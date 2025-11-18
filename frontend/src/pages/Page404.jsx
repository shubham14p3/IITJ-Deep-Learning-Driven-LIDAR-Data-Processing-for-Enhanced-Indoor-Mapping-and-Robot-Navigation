import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Page404() {
    const nav = useNavigate();
    useEffect(() => { setTimeout(() => nav("/"), 5000); }, []);

    return (
        <div style={{
            height: "100vh", color: "#fff",
            background: "linear-gradient(135deg,#004d40,#009688)",
            display: "flex", flexDirection: "column",
            justifyContent: "center", alignItems: "center"
        }}>
            <h1>404 — Page Not Found</h1>
            <p>Redirecting in 5 seconds…</p>
        </div>
    );
}
