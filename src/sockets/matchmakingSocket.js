import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL

export const matchmakingSocket = io(`${SOCKET_URL}/matchmaking`, {
  autoConnect:  false,
  transports:   ['websocket'],
})

export function connectMatchmaking(token) {
  if (matchmakingSocket.connected) return
  matchmakingSocket.auth = { token }
  matchmakingSocket.connect()
}

export function disconnectMatchmaking() {
  matchmakingSocket.disconnect()
}