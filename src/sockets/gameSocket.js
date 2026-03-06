import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL

export const gameSocket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket'],
})

let _authenticated = false
let _authCallbacks = []

function _setAuthenticated() {
  _authenticated = true
  const cbs = _authCallbacks.splice(0)
  cbs.forEach((cb) => cb())
}

gameSocket.on('disconnect', () => {
  _authenticated = false
})

export function whenAuthenticated(callback) {
  if (_authenticated) {
    callback()
  } else {
    _authCallbacks.push(callback)
  }
}

export function connectGame(token) {
  if (gameSocket.connected) {
    gameSocket.auth = { token }
    gameSocket.emit('authenticate', token, (res) => {
      if (res?.success) _setAuthenticated()
      else console.error('[GameSocket] Re-auth failed:', res?.error)
    })
    return
  }
  _authenticated = false
  gameSocket.auth = { token }
  gameSocket.connect()
}

export function disconnectGame() {
  _authenticated = false
  gameSocket.disconnect()
}

export { _setAuthenticated as _markAuthenticated }