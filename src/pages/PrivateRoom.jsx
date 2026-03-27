import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useRoomStore } from '../store/roomStore'
import { useAuthStore } from '../store/authStore'
import { useProgressionStore } from '../store/progressionStore'
import { useRoom } from '../hooks/useRoom'
import RoleBadge from '../components/RoleBadge'
import CyberGrid from '../components/CyberGrid'

// ─── CodeChar ────────────────────────────────────────────
function CodeChar({ char, index }) {
  return (
    <motion.span
      key={char + index}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="inline-flex items-center justify-center font-display font-black rounded-sm"
      style={{
        width: 'clamp(36px, 10vw, 44px)',
        height: 'clamp(44px, 12vw, 52px)',
        fontSize: 'clamp(18px, 5vw, 24px)',
        color: '#00d4ff',
        textShadow: '0 0 15px #00d4ff',
        background: 'rgba(0,212,255,0.08)',
        border: '1px solid rgba(0,212,255,0.3)',
        boxShadow: '0 0 12px rgba(0,212,255,0.1)',
      }}
    >
      {char}
    </motion.span>
  )
}

// ─── RoomCodeDisplay ─────────────────────────────────────
function RoomCodeDisplay({ code }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="text-center">
      <p className="text-xs font-mono text-arena-muted tracking-widest mb-3">ROOM ACCESS CODE</p>
      <div className="flex justify-center gap-2 mb-4">
        {code.split('').map((c, i) => <CodeChar key={i} char={c} index={i} />)}
      </div>
      <motion.button
        onClick={copy}
        className="text-xs font-mono px-4 py-2 rounded-sm"
        style={{
          minHeight: '44px',
          ...(copied
            ? { color: '#10b981', border: '1px solid #10b98140', background: '#10b98110' }
            : { color: '#475569', border: '1px solid #1e293b', background: 'transparent' }),
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {copied ? '✓ COPIED TO CLIPBOARD' : '⎘ COPY CODE'}
      </motion.button>
    </div>
  )
}

// ─── MemberSlot ──────────────────────────────────────────
function MemberSlot({ member, isHost, onKick, currentUserId, currentUserRole }) {
  const isMe = String(member.userId) === String(currentUserId)
  const effectiveRole = isMe ? currentUserRole : member.role
  const isMemberAttacker = effectiveRole === 'attacker' || effectiveRole === 'red_team'

  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 15 }}
      className="flex items-center justify-between p-3 rounded-sm gap-2"
      style={{
        background: isMe ? 'rgba(0,212,255,0.05)' : 'rgba(15,23,42,0.6)',
        border: `1px solid ${isMe ? 'rgba(0,212,255,0.2)' : 'rgba(30,41,59,0.8)'}`,
      }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="w-9 h-9 rounded-sm flex items-center justify-center font-display font-bold text-sm shrink-0"
          style={{
            border: `1px solid ${isMemberAttacker ? '#ff224440' : '#00d4ff40'}`,
            color: isMemberAttacker ? '#ff2244' : '#00d4ff',
            background: isMemberAttacker ? '#ff224408' : '#00d4ff08',
          }}
        >
          {member.username?.[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-mono text-white font-bold truncate">{member.username}</span>
            {isMe && <span className="text-xs font-mono text-arena-muted shrink-0">(you)</span>}
            {member.isHost && (
              <span className="text-xs font-display px-1.5 py-0.5 tracking-wider shrink-0"
                style={{ color: '#f59e0b', border: '1px solid #f59e0b30', background: '#f59e0b08' }}>
                HOST
              </span>
            )}
          </div>
          <span className="text-xs text-arena-muted">{member.levelName || 'Operator'}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {effectiveRole && (
          <AnimatePresence mode="wait">
            <motion.div
              key={effectiveRole}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <RoleBadge role={effectiveRole} size="sm" />
            </motion.div>
          </AnimatePresence>
        )}
        {isHost && !isMe && (
          <motion.button
            onClick={() => onKick(member.userId)}
            className="text-xs font-mono px-2 py-1 rounded-sm"
            style={{ color: '#ff2244', border: '1px solid #ff224430', minHeight: '36px', minWidth: '44px' }}
            whileHover={{ background: '#ff224415' }}
          >
            KICK
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

// ─── EmptySlot ───────────────────────────────────────────
function EmptySlot({ index }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center gap-3 p-3 rounded-sm"
      style={{ border: '1px dashed rgba(30,41,59,0.8)' }}
    >
      <div className="w-9 h-9 rounded-sm border border-dashed border-arena-border flex items-center justify-center shrink-0">
        <span className="text-arena-muted text-lg">+</span>
      </div>
      <div>
        <span className="text-xs font-mono text-arena-muted">Waiting for operator...</span>
        <div className="flex gap-0.5 mt-1">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} className="w-1 h-1 rounded-full bg-arena-muted"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── CodeInput ───────────────────────────────────────────
function CodeInput({ value, onChange }) {
  const LENGTH = 4
  const refs = useRef([])

  const handleKey = (e, i) => {
    const key = e.key.toUpperCase()
    if (key === 'BACKSPACE') {
      e.preventDefault()
      onChange(value.slice(0, i) + value.slice(i + 1))
      if (i > 0) refs.current[i - 1]?.focus()
      return
    }
    if (key === 'ARROWLEFT' && i > 0) { refs.current[i - 1]?.focus(); return }
    if (key === 'ARROWRIGHT' && i < LENGTH - 1) { refs.current[i + 1]?.focus(); return }
    if (/^[A-Z0-9]$/.test(key)) {
      e.preventDefault()
      const arr = value.split('')
      arr[i] = key
      onChange(arr.join('').slice(0, LENGTH))
      if (i < LENGTH - 1) refs.current[i + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, LENGTH)
    onChange(pasted)
    refs.current[Math.min(pasted.length, LENGTH - 1)]?.focus()
  }

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: LENGTH }).map((_, i) => {
        const char = value[i] || ''
        const isFilled = !!char
        return (
          <motion.input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            type="text"
            inputMode="text"
            maxLength={1}
            value={char}
            onKeyDown={(e) => handleKey(e, i)}
            onPaste={handlePaste}
            onChange={() => {}}
            className="text-center font-display font-black rounded-sm outline-none caret-transparent select-none"
            style={{
              width: 'clamp(48px, 16vw, 56px)',
              height: 'clamp(52px, 16vw, 60px)',
              fontSize: 'clamp(20px, 6vw, 26px)',
              background: isFilled ? 'rgba(255,34,68,0.1)' : 'rgba(15,23,42,0.8)',
              border: `1px solid ${isFilled ? '#ff224460' : 'rgba(30,41,59,0.8)'}`,
              color: isFilled ? '#ff2244' : '#475569',
              textShadow: isFilled ? '0 0 12px #ff2244' : 'none',
            }}
            whileFocus={{ borderColor: '#ff2244', boxShadow: '0 0 15px rgba(255,34,68,0.25)' }}
          />
        )
      })}
    </div>
  )
}

// ─── Constants ───────────────────────────────────────────
const SCENARIOS = [
  { value: 'random',           label: 'Random Scenario' },
  { value: 'brute_force',      label: 'Brute Force' },
  { value: 'sql_injection',    label: 'SQL Injection' },
  { value: 'xss',              label: 'XSS' },
  { value: 'phishing',         label: 'Phishing' },
  { value: 'jwt_manipulation', label: 'JWT Manipulation' },
  { value: 'network_anomaly',  label: 'Network Anomaly' },
]
const DIFFICULTIES = ['easy', 'medium', 'hard']
const DIFF_COLORS   = { easy: '#10b981', medium: '#f59e0b', hard: '#ff6600' }

// ─── LobbyView ───────────────────────────────────────────
function LobbyView({ roomCode, members, isHost, config, currentUserId, currentUserRole,
  canStart, onKick, onUpdateConfig, onStart, onLeave, status }) {
  return (
    <div className="min-h-screen flex items-start justify-center relative pt-20 pb-8 px-4">
      <CyberGrid />
      <div className="relative z-10 w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel rounded-sm overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-arena-border flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.05), transparent)' }}>
            <div>
              <p className="text-xs font-mono text-arena-muted tracking-widest mb-0.5">PRIVATE ROOM</p>
              <h2 className="font-display text-base sm:text-lg font-bold neon-text-blue tracking-wider">
                OPERATOR LOBBY
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="status-dot green" />
              <span className="text-xs font-mono text-arena-muted">LIVE</span>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-5">
            {roomCode && <RoomCodeDisplay code={roomCode} />}

            {/* Members */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-xs tracking-widest text-arena-muted">
                  OPERATORS ({members.length}/{config.maxPlayers || 2})
                </h3>
                <span className="text-xs font-mono">
                  {members.length >= 2
                    ? <span style={{ color: '#10b981' }}>✓ Ready</span>
                    : <span style={{ color: '#f59e0b' }}>Waiting...</span>}
                </span>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {members.map((m) => (
                    <MemberSlot key={m.userId} member={m} isHost={isHost}
                      onKick={onKick} currentUserId={currentUserId} currentUserRole={currentUserRole} />
                  ))}
                  {Array.from({ length: Math.max(0, (config.maxPlayers || 2) - members.length) }).map((_, i) => (
                    <EmptySlot key={`empty-${i}`} index={i} />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Config summary — stacks on mobile */}
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: 'SCENARIO',
                  value: SCENARIOS.find(s => s.value === config.scenario)?.label ?? config.scenario ?? 'Random',
                  color: '#00d4ff',
                },
                {
                  label: 'DIFFICULTY',
                  value: (config.difficulty || 'medium').toUpperCase(),
                  color: DIFF_COLORS[config.difficulty] || '#f59e0b',
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-3 rounded-sm" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                  <p className="text-xs font-mono text-arena-muted mb-0.5">{label}</p>
                  <p className="text-xs sm:text-sm font-display font-bold truncate" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Host controls */}
            {isHost && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-sm"
                style={{ background: 'rgba(0,212,255,0.03)', border: '1px dashed rgba(0,212,255,0.15)' }}
              >
                <p className="text-xs font-display tracking-widest text-arena-muted mb-3">HOST CONTROLS</p>
                {/* Stacks to 1 col on small screens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-arena-muted block mb-1">SCENARIO</label>
                    <select
                      value={config.scenario}
                      onChange={(e) => onUpdateConfig({ scenario: e.target.value })}
                      className="w-full bg-black/40 border border-arena-border rounded-sm px-2 py-2 text-xs font-mono text-white outline-none"
                      style={{ minHeight: '44px' }}
                    >
                      {SCENARIOS.map(({ value, label }) => (
                        <option key={value} value={value} style={{ background: '#0f172a' }}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-mono text-arena-muted block mb-1">DIFFICULTY</label>
                    <select
                      value={config.difficulty}
                      onChange={(e) => onUpdateConfig({ difficulty: e.target.value })}
                      className="w-full bg-black/40 border border-arena-border rounded-sm px-2 py-2 text-xs font-mono text-white outline-none"
                      style={{ minHeight: '44px' }}
                    >
                      {DIFFICULTIES.map((d) => (
                        <option key={d} value={d} style={{ background: '#0f172a' }}>{d.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action buttons — stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                onClick={onLeave}
                className="btn-danger rounded-sm sm:flex-1"
                style={{ minHeight: '48px' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isHost ? 'CLOSE ROOM' : 'LEAVE ROOM'}
              </motion.button>

              {isHost && (
                <motion.button
                  onClick={onStart}
                  disabled={!canStart || status === 'starting'}
                  className="rounded-sm px-6 py-3 font-display text-sm font-bold tracking-widest uppercase sm:flex-1"
                  style={{
                    minHeight: '48px',
                    ...(canStart ? {
                      background: 'rgba(0,212,255,0.1)',
                      border: '1px solid #00d4ff',
                      color: '#00d4ff',
                      textShadow: '0 0 10px #00d4ff',
                    } : {
                      background: 'transparent',
                      border: '1px solid #1e293b',
                      color: '#475569',
                      cursor: 'not-allowed',
                    }),
                  }}
                  animate={canStart ? {
                    boxShadow: ['0 0 15px rgba(0,212,255,0.2)', '0 0 30px rgba(0,212,255,0.4)', '0 0 15px rgba(0,212,255,0.2)'],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {status === 'starting' ? 'LAUNCHING...' : canStart ? '⚡ LAUNCH MATCH' : `NEED ${2 - members.length} MORE`}
                </motion.button>
              )}

              {!isHost && (
                <div className="sm:flex-1 flex items-center justify-center py-3 rounded-sm text-xs font-mono text-arena-muted"
                  style={{ border: '1px dashed #1e293b', minHeight: '48px' }}>
                  <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
                    Waiting for host...
                  </motion.span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────
export default function PrivateRoom() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    roomCode, isHost, members, status, error, config,
    createRoom, joinRoom, leaveRoom, kickMember,
    updateConfig, startRoom, clearError,
  } = useRoomStore()
  const { applyMatchXP, incrementWin, incrementLoss } = useProgressionStore()

  useRoom()

  const [view, setView]           = useState('choose')
  const [joinCode, setJoinCode]   = useState('')
  const [localConfig, setLocalConfig] = useState({ scenario: 'random', difficulty: 'medium', maxPlayers: 2 })
  const [joinError, setJoinError] = useState('')

  React.useEffect(() => { if (status === 'lobby') setView('lobby') }, [status])
  React.useEffect(() => {
    if (status === 'error' && error) { setJoinError(error); clearError() }
  }, [status, error])

  const handleCreate = () => createRoom(localConfig)
  const handleJoin   = () => {
    if (joinCode.length < 4) { setJoinError('Code must be 4 characters'); return }
    setJoinError('')
    joinRoom(joinCode)
  }
  const handleLeave = () => { leaveRoom(); setView('choose'); setJoinCode('') }

  const currentUserId   = user?._id || user?.id
  const currentUserRole = user?.role
  const canStart        = members.length >= 2 && isHost

  if (view === 'lobby') {
    return (
      <LobbyView
        roomCode={roomCode} members={members} isHost={isHost}
        config={config} currentUserId={currentUserId} currentUserRole={currentUserRole}
        canStart={canStart} onKick={kickMember} onUpdateConfig={updateConfig}
        onStart={startRoom} onLeave={handleLeave} status={status}
      />
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4">
      <CyberGrid />
      <div className="relative z-10 w-full max-w-lg">
        <AnimatePresence mode="wait">

          {/* ── CHOOSE ── */}
          {view === 'choose' && (
            <motion.div key="choose"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8">
                <p className="text-xs font-mono text-arena-muted tracking-widest mb-2">// PRIVATE OPERATIONS</p>
                <h1 className="font-display font-black tracking-widest" style={{ fontSize: 'clamp(22px, 7vw, 30px)' }}>
                  <span className="neon-text-blue">PRIVATE</span>
                  <span className="neon-text-red ml-2">ROOM</span>
                </h1>
                <p className="text-sm font-mono text-arena-muted mt-2">Challenge a specific operator directly</p>
              </div>

              <div className="space-y-3">
                <motion.button
                  onClick={() => setView('create')}
                  className="w-full p-4 sm:p-5 rounded-sm text-left"
                  style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.25)', minHeight: '80px' }}
                  whileHover={{ background: 'rgba(0,212,255,0.08)', boxShadow: '0 0 25px rgba(0,212,255,0.15)' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-sm flex items-center justify-center text-xl shrink-0"
                      style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>⚡</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm sm:text-base font-bold neon-text-blue tracking-wider">CREATE ROOM</p>
                      <p className="text-xs font-mono text-arena-muted mt-0.5">Generate a code and share with your squad</p>
                    </div>
                    <span className="neon-text-blue text-lg shrink-0">→</span>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => setView('join')}
                  className="w-full p-4 sm:p-5 rounded-sm text-left"
                  style={{ background: 'rgba(255,34,68,0.04)', border: '1px solid rgba(255,34,68,0.25)', minHeight: '80px' }}
                  whileHover={{ background: 'rgba(255,34,68,0.08)', boxShadow: '0 0 25px rgba(255,34,68,0.15)' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-sm flex items-center justify-center text-xl shrink-0"
                      style={{ background: 'rgba(255,34,68,0.1)', border: '1px solid rgba(255,34,68,0.3)' }}>🔑</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm sm:text-base font-bold neon-text-red tracking-wider">JOIN ROOM</p>
                      <p className="text-xs font-mono text-arena-muted mt-0.5">Enter a code from another operator</p>
                    </div>
                    <span className="neon-text-red text-lg shrink-0">→</span>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => navigate('/dashboard')}
                  className="w-full text-center py-3 text-xs font-mono text-arena-muted"
                  style={{ minHeight: '44px' }}
                  whileHover={{ color: '#94a3b8' }}
                >
                  ← Back to Dashboard
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── CREATE ── */}
          {view === 'create' && (
            <motion.div key="create"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="glass-panel rounded-sm p-5 sm:p-7"
            >
              <button
                onClick={() => setView('choose')}
                className="text-xs font-mono text-arena-muted mb-5 flex items-center gap-1 hover:text-slate-300"
                style={{ minHeight: '44px' }}
              >
                ← Back
              </button>
              <h2 className="font-display text-lg sm:text-xl font-bold neon-text-blue tracking-widest mb-5">
                CONFIGURE ROOM
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-arena-muted tracking-wider mb-1.5">SCENARIO</label>
                  <select
                    value={localConfig.scenario}
                    onChange={(e) => setLocalConfig({ ...localConfig, scenario: e.target.value })}
                    className="w-full bg-black/50 border border-arena-border rounded-sm px-3 py-2.5 text-sm font-mono text-white outline-none"
                    style={{ borderColor: 'rgba(0,212,255,0.2)', minHeight: '44px' }}
                  >
                    {SCENARIOS.map(({ value, label }) => (
                      <option key={value} value={value} style={{ background: '#0f172a' }}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-arena-muted tracking-wider mb-1.5">DIFFICULTY</label>
                  <div className="grid grid-cols-3 gap-2">
                    {DIFFICULTIES.map((d) => {
                      const selected = localConfig.difficulty === d
                      return (
                        <motion.button
                          key={d}
                          onClick={() => setLocalConfig({ ...localConfig, difficulty: d })}
                          className="py-2 text-xs font-display tracking-wider rounded-sm uppercase"
                          style={{
                            minHeight: '44px',
                            color: DIFF_COLORS[d],
                            border: `1px solid ${selected ? DIFF_COLORS[d] : DIFF_COLORS[d] + '30'}`,
                            background: selected ? `${DIFF_COLORS[d]}15` : 'transparent',
                            textShadow: selected ? `0 0 8px ${DIFF_COLORS[d]}` : 'none',
                          }}
                          whileHover={{ background: `${DIFF_COLORS[d]}10` }}
                        >
                          {d}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <motion.button
                onClick={handleCreate}
                disabled={status === 'creating'}
                className="btn-primary w-full rounded-sm mt-6"
                style={{ minHeight: '48px' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {status === 'creating' ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full" />
                    GENERATING...
                  </span>
                ) : '⚡ CREATE ROOM'}
              </motion.button>
            </motion.div>
          )}

          {/* ── JOIN ── */}
          {view === 'join' && (
            <motion.div key="join"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="glass-panel rounded-sm p-5 sm:p-7"
            >
              <button
                onClick={() => { setView('choose'); setJoinError('') }}
                className="text-xs font-mono text-arena-muted mb-5 flex items-center gap-1 hover:text-slate-300"
                style={{ minHeight: '44px' }}
              >
                ← Back
              </button>
              <h2 className="font-display text-lg sm:text-xl font-bold neon-text-red tracking-widest mb-2">
                ENTER ROOM CODE
              </h2>
              <p className="text-xs font-mono text-arena-muted mb-6">Get the 4-character code from the room host</p>

              <CodeInput value={joinCode} onChange={(v) => { setJoinCode(v); setJoinError('') }} />

              {joinError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-xs font-mono mt-3 text-center" style={{ color: '#ff2244' }}>
                  ⚠ {joinError}
                </motion.p>
              )}

              <motion.button
                onClick={handleJoin}
                disabled={status === 'joining' || joinCode.length < 4}
                className="mt-6 w-full rounded-sm px-6 py-3 font-display text-sm font-bold tracking-widest uppercase"
                style={{
                  minHeight: '48px',
                  background: joinCode.length >= 4 ? 'rgba(255,34,68,0.08)' : 'transparent',
                  border: `1px solid ${joinCode.length >= 4 ? '#ff2244' : '#1e293b'}`,
                  color: joinCode.length >= 4 ? '#ff2244' : '#475569',
                  textShadow: joinCode.length >= 4 ? '0 0 10px #ff2244' : 'none',
                }}
                whileHover={joinCode.length >= 4 ? { boxShadow: '0 0 25px #ff224430' } : {}}
              >
                {status === 'joining' ? 'CONNECTING...' : '🔑 JOIN ROOM'}
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}