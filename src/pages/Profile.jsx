import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { useProgressionStore } from '../store/progressionStore'
import RoleBadge from '../components/RoleBadge'
import XPBar from '../components/XPBar'
import api from '../services/api'

const isRedTeam = (role) => role === 'red_team'

// ─── Animated number counter ──────────────────────────────────────────────────
function AnimatedCounter({ target, duration = 1200, decimals = 0 }) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let raf
    const start = Date.now()
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)
      setValue(parseFloat((eased * target).toFixed(decimals)))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, decimals])
  return <span className="tabular-nums">{decimals > 0 ? value.toFixed(decimals) : value.toLocaleString()}</span>
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, suffix = '', color = '#00d4ff', icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-panel rounded-sm p-4 relative overflow-hidden"
      style={{ borderColor: `${color}25`, boxShadow: `0 0 20px ${color}06` }}
    >
      <div className="absolute top-0 right-0 w-14 h-14 opacity-10 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}, transparent)` }} />
      <p className="text-xs font-mono text-arena-muted tracking-wider mb-2">{icon} {label}</p>
      <p className="font-display text-2xl font-bold" style={{ color, textShadow: `0 0 15px ${color}60` }}>
        <AnimatedCounter target={typeof value === 'number' ? value : 0} />{suffix}
      </p>
    </motion.div>
  )
}

// ─── Progress bar row ─────────────────────────────────────────────────────────
function PerformanceRow({ label, value, color, max, decimals = 0, delay = 0 }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-mono text-arena-muted">{label}</span>
        <span className="text-sm font-display font-bold" style={{ color }}>
          <AnimatedCounter target={value} decimals={decimals} />{decimals > 0 ? 's' : ''}
        </span>
      </div>
      <div className="h-1 bg-arena-border rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}88, ${color})`, boxShadow: `0 0 8px ${color}60` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, delay: delay + 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Profile() {
  const { user, updateUser, updateToken } = useAuthStore()
  const {
    xp, level, levelName, wins, losses, gamesPlayed,
    progressPercentage, nextLevelXP, metrics,
    fetchProgression, hydrated,
  } = useProgressionStore()

  const [roleChanging, setRoleChanging] = useState(false)
  const [roleError,    setRoleError]    = useState(null)
  const [roleSuccess,  setRoleSuccess]  = useState(false)

  useEffect(() => {
    useProgressionStore.setState({ hydrated: false })
    fetchProgression()
  }, [])

  const attacker  = isRedTeam(user?.role)
  const roleColor = attacker ? '#ff2244' : '#00d4ff'
  const winRate   = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0

  // API returns user.stats.averageResponseTime (in ms).
  // progressionStore may expose it as metrics.avgResponseTime or metrics.averageResponseTime.
  // Fall back to user.stats directly if metrics is not populated.
  const rawStats = metrics ?? user?.stats ?? {}
  const perf = {
    correctDefenses:           rawStats.correctDefenses           ?? 0,
    successfulAttacks:         rawStats.successfulAttacks         ?? 0,
    vulnerabilitiesIdentified: rawStats.vulnerabilitiesIdentified ?? 0,
    // Field name differs between store (avgResponseTime) and API (averageResponseTime); support both.
    // Value is stored in ms — convert to seconds for display.
    avgResponseTime: ((rawStats.avgResponseTime ?? rawStats.averageResponseTime ?? 0) / 1000),
  }

  const handleRoleSwitch = async () => {
    const newDisplayRole = attacker ? 'defender' : 'attacker'
    setRoleChanging(true)
    setRoleError(null)
    setRoleSuccess(false)
    try {
      const res = await api.patch('/users/me/role', { role: newDisplayRole })
      if (res.data.token) updateToken(res.data.token)
      updateUser({ role: res.data.role })
      setRoleSuccess(true)
      setTimeout(() => setRoleSuccess(false), 3000)
    } catch (err) {
      setRoleError(err.response?.data?.error || 'Failed to switch role')
      setTimeout(() => setRoleError(null), 4000)
    } finally {
      setRoleChanging(false)
    }
  }

  const loading = !hydrated

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(11,17,32,0.7)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="w-5 h-5 rounded-full border-2"
                style={{ borderColor: '#00d4ff', borderTopColor: 'transparent' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
              <span className="text-xs font-mono text-arena-muted tracking-wider">LOADING OPERATOR DATA...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Profile card ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className={`rounded-sm overflow-hidden ${attacker ? 'glass-panel-red' : 'glass-panel-blue'}`}>

            <div className="p-8 text-center relative"
              style={{ background: `linear-gradient(135deg, ${roleColor}10, transparent)` }}>

              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="absolute w-full h-px"
                    style={{ top: `${12 + i * 12}%`, background: roleColor }} />
                ))}
              </div>

              <motion.div
                className="w-20 h-20 mx-auto mb-4 rounded-sm flex items-center justify-center font-display text-4xl font-black relative"
                style={{ border: `2px solid ${roleColor}`, color: roleColor, textShadow: `0 0 20px ${roleColor}` }}
                animate={{ boxShadow: [`0 0 20px ${roleColor}30`, `0 0 45px ${roleColor}55`, `0 0 20px ${roleColor}30`] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                {user?.username?.[0]?.toUpperCase() || 'O'}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{ borderColor: roleColor }} />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r" style={{ borderColor: roleColor }} />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l" style={{ borderColor: roleColor }} />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{ borderColor: roleColor }} />
              </motion.div>

              <h2 className="font-display font-bold text-lg text-white tracking-wider mb-0.5">{user?.username}</h2>
              <p className="text-xs text-arena-muted mb-4">{user?.email}</p>

              <div className="flex flex-col items-center gap-3">
                <AnimatePresence mode="wait">
                  <motion.div key={user?.role}
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }}>
                    {user?.role && <RoleBadge role={user.role} />}
                  </motion.div>
                </AnimatePresence>

                <motion.button
                  onClick={handleRoleSwitch}
                  disabled={roleChanging}
                  className="relative flex items-center rounded-sm overflow-hidden text-xs font-display tracking-wider"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                >
                  <div className="px-3 py-1.5 transition-all duration-300"
                    style={{ background: attacker ? '#ff224420' : 'transparent', color: attacker ? '#ff2244' : '#475569', textShadow: attacker ? '0 0 8px #ff2244' : 'none' }}>
                    RED
                  </div>
                  <div className="px-1.5 py-1.5 flex items-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <motion.div className="w-3 h-3 rounded-full"
                      animate={{ x: attacker ? -4 : 4, background: attacker ? '#ff2244' : '#00d4ff', boxShadow: attacker ? '0 0 6px #ff2244' : '0 0 6px #00d4ff' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }} />
                  </div>
                  <div className="px-3 py-1.5 transition-all duration-300"
                    style={{ background: !attacker ? '#00d4ff20' : 'transparent', color: !attacker ? '#00d4ff' : '#475569', textShadow: !attacker ? '0 0 8px #00d4ff' : 'none' }}>
                    BLUE
                  </div>
                  {roleChanging && (
                    <motion.div className="absolute inset-0 flex items-center justify-center"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ background: 'rgba(11,17,32,0.75)' }}>
                      <motion.div className="w-3 h-3 border border-current border-t-transparent rounded-full"
                        animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        style={{ color: '#00d4ff' }} />
                    </motion.div>
                  )}
                </motion.button>

                <AnimatePresence>
                  {roleSuccess && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs font-mono" style={{ color: '#10b981' }}>✓ Team switched</motion.p>
                  )}
                  {roleError && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs font-mono" style={{ color: '#ff2244' }}>⚠ {roleError}</motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="px-6 pb-6">
              <div className="flex justify-between text-xs mb-2">
                <span className="font-mono text-arena-muted">LEVEL {level}</span>
                <span className="font-mono" style={{ color: roleColor }}>{levelName}</span>
              </div>
              <XPBar current={xp} total={nextLevelXP} percentage={progressPercentage} />
              <p className="text-xs text-arena-muted font-mono mt-1.5 text-right">
                {(nextLevelXP - xp).toLocaleString()} XP to next level
              </p>

              <div className="mt-4 space-y-2">
                {[
                  { label: 'Total XP',     value: xp.toLocaleString(),   color: '#f59e0b' },
                  { label: 'Games Played', value: gamesPlayed,           color: '#64748b' },
                  { label: 'Win Rate',     value: `${winRate}%`,         color: winRate >= 50 ? '#10b981' : '#ff2244' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-arena-border/40">
                    <span className="text-xs font-mono text-arena-muted">{label}</span>
                    <span className="text-xs font-mono font-bold" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Right: Stats & metrics ─────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="WINS"     value={wins}        color="#10b981" icon="🏆" delay={0.1}  />
            <StatCard label="LOSSES"   value={losses}      color="#ff2244" icon="💀" delay={0.15} />
            <StatCard label="GAMES"    value={gamesPlayed} color="#00d4ff" icon="⚔️" delay={0.2}  />
            <StatCard label="WIN RATE" value={winRate}     suffix="%" color="#f59e0b" icon="📊" delay={0.25} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-panel rounded-sm p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xs tracking-widest text-arena-muted">◈ PERFORMANCE METRICS</h3>
              <span className="text-xs font-mono text-arena-muted opacity-50">LIFETIME</span>
            </div>
            <div className="space-y-4">
              <PerformanceRow label="Correct Defenses"    value={perf.correctDefenses}           color="#00d4ff" max={200}  delay={0.35} />
              <PerformanceRow label="Successful Attacks"  value={perf.successfulAttacks}         color="#ff2244" max={150}  delay={0.4}  />
              <PerformanceRow label="Vulns Identified"    value={perf.vulnerabilitiesIdentified} color="#f59e0b" max={60}   delay={0.45} />
              <PerformanceRow label="Avg Response Time"   value={perf.avgResponseTime}           color="#10b981" max={15}   delay={0.5} decimals={1} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="glass-panel rounded-sm p-5"
          >
            <h3 className="font-display text-xs tracking-widest text-arena-muted mb-4">◈ OPERATOR INTEL</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'SPECIALIZATION', value: attacker ? 'Offensive Ops'    : 'Threat Response'  },
                { label: 'TOP SKILL',      value: attacker ? 'SQL Injection'    : 'Threat Detection' },
                { label: 'WEAK POINT',     value: perf.avgResponseTime > 10 ? 'Response Time' : gamesPlayed === 0 ? 'No data yet' : 'Consistency' },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-sm relative overflow-hidden"
                  style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
                  <div className="absolute top-0 left-0 w-full h-0.5"
                    style={{ background: `linear-gradient(90deg, ${roleColor}60, transparent)` }} />
                  <p className="text-xs font-mono text-arena-muted mb-1">{label}</p>
                  <p className="text-xs font-mono text-white font-bold">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="glass-panel rounded-sm p-5"
          >
            <h3 className="font-display text-xs tracking-widest text-arena-muted mb-4">◈ COMBAT RECORD</h3>
            {gamesPlayed === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs font-mono text-arena-muted">No matches played yet</p>
                <p className="text-xs font-mono text-arena-muted opacity-50 mt-1">Complete a match to see your record</p>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                    <motion.div
                      className="h-full rounded-l-full"
                      style={{ background: 'linear-gradient(90deg, #10b981, #059669)', boxShadow: '0 0 8px #10b98160' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${winRate}%` }}
                      transition={{ duration: 1.2, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                    />
                    <motion.div className="h-full rounded-r-full flex-1" style={{ background: '#1e293b' }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs font-mono" style={{ color: '#10b981' }}>{wins}W</span>
                    <span className="text-xs font-mono" style={{ color: '#ff2244' }}>{losses}L</span>
                  </div>
                </div>
                <div className="text-center shrink-0">
                  <p className="font-display text-2xl font-black" style={{ color: winRate >= 50 ? '#10b981' : '#ff2244' }}>
                    {winRate}%
                  </p>
                  <p className="text-xs font-mono text-arena-muted">WIN RATE</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}