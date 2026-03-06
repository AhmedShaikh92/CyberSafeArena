import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useMatchStore } from '../store/matchStore'
import { useMatchmaking } from '../hooks/useMatchmaking'

export default function Matchmaking() {
  const navigate = useNavigate()
  const { isSearching, queuePosition, queueSize, cancelMatch, phase } = useMatchStore()
  useMatchmaking()

  useEffect(() => {
    if (phase === 'idle') navigate('/dashboard')
  }, [phase])

  const handleCancel = () => {
    cancelMatch()
    navigate('/dashboard')
  }

  // Fake elapsed time
  const [elapsed, setElapsed] = React.useState(0)
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [])
  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        {/* Radar */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          {/* Outer rings */}
          {[1, 0.75, 0.5, 0.25].map((scale, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border"
              style={{
                transform: `scale(${scale})`,
                borderColor: 'rgba(0,212,255,0.2)',
                margin: 'auto',
                top: 0, left: 0,
              }}
            />
          ))}

          {/* Radar sweep */}
          <motion.div
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{ background: 'transparent' }}
          >
            <motion.div
              className="absolute inset-0 origin-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              style={{
                background: 'conic-gradient(from 0deg, transparent 270deg, rgba(0,212,255,0.4) 360deg)',
              }}
            />
          </motion.div>

          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-3 h-3 rounded-full"
              style={{ background: '#00d4ff', boxShadow: '0 0 15px #00d4ff' }}
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>

          {/* Random blips */}
          {[
            { x: '30%', y: '25%', delay: 0.5 },
            { x: '65%', y: '60%', delay: 1.2 },
            { x: '20%', y: '70%', delay: 2.1 },
          ].map(({ x, y, delay }, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                left: x, top: y,
                background: '#00d4ff',
                boxShadow: '0 0 8px #00d4ff',
              }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay, repeatDelay: 2 }}
            />
          ))}
        </div>

        {/* Text */}
        <motion.h2
          className="font-display text-2xl font-bold tracking-widest neon-text-blue mb-3"
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          SEARCHING FOR OPPONENT
        </motion.h2>

        <div className="space-y-2 mb-8">
          <p className="text-sm font-mono text-arena-muted">
            TIME ELAPSED: <span className="text-white tabular-nums">
              {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
            </span>
          </p>
          {queueSize > 0 && (
            <p className="text-sm font-mono text-arena-muted">
              QUEUE POSITION: <span className="neon-text-blue">{queuePosition}</span>
              <span className="text-arena-muted"> / {queueSize} OPERATORS</span>
            </p>
          )}
        </div>

        {/* Queue indicator bars */}
        <div className="flex justify-center gap-1 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full"
              style={{ background: '#00d4ff', boxShadow: '0 0 4px #00d4ff' }}
              animate={{ height: [8, 16 + Math.random() * 20, 8] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <motion.button
          onClick={handleCancel}
          className="btn-danger rounded-sm px-8 py-3"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          CANCEL SEARCH
        </motion.button>
      </motion.div>
    </div>
  )
}
