import { create } from 'zustand'
import { matchmakingSocket, connectMatchmaking } from '../sockets/matchmakingSocket'
import { useAuthStore } from './authStore'

export const useMatchStore = create((set, get) => ({
  gameId:        null,
  opponent:      null,
  role:          null,
  phase:         'idle',  // idle | searching | found | briefing | active | aar
  scenario:      null,
  difficulty:    null,
  isSearching:   false,
  queuePosition: 0,
  queueSize:     0,

  findMatch: () => {
    const token = useAuthStore.getState().token
    if (!token) {
      console.error('[Matchmaking] No auth token')
      return
    }

    set({ isSearching: true, phase: 'searching', queuePosition: 0 })

    // Connect socket first — it carries the JWT for server auth middleware
    connectMatchmaking(token)

    // Emit after connect (or immediately if already connected)
    const doEmit = () => {
      matchmakingSocket.emit('find_match', (res) => {
        if (res?.error) {
          console.error('[Matchmaking] find_match error:', res.error)
          set({ isSearching: false, phase: 'idle' })
        }
        // On success the server enqueues — match_found arrives via useMatchmaking listener
      })
    }

    if (matchmakingSocket.connected) {
      doEmit()
    } else {
      matchmakingSocket.once('connect', doEmit)
    }
  },

  cancelMatch: () => {
    matchmakingSocket.emit('cancel_match')
    matchmakingSocket.disconnect()
    set({ isSearching: false, phase: 'idle', queuePosition: 0, opponent: null })
  },

  setMatchFound: (data) => {
    set({
      gameId:      data.gameId,
      opponent:    data.opponent,
      role:        data.role,
      scenario:    data.scenario,
      difficulty:  data.difficulty,
      phase:       'found',
      isSearching: false,
    })
  },

  setPhase: (phase) => set({ phase }),

  setQueueUpdate: (data) => {
    set({ queuePosition: data.position, queueSize: data.size })
  },

  resetMatch: () => {
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