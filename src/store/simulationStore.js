import { create } from 'zustand'
import { gameSocket } from '../sockets/gameSocket'

export const useSimulationStore = create((set, get) => ({
  phase: 'idle',
  logs: [],
  vulnerabilities: [],
  systemStatus: {
    firewall:  'secure',
    api:       'secure',
    database:  'secure',
    auth:      'secure',
  },
  timeRemaining: 300,
  actions: [],
  actionCooldowns: {},
  progressPercentage: 0,
  activeActions: [],
  _timerInterval: null,
  aarResult: null,

  // subscribe_simulation — correct event name (NOT join_game)
  subscribe: (gameId) => {
    gameSocket.emit('subscribe_simulation', gameId, (response) => {
      if (response?.error) {
        console.error('[Simulation] subscribe error:', response.error)
        return
      }
      if (response?.state) {
        const { events, vulnerabilities } = response.state
        if (Array.isArray(events)) {
          events.forEach((e) => {
            get().addLog({
              id:        `seed-${e.timestamp}-${Math.random().toString(36).slice(2, 7)}`,
              type:      e.type,
              message:   e.message,
              severity:  e.severity,
              timestamp: new Date(e.timestamp).toISOString(),
            })
          })
        }
        if (Array.isArray(vulnerabilities)) {
          set({ vulnerabilities })
        }
      }
    })
  },

  startLocalTimer: (initial = 300) => {
    const { _timerInterval } = get()
    if (_timerInterval) clearInterval(_timerInterval)
    set({ timeRemaining: initial })
    const id = setInterval(() => {
      const { timeRemaining } = get()
      if (timeRemaining <= 1) {
        clearInterval(id)
        set({ timeRemaining: 0, _timerInterval: null })
        return
      }
      set({ timeRemaining: timeRemaining - 1 })
    }, 1000)
    set({ _timerInterval: id })
  },

  stopLocalTimer: () => {
    const { _timerInterval } = get()
    if (_timerInterval) {
      clearInterval(_timerInterval)
      set({ _timerInterval: null })
    }
  },

  // player_action — correct event name (NOT game_action)
  sendAction: (actionId, gameId) => {
    const cooldowns = get().actionCooldowns
    if (cooldowns[actionId]) return

    gameSocket.emit('player_action', gameId, actionId, {}, (response) => {
      if (response?.success === false) {
        console.warn('[Simulation] action failed:', response.error)
      }
    })

    const action     = get().actions.find((a) => a.id === actionId)
    const cooldownMs = (action?.cooldown || 10) * 1000

    set((state) => ({
      actionCooldowns: { ...state.actionCooldowns, [actionId]: true },
      activeActions:   [...state.activeActions, actionId],
    }))

    setTimeout(() => {
      set((state) => {
        const next = { ...state.actionCooldowns }
        delete next[actionId]
        return {
          actionCooldowns: next,
          activeActions:   state.activeActions.filter((id) => id !== actionId),
        }
      })
    }, cooldownMs)
  },

  addLog: (log) => {
    set((state) => ({
      logs: [
        {
          ...log,
          id:        log.id        || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: log.timestamp || new Date().toISOString(),
        },
        ...state.logs,
      ].slice(0, 200),
    }))
  },

  updateSystemStatus: (status) => {
    // Replace entirely — don't merge. Merging causes stale scenario-specific
    // keys from a previous game to bleed into the new game's HUD display.
    set({ systemStatus: status })
  },

  setTimeRemaining:   (time)    => set({ timeRemaining: time }),
  setProgress:        (pct)     => set({ progressPercentage: pct }),
  setActions:         (actions) => set({ actions }),
  setVulnerabilities: (vulns)   => set({ vulnerabilities: vulns }),
  setPhase:           (phase)   => set({ phase }),
  setAarResult:       (result)  => set({ aarResult: result }),

  reset: () => {
    const { _timerInterval } = get()
    if (_timerInterval) clearInterval(_timerInterval)
    set({
      phase:              'idle',
      logs:               [],
      vulnerabilities:    [],
      systemStatus:       { firewall: 'secure', api: 'secure', database: 'secure', auth: 'secure' },
      timeRemaining:      300,
      actions:            [],
      actionCooldowns:    {},
      progressPercentage: 0,
      activeActions:      [],
      _timerInterval:     null,
      aarResult:          null,
    })
  },
}))