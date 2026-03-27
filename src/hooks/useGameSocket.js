import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSimulationStore } from "../store/simulationStore";
import { useProgressionStore } from "../store/progressionStore";
import { useMatchStore } from "../store/matchStore";
import { useAuthStore } from "../store/authStore";
import {
  gameSocket,
  connectGame,
  _markAuthenticated,
} from "../sockets/gameSocket";

export function useGameSocket() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuthStore();
  const {
    addLog,
    updateSystemStatus,
    setTimeRemaining,
    setProgress,
    setActions,
    setPhase,
    stopLocalTimer,
    setAarResult,
  } = useSimulationStore();
  const { applyXPGain, incrementWin, incrementLoss, saveProgression } =
    useProgressionStore();
  const { setPhase: setMatchPhase, gameId } = useMatchStore();

  useEffect(() => {
    if (!gameId) return;

    connectGame(token);

    const onConnect = () => {
      gameSocket.emit("authenticate", token, (res) => {
        if (!res?.success) {
          console.error("[GameSocket] Auth failed:", res?.error);
          return;
        }
        _markAuthenticated();
        // ── Rejoin after reload ──────────────────────────────────────────
        // gameId survived in sessionStorage → matchStore was rehydrated.
        // Ask the server if the game still exists and what phase it's in.
        if (gameId) {
          gameSocket.emit("rejoin_game", gameId, (rejoinRes) => {
            if (rejoinRes?.error) {
              // Game no longer exists on server — clean up client state
              console.warn("[GameSocket] Rejoin failed:", rejoinRes.error);
              useMatchStore.getState().resetMatch();
              navigate("/dashboard", { replace: true });
              return;
            }

            const { phase, timeRemaining } = rejoinRes;

            // Sync phase into stores
            setPhase(phase);
            setMatchPhase(phase);
            if (typeof timeRemaining === "number") {
              setTimeRemaining(Math.floor(timeRemaining / 1000));
            }

            // Navigate to the right page for the current phase
            const current = location.pathname;
            if (phase === "briefing" && current !== "/briefing") {
              navigate("/briefing", { replace: true });
            } else if (phase === "active" && current !== "/simulation") {
              navigate("/simulation", { replace: true });
            } else if (phase === "aar" && current !== "/aar") {
              navigate("/aar", { replace: true });
            }
          });
        }
      });
    };

    const onLog = (log) => addLog(log);
    const onStatus = (status) => {
      updateSystemStatus(status);
      if (typeof status?.progressPercentage === "number")
        setProgress(status.progressPercentage);
    };
    const onTimer = ({ timeRemaining }) =>
      setTimeRemaining(Math.floor(timeRemaining / 1000));
    const onActions = (actions) => setActions(actions);

    const onPhaseChanged = ({ phase, result }) => {
      console.log("[PhaseChanged]", phase, result);
      setPhase(phase);
      setMatchPhase(phase);

      if (phase === "active") {
        if (location.pathname === "/briefing") navigate("/simulation");
      }

      if (phase === "aar") {
        stopLocalTimer();
        if (result) {
          setAarResult(result);
          if (result.outcome === "win") incrementWin();
          else if (result.outcome === "loss") incrementLoss();
          applyXPGain(result.xpGained ?? 0);

          // Persist to DB — this is what was missing before
          saveProgression(result.outcome, result.xpGained ?? 0);
        }
        // Do NOT resetSim here — aarResult must survive for AAR page to read.
        // Do NOT resetMatch here — AAR page needs scenario/role for display.
        navigate("/aar");
      }
    };

    const onForfeited = () => {
      stopLocalTimer();
      incrementWin();
      applyXPGain(50);
      setMatchPhase("aar");
      navigate("/aar");
    };

    if (gameSocket.connected) onConnect();

    gameSocket.on("connect", onConnect);
    gameSocket.on("game_log", onLog);
    gameSocket.on("system_status", onStatus);
    gameSocket.on("timer_update", onTimer);
    gameSocket.on("actions_update", onActions);
    gameSocket.on("phase_changed", onPhaseChanged);
    gameSocket.on("game_forfeited", onForfeited);

    return () => {
      gameSocket.off("connect", onConnect);
      gameSocket.off("game_log", onLog);
      gameSocket.off("system_status", onStatus);
      gameSocket.off("timer_update", onTimer);
      gameSocket.off("actions_update", onActions);
      gameSocket.off("phase_changed", onPhaseChanged);
      gameSocket.off("game_forfeited", onForfeited);
    };
  }, [gameId, token]);
}
