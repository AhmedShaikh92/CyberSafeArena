import React from 'react'
import { motion } from 'framer-motion'

export default function RoleBadge({ role, size = 'md' }) {
  const isAttacker = role === 'attacker' || role === 'red_team'
  
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  return (
    <motion.span
      className={`inline-flex items-center gap-1.5 font-display font-bold tracking-widest uppercase rounded-sm ${sizes[size]}`}
      style={isAttacker ? {
        color: '#ff2244',
        border: '1px solid #ff2244',
        textShadow: '0 0 10px #ff2244',
        boxShadow: '0 0 10px #ff224430, inset 0 0 10px #ff224408',
        background: 'rgba(255,34,68,0.08)'
      } : {
        color: '#00d4ff',
        border: '1px solid #00d4ff',
        textShadow: '0 0 10px #00d4ff',
        boxShadow: '0 0 10px #00d4ff30, inset 0 0 10px #00d4ff08',
        background: 'rgba(0,212,255,0.08)'
      }}
      animate={{
        boxShadow: isAttacker
          ? ['0 0 10px #ff224430', '0 0 20px #ff224450', '0 0 10px #ff224430']
          : ['0 0 10px #00d4ff30', '0 0 20px #00d4ff50', '0 0 10px #00d4ff30']
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <span className="w-1.5 h-1.5 rounded-full"
        style={isAttacker
          ? { background: '#ff2244', boxShadow: '0 0 6px #ff2244' }
          : { background: '#00d4ff', boxShadow: '0 0 6px #00d4ff' }
        }
      />
      {isAttacker ? 'RED TEAM' : 'BLUE TEAM'}
    </motion.span>
  )
}
