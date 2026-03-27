import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useMatchStore } from '../store/matchStore'
import { useAuthStore } from '../store/authStore'
import CountdownTimer from '../components/CountdownTimer'
import { useGameSocket } from '../hooks/useGameSocket'
import { gameSocket } from '../sockets/gameSocket'
import api from '../services/api'

const isRedTeam = (role) => role === 'red_team'

const SCENARIO_PLAIN = {
  brute_force: {
    emoji: '🔐', title: 'The Locked Door',
    story: "There's a door with a secret password. The attacker keeps trying different passwords until one works. The defender has to make the door smarter — so it slams shut after too many wrong guesses.",
    attackerStory: "You're trying to break into a locked vault by guessing the password over and over again. The faster you guess, the better your chances — but watch out, the defender might lock you out!",
    defenderStory: "Someone is hammering your front door trying every key combo they know. Your job is to set up traps — after a few wrong tries, lock them out completely!",
    attackerWin: 'Successfully log in by guessing the right password',
    defenderWin: 'Block the attacker before they guess correctly',
    attackerSteps: [
      { icon: '🎯', text: 'Fire off login attempts — try many passwords fast' },
      { icon: '⚡', text: 'Use Brute Force action to auto-guess credentials' },
      { icon: '🔓', text: 'The moment a login succeeds — you win!' },
      { icon: '🏃', text: 'Move quickly before the defender notices the pattern' },
    ],
    defenderSteps: [
      { icon: '🚫', text: 'Block the IP address flooding your login page' },
      { icon: '⏱', text: 'Enable Rate Limit to slow down guessing attempts' },
      { icon: '🔒', text: 'Add a Firewall Rule to reject suspicious traffic' },
      { icon: '🚨', text: 'Trigger Incident Response when things get serious' },
    ],
    attackerMistakes: ['Going too slow — the defender will patch everything', 'Ignoring the rate limit — it will shut you down'],
    defenderMistakes: ['Waiting too long to block — every second counts', "Forgetting to enable rate limiting — it's your best weapon"],
  },
  sql_injection: {
    emoji: '💉', title: 'The Poisoned Message',
    story: "Imagine a search box on a website. Instead of typing a normal word, the attacker types a sneaky command that tricks the website into giving away secret data. The defender has to teach the website to ignore those tricks.",
    attackerStory: "You've found a crack in the wall — the website's search box will run any command you type into it. Slip in the right command and the database spills its secrets!",
    defenderStory: "The attacker is sending weird messages to your search box, hoping it does something it shouldn't. Patch the holes so those messages get ignored before any data leaks.",
    attackerWin: 'Steal data from the database using injected commands',
    defenderWin: 'Patch all vulnerabilities before data is stolen',
    attackerSteps: [
      { icon: '💉', text: 'Use SQL Inject to fire malicious commands at the database' },
      { icon: '🔍', text: 'Port Scan first to find which entry points are open' },
      { icon: '📤', text: 'Exfiltrate data once you find a working injection point' },
      { icon: '⚡', text: 'Speed matters — hit multiple entry points at once' },
    ],
    defenderSteps: [
      { icon: '✅', text: 'Enable Input Validation to reject weird-looking messages' },
      { icon: '🔧', text: 'Patch Vulnerability on any entry point that gets hit' },
      { icon: '🚫', text: 'Block IPs that send suspicious database commands' },
      { icon: '🔒', text: 'Isolate the database service if things get bad' },
    ],
    attackerMistakes: ['Hitting only one entry point — try them all', 'Not exfiltrating fast enough after a successful injection'],
    defenderMistakes: ['Skipping input validation — it stops most attacks instantly', 'Patching slowly while the attacker pivots to another entry point'],
  },
  xss: {
    emoji: '📜', title: 'The Hidden Trap',
    story: "Imagine a notice board where anyone can post messages. The attacker posts a message with a hidden booby trap inside. When someone reads it, the trap springs — stealing their info. The defender has to check every message for traps before anyone reads it.",
    attackerStory: "You're sneaking booby-trapped messages onto a website. When another user reads your message, it secretly steals their login cookie. Sneak in as many traps as you can!",
    defenderStory: "Someone is leaving trap messages on your website. Before your users get hurt, you need to clean every message and set up a security policy that blocks scripts from running.",
    attackerWin: 'Execute scripts that steal user data or session cookies',
    defenderWin: 'Enable CSP and sanitize inputs before scripts execute',
    attackerSteps: [
      { icon: '📜', text: 'Drop Payload to plant malicious scripts in the website' },
      { icon: '⚡', text: 'Trigger script executions before the defender sanitizes' },
      { icon: '🎯', text: 'Target unsanitized input fields — those are your doors' },
      { icon: '🔄', text: 'Keep planting — each execution gets you closer to winning' },
    ],
    defenderSteps: [
      { icon: '🛡', text: 'Enable CSP (Content Security Policy) — stops scripts cold' },
      { icon: '🔧', text: 'Patch each unsanitized input field the attacker finds' },
      { icon: '🔒', text: 'Isolate the affected page service to limit damage' },
      { icon: '🚫', text: "Block the attacker's IP when you spot the pattern" },
    ],
    attackerMistakes: ["Not acting before the defender enables CSP — it's game over after that", 'Only targeting one input field — spread out'],
    defenderMistakes: ["Delaying CSP — it's the single most powerful move you have", 'Patching fields one by one while ignoring the others'],
  },
  phishing: {
    emoji: '🎣', title: 'The Fake Letter',
    story: "Someone sends you a letter that looks like it's from your bank, asking for your password. But it's a fake — the attacker made it look real! The defender has to teach people to spot fakes and block those letters before anyone reads them.",
    attackerStory: "You're sending convincing fake emails pretending to be from a trusted source. If a user clicks and types their password — you've got them. Send as many as you can before the defender shuts you down!",
    defenderStory: "Fake emails are flooding in, trying to trick your users. You need to block them at the gate and protect user credentials before anyone gets fooled.",
    attackerWin: 'Get users to submit their credentials via fake emails',
    defenderWin: 'Block phishing emails and protect all user credentials',
    attackerSteps: [
      { icon: '📧', text: 'Send waves of phishing emails using your attack actions' },
      { icon: '🎯', text: 'Exfiltrate data when a user falls for the fake message' },
      { icon: '🔄', text: 'Keep sending — volume is your advantage' },
      { icon: '👁', text: 'Watch credential risk — when it rises, you are winning' },
    ],
    defenderSteps: [
      { icon: '🚫', text: 'Block suspicious emails before they reach users' },
      { icon: '🔒', text: 'Isolate compromised accounts immediately' },
      { icon: '🛡', text: 'Add Firewall Rules targeting the phishing patterns' },
      { icon: '🚨', text: 'Run Incident Response when credential risk spikes' },
    ],
    attackerMistakes: ['Sending too few emails — spam the system to maximize hits', 'Ignoring credential risk — that number tells you how well you are doing'],
    defenderMistakes: ['Reacting slowly — once credentials leak, the round is nearly over', 'Not blocking emails early — prevention beats damage control'],
  },
  jwt_manipulation: {
    emoji: '🎫', title: 'The Fake VIP Pass',
    story: "At a concert, everyone gets a ticket. A sneaky person finds a way to print their own VIP ticket — even though they never paid for it. The defender has to check every ticket very carefully so fake ones get caught at the door.",
    attackerStory: "The website hands out digital passes (JWT tokens) to logged-in users. You've found a way to forge one — giving yourself admin powers you were never supposed to have. Use them before security catches on!",
    defenderStory: "Someone is sneaking around with a forged admin pass. Enable strict token checking so any fake pass gets rejected the moment it shows up.",
    attackerWin: 'Use forged tokens to access admin or privileged actions',
    defenderWin: 'Validate all tokens and reject forged ones before misuse',
    attackerSteps: [
      { icon: '🎫', text: 'Use SQL Inject or Payload Drop to forge a token' },
      { icon: '⚡', text: 'Act fast — exploit the forged token before validation is enabled' },
      { icon: '🔓', text: 'Brute Force token signatures to create valid fakes' },
      { icon: '🏃', text: 'Move quickly — defender only needs one click to stop you' },
    ],
    defenderSteps: [
      { icon: '✅', text: 'Enable Token Validation — rejects all forged passes instantly' },
      { icon: '👤', text: 'Verify Role Claims so nobody can upgrade their own permissions' },
      { icon: '🔒', text: 'Isolate services that accepted invalid tokens' },
      { icon: '🔧', text: 'Patch the vulnerability that allowed token forgery' },
    ],
    attackerMistakes: ["Waiting too long — the defender's one-click fix kills your entire strategy", 'Not escalating privileges fast enough after forging'],
    defenderMistakes: ["Not enabling Token Validation immediately — it's your best move", 'Ignoring role claims — attackers exploit permission escalation'],
  },
  network_anomaly: {
    emoji: '🌊', title: 'The Traffic Flood',
    story: "Imagine a highway that can only hold 100 cars. The attacker sends 10,000 cars at once — nobody can move, and the whole highway grinds to a halt. The defender has to build traffic barriers to let real cars through and stop the flood.",
    attackerStory: "You're going to flood the network with so much fake traffic that the real system collapses under the weight. Fire wave after wave until everything goes offline!",
    defenderStory: "A massive wave of fake traffic is aimed at your network, trying to knock everything offline. Deploy your DDoS shield and traffic barriers to keep real users connected.",
    attackerWin: 'Overwhelm the network until system health hits zero',
    defenderWin: 'Activate DDoS protection and keep the system online',
    attackerSteps: [
      { icon: '🌊', text: 'Launch DDoS Wave to flood the network with traffic' },
      { icon: '🔄', text: 'Keep firing — wait for cooldown and hit again immediately' },
      { icon: '📡', text: 'Port Scan to find unprotected network entry points' },
      { icon: '⚡', text: 'Chain attacks to overwhelm before the shield goes up' },
    ],
    defenderSteps: [
      { icon: '🛡', text: 'Enable DDoS Protection — your most important first move' },
      { icon: '🚫', text: 'Block IPs generating the most traffic immediately' },
      { icon: '🔒', text: 'Isolate non-critical services to protect core systems' },
      { icon: '🛡', text: 'Add Firewall Rules to filter out flood traffic patterns' },
    ],
    attackerMistakes: ["Not attacking continuously — gaps give the defender time to recover", 'Ignoring system health — watch it drop to know when you are winning'],
    defenderMistakes: ["Not enabling DDoS Protection first — everything else comes second", "Trying to block IPs before the shield is up — you won't keep up"],
  },
}

// ─── StepCard ─────────────────────────────────────────────
function StepCard({ step, index, color, isLast }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.3 }}
      className="relative flex items-start gap-3 group"
    >
      <div className="relative shrink-0 flex flex-col items-center">
        <motion.div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-base sm:text-lg relative z-10"
          style={{
            background: `linear-gradient(135deg, ${color}12 0%, ${color}08 100%)`,
            border: `1.5px solid ${color}28`,
            boxShadow: `0 2px 8px ${color}10`,
          }}
          whileHover={{ scale: 1.05 }}
        >
          {step.icon}
        </motion.div>
        {!isLast && (
          <div className="w-0.5 h-full mt-1.5 absolute top-8 sm:top-9"
            style={{ background: `linear-gradient(180deg, ${color}25 0%, ${color}08 100%)` }} />
        )}
      </div>
      <div className="flex-1 pb-4 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-mono font-bold px-2 py-0.5 rounded"
            style={{ color: `${color}90`, fontSize: '9px', letterSpacing: '0.12em', background: `${color}10`, border: `1px solid ${color}20` }}>
            STEP {index + 1}
          </span>
        </div>
        <p className="font-mono text-xs sm:text-sm leading-relaxed" style={{ color: '#d8e8f8', lineHeight: '1.6' }}>
          {step.text}
        </p>
      </div>
    </motion.div>
  )
}

// ─── MistakeCard ──────────────────────────────────────────
function MistakeCard({ text, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.05 }}
      className="flex items-start gap-3 px-3 sm:px-4 py-3 rounded-lg"
      style={{
        background: 'linear-gradient(135deg, rgba(255,34,68,0.06) 0%, rgba(255,34,68,0.03) 100%)',
        border: '1px solid rgba(255,34,68,0.18)',
      }}
    >
      <div className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs"
        style={{ background: 'rgba(255,34,68,0.12)', border: '1px solid rgba(255,34,68,0.25)', color: '#ff4466' }}>
        ✕
      </div>
      <span className="font-mono text-xs leading-relaxed flex-1" style={{ color: '#b8c8d8', lineHeight: '1.5' }}>
        {text}
      </span>
    </motion.div>
  )
}

// ─── VsDivider — stacks on mobile ─────────────────────────
function VsDivider({ attackerWin, defenderWin }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="flex flex-col sm:flex-row items-stretch rounded-lg overflow-hidden"
      style={{ border: '1px solid #0d1e30', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
    >
      {/* Attacker */}
      <div className="flex-1 flex items-center gap-3 px-4 py-4"
        style={{ background: 'linear-gradient(135deg, rgba(255,34,68,0.08) 0%, rgba(255,34,68,0.04) 100%)' }}>
        <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-lg"
          style={{ background: 'rgba(255,34,68,0.12)', border: '1px solid rgba(255,34,68,0.25)' }}>💀</div>
        <div className="flex-1 min-w-0">
          <p className="font-mono font-bold mb-1" style={{ color: '#ff2244', fontSize: '10px', letterSpacing: '0.12em' }}>
            ATTACKER WINS BY
          </p>
          <p className="font-mono text-xs sm:text-sm leading-snug" style={{ color: '#e8a8b8', lineHeight: '1.4' }}>
            {attackerWin}
          </p>
        </div>
      </div>

      {/* VS divider — horizontal on mobile, vertical on desktop */}
      <div className="flex items-center justify-center py-2 sm:py-0 sm:px-4"
        style={{ background: 'linear-gradient(180deg, #060d1a 0%, #04080f 100%)', borderTop: '1px solid #0d1e30', borderBottom: '1px solid #0d1e30' }}>
        <span className="font-mono font-black" style={{ color: '#1e3a52', fontSize: '13px', letterSpacing: '0.15em' }}>
          VS
        </span>
      </div>

      {/* Defender */}
      <div className="flex-1 flex items-center gap-3 px-4 py-4"
        style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(0,212,255,0.04) 100%)' }}>
        <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-lg"
          style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)' }}>🛡</div>
        <div className="flex-1 min-w-0">
          <p className="font-mono font-bold mb-1" style={{ color: '#00d4ff', fontSize: '10px', letterSpacing: '0.12em' }}>
            DEFENDER WINS BY
          </p>
          <p className="font-mono text-xs sm:text-sm leading-snug" style={{ color: '#a8d8e8', lineHeight: '1.4' }}>
            {defenderWin}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── SectionHeader ────────────────────────────────────────
function SectionHeader({ number, title, subtitle, color = '#1e3a52' }) {
  return (
    <div className="flex items-center justify-between px-4 sm:px-5 py-3"
      style={{ background: `linear-gradient(135deg, ${color}12 0%, ${color}06 100%)`, borderBottom: `1px solid ${color}20` }}>
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <span className="font-mono font-bold px-2 py-1 rounded shrink-0"
          style={{ color: `${color}90`, fontSize: '10px', letterSpacing: '0.15em', background: `${color}15`, border: `1px solid ${color}25` }}>
          {number}
        </span>
        <span className="font-mono font-bold tracking-wide truncate"
          style={{ color: `${color}cc`, fontSize: '11px', letterSpacing: '0.08em' }}>
          {title}
        </span>
      </div>
      {subtitle && (
        <span className="font-mono text-xs shrink-0 ml-2" style={{ color: `${color}60` }}>
          {subtitle}
        </span>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────
export default function TacticalBriefing() {
  const navigate = useNavigate()
  const { role, scenario, difficulty, gameId } = useMatchStore()
  const { user } = useAuthStore()
  const attacker  = isRedTeam(role)
  const roleColor = attacker ? '#ff2244' : '#00d4ff'

  useGameSocket()

  const [briefing, setBriefing] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const resolvedRef             = useRef(false)

  useEffect(() => {
    if (!gameId) navigate('/dashboard', { replace: true })
  }, [gameId, navigate])

  useEffect(() => {
    if (!gameId) return
    let cancelled = false

    const resolve = (b) => {
      if (cancelled || resolvedRef.current) return
      resolvedRef.current = true
      setBriefing(b)
      setLoading(false)
    }
    const fail = (m) => {
      if (cancelled || resolvedRef.current) return
      resolvedRef.current = true
      setError(m)
      setLoading(false)
    }

    api.get(`/games/${gameId}/briefing`)
      .then(r => resolve(r.data.briefing ?? r.data))
      .catch(() => {
        if (gameSocket.connected) {
          gameSocket.emit('get_briefing', gameId, (res) => {
            if (res?.error) fail(res.error)
            else resolve(res?.briefing ?? res)
          })
        } else {
          fail('No briefing received — entering simulation')
        }
      })

    const onBriefing = ({ briefing: b }) => resolve(b)
    gameSocket.on('briefing', onBriefing)
    const t = setTimeout(() => fail('No briefing received — entering simulation'), 6000)

    return () => {
      cancelled = true
      gameSocket.off('briefing', onBriefing)
      clearTimeout(t)
    }
  }, [gameId])

  const handleComplete = () => navigate('/simulation')

  const scenarioKey     = briefing?.scenarioType || scenario || ''
  const plain           = SCENARIO_PLAIN[scenarioKey] || SCENARIO_PLAIN.brute_force
  const steps           = attacker ? plain.attackerSteps : plain.defenderSteps
  const mistakes        = attacker ? plain.attackerMistakes : plain.defenderMistakes
  const myStory         = attacker ? plain.attackerStory : plain.defenderStory
  const difficultyColors = { easy: '#10b981', medium: '#f59e0b', hard: '#ff6600', elite: '#ff2244' }
  const difficultyColor  = difficultyColors[difficulty] || '#f59e0b'

  if (!gameId) return null

  return (
    <div className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #060d1a 0%, #04080f 100%)', paddingBottom: '32px' }}>
      <div className="max-w-3xl mx-auto px-3 sm:px-6 space-y-4 sm:space-y-5">

        {/* Status bar */}
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-3 sm:px-5 py-3 rounded-xl gap-2"
          style={{ background: 'rgba(6,13,26,0.95)', border: '1px solid #0d1e30', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
        >
          {/* Left — truncates on tiny screens */}
          <div className="flex items-center gap-2 min-w-0">
            <motion.div className="w-2 h-2 rounded-full shrink-0"
              style={{ background: '#f59e0b', boxShadow: '0 0 8px rgba(245,158,11,0.5)' }}
              animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <span className="font-mono font-bold tracking-widest hidden sm:block"
              style={{ color: '#f59e0b', fontSize: '11px' }}>TACTICAL BRIEFING</span>
            <span className="font-mono text-xs font-medium truncate" style={{ color: '#4d6a83' }}>
              {scenarioKey.replace(/_/g, ' ').toUpperCase() || 'LOADING...'}
            </span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 shrink-0">
            {difficulty && (
              <span className="font-mono font-bold text-xs px-2 py-1 rounded-md"
                style={{ color: difficultyColor, border: `1.5px solid ${difficultyColor}50`, background: `${difficultyColor}10` }}>
                {difficulty.toUpperCase()}
              </span>
            )}
            {!loading && (
              <CountdownTimer
                seconds={briefing?.timeToRead ? briefing.timeToRead / 1000 : 30}
                onComplete={handleComplete}
                size="sm"
                color={attacker ? 'red' : 'blue'}
              />
            )}
          </div>
        </motion.div>

        {/* Loading */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-5">
              <div className="relative w-12 h-12">
                <motion.div className="absolute inset-0 rounded-full"
                  style={{ border: `3px solid ${roleColor}`, borderTopColor: 'transparent' }}
                  animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
              </div>
              <p className="font-mono text-sm tracking-wider" style={{ color: '#3d5a73' }}>
                Receiving tactical orders...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence mode="wait">
          {!loading && error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl p-8 sm:p-10 text-center"
              style={{ background: 'linear-gradient(135deg, rgba(255,34,68,0.08), rgba(255,34,68,0.04))', border: '1px solid rgba(255,34,68,0.25)' }}>
              <span className="text-4xl block mb-6">⚠️</span>
              <p className="font-mono text-sm mb-6" style={{ color: '#ff6680' }}>{error}</p>
              <motion.button onClick={handleComplete}
                className="font-mono font-bold text-sm px-8 py-3 rounded-lg"
                style={{ background: 'rgba(255,34,68,0.15)', border: '1.5px solid rgba(255,34,68,0.4)', color: '#ff4466', minHeight: '48px' }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                ENTER SIMULATION →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <AnimatePresence mode="wait">
          {!loading && !error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 sm:space-y-5">

              {/* 01 Scenario */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }} className="rounded-xl overflow-hidden"
                style={{ border: '1px solid #0d1e30', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
                <SectionHeader number="01" title="THE SCENARIO" color="#1e3a52" />
                <div className="px-4 sm:px-6 py-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {/* Emoji + title — tighter on mobile */}
                  <div className="flex items-center gap-3 sm:gap-5 mb-4 sm:mb-5">
                    <motion.div
                      className="flex items-center justify-center rounded-xl shrink-0"
                      style={{
                        width: 'clamp(56px, 16vw, 96px)',
                        height: 'clamp(56px, 16vw, 96px)',
                        fontSize: 'clamp(28px, 8vw, 48px)',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                      whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                      {plain.emoji}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h1 className="font-mono font-black mb-1 sm:mb-2"
                        style={{ fontSize: 'clamp(18px, 5vw, 28px)', color: '#f8fcff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                        {plain.title}
                      </h1>
                      <p className="font-mono text-xs sm:text-sm truncate" style={{ color: '#4d6a83' }}>
                        {scenarioKey.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-4 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.04)', borderLeft: '3px solid #2d4a62' }}>
                    <p className="font-mono text-xs sm:text-sm leading-relaxed" style={{ color: '#a8c8d8', lineHeight: '1.7' }}>
                      {plain.story}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* 02 Your mission */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }} className="rounded-xl overflow-hidden"
                style={{ border: `1.5px solid ${roleColor}30`, boxShadow: `0 4px 16px ${roleColor}15` }}>
                <SectionHeader number="02" title="YOUR MISSION" subtitle={attacker ? 'Red Team' : 'Blue Team'} color={roleColor} />
                <div className="px-4 sm:px-6 py-4 sm:py-5"
                  style={{ background: `linear-gradient(135deg, ${roleColor}08 0%, ${roleColor}03 100%)` }}>
                  <div className="flex items-center gap-3 sm:gap-4 mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl shrink-0"
                      style={{ background: `${roleColor}15`, border: `1.5px solid ${roleColor}35`, boxShadow: `0 4px 12px ${roleColor}20` }}>
                      {attacker ? '💀' : '🛡'}
                    </div>
                    <div className="min-w-0">
                      <span className="font-mono font-black tracking-wider block mb-1"
                        style={{ color: roleColor, fontSize: 'clamp(12px, 4vw, 15px)', letterSpacing: '0.1em' }}>
                        {attacker ? 'ATTACKER' : 'DEFENDER'}
                      </span>
                      <span className="font-mono text-xs block truncate" style={{ color: `${roleColor}70` }}>
                        {attacker ? 'Red Team · Offensive Operations' : 'Blue Team · Defensive Operations'}
                      </span>
                    </div>
                  </div>
                  <p className="font-mono text-xs sm:text-sm leading-relaxed px-4 py-4 rounded-lg"
                    style={{ color: '#d8e8f8', lineHeight: '1.7', background: 'rgba(255,255,255,0.03)', borderLeft: `3px solid ${roleColor}` }}>
                    {myStory}
                  </p>
                </div>
              </motion.div>

              {/* 03 Victory conditions */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }} className="rounded-xl overflow-hidden"
                style={{ border: '1px solid #0d1e30' }}>
                <SectionHeader number="03" title="VICTORY CONDITIONS" color="#1e3a52" />
                <div className="p-3 sm:p-5" style={{ background: 'rgba(255,255,255,0.01)' }}>
                  <VsDivider attackerWin={plain.attackerWin} defenderWin={plain.defenderWin} />
                </div>
              </motion.div>

              {/* 04 Tactical playbook */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }} className="rounded-xl overflow-hidden"
                style={{ border: `1.5px solid ${roleColor}25`, boxShadow: `0 4px 16px ${roleColor}12` }}>
                <SectionHeader number="04" title="TACTICAL PLAYBOOK"
                  subtitle={attacker ? 'Attack Strategy' : 'Defense Strategy'} color={roleColor} />
                <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-1" style={{ background: 'rgba(255,255,255,0.015)' }}>
                  {steps.map((step, i) => (
                    <StepCard key={i} step={step} index={i} color={roleColor} isLast={i === steps.length - 1} />
                  ))}
                </div>
              </motion.div>

              {/* 05 Common mistakes */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }} className="rounded-xl overflow-hidden"
                style={{ border: '1px solid rgba(255,34,68,0.2)' }}>
                <SectionHeader number="05" title="COMMON MISTAKES" subtitle="Avoid these" color="rgba(255,34,68,0.8)" />
                <div className="px-3 sm:px-5 py-4 space-y-3" style={{ background: 'rgba(255,255,255,0.01)' }}>
                  {mistakes.map((m, i) => <MistakeCard key={i} text={m} index={i} />)}
                </div>
              </motion.div>

              {/* Footer */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                className="flex items-center justify-between px-4 sm:px-5 py-4 rounded-xl gap-3"
                style={{ background: 'rgba(6,13,26,0.95)', border: '1px solid #0d1e30' }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-mono font-black text-sm sm:text-base shrink-0"
                    style={{ background: `${roleColor}20`, color: roleColor, border: `1.5px solid ${roleColor}40` }}>
                    {user?.username?.[0]?.toUpperCase() || 'O'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono font-medium text-xs sm:text-sm truncate" style={{ color: '#7899b0' }}>
                      {user?.username || 'Operative'}
                    </p>
                    <p className="font-mono text-xs" style={{ color: `${roleColor}90` }}>
                      {attacker ? '💀 Attacker' : '🛡 Defender'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <motion.div className="w-2 h-2 rounded-full"
                    style={{ background: '#f59e0b' }}
                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                  <span className="font-mono text-xs hidden sm:block" style={{ color: '#f59e0b' }}>
                    AUTO-START WHEN TIMER ENDS
                  </span>
                  <span className="font-mono text-xs sm:hidden" style={{ color: '#f59e0b' }}>
                    AUTO-START
                  </span>
                </div>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}