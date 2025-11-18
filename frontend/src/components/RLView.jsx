// RLView.jsx
import { useEffect, useState } from "react";
import { rlResetRandom, rlResetFromMap, rlStep } from "../api";
import Viewer2D from "./Viewer2D";

// small helper to interpret actions
const ACTION_LABELS = {
  "-1": "—",
  0: "Move Up",
  1: "Move Right",
  2: "Move Down",
  3: "Move Left",
};

export default function RLView() {
  const [grid, setGrid] = useState(null);
  const [info, setInfo] = useState("");
  const [auto, setAuto] = useState(false);

  const [episodeDone, setEpisodeDone] = useState(false);
  const [lastAction, setLastAction] = useState(-1);

  const [stats, setStats] = useState({
    steps: 0,
    totalReward: 0,
    episodes: 0,
  });

  // -------------------------------------------------
  // Helper: reset stats (keep episodes count optional)
  // -------------------------------------------------
  const resetStatsForNewEpisode = (keepEpisodes = true) => {
    setStats((prev) => ({
      steps: 0,
      totalReward: 0,
      episodes: keepEpisodes ? prev.episodes : 0,
    }));
    setEpisodeDone(false);
    setLastAction(-1);
  };

  // -------------------------------------------------
  // Initial environment load
  // -------------------------------------------------
  useEffect(() => {
    (async () => {
      const res = await rlResetRandom();
      setGrid(res.grid);
      resetStatsForNewEpisode(false);
      setInfo("Random environment initialized. Agent starts at a random free cell, goal is placed elsewhere.");
    })();
  }, []);

  // -------------------------------------------------
  // AUTO-RUN LOOP
  // -------------------------------------------------
  useEffect(() => {
    if (!auto) return;

    let id = setInterval(async () => {
      // if episode already done, stop auto
      if (episodeDone) {
        setAuto(false);
        clearInterval(id);
        return;
      }

      const res = await rlStep();

      setGrid(res.grid);
      setLastAction(res.action);

      setStats((prev) => ({
        ...prev,
        steps: prev.steps + 1,
        totalReward: prev.totalReward + res.reward,
      }));

      // Update info text
      setInfo(
        `Action: ${ACTION_LABELS[res.action] || res.action} • Reward: ${res.reward.toFixed(
          2
        )} • Done: ${res.done}`
      );

      // If episode finished (either goal reached or failure)
      if (res.done) {
        setEpisodeDone(true);
        setAuto(false);
        setStats((prev) => ({
          ...prev,
          episodes: prev.episodes + 1,
        }));
        setInfo(
          `Episode finished. Final reward: ${(
            stats.totalReward + res.reward
          ).toFixed(2)}`
        );
      }
    }, 350);

    return () => clearInterval(id);
  }, [auto, episodeDone, stats.totalReward]);

  // -------------------------------------------------
  // Handlers
  // -------------------------------------------------

  const handleResetRandom = async () => {
    const res = await rlResetRandom();
    setGrid(res.grid);
    resetStatsForNewEpisode(); // keep episodes count
    setAuto(false);
    setInfo("Random environment reset. Agent and goal are placed on a fresh random grid.");
  };

  const handleResetFromMap = async () => {
    const res = await rlResetFromMap();
    setGrid(res.grid);
    resetStatsForNewEpisode(); // keep episodes count
    setAuto(false);
    setInfo(
      "Environment reset from the current occupancy map. The agent navigates in the same map built from LiDAR."
    );
  };

  const handleStep = async () => {
    const res = await rlStep();
    setGrid(res.grid);
    setLastAction(res.action);

    setStats((prev) => ({
      ...prev,
      steps: prev.steps + 1,
      totalReward: prev.totalReward + res.reward,
    }));

    setInfo(
      `Action: ${ACTION_LABELS[res.action] || res.action} • Reward: ${res.reward.toFixed(
        2
      )} • Done: ${res.done}`
    );

    if (res.done) {
      setEpisodeDone(true);
      setAuto(false);
      setStats((prev) => ({
        ...prev,
        episodes: prev.episodes + 1,
      }));
      setInfo(
        `Episode finished. Final reward: ${(
          stats.totalReward + res.reward
        ).toFixed(2)}`
      );
    }
  };

  const handleStartAuto = () => {
    if (!grid) return;
    setEpisodeDone(false);
    setAuto(true);
    setInfo("Auto-run started. The agent is now taking steps using its learned policy (with some exploration).");
  };

  const handleStopAuto = () => {
    setAuto(false);
    setInfo("Auto-run paused. You can step manually or start auto-run again.");
  };

  // -------------------------------------------------
  // Render
  // -------------------------------------------------

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "24px 16px 40px",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "22px",
          borderRadius: "18px",
          background: "linear-gradient(120deg, #004d40, #00897b, #26a69a)",
          color: "#e0f2f1",
          marginBottom: "26px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 14px 35px rgba(0,0,0,0.25)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.8rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: 0.9,
            }}
          >
            IIT Jodhpur • Indoor LiDAR Lab
          </div>

          <h2
            style={{
              margin: "4px 0 0 0",
              fontSize: "1.7rem",
              fontWeight: 700,
            }}
          >
            Reinforcement Learning Navigation
          </h2>

          <p
            style={{
              marginTop: 6,
              fontSize: "0.85rem",
              opacity: 0.95,
              maxWidth: "640px",
              lineHeight: 1.6,
            }}
          >
            Here, a reinforcement learning agent moves inside the{" "}
            <b>2D grid world</b> (derived from LiDAR data). It receives{" "}
            <b>rewards</b> for reaching the goal and penalties for collisions
            or bad moves. You can:
            <br />
            • Reset the environment (random or from your LiDAR map) <br />
            • Step manually and inspect each action <br />
            • Let the agent <b>auto-run</b> and watch how it learns to
            navigate.
          </p>
        </div>

        {/* Decorative circle */}
        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 30% 30%, #ffffffaa, #004d40)",
            border: "2px solid rgba(255,255,255,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            boxShadow: "0 0 18px rgba(0,0,0,0.35)",
          }}
        >
          🤖
        </div>
      </div>

      {/* Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1.6fr",
          gap: "22px",
        }}
      >
        {/* LEFT PANEL — Controls & Stats */}
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: "rgba(224, 242, 241, 0.85)",
            backdropFilter: "blur(6px)",
            boxShadow: "0 10px 26px rgba(0,0,0,0.15)",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: 8,
              fontSize: "1.15rem",
              color: "#004d40",
            }}
          >
            1️⃣ RL Agent Controls
          </h3>

          <p
            style={{
              fontSize: "0.9rem",
              marginBottom: "16px",
              color: "#315c53",
            }}
          >
            Use these controls to reset the grid, step the agent once, or let it
            run automatically using its learned policy.
          </p>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginBottom: "18px",
            }}
          >
            <button onClick={handleResetRandom} style={btnPrimary}>
              🔄 Reset — Random Environment
            </button>

            <button onClick={handleResetFromMap} style={btnTeal}>
              🗺 Reset — From Occupancy Map
            </button>

            <button
              onClick={handleStep}
              style={btnBlue}
              disabled={auto}
              title={auto ? "Stop auto-run to step manually" : ""}
            >
              ⏭ Step Once
            </button>

            {!auto ? (
              <button
                onClick={handleStartAuto}
                style={btnPurple}
                disabled={episodeDone || !grid}
              >
                ▶ Start Auto-Run
              </button>
            ) : (
              <button onClick={handleStopAuto} style={btnRed}>
                ■ Stop Auto-Run
              </button>
            )}
          </div>

          {/* Episode Status */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "12px",
              background: "#ffffff",
              border: "1px solid #b2dfdb",
              marginBottom: "14px",
              fontSize: "0.85rem",
              color: "#004d40",
            }}
          >
            <div
              style={{
                marginBottom: 6,
                fontWeight: 700,
                fontSize: "0.88rem",
              }}
            >
              Episode Status
            </div>
            <div>
              <b>Episodes completed:</b> {stats.episodes}
            </div>
            <div>
              <b>Steps in current episode:</b> {stats.steps}
            </div>
            <div>
              <b>Total reward (current episode):</b>{" "}
              {stats.totalReward.toFixed(2)}
            </div>
            <div>
              <b>Last action:</b> {ACTION_LABELS[lastAction] || "—"}
            </div>
            <div>
              <b>Auto-run:</b> {auto ? "Running" : "Stopped"}
            </div>
          </div>

          {/* Info / Tooltip Text */}
          {info && (
            <div
              style={{
                background: "#fffde7",
                border: "1px solid #fff59d",
                padding: "10px 12px",
                borderRadius: "10px",
                color: "#8d6e63",
                fontWeight: 600,
                fontSize: "0.84rem",
                boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
              }}
            >
              {info}
            </div>
          )}

          {/* Episode finished banner */}
          {episodeDone && (
            <div
              style={{
                marginTop: "12px",
                padding: "10px 12px",
                borderRadius: "10px",
                background: "#e8f5e9",
                border: "1px solid #a5d6a7",
                color: "#2e7d32",
                fontSize: "0.86rem",
                fontWeight: 600,
              }}
            >
              ✅ Episode finished. This usually means the agent reached the goal
              or hit a terminal state. Reset to start a new episode.
            </div>
          )}
        </div>

        {/* RIGHT PANEL — Viewer + Legend */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: -20,
              background:
                "radial-gradient(circle at 15% 0%, rgba(0,150,136,0.12), transparent 55%), radial-gradient(circle at 90% 100%, rgba(156,39,176,0.16), transparent 55%)",
              pointerEvents: "none",
              zIndex: -1,
            }}
          />

          {grid ? (
            <div
              style={{
                padding: "20px",
                borderRadius: "16px",
                background: "white",
                boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: 10,
                  fontSize: "1.15rem",
                  color: "#004d40",
                }}
              >
                2️⃣ Environment View
              </h3>

              <p
                style={{
                  marginTop: 0,
                  marginBottom: 14,
                  fontSize: "0.85rem",
                  color: "#546e7a",
                }}
              >
                The grid below shows the agent moving in a discrete 2D world.{" "}
                <b>Free cells</b> are navigable, <b>walls/obstacles</b> block
                movement, and one special cell is the <b>goal</b>. Depending on
                how your <code>Viewer2D</code> is configured, the agent and goal
                are typically drawn with distinct colors (for example, blue for
                agent, green for goal).
              </p>

              <Viewer2D grid={grid} />
            </div>
          ) : (
            <div
              style={{
                padding: "22px",
                borderRadius: "16px",
                background: "#fafafa",
                border: "1px dashed #cfd8dc",
                color: "#607d8b",
                fontSize: "0.9rem",
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#bbdefb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                  }}
                >
                  🤖
                </span>
                <div>
                  <strong>No environment loaded</strong>
                  <div style={{ marginTop: 4 }}>
                    Use one of the reset buttons on the left to start a new RL
                    episode.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------
   Button Styles
------------------------------------------- */

const baseBtn = {
  padding: "10px 18px",
  cursor: "pointer",
  borderRadius: "12px",
  border: "none",
  fontWeight: "600",
  letterSpacing: "0.5px",
  color: "white",
  fontSize: "0.9rem",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  transition: "0.2s",
};

const btnPrimary = {
  ...baseBtn,
  background: "linear-gradient(120deg,#00695c,#00897b)",
};

const btnTeal = {
  ...baseBtn,
  background: "linear-gradient(120deg,#009688,#26a69a)",
};

const btnBlue = {
  ...baseBtn,
  background: "linear-gradient(120deg,#0277bd,#0288d1)",
};

const btnPurple = {
  ...baseBtn,
  background: "linear-gradient(120deg,#6a1b9a,#8e24aa)",
};

const btnRed = {
  ...baseBtn,
  background: "linear-gradient(120deg,#c62828,#b71c1c)",
};
