import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export const roomSocket = io(`${SOCKET_URL}/rooms`, {
  autoConnect: false,
  transports: ['websocket'],
})

export function connectRoom(token) {
  roomSocket.auth = { token }
  roomSocket.connect()
}

export function disconnectRoom() {
  roomSocket.disconnect()
}
