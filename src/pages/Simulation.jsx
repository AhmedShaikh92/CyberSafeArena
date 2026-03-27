import React, { useEffect, useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMatchStore } from "../store/matchStore";
import { useSimulationStore } from "../store/simulationStore";
import { gameSocket, whenAuthenticated } from "../sockets/gameSocket";
import TerminalLog from "../components/TerminalLog";
import SystemStatusHUD from "../components/SystemStatusHUD";
import ActionPanel from "../components/ActionPanel";
import { useGameSocket } from "../hooks/useGameSocket";

// ─── Forfeit Dialog ───────────────────────────────────────
function ForfeitDialog({ onConfirm, onCancel }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
        onClick={onCancel}
      />
      <motion.div
        className="relative w-full max-w-sm overflow-hidden"
        initial={{ scale: 0.92, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 24, opacity: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        style={{
          background: "linear-gradient(160deg, #0d1623 0%, #080f1a 100%)",
          border: "1px solid rgba(255,34,68,0.35)",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(255,34,68,0.12)",
          borderRadius: "4px",
        }}
      >
        <div
          style={{
            height: "2px",
            background:
              "linear-gradient(90deg, transparent, #ff2244, transparent)",
          }}
        />
        <div className="p-6 sm:p-8 text-center">
          <motion.div
            className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5 flex items-center justify-center"
            style={{
              background:
                "radial-gradient(circle, rgba(255,34,68,0.15) 0%, transparent 70%)",
              border: "1px solid rgba(255,34,68,0.25)",
              borderRadius: "4px",
              fontSize: "24px",
            }}
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(255,34,68,0)",
                "0 0 0 8px rgba(255,34,68,0)",
                "0 0 0 0 rgba(255,34,68,0)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⚠
          </motion.div>
          <h2
            className="font-mono text-sm sm:text-base font-bold tracking-widest mb-2 uppercase"
            style={{ color: "#ff2244" }}
          >
            Forfeit Match?
          </h2>
          <p
            className="text-xs sm:text-sm font-mono mb-6 leading-relaxed"
            style={{ color: "#475569" }}
          >
            This counts as a loss and will be permanently recorded.
            <br />
            <span style={{ color: "#334155" }}>
              Your opponent wins by default.
            </span>
          </p>
          <div className="flex gap-3">
            <motion.button
              onClick={onCancel}
              className="flex-1 font-mono text-xs tracking-widest uppercase"
              style={{
                minHeight: "48px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid #1e293b",
                color: "#475569",
                borderRadius: "3px",
              }}
              whileHover={{ borderColor: "#334155", color: "#94a3b8" }}
              whileTap={{ scale: 0.97 }}
            >
              Stay In
            </motion.button>
            <motion.button
              onClick={onConfirm}
              className="flex-1 font-mono text-xs tracking-widest uppercase font-bold"
              style={{
                minHeight: "48px",
                background: "rgba(255,34,68,0.1)",
                border: "1px solid rgba(255,34,68,0.5)",
                color: "#ff2244",
                borderRadius: "3px",
              }}
              whileHover={{
                background: "rgba(255,34,68,0.18)",
                boxShadow: "0 0 20px rgba(255,34,68,0.25)",
              }}
              whileTap={{ scale: 0.97 }}
            >
              Forfeit
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Game Timer ───────────────────────────────────────────
function GameTimer({ seconds, compact = false }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isUrgent = seconds < 60;
  const isWarning = seconds < 120 && !isUrgent;
  const color = isUrgent ? "#ff2244" : isWarning ? "#f59e0b" : "#e2e8f0";

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        {isUrgent && (
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#ff2244" }}
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
        <span
          className="font-mono font-black tabular-nums"
          style={{
            fontSize: "20px",
            color,
            letterSpacing: "-0.02em",
            textShadow: isUrgent ? "0 0 20px rgba(255,34,68,0.6)" : "none",
          }}
        >
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <p
        className="font-mono tracking-widest uppercase"
        style={{ color: "#2d4a62", fontSize: "9px" }}
      >
        Time Remaining
      </p>
      <div className="flex items-center gap-1">
        {isUrgent && (
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#ff2244" }}
            animate={{ opacity: [1, 0.2, 1], scale: [1, 1.3, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
        <motion.span
          className="font-mono font-black tabular-nums"
          style={{
            fontSize: "28px",
            letterSpacing: "-0.02em",
            color,
            textShadow: isUrgent
              ? "0 0 30px rgba(255,34,68,0.6)"
              : isWarning
                ? "0 0 20px rgba(245,158,11,0.4)"
                : "none",
          }}
          animate={
            isUrgent
              ? {
                  textShadow: [
                    "0 0 20px rgba(255,34,68,0.4)",
                    "0 0 40px rgba(255,34,68,0.8)",
                    "0 0 20px rgba(255,34,68,0.4)",
                  ],
                }
              : {}
          }
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </motion.span>
      </div>
    </div>
  );
}

// ─── HUD Pill ─────────────────────────────────────────────
function HudPill({ children, color, glow = false }) {
  return (
    <span
      className="font-mono text-xs px-2 py-1 tracking-widest uppercase whitespace-nowrap"
      style={{
        color,
        background: `${color}10`,
        border: `1px solid ${color}35`,
        borderRadius: "3px",
        boxShadow: glow ? `0 0 12px ${color}25` : "none",
      }}
    >
      {children}
    </span>
  );
}

// ─── Mobile Tab Bar ───────────────────────────────────────
const TABS = [
  { id: "actions", label: "Actions", icon: "⚡" },
  { id: "status", label: "Status", icon: "📡" },
  { id: "log", label: "Log", icon: "📋" },
];

function MobileTabBar({ active, onChange }) {
  return (
    <div
      className="shrink-0 grid grid-cols-3 border-t border-b"
      style={{ borderColor: "#0d1e30", background: "rgba(6,13,26,0.98)" }}
    >
      {TABS.map(({ id, label, icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex flex-col items-center justify-center py-2.5 gap-1 relative"
            style={{ minHeight: "52px" }}
          >
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: "#00d4ff" }}
              />
            )}
            <span style={{ fontSize: "16px" }}>{icon}</span>
            <span
              className="font-mono text-xs tracking-wider"
              style={{
                color: isActive ? "#00d4ff" : "#2d4a62",
                fontSize: "10px",
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Reconnecting ─────────────────────────────────────────
function ReconnectingScreen() {
  return (
    <div
      className="h-screen flex flex-col items-center justify-center gap-6"
      style={{ background: "#060d1a" }}
    >
      <div className="relative w-12 h-12">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: "1px solid rgba(0,212,255,0.1)" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: "2px solid transparent", borderTopColor: "#00d4ff" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full"
          style={{
            border: "1px solid transparent",
            borderTopColor: "rgba(0,212,255,0.4)",
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div className="text-center">
        <p
          className="font-mono text-xs tracking-widest uppercase mb-1"
          style={{ color: "#00d4ff" }}
        >
          Reconnecting
        </p>
        <p className="font-mono text-xs" style={{ color: "#1e3a52" }}>
          Restoring simulation session...
        </p>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────
export default function Simulation() {
  const navigate = useNavigate();
  const { role, gameId, scenario, difficulty, resetMatch } = useMatchStore();
  const {
    logs,
    systemStatus,
    timeRemaining,
    actions,
    actionCooldowns,
    activeActions,
    progressPercentage,
    sendAction,
    subscribe,
    startLocalTimer,
    stopLocalTimer,
    reset: resetSim,
  } = useSimulationStore();

  useGameSocket();

  const attacker = role === "red_team";
  const roleColor = attacker ? "#ff2244" : "#00d4ff";

  const [showForfeit, setShowForfeit] = useState(false);
  const [rejoining, setRejoining] = useState(true);
  const [gameNotFound, setGameNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState("actions"); // mobile tab state

  const gameIdRef = useRef(gameId);

  useEffect(() => {
    const gid = gameIdRef.current;
    if (!gid) {
      navigate("/dashboard", { replace: true });
      return;
    }

    const doRejoin = () => {
      gameSocket.emit("rejoin_game", gid, (response) => {
        setRejoining(false);
        if (response?.error) {
          setGameNotFound(true);
          setTimeout(() => {
            resetMatch();
            resetSim();
            navigate("/dashboard", { replace: true });
          }, 3000);
          return;
        }
        subscribe(gid);
        const serverTime = response?.timeRemaining;
        const initialSecs =
          serverTime != null
            ? Math.floor(serverTime / 1000)
            : useSimulationStore.getState().timeRemaining || 300;
        startLocalTimer(initialSecs);
      });
    };
    whenAuthenticated(doRejoin);
    return () => {
      stopLocalTimer();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAction = useCallback(
    (actionId) => {
      if (gameId) sendAction(actionId, gameId);
    },
    [gameId, sendAction],
  );

  const handleForfeitConfirm = useCallback(() => {
    setShowForfeit(false);
    stopLocalTimer();
    if (gameId) gameSocket.emit("forfeit_game", { gameId });
  }, [gameId, stopLocalTimer]);

  const difficultyColors = {
    easy: "#10b981",
    medium: "#f59e0b",
    hard: "#ff6600",
    elite: "#ff2244",
  };
  const difficultyColor = difficultyColors[difficulty] || "#f59e0b";

  if (rejoining) return <ReconnectingScreen />;
  if (gameNotFound)
    return (
      <div
        className="h-screen flex flex-col items-center justify-center gap-3 px-4"
        style={{ background: "#060d1a" }}
      >
        <div
          className="flex items-center gap-3 px-5 py-3 text-center"
          style={{
            background: "rgba(255,34,68,0.06)",
            border: "1px solid rgba(255,34,68,0.2)",
            borderRadius: "4px",
          }}
        >
          <span style={{ color: "#ff2244" }}>⚠</span>
          <p className="font-mono text-sm" style={{ color: "#ff6680" }}>
            Session ended — returning to dashboard
          </p>
        </div>
        <p
          className="font-mono text-xs text-center"
          style={{ color: "#2d4a62" }}
        >
          Your opponent may have left during your disconnect.
        </p>
      </div>
    );
  if (!gameId) return null;

  // Progress bar — shared between layouts
  const ProgressBar = () => {
    const safeProgress = Math.max(0, Math.min(100, progressPercentage || 0));

    return (
      <div
        className="shrink-0 px-3 sm:px-4 py-2 flex items-center gap-2 sm:gap-3"
        style={{
          borderTop: "1px solid #0d1e30",
          background: "rgba(6,13,26,0.95)",
        }}
      >
        <span
          className="font-mono tracking-wide sm:tracking-widest uppercase shrink-0"
          style={{ color: "#1e3a52", fontSize: "10px" }}
        >
          Progress
        </span>

        <div
          className="flex-1 relative h-1.5 sm:h-1 overflow-hidden"
          style={{ background: "#0a1828", borderRadius: "2px" }}
        >
          <motion.div
            className="absolute inset-y-0 left-0"
            initial={false} // ✅ IMPORTANT FIX
            animate={{ width: `${safeProgress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              background: attacker
                ? "linear-gradient(90deg, #ff2244, #ff6600)"
                : "linear-gradient(90deg, #00d4ff, #0080ff)",
              boxShadow: attacker
                ? "0 0 8px rgba(255,34,68,0.5)"
                : "0 0 8px rgba(0,212,255,0.5)",
              borderRadius: "2px",
            }}
          />

          {[25, 50, 75].map((tick) => (
            <div
              key={tick}
              className="absolute top-0 bottom-0 w-px"
              style={{
                left: `${tick}%`,
                background: "rgba(255,255,255,0.06)",
              }}
            />
          ))}
        </div>

        <span
          className="font-mono text-[10px] sm:text-xs font-bold tabular-nums shrink-0"
          style={{
            color: roleColor,
            minWidth: "32px",
            textAlign: "right",
          }}
        >
          {safeProgress}%
        </span>
      </div>
    );
  };

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: "#060d1a" }}
    >
      <AnimatePresence>
        {showForfeit && (
          <ForfeitDialog
            onConfirm={handleForfeitConfirm}
            onCancel={() => setShowForfeit(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Top HUD ── */}
      <div
        className="shrink-0 flex items-center justify-between px-3 sm:px-4 py-2"
        style={{
          marginTop: "56px",
          background: "rgba(6,13,26,0.95)",
          borderBottom: "1px solid #0d1e30",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Left: live dot + scenario */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 shrink-0">
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#ff2244",
                boxShadow: "0 0 8px rgba(255,34,68,0.8)",
              }}
              animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
              transition={{ duration: 0.9, repeat: Infinity }}
            />
            <span
              className="font-mono tracking-widest uppercase"
              style={{ color: "#ff4466", fontSize: "10px" }}
            >
              Live
            </span>
          </div>
          {/* Scenario — hidden on very small screens */}
          <span
            className="font-mono text-xs truncate hidden xs:block"
            style={{ color: "#3d6680" }}
          >
            {scenario?.replace(/_/g, " ") || "—"}
          </span>
        </div>

        {/* Center: timer — compact on mobile */}
        <div className="shrink-0 px-2 sm:px-6">
          {/* Full timer on sm+, compact on mobile */}
          <div className="hidden sm:block">
            <GameTimer seconds={timeRemaining} />
          </div>
          <div className="sm:hidden">
            <GameTimer seconds={timeRemaining} compact />
          </div>
        </div>

        {/* Right: role pill + forfeit */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          {/* Difficulty — hidden on mobile */}
          {difficulty && (
            <div className="hidden sm:block">
              <HudPill color={difficultyColor}>{difficulty}</HudPill>
            </div>
          )}
          {/* Role pill — shorter text on mobile */}
          <HudPill color={roleColor} glow>
            <span className="sm:hidden">{attacker ? "⚔" : "🛡"}</span>
            <span className="hidden sm:inline">
              {attacker ? "◈ Offensive" : "◈ Defensive"}
            </span>
          </HudPill>
          <motion.button
            onClick={() => setShowForfeit(true)}
            className="flex items-center gap-1 font-mono text-xs tracking-widest uppercase"
            style={{
              minHeight: "36px",
              minWidth: "44px",
              color: "#ff2244",
              border: "1px solid rgba(255,34,68,0.25)",
              background: "rgba(255,34,68,0.04)",
              borderRadius: "3px",
              paddingLeft: "8px",
              paddingRight: "8px",
            }}
            whileHover={{
              background: "rgba(255,34,68,0.1)",
              borderColor: "rgba(255,34,68,0.5)",
            }}
            whileTap={{ scale: 0.96 }}
          >
            {/* Icon only on mobile, icon+text on desktop */}
            <span>⏹</span>
            <span className="hidden sm:inline ml-1">Forfeit</span>
          </motion.button>
        </div>
      </div>

      {/* ── Desktop: 3-panel grid ── */}
      <div className="hidden sm:flex flex-1 gap-2 p-2 overflow-hidden min-h-0">
        <div className="flex-1 min-h-0 overflow-hidden">
          <TerminalLog logs={logs} />
        </div>
        <div className="flex-1 min-h-0 overflow-auto">
          <SystemStatusHUD status={systemStatus} />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <ActionPanel
            role={role}
            actions={actions}
            onAction={handleAction}
            cooldowns={actionCooldowns}
            activeActions={activeActions}
          />
        </div>
      </div>

      {/* ── Mobile: tabbed single-panel ── */}
      <div className="flex sm:hidden flex-col flex-1 min-h-0 overflow-hidden">
        <MobileTabBar active={activeTab} onChange={setActiveTab} />
        <div className="flex-1 overflow-hidden min-h-0">
          <AnimatePresence mode="wait">
            {activeTab === "actions" && (
              <motion.div
                key="actions"
                className="h-full overflow-hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                <ActionPanel
                  role={role}
                  actions={actions}
                  onAction={handleAction}
                  cooldowns={actionCooldowns}
                  activeActions={activeActions}
                />
              </motion.div>
            )}
            {activeTab === "status" && (
              <motion.div
                key="status"
                className="h-full overflow-auto"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                <SystemStatusHUD status={systemStatus} />
              </motion.div>
            )}
            {activeTab === "log" && (
              <motion.div
                key="log"
                className="h-full overflow-hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                <TerminalLog logs={logs} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <ProgressBar />
    </div>
  );
}
