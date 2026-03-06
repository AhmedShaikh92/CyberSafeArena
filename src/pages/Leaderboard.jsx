import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'
import RoleBadge from '../components/RoleBadge'

// ─── Mock fallback ────────────────────────────────────────────────────────────
const MOCK = Array.from({ length: 20 }, (_, i) => ({
  position: i + 1,
  username:  ['shadow_operator','null_ptr','r00tkit_xx','ghost_in_net','zero_day_Z','darkn3t','pwnstar','b1tsec','nmap_ninja','hackerman42','bytebreaker','exploit_dev','sec_monk','red_daemon','blueteam_1','nis_42','ghost_coder','crypt0r','voidops','heist_xr'][i],
  role:      i % 2 === 0 ? 'red_team' : 'blue_team',
  rank:      Math.max(0, 5 - Math.floor(i / 4)),
  rankName:  ['Trainee','Defender','Analyst','Expert','Specialist','Master'][Math.max(0, 5 - Math.floor(i / 4))],
  xp:        Math.max(100, 3200 - i * 150),
  wins:      Math.max(1, 45 - i * 2),
  losses:    Math.max(1, 5 + i),
  gamesPlayed: Math.max(2, 50 - i * 2),
})).map(p => ({ ...p, winRate: Math.round(p.wins / p.gamesPlayed * 100) }))

const RANK_META = {
  1: { color: '#f59e0b', glow: '#f59e0b', medal: '🥇' },
  2: { color: '#94a3b8', glow: '#94a3b8', medal: '🥈' },
  3: { color: '#cd7f32', glow: '#cd7f32', medal: '🥉' },
}

const FILTERS = [
  { key: 'all',       label: 'ALL',       param: null },
  { key: 'red_team',  label: 'RED TEAM',  param: 'red_team',  color: '#ff2244' },
  { key: 'blue_team', label: 'BLUE TEAM', param: 'blue_team', color: '#00d4ff' },
]

const PAGE_SIZE = 10

// ─── Normalise API entry → display shape ─────────────────────────────────────
function normalise(p, i) {
  const games = p.gamesPlayed ?? (p.wins + p.losses) ?? 0
  const wr    = p.winRate != null
    ? Math.round(parseFloat(p.winRate))          // API returns string from .toFixed(1)
    : games > 0 ? Math.round(p.wins / games * 100) : 0
  return {
    position:   p.position ?? i + 1,
    username:   p.username,
    role:       p.role ?? null,                  // not returned by API — null is fine, RoleBadge handles it
    rank:       p.rank      ?? 0,
    rankName:   p.rankName  ?? 'Trainee',
    xp:         p.xp        ?? 0,
    wins:       p.wins      ?? 0,
    losses:     p.losses    ?? 0,
    winRate:    wr,
  }
}

// ─── Top-3 podium ─────────────────────────────────────────────────────────────
function Podium({ players }) {
  if (players.length < 3) return null
  // order: 2nd, 1st, 3rd
  const order = [players[1], players[0], players[2]]
  const heights = ['h-20', 'h-28', 'h-14']
  const sizes   = ['text-3xl', 'text-4xl', 'text-2xl']

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      className="flex items-end justify-center gap-3 mb-6"
    >
      {order.map((p, i) => {
        const pos    = [2, 1, 3][i]
        const meta   = RANK_META[pos]
        const isFirst = pos === 1
        return (
          <div key={p.username} className="flex flex-col items-center gap-2 w-28">
            {/* Avatar */}
            <motion.div
              animate={{ boxShadow: [`0 0 12px ${meta.glow}30`, `0 0 24px ${meta.glow}55`, `0 0 12px ${meta.glow}30`] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-12 h-12 rounded-sm flex items-center justify-center font-display font-black text-xl"
              style={{ background: `${meta.color}15`, border: `2px solid ${meta.color}50`, color: meta.color }}
            >
              {p.username[0].toUpperCase()}
            </motion.div>
            <p className="text-xs font-mono text-white font-bold truncate w-full text-center">{p.username}</p>
            <p className="text-xs font-mono text-arena-muted truncate w-full text-center">{p.rankName}</p>
            {/* Podium block */}
            <div className={`w-full ${heights[i]} rounded-t-sm flex flex-col items-center justify-center gap-1 relative overflow-hidden`}
              style={{ background: `${meta.color}12`, border: `1px solid ${meta.color}35`, borderBottom: 'none' }}>
              <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${meta.color}18, transparent)` }} />
              <span className={sizes[i]}>{meta.medal}</span>
              <span className="text-xs font-display font-bold" style={{ color: meta.color }}>
                {p.xp.toLocaleString()} XP
              </span>
            </div>
          </div>
        )
      })}
    </motion.div>
  )
}

// ─── Table row ────────────────────────────────────────────────────────────────
function PlayerRow({ player, index, isMe }) {
  const meta     = RANK_META[player.position]
  const isTop3   = player.position <= 3
  const rowColor = meta?.color
  const wrColor  = player.winRate >= 60 ? '#10b981' : player.winRate >= 40 ? '#f59e0b' : '#ff2244'

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.025 }}
      className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-arena-border/40 items-center transition-colors"
      style={{
        background:   isMe    ? 'rgba(0,212,255,0.04)' : isTop3 ? `${rowColor}06` : 'transparent',
        borderLeft:   isMe    ? '2px solid #00d4ff60'  : isTop3 ? `2px solid ${rowColor}55` : '2px solid transparent',
      }}
    >
      {/* Rank */}
      <div className="col-span-1">
        {isTop3 ? (
          <span className="font-display text-sm font-black" style={{ color: rowColor, textShadow: `0 0 8px ${rowColor}` }}>
            #{player.position}
          </span>
        ) : (
          <span className="font-mono text-xs text-arena-muted">#{player.position}</span>
        )}
      </div>

      {/* Name */}
      <div className="col-span-3">
        <div className="flex items-center gap-1.5">
          <span className={`font-mono text-sm font-bold ${isTop3 || isMe ? 'text-white' : 'text-slate-300'}`}>
            {player.username}
          </span>
          {isMe && <span className="text-xs font-mono px-1.5 py-0.5 rounded-sm" style={{ background: '#00d4ff15', color: '#00d4ff', border: '1px solid #00d4ff30' }}>YOU</span>}
        </div>
        <span className="text-xs text-arena-muted">{player.rankName}</span>
      </div>

      {/* Role */}
      <div className="col-span-2">
        {player.role ? <RoleBadge role={player.role} size="sm" /> : (
          <span className="text-xs font-mono text-arena-muted">—</span>
        )}
      </div>

      {/* Rank level */}
      <div className="col-span-1">
        <span className="font-mono text-xs" style={{ color: '#00d4ff' }}>{player.rank}</span>
      </div>

      {/* XP */}
      <div className="col-span-2 text-right">
        <span className="font-mono text-xs text-white">{player.xp.toLocaleString()}</span>
      </div>

      {/* Win% */}
      <div className="col-span-1 text-right">
        <span className="font-mono text-xs font-bold" style={{ color: wrColor }}>{player.winRate}%</span>
      </div>

      {/* W/L */}
      <div className="col-span-2 text-right font-mono text-xs">
        <span style={{ color: '#10b981' }}>{player.wins}</span>
        <span className="text-arena-muted"> / </span>
        <span style={{ color: '#ff2244' }}>{player.losses}</span>
      </div>
    </motion.div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Leaderboard() {
  const { user }  = useAuthStore()
  const [all, setAll]       = useState(MOCK)
  const [filter, setFilter] = useState('all')
  const [page, setPage]     = useState(0)
  const [loading, setLoading] = useState(true)
  const tableRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    const roleParam = FILTERS.find(f => f.key === filter)?.param
    const url = roleParam
      ? `/progression/leaderboard/global?limit=100&role=${roleParam}`
      : `/progression/leaderboard/global?limit=100`

    api.get(url)
      .then(r => {
        const data = r.data.leaderboard ?? r.data
        if (Array.isArray(data) && data.length > 0) {
          setAll(data.map(normalise))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filter])

  const handleFilter = (key) => {
    if (key === filter) return
    setFilter(key)
    setPage(0)
  }

  // Client-side role filter on mock (API filters server-side)
  const filtered    = filter === 'all' ? all : all.filter(p => p.role === filter || p.role === null)
  const paginated   = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE)
  const top3        = filtered.slice(0, 3)

  const scrollToTable = () => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-xs font-mono text-arena-muted tracking-widest mb-1">// GLOBAL RANKINGS</p>
        <h1 className="font-display text-2xl font-bold neon-text-blue tracking-widest">OPERATOR LEADERBOARD</h1>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
        className="flex items-center gap-2 mb-5">
        {FILTERS.map(({ key, label, color }) => {
          const active = filter === key
          const c = color ?? '#00d4ff'
          return (
            <motion.button key={key} onClick={() => handleFilter(key)}
              className="px-4 py-1.5 text-xs font-display tracking-wider rounded-sm transition-all"
              style={active
                ? { color: c, border: `1px solid ${c}40`, background: `${c}15`, textShadow: `0 0 8px ${c}` }
                : { color: '#475569', border: '1px solid #1e293b', background: 'transparent' }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              {label}
            </motion.button>
          )
        })}
      </motion.div>

      {/* Podium — only on page 0, no active filter */}
      <AnimatePresence>
        {!loading && page === 0 && top3.length >= 3 && (
          <Podium players={top3} />
        )}
      </AnimatePresence>

      {/* Table */}
      <motion.div ref={tableRef} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="glass-panel rounded-sm overflow-hidden">

        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-arena-border text-xs font-display tracking-widest text-arena-muted">
          <div className="col-span-1">RANK</div>
          <div className="col-span-3">OPERATOR</div>
          <div className="col-span-2">ROLE</div>
          <div className="col-span-1">LVL</div>
          <div className="col-span-2 text-right">XP</div>
          <div className="col-span-1 text-right">WIN%</div>
          <div className="col-span-2 text-right">W / L</div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12 gap-3">
            <motion.div className="w-4 h-4 rounded-full border border-t-transparent"
              style={{ borderColor: '#00d4ff', borderTopColor: 'transparent' }}
              animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
            <span className="text-xs font-mono text-arena-muted">Loading operators...</span>
          </div>
        )}

        {/* Rows */}
        {!loading && paginated.map((player, i) => (
          <PlayerRow
            key={player.username}
            player={player}
            index={i}
            isMe={user?.username === player.username}
          />
        ))}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-xs font-mono text-arena-muted">No operators found</div>
        )}
      </motion.div>

      {/* Pagination — prev/next + page indicator */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <motion.button
            onClick={() => { setPage(p => Math.max(0, p - 1)); scrollToTable() }}
            disabled={page === 0}
            className="px-4 py-1.5 text-xs font-mono rounded-sm transition-all"
            style={page === 0
              ? { color: '#2d3748', border: '1px solid #1e293b', cursor: 'not-allowed' }
              : { color: '#94a3b8', border: '1px solid #334155', background: 'transparent' }}
            whileHover={page > 0 ? { scale: 1.04 } : {}}>
            ← PREV
          </motion.button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => (
              <motion.button key={i}
                onClick={() => { setPage(i); scrollToTable() }}
                className="w-7 h-7 text-xs font-mono rounded-sm transition-all"
                style={page === i
                  ? { background: '#00d4ff18', border: '1px solid #00d4ff40', color: '#00d4ff' }
                  : { background: 'transparent', border: '1px solid #1e293b', color: '#475569' }}
                whileHover={{ scale: 1.1 }}>
                {i + 1}
              </motion.button>
            ))}
          </div>

          <motion.button
            onClick={() => { setPage(p => Math.min(totalPages - 1, p + 1)); scrollToTable() }}
            disabled={page === totalPages - 1}
            className="px-4 py-1.5 text-xs font-mono rounded-sm transition-all"
            style={page === totalPages - 1
              ? { color: '#2d3748', border: '1px solid #1e293b', cursor: 'not-allowed' }
              : { color: '#94a3b8', border: '1px solid #334155', background: 'transparent' }}
            whileHover={page < totalPages - 1 ? { scale: 1.04 } : {}}>
            NEXT →
          </motion.button>
        </div>
      )}
    </div>
  )
}