import { create } from 'zustand'
import { matchmakingSocket, connectMatchmaking, disconnectMatchmaking } from '../sockets/matchmakingSocket'
import { useAuthStore } from './authStore'

// ─── Session persistence helpers ─────────────────────────────────────────────
const SESSION_KEY = 'match_session'

function saveSession(state) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      gameId:     state.gameId,
      role:       state.role,
      scenario:   state.scenario,
      difficulty: state.difficulty,
      phase:      state.phase,
      opponent:   state.opponent,
    }))
  } catch {}
}

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const s = JSON.parse(raw)
    // Only restore if there's an active game in a resumable phase
    const resumable = ['briefing', 'active', 'aar', 'found']
    if (s?.gameId && resumable.includes(s.phase)) return s
  } catch {}
  return null
}

function clearSession() {
  try { sessionStorage.removeItem(SESSION_KEY) } catch {}
}

const saved = loadSession()

export const useMatchStore = create((set, get) => ({
  // Rehydrate from session on load if available
  gameId:        saved?.gameId     ?? null,
  opponent:      saved?.opponent   ?? null,
  role:          saved?.role       ?? null,
  phase:         saved?.phase      ?? 'idle',
  scenario:      saved?.scenario   ?? null,
  difficulty:    saved?.difficulty ?? null,
  isSearching:   false,
  queuePosition: 0,
  queueSize:     0,

  findMatch: () => {
    const token = useAuthStore.getState().token
    if (!token) { console.error('[Matchmaking] No auth token'); return }

    set({ isSearching: true, phase: 'searching', queuePosition: 0 })

    connectMatchmaking(token)

    const doEmit = () => {
      matchmakingSocket.emit('find_match', (res) => {
        if (res?.error || res?.success === false) {
          console.error('[Matchmaking] find_match error:', res.error)
          set({ isSearching: false, phase: 'idle' })
          return
        }
        console.log('[Matchmaking] Queued, queue length:', res.queueLength)
      })
    }

    if (matchmakingSocket.connected) doEmit()
    else {
      matchmakingSocket.off('connect', doEmit)
      matchmakingSocket.once('connect', doEmit)
    }
  },

  cancelMatch: () => {
    matchmakingSocket.emit('cancel_match')
    disconnectMatchmaking()
    clearSession()
    set({ isSearching: false, phase: 'idle', queuePosition: 0, opponent: null })
  },

  setMatchFound: (data) => {
    const next = {
      gameId:      data.gameId,
      opponent:    data.opponent,
      role:        data.role,
      scenario:    data.scenario,
      difficulty:  data.difficulty,
      phase:       'found',
      isSearching: false,
    }
    saveSession(next)
    set(next)
  },

  setPhase: (phase) => {
    set((s) => {
      const next = { ...s, phase }
      saveSession(next)
      return next
    })
  },

  setQueueUpdate: (data) => {
    set({ queuePosition: data.position, queueSize: data.size })
  },

  resetMatch: () => {
    clearSession()
    set({
      gameId:        null,
      opponent:      null,
      role:          null,
      phase:         'idle',
      scenario:      null,
      difficulty:    null,
      isSearching:   false,
      queuePosition: 0,
    })
  },
}))