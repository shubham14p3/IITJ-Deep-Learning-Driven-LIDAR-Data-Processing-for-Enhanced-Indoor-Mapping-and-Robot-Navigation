export default function Explain() {
    return (
        <div
            style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "24px 16px 40px",
                fontFamily:
                    "Poppins, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                animation: "fadeIn 0.8s ease",
            }}
        >
            {/* ---------------- HEADER ---------------- */}
            <div
                style={{
                    padding: "18px 22px",
                    borderRadius: "18px",
                    background: "linear-gradient(120deg, #004d40, #00897b, #26a69a)",
                    color: "#e0f2f1",
                    marginBottom: "28px",
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
                            opacity: 0.85,
                        }}
                    >
                        IIT Jodhpur • Indoor LiDAR Research Lab
                    </div>
                    <h2
                        style={{
                            margin: "4px 0 0 0",
                            fontSize: "1.8rem",
                            fontWeight: 700,
                        }}
                    >
                        Project Architecture & Explanation
                    </h2>
                    <p
                        style={{
                            marginTop: 4,
                            fontSize: "0.9rem",
                            opacity: 0.9,
                        }}
                    >
                        Full breakdown: Segmentation • Mapping • RL Navigation • API
                        architecture • Backend logic • Research methodology
                    </p>
                </div>

                {/* Icon Circle */}
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
                        fontSize: "1.8rem",
                        boxShadow: "0 0 18px rgba(0,0,0,0.35)",
                    }}
                >
                    🧠
                </div>
            </div>

            {/* ---------------- 3 Cards Summary ---------------- */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "18px",
                    marginBottom: "30px",
                }}
            >
                {/* Segmentation card */}
                <div
                    style={{
                        padding: "20px",
                        borderRadius: "16px",
                        background: "rgba(224,242,241,0.8)",
                        backdropFilter: "blur(6px)",
                        boxShadow: "0 10px 26px rgba(0,0,0,0.15)",
                    }}
                >
                    <h3 style={{ color: "#004d40", margin: "0 0 10px 0" }}>Segmentation</h3>
                    <p style={{ fontSize: "0.9rem", color: "#315c53" }}>
                        PointNet-based semantic segmentation on 3D LiDAR scans. Includes
                        normal mode, random-mode, and **real-time streaming segmentation**
                        handling millions of points with SSE.
                    </p>
                </div>

                {/* Mapping card */}
                <div
                    style={{
                        padding: "20px",
                        borderRadius: "16px",
                        background: "rgba(224,242,241,0.8)",
                        backdropFilter: "blur(6px)",
                        boxShadow: "0 10px 26px rgba(0,0,0,0.15)",
                    }}
                >
                    <h3 style={{ color: "#004d40", margin: "0 0 10px 0" }}>Mapping</h3>
                    <p style={{ fontSize: "0.9rem", color: "#315c53" }}>
                        Converts raw 3D points + semantic labels into a 2D occupancy grid
                        used for navigation. Incorporates real-world scaling and semantic
                        priority layers.
                    </p>
                </div>

                {/* RL Nav card */}
                <div
                    style={{
                        padding: "20px",
                        borderRadius: "16px",
                        background: "rgba(224,242,241,0.8)",
                        backdropFilter: "blur(6px)",
                        boxShadow: "0 10px 26px rgba(0,0,0,0.15)",
                    }}
                >
                    <h3 style={{ color: "#004d40", margin: "0 0 10px 0" }}>
                        RL Navigation
                    </h3>
                    <p style={{ fontSize: "0.9rem", color: "#315c53" }}>
                        Deep Reinforcement Learning agent navigates the occupancy grid.
                        Rewards encourage movement towards goal, penalize collisions, and
                        adapt to semantic obstacles.
                    </p>
                </div>
            </div>

            {/* ---------------- ABSTRACT ---------------- */}
            <section
                style={{
                    padding: "22px",
                    borderRadius: "16px",
                    background: "rgba(255,255,255,0.9)",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
                    marginBottom: "30px",
                }}
            >
                <h2 style={{ color: "#00695c", marginBottom: "10px" }}>ABSTRACT</h2>
                <p style={{ fontSize: "0.95rem", color: "#444" }}>
                    This project builds a **full simulation pipeline** for indoor LiDAR
                    mapping & autonomous navigation. It unifies:
                    <br />
                    <b>✓ Deep Learning Segmentation</b> (PointNet-like model)
                    <b>✓ Semantic Occupancy Mapping</b>
                    <b>✓ Reinforcement Learning Navigation</b>
                    <br />
                    The frontend offers real-time streaming visualization, while the
                    backend handles batch-wise segmentation, mapping generation, and RL
                    environment management.
                </p>
            </section>

            {/* ---------------- OBJECTIVES ---------------- */}
            <h2 style={{ color: "#00695c", marginBottom: "12px" }}>
                Research Objectives
            </h2>
            <ul style={{ lineHeight: "1.8", color: "#444" }}>
                <li>
                    <b>Scan Matching:</b> Deep networks reduce SLAM drift beyond ICP
                    accuracy.
                </li>
                <li>
                    <b>Semantic Segmentation:</b> PointNet-style architecture classifies
                    walls, doors, floors, etc.
                </li>
                <li>
                    <b>Navigation:</b> RL agent learns optimal movement in semantic maps.
                </li>
            </ul>

            {/* ---------------- API ARCHITECTURE ---------------- */}
            <h2 style={{ color: "#00695c", marginTop: "40px" }}>
                Frontend API Architecture (api.js)
            </h2>

            <div
                style={{
                    padding: "20px",
                    borderRadius: "16px",
                    background: "rgba(255,255,255,0.9)",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.15)",
                    marginBottom: "20px",
                }}
            >
                <h3 style={{ color: "#004d40" }}>API Summary</h3>
                <ul style={{ lineHeight: "1.7" }}>
                    <li>
                        <b>healthCheck()</b> — Displays backend status in Navbar.
                    </li>
                    <li>
                        <b>segmentPointCloud()</b> — Full PointNet segmentation.
                    </li>
                    <li>
                        <b>segmentStream()</b> — Real-time streaming SSE segmentation.
                    </li>
                    <li>
                        <b>buildMap()</b> — Generates semantic occupancy grid.
                    </li>
                    <li>
                        <b>RL APIs</b> — Reset, step, reward, done.
                    </li>
                    <li>
                        <b>downloadRandomScene()</b> — Downloads a random NPZ sample.
                    </li>
                </ul>
            </div>

            {/* ---------------- BACKEND PIPELINE ---------------- */}
            <h2 style={{ color: "#00695c", marginTop: "40px" }}>
                Backend Architecture (FastAPI)
            </h2>

            <div
                style={{
                    padding: "22px",
                    borderRadius: "16px",
                    background: "rgba(255,255,255,0.9)",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.15)",
                    marginBottom: "25px",
                }}
            >
                <h3 style={{ color: "#004d40" }}>Segmentation Pipeline</h3>
                <ul style={{ lineHeight: "1.7" }}>
                    <li>Loads PointNetSegLite model (input_dim = 7).</li>
                    <li>Normalizes raw NPZ files into (N×7) tensor.</li>
                    <li>Streams segmentation batch-by-batch (50k pts).</li>
                    <li>Final combined result returned to UI.</li>
                </ul>

                <h3 style={{ color: "#004d40", marginTop: "25px" }}>
                    Occupancy Mapping
                </h3>
                <ul style={{ lineHeight: "1.7" }}>
                    <li>Converts XYZ → grid based on resolution (0.2m).</li>
                    <li>Writes semantic labels (0–7) into each cell.</li>
                    <li>Produces GLOBAL_OCC map used in RL.</li>
                </ul>

                <h3 style={{ color: "#004d40", marginTop: "25px" }}>
                    Reinforcement Learning Agent
                </h3>
                <ul style={{ lineHeight: "1.7" }}>
                    <li>Grid-based navigation with reward shaping.</li>
                    <li>Supports two resets: random & semantic map.</li>
                    <li>
                        <b>/rl_step</b> returns: next_state, reward, done, action.
                    </li>
                </ul>
            </div>

            {/* ---------------- OUTCOMES ---------------- */}
            <h2 style={{ color: "#00695c", marginTop: "40px" }}>Expected Outcomes</h2>
            <ul style={{ lineHeight: "1.7", color: "#444" }}>
                <li>Semantic accuracy &gt; 85% on 3D indoor scans.</li>
                <li>Drift reduction compared to classical ICP.</li>
                <li>RL agent achieves &gt; 90% navigation success.</li>
                <li>High-quality semantic occupancy grid maps.</li>
            </ul>

            {/* ---------------- APPLICATIONS ---------------- */}
            <h2 style={{ color: "#00695c", marginTop: "40px" }}>Applications</h2>
            <ul style={{ lineHeight: "1.7", color: "#444" }}>
                <li>Indoor service robots</li>
                <li>Warehouse navigation</li>
                <li>Disaster rescue bots</li>
                <li>Digital twins / AR / VR</li>
            </ul>

            {/* ---------------- Animation ---------------- */}
            <style>
                {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
            </style>
        </div>
    );
}
