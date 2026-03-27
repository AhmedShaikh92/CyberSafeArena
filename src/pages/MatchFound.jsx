import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useMatchStore } from '../store/matchStore'
import { useAuthStore } from '../store/authStore'
import RoleBadge from '../components/RoleBadge'

export default function MatchFound() {
  const navigate = useNavigate()
  const { opponent, role, scenario, difficulty } = useMatchStore()
  const { user: authUser } = useAuthStore()
  const [countdown, setCountdown]       = useState(5)
  const [showVs, setShowVs]             = useState(false)
  const [shouldNavigate, setShouldNavigate] = useState(false)

  const isAttacker   = role === 'red_team'
  const opponentRole = isAttacker ? 'blue_team' : 'red_team'

  useEffect(() => {
    const t = setTimeout(() => setShowVs(true), 500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!showVs) return
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(interval); setShouldNavigate(true); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [showVs])

  useEffect(() => {
    if (shouldNavigate) navigate('/briefing')
  }, [shouldNavigate])

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* Flash */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-50"
        initial={{ opacity: 1, background: 'lightgray' }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />

      <div className="relative text-center w-full max-w-4xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
          <motion.h1
            className="font-display font-black tracking-widest"
            style={{
              fontSize: 'clamp(24px, 8vw, 48px)',
              color: '#f59e0b',
              textShadow: '0 0 20px #f59e0b, 0 0 60px #f59e0b40',
            }}
            animate={{
              textShadow: [
                '0 0 20px #f59e0b, 0 0 60px #f59e0b40',
                '0 0 40px #f59e0b, 0 0 100px #f59e0b60',
                '0 0 20px #f59e0b, 0 0 60px #f59e0b40',
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            MATCH FOUND
          </motion.h1>

          {scenario && (
            <p className="text-xs sm:text-sm font-mono text-arena-muted mt-2 tracking-wider">
              SCENARIO:{' '}
              <span className="text-white">{scenario.replace(/_/g, ' ').toUpperCase()}</span>
              {difficulty && (
                <> · <span className="text-yellow-500">{difficulty.toUpperCase()}</span></>
              )}
            </p>
          )}
        </motion.div>

        {/* VS layout */}
        <AnimatePresence>
          {showVs && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-8 sm:mb-10"
            >
              {/* You */}
              <motion.div
                initial={{ x: -80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className={`glass-panel rounded-sm p-5 sm:p-6 text-center w-full sm:w-48 ${isAttacker ? 'glass-panel-red' : 'glass-panel-blue'}`}
              >
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 rounded-sm flex items-center justify-center font-display font-bold border-2"
                  style={{
                    fontSize: 'clamp(20px, 6vw, 28px)',
                    borderColor: isAttacker ? '#ff2244' : '#00d4ff',
                    color:       isAttacker ? '#ff2244' : '#00d4ff',
                    textShadow: `0 0 15px ${isAttacker ? '#ff2244' : '#00d4ff'}`,
                    boxShadow:  `0 0 20px ${isAttacker ? '#ff224440' : '#00d4ff40'}`,
                  }}
                >
                  {authUser?.username?.[0]?.toUpperCase() || 'Y'}
                </div>
                <p className="font-mono font-bold text-white mb-2 truncate">
                  {authUser?.username || 'You'}
                </p>
                <RoleBadge role={role} size="sm" />
              </motion.div>

              {/* VS — rotates on mobile to horizontal */}
              <motion.div
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.3 }}
                className="shrink-0"
              >
                <div
                  className="font-display font-black"
                  style={{
                    fontSize: 'clamp(32px, 10vw, 56px)',
                    color: '#f59e0b',
                    textShadow: '0 0 30px #f59e0b',
                  }}
                >
                  VS
                </div>
              </motion.div>

              {/* Opponent */}
              <motion.div
                initial={{ x: 80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className={`glass-panel rounded-sm p-5 sm:p-6 text-center w-full sm:w-48 ${!isAttacker ? 'glass-panel-red' : 'glass-panel-blue'}`}
              >
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 rounded-sm flex items-center justify-center font-display font-bold border-2"
                  style={{
                    fontSize: 'clamp(20px, 6vw, 28px)',
                    borderColor: !isAttacker ? '#ff2244' : '#00d4ff',
                    color:       !isAttacker ? '#ff2244' : '#00d4ff',
                    textShadow: `0 0 15px ${!isAttacker ? '#ff2244' : '#00d4ff'}`,
                    boxShadow:  `0 0 20px ${!isAttacker ? '#ff224440' : '#00d4ff40'}`,
                  }}
                >
                  {opponent?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <p className="font-mono font-bold text-white mb-2 truncate">
                  {opponent?.username || 'Operator'}
                </p>
                <RoleBadge role={opponentRole} size="sm" />
                {opponent?.levelName && (
                  <p className="text-xs text-arena-muted mt-1">{opponent.levelName}</p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Countdown */}
        {showVs && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <p className="text-xs sm:text-sm font-mono text-arena-muted mb-3 tracking-wider">
              ENTERING TACTICAL BRIEFING IN...
            </p>
            <motion.div
              className="font-display font-black tabular-nums"
              key={countdown}
              initial={{ scale: 1.3, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                fontSize: 'clamp(48px, 15vw, 80px)',
                color: '#00d4ff',
                textShadow: '0 0 30px #00d4ff',
              }}
            >
              {countdown}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}