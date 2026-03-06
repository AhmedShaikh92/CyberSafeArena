import { create } from 'zustand'
import api from '../services/api'
import { ProgressionService, XP_CONFIG } from '../services/progressionService'

function getLevelInfo(xp) {
  const level        = ProgressionService.calculateLevel(xp)
  const levelName    = ProgressionService.getLevelName(level)
  const progressInfo = ProgressionService.getProgressionInfo(xp, level)
  return {
    level,
    levelName,
    nextLevelXP:        progressInfo.xpToNextLevel > 0 ? xp + progressInfo.xpToNextLevel : xp,
    progressPercentage: progressInfo.progressPercentage,
  }
}

export const useProgressionStore = create((set, get) => ({
  xp:                 0,
  level:              1,
  levelName:          'Rookie',
  wins:               0,
  losses:             0,
  gamesPlayed:        0,
  progressPercentage: 0,
  nextLevelXP:        500,
  isLevelingUp:       false,
  pendingXP:          0,
  hydrated:           false,
  metrics: {
    correctDefenses:           0,
    successfulAttacks:         0,
    vulnerabilitiesIdentified: 0,
    avgResponseTime:           0,
  },

  // JWT only has userId/username/role/level — no xp/wins/losses.
  // Just clear hydrated so fetchProgression loads real data from DB.
  seedFromUser: (user) => {
    if (!user) return
    set({ hydrated: false })
  },

  // Always fetches from DB on mount. hydrated prevents duplicate calls
  // within the same session. Reset to false after saveProgression so
  // Dashboard always shows latest match results after returning from AAR.
  fetchProgression: async () => {
    if (get().hydrated) return
    try {
      const res = await api.get('/progression/me')
      const { user } = res.data
      const xp        = user.xp ?? 0
      const levelInfo = getLevelInfo(xp)
      set({
        xp,
        wins:        user.wins        ?? 0,
        losses:      user.losses      ?? 0,
        gamesPlayed: user.gamesPlayed ?? 0,
        metrics:     user.stats       ?? get().metrics,
        ...levelInfo,
        hydrated: true,
      })
    } catch (err) {
      if (err?.response?.status === 404) {
        set({ hydrated: true })
      } else {
        console.error('[Progression] fetch failed:', err)
      }
    }
  },

  applyXPGain: (xpGain) => {
    if (!xpGain || xpGain <= 0) return
    const { xp, level } = get()
    const newXP         = xp + xpGain
    const levelInfo     = getLevelInfo(newXP)
    const isLevelingUp  = levelInfo.level > level
    set({ xp: newXP, ...levelInfo, pendingXP: xpGain, isLevelingUp })
    setTimeout(() => set({ pendingXP: 0 }), 2000)
    if (isLevelingUp) setTimeout(() => set({ isLevelingUp: false }), 3000)
  },

  applyMatchXP: (performanceScore, result) => {
    const xpGain       = ProgressionService.calculateXPGain(performanceScore, result)
    const { xp, level } = get()
    const newXP        = xp + xpGain.totalXP
    const levelInfo    = getLevelInfo(newXP)
    const isLevelingUp = levelInfo.level > level
    set({ xp: newXP, ...levelInfo, pendingXP: xpGain.totalXP, isLevelingUp })
    setTimeout(() => set({ pendingXP: 0 }), 2000)
    if (isLevelingUp) setTimeout(() => set({ isLevelingUp: false }), 3000)
    return xpGain
  },

  getProgressionInfo: () => {
    const { xp, level } = get()
    return ProgressionService.getProgressionInfo(xp, level)
  },

  setMetrics: (metrics) => set({ metrics }),

  incrementWin: () => set((s) => ({
    wins: s.wins + 1, gamesPlayed: s.gamesPlayed + 1,
  })),

  incrementLoss: () => set((s) => ({
    losses: s.losses + 1, gamesPlayed: s.gamesPlayed + 1,
  })),

  saveProgression: async (outcome, xpGained) => {
    try {
      const res = await api.patch('/progression/me', { outcome, xpGained })
      const data = res.data
      const levelInfo = getLevelInfo(data.xp)
      set({
        xp:          data.xp,
        wins:        data.wins,
        losses:      data.losses,
        gamesPlayed: data.gamesPlayed,
        ...levelInfo,
        hydrated: false, // force Dashboard to refetch confirmed DB values on next mount
      })
    } catch (err) {
      console.error('[Progression] Failed to save progression:', err)
    }
  },
}))