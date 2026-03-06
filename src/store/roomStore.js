import { create } from 'zustand'
import { roomSocket } from '../sockets/roomSocket'

export const useRoomStore = create((set, get) => ({
  // Room state
  roomCode: null,
  roomId: null,
  isHost: false,
  members: [],          // [{ userId, username, role, levelName, isReady, isHost }]
  status: 'idle',       // idle | creating | joining | lobby | starting | error
  error: null,

  // Config the host picks
  config: {
    scenario: 'random',
    difficulty: 'medium',
    maxPlayers: 2,
  },

  // ── Actions ────────────────────────────────────────────

  createRoom: (config) => {
    set({ status: 'creating', error: null, config })
    roomSocket.emit('create_room', { config })
  },

  joinRoom: (code) => {
    const clean = code.trim().toUpperCase()
    if (!clean) return
    set({ status: 'joining', error: null })
    roomSocket.emit('join_room', { roomCode: clean })
  },

  leaveRoom: () => {
    const { roomId } = get()
    if (roomId) roomSocket.emit('leave_room', { roomId })
    set({ roomCode: null, roomId: null, isHost: false, members: [], status: 'idle', error: null })
  },

  kickMember: (userId) => {
    const { roomId } = get()
    roomSocket.emit('kick_member', { roomId, userId })
  },

  updateConfig: (patch) => {
    const { roomId, config } = get()
    const next = { ...config, ...patch }
    set({ config: next })
    roomSocket.emit('update_room_config', { roomId, config: next })
  },

  startRoom: () => {
    const { roomId } = get()
    roomSocket.emit('start_room', { roomId })
    set({ status: 'starting' })
  },

  // ── Socket event handlers (called from useRoom hook) ───

  onRoomCreated: (data) => {
    set({
      roomCode: data.roomCode,
      roomId: data.roomId,
      isHost: true,
      members: data.members || [],
      status: 'lobby',
      error: null,
    })
  },

  onRoomJoined: (data) => {
    set({
      roomCode: data.roomCode,
      roomId: data.roomId,
      isHost: false,
      members: data.members || [],
      status: 'lobby',
      error: null,
    })
  },

  onMembersUpdate: (members) => {
    set({ members })
  },

  onRoomError: (message) => {
    set({ status: 'error', error: message })
  },

  onRoomClosed: () => {
    set({ roomCode: null, roomId: null, isHost: false, members: [], status: 'idle', error: 'Host closed the room' })
  },

  clearError: () => set({ error: null }),
  setStatus: (status) => set({ status }),
}))
