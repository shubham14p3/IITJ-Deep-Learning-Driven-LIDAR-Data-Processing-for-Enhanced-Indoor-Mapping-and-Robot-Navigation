import { useEffect, useState } from "react";
import { healthCheck } from "../api";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography, Button, Fade } from "@mui/material";

const funnyMessages = [
    "Initializing LiDAR sensors...",
    "Warming up the mop-bot motors...",
    "Scanning room corners for dust bunnies...",
    "Calibrating indoor map grid...",
    "Optimizing occupancy cells...",
    "Synchronizing laser reflections...",
    "Calibrating mop vibration patterns...",
    "Waiting for backend to wake up...",
];

export default function BackendCheckPage() {
    const nav = useNavigate();
    const [status, setStatus] = useState("checking");
    const [err, setErr] = useState("");
    const [msgIndex, setMsgIndex] = useState(0);
    const [fadeIn, setFadeIn] = useState(true);

    // 🔄 Rotate funny messages every 1.2 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setFadeIn(false);
            setTimeout(() => {
                setMsgIndex((i) => (i + 1) % funnyMessages.length);
                setFadeIn(true);
            }, 300);
        }, 1200);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const run = async () => {
            const startTime = Date.now();

            try {
                const res = await healthCheck();
                const elapsed = Date.now() - startTime;

                // 🔁 Ensure a MINIMUM 5-second loading experience
                const waitMore = Math.max(0, 5000 - elapsed);

                if (res?.status === "ok") {
                    setTimeout(() => {
                        setStatus("ok");
                        nav("/");
                    }, waitMore);
                } else {
                    throw new Error("Backend returned invalid response.");
                }
            } catch (e) {
                setStatus("fail");
                setErr(e.message);
            }
        };

        run();
    }, [nav]);

    return (
        <Box
            sx={{
                height: "calc(100vh - 120px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                px: 3,
            }}
        >
            {status === "checking" && (
                <>
                    <CircularProgress size={70} thickness={5} />

                    <Fade in={fadeIn} timeout={400}>
                        <Typography sx={{ mt: 3, fontSize: "1.2rem", fontWeight: 500 }}>
                            {funnyMessages[msgIndex]}
                        </Typography>
                    </Fade>

                    <Typography sx={{ mt: 1, fontSize: "0.9rem", color: "gray" }}>
                        Checking backend connection... please wait
                    </Typography>
                </>
            )}

            {status === "fail" && (
                <>
                    <Typography color="error" sx={{ mb: 1, fontSize: "1.2rem" }}>
                        Backend Connection Failed
                    </Typography>

                    <Typography variant="body2" sx={{ mb: 3 }}>
                        {err}
                    </Typography>

                    <Button variant="contained" onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </>
            )}
        </Box>
    );
}
