import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMatchStore } from '../store/matchStore'
import { useAuthStore } from '../store/authStore'
import { matchmakingSocket, connectMatchmaking } from '../sockets/matchmakingSocket'

export function useMatchmaking() {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const { setMatchFound, setQueueUpdate, setPhase } = useMatchStore()

  useEffect(() => {
    connectMatchmaking(token)

    const onQueueUpdate = (data) => setQueueUpdate(data)

    const onMatchFound = (data) => {
      setMatchFound(data)
      navigate('/briefing', { replace: true })
    }

    const onMatchError = (data) => {
      console.error('[Matchmaking] match_error:', data)
      setPhase('idle')
    }

    matchmakingSocket.on('queue_update', onQueueUpdate)
    matchmakingSocket.on('match_found',  onMatchFound)
    matchmakingSocket.on('match_error',  onMatchError)

    return () => {
      matchmakingSocket.off('queue_update', onQueueUpdate)
      matchmakingSocket.off('match_found',  onMatchFound)
      matchmakingSocket.off('match_error',  onMatchError)
    }
  }, [token])
}