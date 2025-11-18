import React, { useState } from "react";
import {
    Box,
    Button,
    Typography,
    Card,
    TextField,
    Alert,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

export default function LoginPage() {
    const [step, setStep] = useState(0); // 0 = login, 1 = welcome screen
    const [loginId, setLoginId] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [error, setError] = useState(false);

    const navigate = useNavigate();
    const loc = useLocation();

    const validCredentials = [
        { id: "ADMIN", password: "ADMIN" },
        { id: "M24DE3076", password: "M24DE3076" },
    ];

    const handleLogin = () => {
        const id = loginId.trim().toUpperCase();
        const pwd = loginPassword.trim().toUpperCase();

        const isValid = validCredentials.some(
            (cred) => cred.id === id && cred.password === pwd
        );

        if (isValid) {
            localStorage.setItem("lidar_auth", "1");
            setStep(1);
            setError(false);
        } else {
            setError(true);
        }
    };

    const handleStart = () => {
        navigate(loc?.state?.from?.pathname || "/check-backend");
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "calc(100vh - 112px)",
                background: "linear-gradient(45deg, #b2dfdb, #e0f2f1, #ffffff)",
            }}
        >
            {/* LOGIN SCREEN */}
            {step === 0 && (
                <Card
                    sx={{
                        width: "100%",
                        maxWidth: 420,
                        p: 4,
                        borderRadius: 4,
                        boxShadow: 6,
                        textAlign: "center",
                        backgroundColor: "#ffffffcc",
                    }}
                >
                    <Box sx={{ textAlign: "center", mb: 2 }}>
                        <img src={logo} alt="IITJ Logo" width="80" />
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                        IIT Jodhpur — Indoor Mapping System
                    </Typography>

                    <TextField
                        label="Login ID"
                        variant="outlined"
                        fullWidth
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            Invalid Login ID or Password
                        </Alert>
                    )}

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleLogin}
                        sx={{
                            background: "linear-gradient(90deg, #00796b, #004d40)",
                            "&:hover": {
                                background: "linear-gradient(90deg, #004d40, #00251a)",
                            },
                        }}
                    >
                        Login
                    </Button>

                    <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 2, color: "text.secondary" }}
                    >
                        Use Login: <b>admin/admin</b> or <b>m24de3076/m24de3076</b>
                    </Typography>
                </Card>
            )}

            {/* WELCOME SCREEN */}
            {step === 1 && (
                <Card
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        width: "100%",
                        maxWidth: "900px",
                        borderRadius: 4,
                        boxShadow: 8,
                        overflow: "hidden",
                    }}
                >
                    {/* Left panel */}
                    <Box
                        sx={{
                            flex: 1,
                            backgroundColor: "#004d40",
                            color: "#fff",
                            p: 4,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                        }}
                    >
                        <img src={logo} alt="IITJ Logo" width="80" />

                        <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                            Indian Institute of Technology Jodhpur
                        </Typography>

                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Date: {new Date().toLocaleDateString()}
                        </Typography>
                    </Box>

                    {/* Right panel */}
                    <Box
                        sx={{
                            flex: 2,
                            backgroundColor: "#e0f2f1",
                            p: 6,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                        }}
                    >
                        <Typography
                            variant="h4"
                            textAlign="center"
                            sx={{ fontWeight: "bold", color: "#004d40", mb: 3 }}
                        >
                            Welcome to the <br />
                            LIDAR Indoor Mapping System
                        </Typography>

                        <Button
                            variant="contained"
                            onClick={handleStart}
                            sx={{
                                alignSelf: "center",
                                px: 6,
                                py: 1.5,
                                background: "linear-gradient(90deg,#00796b,#004d40)",
                                "&:hover": {
                                    background: "linear-gradient(90deg,#004d40,#00251a)",
                                },
                            }}
                        >
                            Start
                        </Button>
                    </Box>
                </Card>
            )}
        </Box>
    );
}
