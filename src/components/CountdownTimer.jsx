import React, { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

export default function CountdownTimer({ seconds, onComplete, size = 'lg', color = 'blue' }) {
  const [remaining, setRemaining] = useState(seconds)
  const onCompleteRef = useRef(onComplete)
  
  useEffect(() => { 
    onCompleteRef.current = onComplete 
  }, [onComplete])

  const radius = size === 'lg' ? 54 : 36
  const stroke = size === 'lg' ? 4 : 3
  const circumference = 2 * Math.PI * radius
  const cx = size === 'lg' ? 60 : 40
  const svgSize = size === 'lg' ? 120 : 80

  // Timer countdown with separate completion effect
  useEffect(() => {
    setRemaining(seconds)
    const interval = setInterval(() => {
      setRemaining((prev) => {
        const next = prev <= 1 ? 0 : prev - 1
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [seconds])

  // Separate effect for handling completion
  useEffect(() => {
    if (remaining === 0 && seconds > 0) {
      onCompleteRef.current?.()
    }
  }, [remaining, seconds])

  const neonColor = color === 'red' ? '#ff2244' : '#00d4ff'
  const isUrgent = remaining <= 10
  const progress = (remaining / Math.max(seconds, 1)) * circumference
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <div className="relative flex items-center justify-center">
      <svg width={svgSize} height={svgSize} className="countdown-ring -rotate-90">
        {/* Track */}
        <circle
          cx={cx} cy={cx} r={radius}
          fill="none"
          stroke="rgba(30,41,59,0.8)"
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        <motion.circle
          cx={cx} cy={cx} r={radius}
          fill="none"
          stroke={neonColor}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${neonColor})` }}
          animate={isUrgent ? {
            stroke: ['#ff2244', '#ff6600', '#ff2244'],
            filter: [
              'drop-shadow(0 0 6px #ff2244)',
              'drop-shadow(0 0 14px #ff6600)',
              'drop-shadow(0 0 6px #ff2244)',
            ],
          } : {}}
          transition={isUrgent ? { duration: 0.5, repeat: Infinity } : {}}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={`font-display font-bold tabular-nums ${size === 'lg' ? 'text-xl' : 'text-sm'}`}
          style={{ color: neonColor, textShadow: `0 0 10px ${neonColor}` }}
          animate={isUrgent ? { scale: [1, 1.12, 1] } : {}}
          transition={isUrgent ? { duration: 0.5, repeat: Infinity } : {}}
        >
          {mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}s`}
        </motion.span>
      </div>
    </div>
  )
}