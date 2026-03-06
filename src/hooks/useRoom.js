import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRoomStore } from '../store/roomStore'
import { useMatchStore } from '../store/matchStore'
import { useAuthStore } from '../store/authStore'
import { roomSocket, connectRoom } from '../sockets/roomSocket'

export function useRoom() {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const {
    onRoomCreated, onRoomJoined, onMembersUpdate,
    onRoomError, onRoomClosed, setStatus,
  } = useRoomStore()
  const { setMatchFound } = useMatchStore()

  useEffect(() => {
    connectRoom(token)

    roomSocket.on('room_created', (data) => {
      onRoomCreated(data)
    })

    roomSocket.on('room_joined', (data) => {
      onRoomJoined(data)
    })

    roomSocket.on('members_update', ({ members }) => {
      onMembersUpdate(members)
    })

    roomSocket.on('room_error', ({ message }) => {
      onRoomError(message)
    })

    roomSocket.on('room_closed', () => {
      onRoomClosed()
      navigate('/dashboard')
    })

    // When the host fires start, backend assigns roles and returns match_found
    roomSocket.on('match_found', (data) => {
      setMatchFound(data)
      navigate('/match-found')
    })

    return () => {
      roomSocket.off('room_created')
      roomSocket.off('room_joined')
      roomSocket.off('members_update')
      roomSocket.off('room_error')
      roomSocket.off('room_closed')
      roomSocket.off('match_found')
    }
  }, [token])
}
