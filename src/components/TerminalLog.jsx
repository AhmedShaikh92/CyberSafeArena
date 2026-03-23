import React, { useRef, useEffect, useCallback, useState } from 'react'

// Event type metadata
const TYPE_MAP = {
  attack_detected:       { color: '#ff3355', bg: 'rgba(255,51,85,0.07)',   badge: 'ATK', badgeBg: 'rgba(255,51,85,0.15)' },
  defense_triggered:     { color: '#00c8f0', bg: 'rgba(0,200,240,0.06)',   badge: 'DEF', badgeBg: 'rgba(0,200,240,0.14)' },
  vulnerability_exposed: { color: '#f5a623', bg: 'rgba(245,166,35,0.07)',  badge: 'VLN', badgeBg: 'rgba(245,166,35,0.15)' },
  system_state_change:   { color: '#9d8df1', bg: 'rgba(157,141,241,0.07)', badge: 'SYS', badgeBg: 'rgba(157,141,241,0.15)' },
}

const SEVERITY_COLOR = {
  critical: '#ff3355',
  high:     '#ff6b35',
  medium:   '#f5a623',
  low:      '#2ecc9a',
}

const SEVERITY_RANK = { critical: 4, high: 3, medium: 2, low: 1 }

function formatTime(iso) {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return '--:--:--'
    return [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map(n => String(n).padStart(2, '0'))
      .join(':')
  } catch {
    return '--:--:--'
  }
}

// Individual log entry — memoized to avoid re-renders on new log additions
const LogEntry = React.memo(function LogEntry({ log }) {
  const typeStyle  = TYPE_MAP[log.type] || TYPE_MAP.system_state_change
  const textColor  = SEVERITY_COLOR[log.severity] || typeStyle.color

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '8px',
        padding: '5px 10px',
        borderRadius: '4px',
        background: typeStyle.bg,
        lineHeight: '1.55',
        animation: 'entryFadeIn 0.18s ease-out both',
      }}
    >
      {/* Timestamp */}
      <span style={{
        flexShrink: 0,
        fontVariantNumeric: 'tabular-nums',
        fontSize: '10px',
        letterSpacing: '0.04em',
        color: 'rgba(160,170,190,0.55)',
        width: '54px',
        userSelect: 'none',
      }}>
        {formatTime(log.timestamp)}
      </span>

      {/* Type badge */}
      <span style={{
        flexShrink: 0,
        fontSize: '9px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        padding: '1px 5px',
        borderRadius: '3px',
        color: typeStyle.color,
        background: typeStyle.badgeBg,
        fontFamily: 'inherit',
      }}>
        {typeStyle.badge}
      </span>

      {/* Severity dot */}
      {log.severity && (
        <span style={{
          flexShrink: 0,
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: SEVERITY_COLOR[log.severity] || 'transparent',
          marginTop: '2px',
          alignSelf: 'center',
          boxShadow: log.severity === 'critical'
            ? `0 0 5px ${SEVERITY_COLOR.critical}`
            : 'none',
        }} />
      )}

      {/* Message */}
      <span style={{
        flex: 1,
        minWidth: 0,
        wordBreak: 'break-word',
        fontSize: '11px',
        color: textColor,
        opacity: log.severity === 'low' ? 0.75 : 1,
      }}>
        {log.message}
      </span>
    </div>
  )
})

export default function TerminalLog({ logs = [], title = 'LIVE THREAT FEED' }) {
  const containerRef   = useRef(null)
  const userScrolled   = useRef(false)
  const resumeTimer    = useRef(null)
  const [showJump, setShowJump] = useState(false)

  // Auto-scroll to bottom when new logs arrive (unless user scrolled up)
  useEffect(() => {
    if (!userScrolled.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [logs.length])

  // Show "jump to latest" button when user scrolled away from bottom
  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    const atBottom = distFromBottom < 48

    userScrolled.current = !atBottom
    setShowJump(!atBottom)

    clearTimeout(resumeTimer.current)
    if (!atBottom) {
      resumeTimer.current = setTimeout(() => {
        userScrolled.current = false
        setShowJump(false)
        if (containerRef.current) {
          containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' })
        }
      }, 6000)
    }
  }, [])

  const jumpToLatest = useCallback(() => {
    userScrolled.current = false
    setShowJump(false)
    clearTimeout(resumeTimer.current)
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' })
  }, [])

  // Counts for the status strip
  const criticalCount = logs.filter(l => l.severity === 'critical').length
  const highCount     = logs.filter(l => l.severity === 'high').length

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      borderRadius: '6px',
      overflow: 'hidden',
      background: '#0d1117',
      border: '1px solid rgba(255,255,255,0.07)',
      fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", ui-monospace, monospace',
    }}>
      <style>{`
        @keyframes entryFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1);   opacity: 1; }
          50%       { transform: scale(1.6); opacity: 0.6; }
        }
        .terminal-scroll::-webkit-scrollbar { width: 4px; }
        .terminal-scroll::-webkit-scrollbar-track { background: transparent; }
        .terminal-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .terminal-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .jump-btn:hover { background: rgba(0,200,240,0.2) !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.3)',
        flexShrink: 0,
      }}>
        {/* Left: traffic lights + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
              <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c, opacity: 0.85 }} />
            ))}
          </div>
          <span style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.15em',
            color: 'rgba(160,180,210,0.7)',
            userSelect: 'none',
          }}>
            {title}
          </span>
        </div>

        {/* Right: live indicator + severity badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {criticalCount > 0 && (
            <span style={{
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em',
              padding: '1px 6px', borderRadius: '3px',
              color: '#ff3355', background: 'rgba(255,51,85,0.15)',
            }}>
              {criticalCount} CRIT
            </span>
          )}
          {highCount > 0 && (
            <span style={{
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em',
              padding: '1px 6px', borderRadius: '3px',
              color: '#ff6b35', background: 'rgba(255,107,53,0.14)',
            }}>
              {highCount} HIGH
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#2ecc9a',
              animation: 'pulse-dot 2s ease-in-out infinite',
              boxShadow: '0 0 5px rgba(46,204,154,0.6)',
            }} />
            <span style={{ fontSize: '10px', color: 'rgba(160,180,210,0.5)' }}>
              {logs.length} events
            </span>
          </div>
        </div>
      </div>

      {/* ── Log body ── */}
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="terminal-scroll"
          style={{
            height: '100%',
            overflowY: 'auto',
            scrollBehavior: 'auto',
          }}
        >
          {logs.length === 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'rgba(160,180,210,0.2)',
              fontSize: '11px',
              letterSpacing: '0.1em',
            }}>
              awaiting transmission...
            </div>
          ) : (
            <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {/* Oldest entries first (top), newest last (bottom) — natural reading order */}
              {logs.map(log => <LogEntry key={log.id} log={log} />)}
            </div>
          )}
        </div>

        {/* Jump-to-latest pill — floats above the scroll area */}
        {showJump && (
          <button
            className="jump-btn"
            onClick={jumpToLatest}
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,200,240,0.12)',
              border: '1px solid rgba(0,200,240,0.3)',
              borderRadius: '12px',
              color: '#00c8f0',
              fontSize: '10px',
              fontFamily: 'inherit',
              fontWeight: 600,
              letterSpacing: '0.06em',
              padding: '4px 12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s',
              zIndex: 10,
            }}
          >
            ↓ jump to latest
          </button>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.2)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '10px', color: 'rgba(160,180,210,0.35)' }}>
          root@arena:~$
        </span>
        <div style={{
          width: '6px',
          height: '13px',
          background: 'rgba(160,180,210,0.45)',
          animation: 'blink 1.1s step-start infinite',
        }} />
      </div>
    </div>
  )
}