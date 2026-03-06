import React from 'react'
import { motion } from 'framer-motion'

export default function XPBar({ current, total, percentage, animated = true }) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-arena-muted font-mono mb-1">
        <span>{current?.toLocaleString()} XP</span>
        <span>{total?.toLocaleString()} XP</span>
      </div>
      <div className="xp-bar">
        <motion.div
          className="xp-fill"
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
