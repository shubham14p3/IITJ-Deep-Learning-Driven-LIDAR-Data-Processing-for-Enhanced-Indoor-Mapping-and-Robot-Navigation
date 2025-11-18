// Navbar.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { healthCheck } from "../api";
import { Box, Typography } from "@mui/material";

export default function Navbar() {
    const nav = useNavigate();
    const [backendOK, setBackendOK] = useState(false);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        localStorage.removeItem("lidar_auth");
        nav("/login");
    };

    // ✔ Check backend ONCE only
    useEffect(() => {
        const check = async () => {
            try {
                setLoading(true);
                const res = await healthCheck();
                setBackendOK(res?.status === "ok");
            } catch (e) {
                setBackendOK(false);
            } finally {
                setLoading(false);
            }
        };
        check();
    }, []);

    return (
        <Box
            sx={{
                height: "60px",
                background: "#00695c",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 3,
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                boxShadow: 3,
            }}
        >
            {/* LEFT: Brand */}
            <Typography
                variant="h6"
                sx={{ cursor: "pointer", fontWeight: 600 }}
                onClick={() => nav("/")}
            >
                IITJ • LIDAR Indoor Mapping
            </Typography>

            {/* CENTER MENU */}
            <Box sx={{ display: "flex", gap: 3 }}>
                <Typography sx={{ cursor: "pointer" }} onClick={() => nav("/seg")}>
                    Segmentation
                </Typography>
                <Typography sx={{ cursor: "pointer" }} onClick={() => nav("/map")}>
                    Map
                </Typography>
                <Typography sx={{ cursor: "pointer" }} onClick={() => nav("/rl")}>
                    RL Navigation
                </Typography>
                <Typography sx={{ cursor: "pointer" }} onClick={() => nav("/batch")}>
                    Batch
                </Typography>
                <Typography sx={{ cursor: "pointer" }} onClick={() => nav("/explain")}>
                    Explain
                </Typography>

            </Box>

            {/* RIGHT: Backend Status + Logout */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                    sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: loading
                            ? "yellow"
                            : backendOK
                                ? "#4caf50"
                                : "#f44336",
                        boxShadow: "0 0 5px rgba(0,0,0,0.3)",
                    }}
                />

                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {loading
                        ? "Checking..."
                        : backendOK
                            ? "Connected"
                            : "Offline"}
                </Typography>

                <button
                    onClick={logout}
                    style={{
                        background: "transparent",
                        color: "#fff",
                        border: "1px solid #fff",
                        padding: "5px 12px",
                        cursor: "pointer",
                        borderRadius: "4px",
                        marginLeft: "15px",
                    }}
                >
                    Logout
                </button>
            </Box>
        </Box>
    );
}
