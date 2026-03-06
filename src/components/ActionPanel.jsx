import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DEFAULT_ATTACKER_ACTIONS = [
  { id: 'port_scan',    label: 'Port Scan',    icon: '📡', description: 'Enumerate open ports',      color: '#ff2244', cooldown: 8  },
  { id: 'sql_inject',   label: 'SQL Inject',   icon: '💉', description: 'Attempt DB injection',      color: '#ff4400', cooldown: 15 },
  { id: 'brute_force',  label: 'Brute Force',  icon: '🔓', description: 'Force auth bypass',         color: '#ff6600', cooldown: 20 },
  { id: 'ddos_wave',    label: 'DDoS Wave',    icon: '🌊', description: 'Flood API gateway',         color: '#ff2266', cooldown: 30 },
  { id: 'payload_drop', label: 'Drop Payload', icon: '☠️', description: 'Inject malware',            color: '#cc0044', cooldown: 25 },
  { id: 'exfiltrate',   label: 'Exfiltrate',   icon: '📤', description: 'Extract data',             color: '#ff3366', cooldown: 20 },
]

const DEFAULT_DEFENDER_ACTIONS = [
  { id: 'block_ip',      label: 'Block IP',      icon: '🚫', description: 'Blacklist threat IP',     color: '#00d4ff', cooldown: 5  },
  { id: 'patch_vuln',    label: 'Patch Vuln',    icon: '🔧', description: 'Apply hotfix',            color: '#0080ff', cooldown: 15 },
  { id: 'isolate_svc',   label: 'Isolate Svc',   icon: '🔒', description: 'Quarantine service',      color: '#00aaff', cooldown: 10 },
  { id: 'honeypot',      label: 'Honeypot',      icon: '🍯', description: 'Deploy decoy system',     color: '#00ccaa', cooldown: 20 },
  { id: 'fw_rule',       label: 'FW Rule',       icon: '🛡', description: 'Add firewall rule',       color: '#0066ff', cooldown: 8  },
  { id: 'incident_resp', label: 'Incident Resp', icon: '🚨', description: 'Full IR response',        color: '#00d4cc', cooldown: 30 },
]

export const isAttackerRole = (role) =>
  role === 'attacker' || role === 'red' || role === 'red_team'
export default function ActionPanel({ role, actions: serverActions = [], onAction, cooldowns = {}, activeActions = [] }) {
  const attacker = isAttackerRole(role)
  const actions = serverActions.length > 0
    ? serverActions
    : (attacker ? DEFAULT_ATTACKER_ACTIONS : DEFAULT_DEFENDER_ACTIONS)

  return (
    <div className="glass-panel rounded-sm p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xs tracking-widest text-arena-muted">
          {attacker ? 'ATTACK VECTORS' : 'DEFENSE PROTOCOLS'}
        </h3>
        <span
          className="text-xs font-mono px-2 py-0.5 rounded-sm"
          style={attacker
            ? { color: '#ff2244', border: '1px solid #ff224440', background: '#ff224408' }
            : { color: '#00d4ff', border: '1px solid #00d4ff40', background: '#00d4ff08' }
          }
        >
          {attacker ? '◈ OFFENSIVE' : '◈ DEFENSIVE'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 flex-1">
        {actions.map((action) => {
          const onCooldown = !!cooldowns[action.id]
          const isActive = activeActions.includes(action.id)
          const color = action.color || (attacker ? '#ff2244' : '#00d4ff')

          return (
            <motion.button
              key={action.id}
              onClick={() => !onCooldown && onAction(action.id)}
              disabled={onCooldown}
              className="relative flex flex-col items-start p-3 rounded-sm text-left overflow-hidden"
              style={{
                background: onCooldown ? 'rgba(30,41,59,0.4)' : `${color}0a`,
                border: `1px solid ${onCooldown ? '#1e293b' : color + '40'}`,
                cursor: onCooldown ? 'not-allowed' : 'pointer',
                opacity: onCooldown ? 0.5 : 1,
              }}
              whileHover={!onCooldown ? { scale: 1.02, boxShadow: `0 0 20px ${color}40` } : {}}
              whileTap={!onCooldown ? { scale: 0.97 } : {}}
            >
              {/* Sweep on activate */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45 }}
                    style={{ background: `linear-gradient(90deg, transparent, ${color}30, transparent)` }}
                  />
                )}
              </AnimatePresence>

              {/* Cooldown drain overlay */}
              {onCooldown && (
                <motion.div
                  className="absolute inset-0 rounded-sm pointer-events-none"
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: action.cooldown || 10, ease: 'linear' }}
                  style={{ background: `${color}18`, transformOrigin: 'left' }}
                />
              )}

              <div className="flex items-center gap-2 mb-1 relative z-10">
                <span className="text-base leading-none">{action.icon}</span>
                <span
                  className="text-xs font-display tracking-wider"
                  style={{ color: onCooldown ? '#475569' : color }}
                >
                  {action.label}
                </span>
              </div>
              <p className="text-xs text-arena-muted relative z-10 leading-tight">
                {action.description}
              </p>
              {onCooldown && (
                <span className="text-xs mt-1 relative z-10 font-mono" style={{ color: '#475569' }}>
                  RECHARGING...
                </span>
              )}
            </motion.button>
          )
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-arena-border">
        <p className="text-xs text-arena-muted text-center font-mono">
          {attacker ? '⚠ Actions may be logged by defender' : '⚠ Respond within detection window'}
        </p>
      </div>
    </div>
  )
}