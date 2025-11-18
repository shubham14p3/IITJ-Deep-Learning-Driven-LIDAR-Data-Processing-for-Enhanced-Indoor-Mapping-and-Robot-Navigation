// MainApp.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Page404 from "./pages/Page404";
import BackendCheckPage from "./pages/BackendCheckPage";
import ProtectedRoute from "./ProtectedRoute";
import App from "./App.jsx";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Explain from "./pages/Explain";
import SemanticSegView from "./components/SemanticSegView";
import MapView from "./components/MapView";
import RLView from "./components/RLView";
import BatchView from "./components/BatchView";

import { Box } from "@mui/material";

export default function MainApp() {
    return (
        <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />

            <Box
                sx={{
                    flex: 1,
                    pt: "70px",
                    pb: "70px",
                    px: 2
                }}
            >
                <Routes>
                    {/* LOGIN & CHECK */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/check-backend" element={<BackendCheckPage />} />

                    {/* MAIN HOME */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <App />
                            </ProtectedRoute>
                        }
                    />

                    {/* TOOL ROUTES */}
                    <Route path="/seg" element={<SemanticSegView />} />
                    <Route path="/map" element={<MapView />} />
                    <Route path="/rl" element={<RLView />} />
                    <Route path="/batch" element={<BatchView />} />
                    <Route
                        path="/explain"
                        element={
                            <ProtectedRoute>
                                <Explain />
                            </ProtectedRoute>
                        }
                    />
                    {/* FALLBACK */}
                    <Route path="*" element={<Page404 />} />
                </Routes>
            </Box>

            <Footer />
        </Box>
    );
}
