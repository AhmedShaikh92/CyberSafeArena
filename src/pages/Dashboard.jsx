import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { useProgressionStore } from '../store/progressionStore'
import { useMatchStore } from '../store/matchStore'
import RoleBadge from '../components/RoleBadge'
import XPBar from '../components/XPBar'

function StatCard({ label, value, color = '#00d4ff', icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-panel rounded-sm p-4 relative overflow-hidden"
      style={{ borderColor: `${color}30`, boxShadow: `0 0 20px ${color}08` }}
    >
      <div className="absolute top-0 right-0 w-16 h-16 opacity-5"
        style={{ background: `radial-gradient(circle, ${color}, transparent)` }}
      />
      <p className="text-xs font-mono text-arena-muted tracking-wider mb-2">{icon} {label}</p>
      <motion.p
        className="text-3xl font-display font-bold"
        style={{ color, textShadow: `0 0 15px ${color}60` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.3 }}
      >
        {value}
      </motion.p>
    </motion.div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { xp, level, levelName, wins, losses, gamesPlayed, progressPercentage, nextLevelXP, fetchProgression } = useProgressionStore()
  const { findMatch, phase } = useMatchStore()

  useEffect(() => {
    fetchProgression()
  }, [])

  const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0
  const isAttacker = user?.role === 'attacker' || user?.role === 'red_team'

  const handleFindMatch = () => {
    findMatch()
    navigate('/matchmaking')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-display text-2xl font-bold text-white tracking-wider">
            WELCOME BACK, <span className={isAttacker ? 'neon-text-red' : 'neon-text-blue'}>{user?.username?.toUpperCase()}</span>
          </h1>
          {user?.role && <RoleBadge role={user.role} />}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-arena-muted">CLEARANCE LEVEL {level}</span>
          <span className="text-arena-muted">◈</span>
          <span className="text-xs font-mono" style={{ color: '#00d4ff' }}>{levelName}</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: XP + Find Match */}
        <div className="lg:col-span-2 space-y-4">
          {/* XP Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel-blue rounded-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-mono text-arena-muted tracking-wider mb-1">OPERATOR PROGRESSION</p>
                <h2 className="font-display text-xl font-bold neon-text-blue tracking-wider">{levelName}</h2>
              </div>
              <div className="text-right">
                <p className="text-3xl font-display font-bold neon-text-blue">{xp.toLocaleString()}</p>
                <p className="text-xs text-arena-muted font-mono">TOTAL XP</p>
              </div>
            </div>
            <XPBar current={xp} total={nextLevelXP} percentage={progressPercentage} />
            <p className="text-xs text-arena-muted font-mono mt-2">
              {(nextLevelXP - xp).toLocaleString()} XP to next clearance level
            </p>
          </motion.div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="WINS" value={wins} color="#10b981" icon="🏆" delay={0.1} />
            <StatCard label="LOSSES" value={losses} color="#ff2244" icon="💀" delay={0.15} />
            <StatCard label="GAMES" value={gamesPlayed} color="#00d4ff" icon="⚔️" delay={0.2} />
            <StatCard label="WIN RATE" value={`${winRate}%`} color="#f59e0b" icon="📊" delay={0.25} />
          </div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel rounded-sm p-6"
          >
            <p className="text-xs font-mono text-arena-muted tracking-widest mb-4 text-center">
              // READY FOR COMBAT?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Find Match */}
              <div className="text-center">
                <motion.button
                  onClick={handleFindMatch}
                  className="btn-primary w-full rounded-sm py-4 text-base"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  animate={{
                    boxShadow: [
                      '0 0 20px #00d4ff30',
                      '0 0 40px #00d4ff50',
                      '0 0 20px #00d4ff30',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ⚡ FIND MATCH
                </motion.button>
                <p className="text-xs text-arena-muted font-mono mt-2">
                  Random opponent · AI role assign
                </p>
              </div>

              {/* Private Room */}
              <div className="text-center">
                <motion.button
                  onClick={() => navigate('/room')}
                  className="w-full rounded-sm py-4 text-base font-display font-bold tracking-widest uppercase"
                  style={{
                    background: 'rgba(255,34,68,0.06)',
                    border: '1px solid rgba(255,34,68,0.4)',
                    color: '#ff2244',
                    textShadow: '0 0 10px #ff2244',
                    boxShadow: '0 0 15px rgba(255,34,68,0.15)',
                  }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: '0 0 30px rgba(255,34,68,0.3)',
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  🔑 PRIVATE ROOM
                </motion.button>
                <p className="text-xs text-arena-muted font-mono mt-2">
                  Invite friends · Custom config
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Operator card */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel rounded-sm overflow-hidden"
          >
            {/* Card header */}
            <div className="p-4 border-b border-arena-border"
              style={{
                background: isAttacker
                  ? 'linear-gradient(135deg, #ff224410, transparent)'
                  : 'linear-gradient(135deg, #00d4ff10, transparent)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-sm flex items-center justify-center font-display text-2xl font-bold"
                  style={{
                    border: `2px solid ${isAttacker ? '#ff2244' : '#00d4ff'}`,
                    color: isAttacker ? '#ff2244' : '#00d4ff',
                    textShadow: `0 0 10px ${isAttacker ? '#ff2244' : '#00d4ff'}`,
                  }}
                >
                  {user?.username?.[0]?.toUpperCase() || 'O'}
                </div>
                <div>
                  <p className="font-mono font-bold text-white text-sm">{user?.username}</p>
                  <p className="text-xs text-arena-muted">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {[
                { label: 'ROLE', value: user?.role ? (isAttacker ? 'RED TEAM' : 'BLUE TEAM') : 'UNASSIGNED' },
                { label: 'LEVEL', value: `${level} — ${levelName}` },
                { label: 'RANK', value: `#${Math.max(1, 100 - wins)}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-arena-border/50">
                  <span className="text-xs font-mono text-arena-muted">{label}</span>
                  <span className="text-xs font-mono text-white">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-panel rounded-sm p-4"
          >
            <h3 className="font-display text-xs tracking-widest text-arena-muted mb-3">ARENA STATUS</h3>
            <div className="space-y-2">
              {[
                { dot: 'green', text: 'Arena servers: ONLINE' },
                { dot: 'green', text: 'Matchmaking: ACTIVE' },
                { dot: 'yellow', text: `Queue depth: ${Math.floor(Math.random() * 20) + 3} operators` },
              ].map(({ dot, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs font-mono">
                  <div className={`status-dot ${dot}`} />
                  <span className="text-slate-300">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}