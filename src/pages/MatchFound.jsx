import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useMatchStore } from '../store/matchStore'
import { useAuthStore } from '../store/authStore'
import RoleBadge from '../components/RoleBadge'

export default function MatchFound() {
  const navigate = useNavigate()
  const { opponent, role, scenario, difficulty } = useMatchStore()
  const { user: authUser } = useAuthStore()                    // removed duplicate useMatchStore().user
  const [countdown, setCountdown] = useState(5)
  const [showVs, setShowVs] = useState(false)
  const [shouldNavigate, setShouldNavigate] = useState(false) // flag — never call navigate() inside setState

  // Backend role values are 'red_team' | 'blue_team'
  const isAttacker   = role === 'red_team'
  const opponentRole = isAttacker ? 'blue_team' : 'red_team'

  useEffect(() => {
    const timer = setTimeout(() => setShowVs(true), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!showVs) return
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval)
          setShouldNavigate(true) // set flag, don't navigate inside setState updater
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [showVs])

  // Navigate in its own effect so it never fires during a render cycle
  useEffect(() => {
    if (shouldNavigate) navigate('/briefing')
  }, [shouldNavigate])

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden">
      {/* Flash effect */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-50"
        initial={{ opacity: 1, background: 'white' }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      />

      <div className="relative text-center w-full max-w-4xl px-4">
        {/* Match Found header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <motion.h1
            className="font-display text-4xl font-black tracking-widest"
            style={{ color: '#f59e0b', textShadow: '0 0 20px #f59e0b, 0 0 60px #f59e0b40' }}
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
            <p className="text-sm font-mono text-arena-muted mt-2 tracking-wider">
              SCENARIO:{' '}
              <span className="text-white">
                {scenario.replace(/_/g, ' ').toUpperCase()}
              </span>
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
              className="flex items-center justify-center gap-8 mb-10"
            >
              {/* You */}
              <motion.div
                initial={{ x: -80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className={`glass-panel rounded-sm p-6 text-center w-48 ${isAttacker ? 'glass-panel-red' : 'glass-panel-blue'}`}
              >
                <div
                  className="w-16 h-16 mx-auto mb-3 rounded-sm flex items-center justify-center font-display text-3xl font-bold border-2"
                  style={{
                    borderColor: isAttacker ? '#ff2244' : '#00d4ff',
                    color:       isAttacker ? '#ff2244' : '#00d4ff',
                    textShadow: `0 0 15px ${isAttacker ? '#ff2244' : '#00d4ff'}`,
                    boxShadow:  `0 0 20px ${isAttacker ? '#ff224440' : '#00d4ff40'}`,
                  }}
                >
                  {authUser?.username?.[0]?.toUpperCase() || 'Y'}
                </div>
                <p className="font-mono font-bold text-white mb-2">{authUser?.username || 'You'}</p>
                <RoleBadge role={role} size="sm" />
              </motion.div>

              {/* VS */}
              <motion.div
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.3 }}
                className="text-center"
              >
                <div
                  className="font-display text-5xl font-black"
                  style={{ color: '#f59e0b', textShadow: '0 0 30px #f59e0b' }}
                >
                  VS
                </div>
              </motion.div>

              {/* Opponent */}
              <motion.div
                initial={{ x: 80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className={`glass-panel rounded-sm p-6 text-center w-48 ${!isAttacker ? 'glass-panel-red' : 'glass-panel-blue'}`}
              >
                <div
                  className="w-16 h-16 mx-auto mb-3 rounded-sm flex items-center justify-center font-display text-3xl font-bold border-2"
                  style={{
                    borderColor: !isAttacker ? '#ff2244' : '#00d4ff',
                    color:       !isAttacker ? '#ff2244' : '#00d4ff',
                    textShadow: `0 0 15px ${!isAttacker ? '#ff2244' : '#00d4ff'}`,
                    boxShadow:  `0 0 20px ${!isAttacker ? '#ff224440' : '#00d4ff40'}`,
                  }}
                >
                  {opponent?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <p className="font-mono font-bold text-white mb-2">{opponent?.username || 'Operator'}</p>
                {/* Use backend role values — never 'attacker'/'defender' */}
                <RoleBadge role={opponentRole} size="sm" />
                {opponent?.levelName && (
                  <p className="text-xs text-arena-muted mt-1">{opponent.levelName}</p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Countdown to briefing */}
        {showVs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm font-mono text-arena-muted mb-3">
              ENTERING TACTICAL BRIEFING IN...
            </p>
            <motion.div
              className="font-display text-6xl font-black tabular-nums"
              key={countdown}
              initial={{ scale: 1.3, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ color: '#00d4ff', textShadow: '0 0 30px #00d4ff' }}
            >
              {countdown}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}