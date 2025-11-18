// App.jsx
export default function App() {
  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        paddingTop: "40px",
        fontFamily: "Poppins, sans-serif",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        animation: "fadeIn 1s ease",
      }}
    >
      {/* Radar-style image */}
      <img
        src="https://cdn-icons-png.flaticon.com/512/854/854894.png"
        alt="LiDAR Scan"
        style={{
          width: "140px",
          opacity: 0.9,
          filter: "drop-shadow(0px 4px 8px rgba(0,0,0,0.2))",
          marginBottom: "20px",
          animation: "pulse 2s infinite",
        }}
      />

      <h1
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          color: "#004d40",
          marginBottom: "12px",
        }}
      >
        Deep Learning LIDAR Indoor Mapping & Navigation
      </h1>

      <p
        style={{
          fontSize: "1.1rem",
          color: "#555",
          maxWidth: "600px",
          lineHeight: "1.6",
        }}
      >
        Use the menu above to explore <br/><b>Segmentation, Mapping, RL Navigation, and Batch Processing.</b>
      </p>

      {/* Soft glowing card */}
      <div
        style={{
          marginTop: "30px",
          padding: "25px",
          borderRadius: "12px",
          background: "rgba(224,242,241,0.6)",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          backdropFilter: "blur(4px)",
          maxWidth: "600px",
        }}
      >
        <h2 style={{ color: "#00695c", marginBottom: "10px" }}>
          System Overview
        </h2>
        <p style={{ color: "#333", fontSize: "0.95rem", lineHeight: "1.5" }}>
          The LIDAR Indoor Mapping System uses cutting-edge machine learning and
          spatial analysis to build accurate indoor maps, identify obstacles,
          and navigate autonomously.
        </p>
      </div>

      {/* Custom animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 0.9; }
          }
        `}
      </style>
    </div>
  );
}
