import React, { useRef, useEffect, useCallback } from 'react'

// Matches engine SimulationEvent types exactly
const TYPE_MAP = {
  attack_detected:       { color: '#ff2244', prefix: 'ATCK', bg: '#ff224412' },
  defense_triggered:     { color: '#00d4ff', prefix: 'DFNS', bg: '#00d4ff12' },
  vulnerability_exposed: { color: '#f59e0b', prefix: 'VULN', bg: '#f59e0b12' },
  system_state_change:   { color: '#a78bfa', prefix: 'SYS ',  bg: '#a78bfa12' },
}

// Severity overrides the color when more specific
const SEVERITY_COLOR = {
  critical: '#ff2244',
  high:     '#ff6600',
  medium:   '#f59e0b',
  low:      '#10b981',
}

function formatTime(iso) {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return '--:--:--'
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`
  } catch { return '--:--:--' }
}

export default function TerminalLog({ logs = [], title = 'LIVE THREAT FEED' }) {
  const containerRef = useRef(null)
  const userScrolled = useRef(false)
  const timerRef     = useRef(null)

  useEffect(() => {
    if (!userScrolled.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [logs.length])

  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60
    userScrolled.current = !atBottom
    clearTimeout(timerRef.current)
    if (!atBottom) {
      timerRef.current = setTimeout(() => { userScrolled.current = false }, 3000)
    }
  }, [])

  return (
    <div className="terminal-window flex flex-col h-full rounded-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-arena-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-80" />
          </div>
          <span className="text-xs font-display text-arena-muted tracking-widest">{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" style={{ boxShadow: '0 0 6px #10b981' }} />
          <span className="text-xs text-arena-muted font-mono">{logs.length} events</span>
        </div>
      </div>

      {/* Entries */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto font-mono text-xs"
        style={{ scrollBehavior: 'auto' }}
      >
        {logs.length === 0 ? (
          <div className="text-arena-muted text-center py-8 opacity-40 text-xs">
            Awaiting transmission...
          </div>
        ) : (
          <div className="p-2 space-y-px">
            {logs.map((log) => {
              const typeStyle = TYPE_MAP[log.type]   || TYPE_MAP.system_state_change
              const color     = SEVERITY_COLOR[log.severity] || typeStyle.color
              return (
                <div
                  key={log.id}
                  className="flex items-baseline gap-2 px-2 py-1 rounded-sm leading-5"
                  style={{ background: typeStyle.bg }}
                >
                  {/* Timestamp */}
                  <span className="shrink-0 tabular-nums select-none opacity-40 text-arena-muted w-16">
                    {formatTime(log.timestamp)}
                  </span>
                  {/* Badge */}
                  <span
                    className="shrink-0 tabular-nums font-bold text-xs px-1 rounded-sm"
                    style={{ color: typeStyle.color, background: `${typeStyle.color}25`, letterSpacing: '0.05em' }}
                  >
                    {typeStyle.prefix}
                  </span>
                  {/* Message */}
                  <span className="min-w-0 break-words" style={{ color }}>
                    {log.message}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer cursor */}
      <div className="px-3 py-1.5 border-t border-arena-border shrink-0 flex items-center gap-2">
        <span className="text-xs text-arena-muted font-mono opacity-60">root@arena:~$</span>
        <span className="inline-block w-1.5 h-3.5 bg-slate-400 animate-pulse align-middle opacity-70" />
      </div>
    </div>
  )
}