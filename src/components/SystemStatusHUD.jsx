import React, { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Metric definitions ───────────────────────────────────────────────────────

const BASE_METRICS = [
  { key: 'securityScore',   label: 'Security',  icon: '🛡', type: 'score', max: 100 },
  { key: 'systemHealth',    label: 'Health',    icon: '💚', type: 'score', max: 100 },
  { key: 'threatsDetected', label: 'Threats',   icon: '⚠',  type: 'count' },
  { key: 'alertsTriggered', label: 'Alerts',    icon: '🔔', type: 'count' },
]

const SCENARIO_METRICS = {
  brute_force: [
    { key: 'failedLogins',     label: 'Failed Logins', icon: '🔑', type: 'count' },
    { key: 'blockedIPs',       label: 'Blocked IPs',   icon: '🚫', type: 'array' },
    { key: 'rateLimitEnabled', label: 'Rate Limit',    icon: '⏱', type: 'bool'  },
  ],
  sql_injection: [
    { key: 'maliciousQueries',       label: 'SQL Attacks',   icon: '💉', type: 'count' },
    { key: 'dbHealthScore',          label: 'DB Health',     icon: '💾', type: 'score', max: 100 },
    { key: 'inputValidationEnabled', label: 'Input Valid.',  icon: '✅', type: 'bool'  },
  ],
  xss: [
    { key: 'unsanitizedInputs', label: 'Unsanitized', icon: '📜', type: 'count' },
    { key: 'scriptExecutions',  label: 'Executions',  icon: '⚡', type: 'count' },
    { key: 'cssPolicyEnabled',  label: 'CSP',         icon: '🛡', type: 'bool'  },
  ],
  phishing: [
    { key: 'suspiciousEmails',    label: 'Suspicious',  icon: '📧', type: 'count' },
    { key: 'blockedEmails',       label: 'Blocked',     icon: '🚫', type: 'count' },
    { key: 'userCredentialsRisk', label: 'Cred Risk',   icon: '🔐', type: 'risk'  },
  ],
  jwt_manipulation: [
    { key: 'invalidTokenAttempts',   label: 'Bad Tokens',  icon: '🎫', type: 'count' },
    { key: 'tokenValidationEnabled', label: 'Token Valid', icon: '✅', type: 'bool'  },
    { key: 'roleClaimsVerified',     label: 'Claims',      icon: '👤', type: 'bool'  },
  ],
  network_anomaly: [
    { key: 'anomalousTraffic',     label: 'Anomalous',   icon: '📡', type: 'count' },
    { key: 'ddosProtectionActive', label: 'DDoS Shield', icon: '🛡', type: 'bool'  },
    { key: 'incomingPackets',      label: 'Packets',     icon: '📶', type: 'count' },
  ],
}

const POSTURE = {
  hardened:    { color: '#10b981', label: 'HARDENED',    pulse: false },
  partial:     { color: '#f59e0b', label: 'PARTIAL',     pulse: false },
  compromised: { color: '#ff2244', label: 'COMPROMISED', pulse: true  },
}

// ─── Value resolver ───────────────────────────────────────────────────────────

function resolve(metric, value) {
  if (value === undefined || value === null) {
    return { text: '—', color: '#1e3a52', bar: undefined }
  }
  switch (metric.type) {
    case 'score': {
      const pct = Math.min(100, Math.round((value / metric.max) * 100))
      const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ff2244'
      return { text: `${value}`, color, bar: pct }
    }
    case 'count': {
      const color = value === 0 ? '#10b981' : value < 5 ? '#f59e0b' : '#ff2244'
      return { text: String(value), color }
    }
    case 'array': {
      const n = Array.isArray(value) ? value.length : 0
      return { text: `${n}`, color: n === 0 ? '#3d5a73' : '#f59e0b' }
    }
    case 'bool': {
      return value
        ? { text: 'ON',  color: '#10b981' }
        : { text: 'OFF', color: '#ff2244' }
    }
    case 'risk': {
      const c = value === 'low' ? '#10b981' : value === 'medium' ? '#f59e0b' : '#ff2244'
      return { text: String(value).toUpperCase(), color: c }
    }
    default:
      return { text: String(value), color: '#94a3b8' }
  }
}

// ─── Animated bar ─────────────────────────────────────────────────────────────

function Bar({ pct, color }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{ width: '40px', height: '4px', background: '#0a1828', borderRadius: '2px' }}
    >
      <motion.div
        className="absolute inset-y-0 left-0"
        style={{
          background: color,
          boxShadow: `0 0 4px ${color}88`,
          borderRadius: '2px',
        }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  )
}

// ─── Single metric row ────────────────────────────────────────────────────────

function MetricRow({ metric, value, prevValue }) {
  const { text, color, bar } = resolve(metric, value)
  const changed = prevValue !== undefined && prevValue !== value

  return (
    <motion.div
      layout
      className="relative flex items-center justify-between px-3 py-2 overflow-hidden"
      style={{
        background: `${color}07`,
        border: `1px solid ${color}18`,
        borderRadius: '3px',
      }}
    >
      {/* Flash on change */}
      <AnimatePresence>
        {changed && (
          <motion.div
            key={`flash-${value}`}
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            style={{ background: color, borderRadius: '3px' }}
          />
        )}
      </AnimatePresence>

      {/* Label */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm leading-none shrink-0">{metric.icon}</span>
        <span className="font-mono text-xs truncate" style={{ color: '#2d4a62', fontSize: '10px', letterSpacing: '0.05em' }}>
          {metric.label.toUpperCase()}
        </span>
      </div>

      {/* Value */}
      <div className="flex items-center gap-2 shrink-0 ml-2">
        {bar !== undefined && <Bar pct={bar} color={color} />}
        <motion.span
          key={text}
          initial={changed ? { opacity: 0, y: -3 } : false}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono font-bold tabular-nums text-right"
          style={{ color, minWidth: '40px', fontSize: '11px' }}
        >
          {text}
        </motion.span>
      </div>
    </motion.div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div
      className="flex items-center gap-2 mt-1 mb-1"
      style={{ padding: '0 2px' }}
    >
      <div className="flex-1 h-px" style={{ background: '#0a1828' }} />
      <span className="font-mono text-xs tracking-widest" style={{ color: '#0f2035', fontSize: '8px' }}>
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: '#0a1828' }} />
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SystemStatusHUD({ status = {} }) {
  const prevRef = useRef({})

  const postureKey = status.securityPosture || 'compromised'
  const postureCfg = POSTURE[postureKey] || POSTURE.compromised
  const vulnsFound = Number(status.vulnerabilitiesFound ?? 0)
  const vulnsTotal = Number(status.vulnerabilitiesTotal ?? 2)

  const scenarioMetrics = Object.values(SCENARIO_METRICS).find(metrics =>
    metrics.some(m => m.key in status)
  ) ?? []

  const prev = { ...prevRef.current }
  useEffect(() => { prevRef.current = { ...status } })

  return (
    <div
      className="flex flex-col h-full overflow-hidden relative"
      style={{
        background: '#050b16',
        border: '1px solid #0a1828',
        borderRadius: '4px',
      }}
    >
      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)',
          opacity: 0.4,
          zIndex: 0,
        }}
      />

      {/* ── Header ── */}
      <div
        className="relative z-10 flex items-center justify-between px-3 py-2 shrink-0"
        style={{ borderBottom: '1px solid #0a1828', background: 'rgba(0,5,14,0.8)' }}
      >
        <div className="flex items-center gap-2">
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: postureCfg.color }}
            animate={postureCfg.pulse
              ? { opacity: [1, 0.2, 1], scale: [1, 1.4, 1] }
              : { opacity: 1 }
            }
            transition={{ duration: 0.65, repeat: postureCfg.pulse ? Infinity : 0 }}
          />
          <span
            className="font-mono text-xs tracking-widest"
            style={{ color: '#284965', fontSize: '9px', letterSpacing: '0.18em' }}
          >
            SYS STATUS
          </span>
        </div>
        <motion.span
          key={postureKey}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          className="font-mono font-bold tracking-widest"
          style={{
            color: postureCfg.color,
            background: `${postureCfg.color}12`,
            border: `1px solid ${postureCfg.color}35`,
            padding: '2px 8px',
            borderRadius: '2px',
            fontSize: '9px',
          }}
        >
          {postureCfg.label}
        </motion.span>
      </div>

      {/* ── Vuln progress ── */}
      <div
        className="relative z-10 px-3 pt-3 pb-3 shrink-0"
        style={{ borderBottom: '1px solid #0a1828' }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="font-mono" style={{ color: '#284965', fontSize: '9px', letterSpacing: '0.1em' }}>
            VULNERABILITIES PATCHED
          </span>
          <span className="font-mono font-bold tabular-nums" style={{ color: postureCfg.color, fontSize: '11px' }}>
            {vulnsFound}
            <span style={{ color: '#284965' }}>/{vulnsTotal}</span>
          </span>
        </div>
        {/* Segmented bar */}
        <div className="flex gap-1.5">
          {Array.from({ length: vulnsTotal }).map((_, i) => {
            const filled = i < vulnsFound
            return (
              <div
                key={i}
                className="flex-1 overflow-hidden"
                style={{ height: '6px', background: '#0a1828', borderRadius: '2px' }}
              >
                <motion.div
                  className="h-full"
                  style={{
                    background: filled ? postureCfg.color : 'transparent',
                    boxShadow: filled ? `0 0 6px ${postureCfg.color}80` : 'none',
                    borderRadius: '2px',
                  }}
                  animate={{ width: filled ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: i * 0.05 }}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Metrics ── */}
      <div
        className="relative z-10 flex-1 overflow-y-auto min-h-0 px-2 py-2 space-y-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#284965 transparent' }}
      >
        <SectionLabel>CORE METRICS</SectionLabel>
        {BASE_METRICS.map(metric => (
          <MetricRow
            key={metric.key}
            metric={metric}
            value={status[metric.key]}
            prevValue={prev[metric.key]}
          />
        ))}

        {scenarioMetrics.length > 0 && (
          <>
            <SectionLabel>SCENARIO METRICS</SectionLabel>
            {scenarioMetrics.map(metric => (
              <MetricRow
                key={metric.key}
                metric={metric}
                value={status[metric.key]}
                prevValue={prev[metric.key]}
              />
            ))}
          </>
        )}
      </div>

      {/* ── Footer summary ── */}
      <div
        className="relative z-10 flex shrink-0"
        style={{ borderTop: '1px solid #0a1828', background: 'rgba(0,5,14,0.8)' }}
      >
        {[
          { label: 'PATCHED', value: vulnsTotal > 0 ? `${Math.round((vulnsFound / vulnsTotal) * 100)}%` : '0%', color: postureCfg.color },
          { label: 'THREATS', value: String(status.threatsDetected ?? 0), color: (status.threatsDetected ?? 0) > 0 ? '#ff2244' : '#10b981' },
          { label: 'ALERTS',  value: String(status.alertsTriggered ?? 0), color: (status.alertsTriggered ?? 0) > 0 ? '#f59e0b' : '#10b981' },
        ].map(({ label, value, color }, i) => (
          <div
            key={label}
            className="flex-1 flex flex-col items-center py-2"
            style={{ borderRight: i < 2 ? '1px solid #0a1828' : 'none' }}
          >
            <span className="font-mono font-bold tabular-nums" style={{ color, fontSize: '12px' }}>{value}</span>
            <span className="font-mono" style={{ color: '#0f2035', fontSize: '8px', letterSpacing: '0.1em' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}