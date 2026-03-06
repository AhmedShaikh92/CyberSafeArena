const LEVEL_THRESHOLDS = [0, 1000, 2500]
const LEVEL_NAMES      = ['Rookie', 'Veteran', 'Elite']

export const XP_CONFIG = {
  WIN:  100,
  LOSS:  30,
  PERFORMANCE_BONUS: {
    EXCELLENT: 50,  // score >= 80
    GOOD:      25,  // score >= 60
    AVERAGE:   10,  // score >= 40
  },
}

export const ProgressionService = {
  calculateRank(xp) {
    for (let rank = LEVEL_THRESHOLDS.length - 1; rank >= 0; rank--) {
      if (xp >= LEVEL_THRESHOLDS[rank]) return rank
    }
    return 0
  },

  // Returns display level 1-3
  calculateLevel(xp) {
    return this.calculateRank(xp) + 1
  },

  getLevelName(level) {
    return LEVEL_NAMES[(level - 1)] ?? 'Rookie'
  },

  getXPToNextLevel(xp) {
    const rank = this.calculateRank(xp)
    if (rank >= LEVEL_THRESHOLDS.length - 1) return 0
    return LEVEL_THRESHOLDS[rank + 1] - xp
  },

  getProgressionInfo(xp, level) {
    const rank               = level - 1
    const isMaxLevel         = level >= 3
    const currentThreshold   = LEVEL_THRESHOLDS[rank]
    const nextThreshold      = isMaxLevel ? currentThreshold : LEVEL_THRESHOLDS[rank + 1]
    const xpInCurrentLevel   = xp - currentThreshold
    const xpRequiredForLevel = isMaxLevel ? 0 : nextThreshold - currentThreshold
    const progressPercentage = isMaxLevel
      ? 100
      : Math.min(100, Math.round((xpInCurrentLevel / xpRequiredForLevel) * 100))

    return {
      currentLevel:      level,
      currentLevelName:  this.getLevelName(level),
      xpInCurrentLevel,
      xpRequiredForLevel,
      progressPercentage,
      xpToNextLevel:     this.getXPToNextLevel(xp),
      totalXP:           xp,
      nextLevelName:     isMaxLevel ? 'Max Level' : this.getLevelName(level + 1),
    }
  },

  // Returns { baseXP, performanceBonus, totalXP }
  calculateXPGain(performanceScore, result) {
    const baseXP          = result === 'win' ? XP_CONFIG.WIN : XP_CONFIG.LOSS
    const b               = XP_CONFIG.PERFORMANCE_BONUS
    const performanceBonus =
      performanceScore >= 80 ? b.EXCELLENT :
      performanceScore >= 60 ? b.GOOD :
      performanceScore >= 40 ? b.AVERAGE : 0

    return { baseXP, performanceBonus, totalXP: baseXP + performanceBonus }
  },
}