import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL

// Singleton — one socket instance for the lifetime of the app session
export const matchmakingSocket = io(`${SOCKET_URL}/matchmaking`, {
  autoConnect:       false,
  transports:        ['websocket'],
  reconnection:      true,
  reconnectionDelay: 1000,
})

/**
 * Connect with auth token.
 * If already connected, do nothing.
 */
export function connectMatchmaking(token) {
  if (matchmakingSocket.connected) return
  matchmakingSocket.auth = { token }
  matchmakingSocket.connect()
}

export function disconnectMatchmaking() {
  matchmakingSocket.disconnect()
}