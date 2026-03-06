import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useMatchStore } from '../store/matchStore'
import { useProgressionStore } from '../store/progressionStore'
import { useSimulationStore } from '../store/simulationStore'
import CountdownTimer from '../components/CountdownTimer'

// ─── Plain-English scenario intel ─────────────────────────────────────────────
// Written for someone who has never heard of cybersecurity.
// Real-world hooks use relatable analogies, not jargon.

const SCENARIO_INTEL = {
  brute_force: {
    emoji: '🔐',
    title: 'The Locked Door',
    tagline: 'Trying every key until one opens the lock',
    realWorld: "In 2023, nearly 1 in 3 data breaches happened because someone guessed or stole a password. Hackers use computer programs that can try over 100,000 passwords every single second — faster than any human could ever type.",
    howItWorks: [
      { icon: '🤖', text: 'A program automatically fires thousands of password guesses — common ones like "123456" or "password" first, then every combination imaginable.' },
      { icon: '🌐', text: 'Smart attackers spread the guesses across thousands of different internet addresses, so it\'s hard to tell it\'s all coming from the same person.' },
      { icon: '♻️', text: 'They also try passwords leaked from other websites — if you use the same password everywhere, cracking one site means cracking them all.' },
    ],
    attackerWinTips: [
      { icon: '⚡', text: 'Attack from many different IP addresses at once so the defender can\'t just block one place' },
      { icon: '📋', text: 'Use real leaked password lists — don\'t just guess randomly, use what has already been proven to work' },
      { icon: '🏃', text: 'Move fast before rate limiting kicks in — the first 20 seconds are your best window' },
    ],
    defenderWinTips: [
      { icon: '⏱', text: 'Enable Rate Limiting first — it caps how many guesses per second, immediately choking the attack' },
      { icon: '🚫', text: 'Block IPs after just 5 wrong attempts, not 50 — don\'t give them breathing room' },
      { icon: '🔒', text: 'Add a Firewall Rule to filter out the suspicious traffic patterns early' },
    ],
    staySecure: [
      { icon: '🔑', text: 'Use a password manager. Let it generate long, random passwords — you only need to remember one master password.' },
      { icon: '📱', text: 'Turn on two-factor authentication (2FA). Even if your password leaks, attackers still can\'t get in without your phone.' },
      { icon: '🔔', text: 'Set up login notifications. You\'ll instantly know if someone else tries to sign in to your account.' },
    ],
    funFact: { emoji: '😅', text: 'The most common password in 2024 was still "123456". A computer cracks it in less than one second.' },
  },

  sql_injection: {
    emoji: '💉',
    title: 'The Poisoned Message',
    tagline: 'Hiding secret commands inside ordinary-looking messages',
    realWorld: "In 2011, a hacker typed a few sneaky words into a search box on Sony's website — and walked out with the personal data of 77 million PlayStation accounts. This same trick has been used on banks, hospitals, and government websites for over 20 years.",
    howItWorks: [
      { icon: '🔍', text: 'The attacker types something weird into a search box — not a normal search word, but a sneaky computer command in disguise.' },
      { icon: '🗃️', text: 'The website\'s database gets confused and thinks it\'s receiving instructions from a trusted admin, so it hands over everything — usernames, passwords, credit card numbers.' },
      { icon: '🤫', text: 'Even if the website hides its error messages, attackers can still figure out the structure by asking clever yes/no questions and watching how the site responds.' },
    ],
    attackerWinTips: [
      { icon: '🔍', text: 'Scan all entry points first — search bars, login boxes, URL parameters — the vulnerability is often hiding somewhere unexpected' },
      { icon: '💡', text: 'If the site shows error messages, read them carefully — they reveal the exact structure of the database' },
      { icon: '📤', text: 'Once you find a working injection point, exfiltrate data immediately before it gets patched' },
    ],
    defenderWinTips: [
      { icon: '✅', text: 'Enable Input Validation immediately — it tells the website to reject anything that doesn\'t look like a normal search word' },
      { icon: '🔧', text: 'Patch each vulnerable entry point as the attacker probes them — don\'t leave any door open' },
      { icon: '🔒', text: 'Isolate the database service if you see active injection attempts — cut it off before data can be extracted' },
    ],
    staySecure: [
      { icon: '🛡', text: 'Websites you use should never show raw error messages — if you see database errors, the site has poor security practices.' },
      { icon: '🔒', text: 'If you build websites, use an ORM library (like Prisma) — it automatically prevents SQL injection for you.' },
      { icon: '👁', text: 'Run free security scanners on your own websites — finding the hole before attackers do is always better.' },
    ],
    funFact: { emoji: '🗑️', text: "There's a famous comic about a student named \"Robert'); DROP TABLE Students;--\" whose name, when entered into a school database, deleted all student records. It sounds absurd — but it's based on real attacks." },
  },

  xss: {
    emoji: '📜',
    title: 'The Hidden Trap',
    tagline: 'Leaving a booby-trapped message that springs on the next visitor',
    realWorld: "In 2018, attackers planted invisible code on British Airways' payment page. For two months, every customer who bought a ticket had their credit card details silently copied and sent to the attackers. 500,000 people were affected.",
    howItWorks: [
      { icon: '🪤', text: 'The attacker posts a message on a website — a comment, a review, a username — but hidden inside is a tiny computer program.' },
      { icon: '👥', text: 'When the next person visits that page and sees the message, their browser runs the hidden program without them knowing.' },
      { icon: '🍪', text: 'The program can silently steal the visitor\'s login session (like a magic cookie that keeps them logged in), log every key they press, or redirect them to a fake login page.' },
    ],
    attackerWinTips: [
      { icon: '⚡', text: 'Plant scripts before the defender enables CSP — once that\'s on, your scripts won\'t run' },
      { icon: '🎭', text: 'If basic script tags are blocked, try hiding code inside image error handlers — <img src=x onerror=...> often slips through' },
      { icon: '🎯', text: 'Go for stored XSS — if it saves to the database, every visitor triggers the attack, not just one' },
    ],
    defenderWinTips: [
      { icon: '🛡', text: 'Enable CSP (Content Security Policy) immediately — it\'s a browser instruction that says "only run scripts from trusted places"' },
      { icon: '🔧', text: 'Patch each unsanitized input field — these are the doors the attacker is walking through' },
      { icon: '🔒', text: 'Isolate affected page services to stop the spread while you patch' },
    ],
    staySecure: [
      { icon: '🌐', text: 'Keep your browser updated — modern browsers have built-in defenses against many XSS attacks.' },
      { icon: '🍪', text: 'Websites you trust should use "HttpOnly" cookies — a setting that makes login cookies invisible to any rogue scripts.' },
      { icon: '⚠️', text: 'Be cautious on sites with lots of user-generated content (forums, comment sections) that look oddly formatted.' },
    ],
    funFact: { emoji: '🐛', text: 'In 2005, a teenager created "The Samy Worm" on MySpace — a self-spreading XSS attack that added 1 million friends to his profile in 20 hours. MySpace had to shut down to contain it.' },
  },

  phishing: {
    emoji: '🎣',
    title: 'The Fake Letter',
    tagline: 'Tricking people instead of hacking computers',
    realWorld: "9 out of 10 cyberattacks start with a fake email. The 2016 hack that leaked thousands of US election emails? It started with one person clicking one link in one email that looked like a Google security alert.",
    howItWorks: [
      { icon: '✉️', text: 'The attacker sends an email that looks exactly like it\'s from your bank, your boss, or a service you use — same logos, same colors, nearly the same email address.' },
      { icon: '😰', text: 'The message creates panic: "Your account will be deleted in 24 hours!" or "Suspicious activity detected — verify now." Panic makes people click without thinking.' },
      { icon: '🪤', text: 'The link takes you to a fake website that looks identical to the real one. You type your password — and the attacker has it instantly.' },
    ],
    attackerWinTips: [
      { icon: '📧', text: 'Send emails in large volumes — the more you send, the higher the chance someone is having a bad day and clicks without checking' },
      { icon: '🎯', text: 'Target specific people with personalized details — "Hi Sarah, your report is attached" is far more convincing than a generic blast' },
      { icon: '😱', text: 'Create urgency — tax deadlines, account suspensions, and security alerts make people panic and skip their usual caution' },
    ],
    defenderWinTips: [
      { icon: '🚫', text: 'Block suspicious emails before they reach users — prevention is infinitely easier than damage control' },
      { icon: '🔍', text: 'Scan every link and attachment — malicious domains have telltale signs when you look closely' },
      { icon: '🚨', text: 'Run Incident Response the moment credential risk rises — act before any stolen credentials are used' },
    ],
    staySecure: [
      { icon: '🔗', text: 'Hover over any link before clicking — the real destination shows in the bottom of your browser. If it looks weird, it is weird.' },
      { icon: '⏸️', text: 'If an email makes you feel urgency or fear, pause. That feeling is the attack working on you. Slow down and verify.' },
      { icon: '📞', text: 'Got a weird email from your bank or a colleague? Call them directly on a number you already know. Never use contact details from the suspicious email itself.' },
    ],
    funFact: { emoji: '🎣', text: 'The word "phishing" comes from "fishing" — attackers cast a wide net and wait for bites. The "ph" spelling is a nod to 1970s phone hackers who called themselves "phreakers."' },
  },

  jwt_manipulation: {
    emoji: '🎫',
    title: 'The Fake VIP Pass',
    tagline: 'Printing your own concert ticket to skip the line — and get backstage',
    realWorld: "JWTs are digital ID cards that websites use to remember who you are after you log in. In 2015, a flaw in how they were built meant you could simply tell the website 'don\'t check my ID signature' — and it would believe you. This affected dozens of major platforms.",
    howItWorks: [
      { icon: '🎫', text: 'When you log in to a website, it gives your browser a digital pass (JWT) that says who you are and what you\'re allowed to do. Your browser shows this pass on every page visit.' },
      { icon: '🔓', text: "The pass has a secret signature to prove it wasn't tampered with. But some websites had a bug: if you changed the pass to say 'no signature needed', they'd still accept it." },
      { icon: '👑', text: 'So an attacker could edit their own pass to say they\'re an admin — and the website would believe them, handing over full control.' },
    ],
    attackerWinTips: [
      { icon: '🔍', text: 'Decode the JWT first (it\'s just base64 — anyone can read it) to understand what role fields to change' },
      { icon: '⚡', text: 'Try changing the algorithm to "none" and removing the signature — many older systems still accept this' },
      { icon: '🏃', text: 'Use forged tokens immediately — the window before the defender enables validation is tiny' },
    ],
    defenderWinTips: [
      { icon: '✅', text: 'Enable Token Validation immediately — this is the single click that blocks every forged pass' },
      { icon: '👤', text: 'Verify Role Claims so users can\'t edit their own permission level' },
      { icon: '🔧', text: 'Patch the vulnerability that allowed token manipulation in the first place' },
    ],
    staySecure: [
      { icon: '🔑', text: 'Use trusted login services (Google Sign-In, Auth0) — they handle JWT security correctly so you don\'t have to.' },
      { icon: '⏱', text: 'Stay alert for "session expired" messages — short-lived tokens limit the damage if one gets stolen.' },
      { icon: '🚫', text: 'Websites should never store sensitive data in JWTs — they\'re like a postcard, not a sealed envelope. Anyone can read them.' },
    ],
    funFact: { emoji: '🎭', text: 'JWT stands for JSON Web Token. Despite the official-sounding name, the payload section is just encoded text — paste any JWT into jwt.io and you can read exactly what\'s inside it.' },
  },

  network_anomaly: {
    emoji: '🌊',
    title: 'The Traffic Flood',
    tagline: 'Sending so many fake visitors that real ones can\'t get through',
    realWorld: "In 2016, attackers hijacked 100,000 home routers, smart cameras, and baby monitors to flood a single company's servers. The result: Twitter, Netflix, Reddit, and Spotify all went offline for an entire day.",
    howItWorks: [
      { icon: '🚗', text: 'Imagine a highway that fits 100 cars. The attacker sends 100,000 cars at once. Real traffic can\'t move. The highway — your server — grinds to a complete halt.' },
      { icon: '📱', text: 'The attack comes from thousands of hacked devices — home routers, smart TVs, security cameras — spread all over the world. There\'s no single place to block.' },
      { icon: '🔍', text: 'Before the big flood, the attacker quietly scouts your network — mapping which ports are open and which services are weakest, looking for the best place to strike.' },
    ],
    attackerWinTips: [
      { icon: '🌊', text: 'Launch DDoS waves continuously — gaps in your attack give the defender time to recover' },
      { icon: '📡', text: 'Port Scan first to find unprotected entry points before unleashing the flood' },
      { icon: '⚡', text: 'Chain multiple attack types — while the defender handles the flood, probe for other open vulnerabilities' },
    ],
    defenderWinTips: [
      { icon: '🛡', text: 'Enable DDoS Protection the moment you see traffic spikes — this is your most important first move, nothing else works without it' },
      { icon: '🚫', text: 'Block the highest-traffic IPs immediately — cutting the biggest flood sources buys critical time' },
      { icon: '🔒', text: 'Isolate non-critical services to protect your core systems — sacrifice the less important parts to keep the vital ones running' },
    ],
    staySecure: [
      { icon: '☁️', text: 'For any website you run, use a CDN like Cloudflare — it absorbs flood traffic before it even reaches your server.' },
      { icon: '📊', text: 'Know what "normal" looks like for your traffic. Attacks are invisible without a baseline to compare against.' },
      { icon: '🌐', text: 'Split your services across separate systems — if one goes down in a flood, the others keep running.' },
    ],
    funFact: { emoji: '📊', text: 'The largest DDoS attack ever recorded hit 3.47 terabits per second in 2021. That\'s enough data to download every movie on Netflix in roughly two seconds.' },
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function AnimatedCounter({ target, duration = 1400, suffix = '' }) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const raf = requestAnimationFrame(function tick() {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return <span className="tabular-nums">{value.toLocaleString()}{suffix}</span>
}

function PendingAAR({ onDismiss }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: '#060d1a' }}>
      <div className="relative w-12 h-12">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: '2px solid rgba(0,212,255,0.15)' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: '2px solid transparent', borderTopColor: '#00d4ff' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      <div className="text-center">
        <p className="font-mono font-bold tracking-widest mb-1" style={{ color: '#3d6680', fontSize: '11px', letterSpacing: '0.2em' }}>
          COMPILING REPORT
        </p>
        <p className="font-mono text-xs" style={{ color: '#1e3a52' }}>Waiting for after action review data...</p>
      </div>
      <motion.button
        onClick={onDismiss}
        className="font-mono text-xs"
        style={{ color: '#1e3a52', textDecoration: 'underline' }}
        whileHover={{ color: '#3d6680' }}
      >
        Return to dashboard
      </motion.button>
    </div>
  )
}

// ─── Stat box ─────────────────────────────────────────────────────────────────

function StatBox({ icon, label, value, suffix = '', color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between px-4 py-3 rounded"
      style={{ background: `${color}08`, border: `1px solid ${color}20` }}
    >
      <div className="flex items-center gap-2.5">
        <span style={{ fontSize: '14px' }}>{icon}</span>
        <span className="font-mono text-xs" style={{ color: '#2d4a62', letterSpacing: '0.06em' }}>
          {label}
        </span>
      </div>
      <span className="font-mono font-bold text-sm tabular-nums" style={{ color }}>
        <AnimatedCounter target={typeof value === 'number' ? value : 0} suffix={suffix} />
      </span>
    </motion.div>
  )
}

// ─── Intel card ───────────────────────────────────────────────────────────────

function IntelCard({ scenario, role, isWin }) {
  const [tab, setTab] = useState('how')
  const intel = SCENARIO_INTEL[scenario]
  if (!intel) return null

  const isAttacker = role === 'red_team'
  const accent = isAttacker ? '#ff2244' : '#00d4ff'
  const winTips = isAttacker ? intel.attackerWinTips : intel.defenderWinTips

  const tabs = [
    { id: 'how',    label: '🎯', title: 'How It Works' },
    { id: 'win',    label: isAttacker ? '💀' : '🛡', title: isAttacker ? 'Attack Tips' : 'Defense Tips' },
    { id: 'safe',   label: '🔒', title: 'Stay Safe IRL' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="rounded overflow-hidden"
      style={{ background: '#060d1a', border: '1px solid #0d1e30' }}
    >
      {/* Header */}
      <div
        className="px-5 py-4"
        style={{ borderBottom: '1px solid #0d1e30', background: 'rgba(255,255,255,0.015)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 flex items-center justify-center text-3xl rounded shrink-0"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {intel.emoji}
          </div>
          <div>
            <p className="font-mono font-black" style={{ color: '#d0e4f0', fontSize: '14px' }}>
              {intel.title}
            </p>
            <p className="font-mono text-xs mt-0.5" style={{ color: accent }}>
              {intel.tagline}
            </p>
          </div>
        </div>
        <p
          className="font-mono text-xs leading-relaxed"
          style={{
            color: '#7899b0',
            background: 'rgba(255,255,255,0.02)',
            borderLeft: `2px solid ${accent}40`,
            padding: '10px 14px',
            borderRadius: '3px',
            fontSize: '12px',
            lineHeight: '1.75',
          }}
        >
          {intel.realWorld}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex" style={{ borderBottom: '1px solid #0d1e30' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors"
            style={{
              background: tab === t.id ? `${accent}0a` : 'transparent',
              borderBottom: tab === t.id ? `2px solid ${accent}` : '2px solid transparent',
              color: tab === t.id ? accent : '#2d4a62',
              fontFamily: 'monospace',
              fontSize: '10px',
              letterSpacing: '0.08em',
            }}
          >
            <span>{t.label}</span>
            <span>{t.title.toUpperCase()}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5 min-h-[200px]">
        <AnimatePresence mode="wait">

          {tab === 'how' && (
            <motion.div
              key="how"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="space-y-3"
            >
              {intel.howItWorks.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center text-base shrink-0 mt-0.5"
                    style={{ background: 'rgba(255,34,68,0.08)', border: '1px solid rgba(255,34,68,0.15)' }}
                  >
                    {item.icon}
                  </div>
                  <p className="font-mono text-xs leading-relaxed flex-1" style={{ color: '#8aacbf', fontSize: '12px', lineHeight: '1.7' }}>
                    {item.text}
                  </p>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-3 px-4 py-3 rounded mt-2"
                style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
              >
                <span className="text-lg shrink-0">{intel.funFact.emoji}</span>
                <p className="font-mono text-xs leading-relaxed" style={{ color: '#c8a840', fontSize: '11px', lineHeight: '1.65' }}>
                  {intel.funFact.text}
                </p>
              </motion.div>
            </motion.div>
          )}

          {tab === 'win' && (
            <motion.div
              key="win"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="space-y-3"
            >
              <p className="font-mono font-bold tracking-widest mb-4" style={{ color: `${accent}70`, fontSize: '9px' }}>
                {isAttacker ? '— HOW TO WIN AS ATTACKER —' : '— HOW TO WIN AS DEFENDER —'}
              </p>
              {winTips.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center text-base shrink-0 mt-0.5"
                    style={{ background: `${accent}10`, border: `1px solid ${accent}25` }}
                  >
                    {tip.icon}
                  </div>
                  <p className="font-mono text-xs leading-relaxed flex-1" style={{ color: '#8aacbf', fontSize: '12px', lineHeight: '1.7' }}>
                    {tip.text}
                  </p>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-3 px-4 py-3 rounded font-mono text-xs"
                style={
                  isWin
                    ? { background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', color: '#5ecba0' }
                    : { background: 'rgba(255,34,68,0.06)', border: '1px solid rgba(255,34,68,0.2)', color: '#ff8099' }
                }
              >
                {isWin
                  ? '✓ You nailed it this round — try the opposite role next to master both sides'
                  : '⚠ Study these tips and come back stronger next match'}
              </motion.div>
            </motion.div>
          )}

          {tab === 'safe' && (
            <motion.div
              key="safe"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="space-y-3"
            >
              <p className="font-mono font-bold tracking-widest mb-4" style={{ color: 'rgba(0,212,255,0.4)', fontSize: '9px' }}>
                — HOW TO PROTECT YOURSELF IN REAL LIFE —
              </p>
              {intel.staySecure.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-3 px-4 py-3 rounded"
                  style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)' }}
                >
                  <span className="text-base shrink-0">{tip.icon}</span>
                  <p className="font-mono text-xs leading-relaxed" style={{ color: '#7899b0', fontSize: '12px', lineHeight: '1.7' }}>
                    {tip.text}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Timeline event ───────────────────────────────────────────────────────────

const SEV_COLORS = {
  warning: '#f59e0b', defense: '#00d4ff', success: '#10b981',
  info: '#334155', critical: '#ff2244', attack: '#ff4488', system: '#a78bfa',
}

function TimelineEvent({ event, index }) {
  const color = SEV_COLORS[event.severity] || '#334155'
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.05 }}
      className="flex items-center gap-3"
    >
      <span
        className="font-mono tabular-nums text-right shrink-0"
        style={{ color: '#1e3a52', fontSize: '10px', minWidth: '44px' }}
      >
        {event.time || event.timestamp}
      </span>
      <div
        className="w-2 h-2 rounded-full shrink-0 relative z-10"
        style={{ background: color, boxShadow: `0 0 5px ${color}80` }}
      />
      <p className="font-mono text-xs" style={{ color: '#6688a0', fontSize: '11px' }}>
        {event.event || event.message}
      </p>
    </motion.div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AAR() {
  const navigate = useNavigate()
  const { resetMatch, scenario, role } = useMatchStore()
  const { isLevelingUp, levelName } = useProgressionStore()
  const { aarResult, reset: resetSim } = useSimulationStore()

  const handleDismiss = () => {
    resetSim()
    resetMatch()
    navigate('/dashboard')
  }

  if (!aarResult) return <PendingAAR onDismiss={handleDismiss} />

  const {
    outcome,
    xpGained          = 0,
    forfeit           = false,
    playerSummary     = {},
    timeline          = [],
    performanceScores = {},
    keyInsights       = [],
    improvementAreas  = [],
  } = aarResult

  const isWin      = outcome === 'win'
  const isAttacker = role === 'red_team'
  const winColor   = isWin ? '#10b981' : '#ff2244'
  const roleColor  = isAttacker ? '#ff2244' : '#00d4ff'

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #060d1a 0%, #040810 100%)', paddingTop: '68px' }}
    >
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

        {/* ── Top bar ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 py-2.5 rounded"
          style={{ background: 'rgba(6,13,26,0.95)', border: '1px solid #0d1e30' }}
        >
          <div>
            <p className="font-mono" style={{ color: '#1e3a52', fontSize: '9px', letterSpacing: '0.2em' }}>
              AFTER ACTION REVIEW
            </p>
            <p className="font-mono font-bold mt-0.5" style={{ color: '#3d6680', fontSize: '12px', letterSpacing: '0.06em' }}>
              {scenario?.replace(/_/g, ' ').toUpperCase() || 'OPERATION COMPLETE'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono" style={{ color: '#1e3a52', fontSize: '9px' }}>NEXT MATCH IN</span>
            <CountdownTimer seconds={90} onComplete={handleDismiss} size="sm" color={isWin ? 'blue' : 'red'} />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* ── Left column ── */}
          <div className="space-y-3">

            {/* Outcome hero */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
              className="relative overflow-hidden rounded text-center"
              style={{
                background: `linear-gradient(160deg, ${winColor}10 0%, rgba(6,13,26,0) 60%)`,
                border: `1px solid ${winColor}30`,
                padding: '28px 20px 24px',
              }}
            >
              {/* Glow orb behind text */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 pointer-events-none"
                style={{ background: `radial-gradient(ellipse, ${winColor}18, transparent 70%)`, top: '-16px' }}
              />

              {/* Level up flash */}
              <AnimatePresence>
                {isLevelingUp && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none rounded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.4, 0] }}
                    transition={{ duration: 1.5 }}
                    style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.3), transparent)' }}
                  />
                )}
              </AnimatePresence>

              <motion.p
                className="font-mono font-black relative z-10"
                style={{
                  fontSize: '36px',
                  letterSpacing: '0.05em',
                  color: winColor,
                  textShadow: `0 0 40px ${winColor}80, 0 0 80px ${winColor}30`,
                  lineHeight: 1,
                  marginBottom: '8px',
                }}
                animate={{ textShadow: [`0 0 30px ${winColor}60`, `0 0 50px ${winColor}90`, `0 0 30px ${winColor}60`] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                {isWin ? 'VICTORY' : 'DEFEAT'}
              </motion.p>

              <p className="font-mono text-xs relative z-10 mb-5" style={{ color: '#2d4a62', lineHeight: '1.6' }}>
                {forfeit
                  ? (isWin ? 'Opponent forfeited the match' : 'Match forfeited — recorded as loss')
                  : (playerSummary.summary || (isWin ? 'Mission objectives completed' : 'Threat overcame defenses'))}
              </p>

              {/* XP box */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative z-10 py-3 px-4 rounded"
                style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}
              >
                <p className="font-mono" style={{ color: '#3d5a30', fontSize: '9px', letterSpacing: '0.15em', marginBottom: '4px' }}>
                  XP EARNED
                </p>
                <p
                  className="font-mono font-black tabular-nums"
                  style={{ fontSize: '30px', color: '#f59e0b', textShadow: '0 0 20px rgba(245,158,11,0.6)', lineHeight: 1 }}
                >
                  +<AnimatedCounter target={xpGained} />
                </p>
              </motion.div>

              {/* Level up badge */}
              {isLevelingUp && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.9, type: 'spring' }}
                  className="relative z-10 mt-3 py-2 px-4 rounded inline-block"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.4)' }}
                >
                  <p className="font-mono font-bold" style={{ color: '#f59e0b', fontSize: '11px', letterSpacing: '0.12em' }}>
                    ⚡ LEVEL UP — {levelName}
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Stats */}
            {!forfeit && Object.keys(playerSummary).length > 0 && (
              <div className="space-y-1.5">
                <StatBox icon="⚡" label="Actions Taken"   value={playerSummary.actionsCount   ?? 0} color="#00d4ff" delay={0.2} />
                <StatBox icon="✓"  label="Correct Actions" value={playerSummary.correctActions  ?? 0} color="#10b981" delay={0.28} />
                <StatBox icon="⏱" label="Avg Response"    value={playerSummary.avgResponseTime ?? 0} color="#f59e0b" suffix="s" delay={0.36} />
              </div>
            )}

            {/* Role badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.44 }}
              className="px-4 py-3 rounded text-center"
              style={{ background: `${roleColor}08`, border: `1px solid ${roleColor}20` }}
            >
              <p className="font-mono font-bold" style={{ color: roleColor, fontSize: '10px', letterSpacing: '0.1em' }}>
                {isAttacker ? '💀 RED TEAM — ATTACKER' : '🛡 BLUE TEAM — DEFENDER'}
              </p>
              <p className="font-mono text-xs mt-1" style={{ color: '#1e3a52', fontSize: '10px' }}>
                {isAttacker
                  ? 'Try defender next — it changes everything'
                  : 'Try attacker next — know thy enemy'}
              </p>
            </motion.div>

            {/* Play again */}
            <motion.button
              onClick={handleDismiss}
              className="w-full py-3 rounded font-mono font-bold text-xs tracking-widest"
              style={{
                background: `${roleColor}12`,
                border: `1px solid ${roleColor}35`,
                color: roleColor,
                letterSpacing: '0.12em',
              }}
              whileHover={{ background: `${roleColor}20`, boxShadow: `0 0 20px ${roleColor}20` }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              ⚡ PLAY AGAIN
            </motion.button>
          </div>

          {/* ── Right columns ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Intel card */}
            <IntelCard scenario={scenario} role={role} isWin={isWin} />

            {/* Timeline */}
            {!forfeit && timeline.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                className="rounded overflow-hidden"
                style={{ background: '#060d1a', border: '1px solid #0d1e30' }}
              >
                <div className="px-4 py-2.5" style={{ borderBottom: '1px solid #0d1e30', background: 'rgba(255,255,255,0.01)' }}>
                  <span className="font-mono" style={{ color: '#1e3a52', fontSize: '9px', letterSpacing: '0.18em' }}>
                    MISSION TIMELINE
                  </span>
                </div>
                <div className="p-4 relative">
                  {/* Vertical line */}
                  <div
                    className="absolute top-4 bottom-4"
                    style={{ left: '64px', width: '1px', background: '#0d1e30' }}
                  />
                  <div className="space-y-3">
                    {timeline.map((event, i) => (
                      <TimelineEvent key={i} event={event} index={i} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Performance scores */}
            {!forfeit && Object.keys(performanceScores).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.33 }}
                className="rounded overflow-hidden"
                style={{ background: '#060d1a', border: '1px solid #0d1e30' }}
              >
                <div className="px-4 py-2.5" style={{ borderBottom: '1px solid #0d1e30', background: 'rgba(255,255,255,0.01)' }}>
                  <span className="font-mono" style={{ color: '#1e3a52', fontSize: '9px', letterSpacing: '0.18em' }}>
                    TACTICAL ASSESSMENT
                  </span>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(performanceScores).map(([key, score], i) => {
                    const colors = ['#10b981', '#00d4ff', '#f59e0b', '#8b5cf6', '#ff6600', '#ff4488']
                    const color = colors[i % colors.length]
                    const label = key.replace(/([A-Z])/g, ' $1').trim()
                    return (
                      <div
                        key={key}
                        className="p-3 rounded"
                        style={{ background: `${color}07`, border: `1px solid ${color}18` }}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-mono text-xs" style={{ color: '#2d4a62', fontSize: '10px' }}>
                            {label.toUpperCase()}
                          </span>
                          <span className="font-mono font-bold text-sm" style={{ color }}>
                            {score}%
                          </span>
                        </div>
                        <div className="h-1 rounded overflow-hidden" style={{ background: '#0a1828' }}>
                          <motion.div
                            className="h-full rounded"
                            style={{ background: color, boxShadow: `0 0 5px ${color}80` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 0.9, delay: 0.5 + i * 0.08, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Insights + improvement */}
            {!forfeit && (keyInsights.length > 0 || improvementAreas.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {keyInsights.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.38 }}
                    className="rounded overflow-hidden"
                    style={{ background: '#060d1a', border: '1px solid #0d1e30' }}
                  >
                    <div className="px-4 py-2.5" style={{ borderBottom: '1px solid #0d1e30' }}>
                      <span className="font-mono" style={{ color: '#1e3a52', fontSize: '9px', letterSpacing: '0.18em' }}>
                        KEY INSIGHTS
                      </span>
                    </div>
                    <ul className="p-4 space-y-2.5">
                      {keyInsights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span style={{ color: '#f59e0b', fontSize: '10px', marginTop: '2px' }}>◆</span>
                          <span className="font-mono text-xs leading-relaxed" style={{ color: '#6688a0', fontSize: '11px', lineHeight: '1.6' }}>
                            {insight}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {improvementAreas.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.42 }}
                    className="rounded overflow-hidden"
                    style={{ background: '#060d1a', border: '1px solid rgba(255,34,68,0.15)' }}
                  >
                    <div className="px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,34,68,0.12)' }}>
                      <span className="font-mono" style={{ color: 'rgba(255,34,68,0.4)', fontSize: '9px', letterSpacing: '0.18em' }}>
                        IMPROVE NEXT TIME
                      </span>
                    </div>
                    <ul className="p-4 space-y-2.5">
                      {improvementAreas.map((area, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span style={{ color: '#ff4466', fontSize: '10px', marginTop: '2px' }}>▸</span>
                          <span className="font-mono text-xs leading-relaxed" style={{ color: '#5a7080', fontSize: '11px', lineHeight: '1.6' }}>
                            {area}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}