# CyberSafe Arena — Frontend

Cyberpunk-aesthetic real-time cybersecurity simulation platform.

## Stack
- React 18 + Vite
- Tailwind CSS
- Framer Motion
- React Router DOM v6
- Axios
- Socket.io Client
- Zustand

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your backend URL
npm run dev
```

## Architecture

```
src/
  pages/           # Route-level components
    Login.jsx
    Register.jsx
    Dashboard.jsx
    Matchmaking.jsx
    MatchFound.jsx
    TacticalBriefing.jsx
    Simulation.jsx  ← Core arena screen
    AAR.jsx
    Leaderboard.jsx
    Profile.jsx

  components/      # Reusable UI
    CyberGrid.jsx       – Animated grid background
    RoleBadge.jsx       – Neon role indicator (Red/Blue)
    XPBar.jsx           – Animated XP progress
    CountdownTimer.jsx  – SVG ring countdown
    TerminalLog.jsx     – Scrollable log terminal
    SystemStatusHUD.jsx – 4-system status display
    ActionPanel.jsx     – Dynamic action buttons w/ cooldowns
    ProtectedRoute.jsx  – Auth guard

  layouts/
    AuthLayout.jsx
    MainLayout.jsx  – With Navbar + CyberGrid
    Navbar.jsx

  store/
    authStore.js        – User auth + token (persisted)
    matchStore.js       – Matchmaking state
    simulationStore.js  – Live game state + logs
    progressionStore.js – XP, level, metrics

  sockets/
    matchmakingSocket.js
    gameSocket.js

  hooks/
    useMatchmaking.js   – Socket event handlers
    useGameSocket.js    – Game event handlers

  services/
    api.js              – Axios instance
```

## Socket Events Expected from Backend

### /rooms namespace
- Emit: `create_room { config }`, `join_room { roomCode }`, `leave_room { roomId }`, `kick_member { roomId, userId }`, `update_room_config { roomId, config }`, `start_room { roomId }`
- On: `room_created { roomCode, roomId, members }`, `room_joined { roomCode, roomId, members }`, `members_update { members }`, `room_error { message }`, `room_closed`, `match_found { gameId, opponent, role, scenario, difficulty }`

**Member shape**: `{ userId, username, role, levelName, isReady, isHost }`
**Config shape**: `{ scenario: string, difficulty: 'easy'|'medium'|'hard'|'elite', maxPlayers: number }`

### /matchmaking namespace
- Emit: `find_match`, `cancel_match`
- On: `queue_update { position, size }`, `match_found { gameId, opponent, role, scenario, difficulty }`, `match_error`

### /game namespace
- Emit: `join_game { gameId }`, `game_action { actionId, gameId }`
- On: `game_log { severity, message }`, `system_status { firewall, api, database, auth }`, `timer_update { timeRemaining }`, `progress_update { percentage }`, `actions_update []`, `game_phase { phase }`, `game_end { outcome, xpGained }`

## Log Severity Levels
`critical` | `warning` | `info` | `success` | `debug` | `attack` | `defense`

## Role Values
- Attacker: `attacker` or `red`
- Defender: `defender` or `blue`

## System Status Values
`secure` | `warning` | `breach`
