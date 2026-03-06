import React from 'react'
import { motion } from 'framer-motion'

export default function CyberGrid() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Animated grid */}
      <div className="absolute inset-0 cyber-grid opacity-60" />
      
      {/* Radial fade */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, #0b1120 90%)'
      }} />

      {/* Corner accent lines */}
      <div className="absolute top-0 left-0 w-64 h-64 opacity-20"
        style={{
          background: 'conic-gradient(from 180deg at 0% 0%, #00d4ff 0deg, transparent 90deg)'
        }}
      />
      <div className="absolute bottom-0 right-0 w-64 h-64 opacity-20"
        style={{
          background: 'conic-gradient(from 0deg at 100% 100%, #ff2244 0deg, transparent 90deg)'
        }}
      />

      {/* Scanlines */}
      <div className="absolute inset-0 opacity-30"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)'
        }}
      />
    </div>
  )
}
