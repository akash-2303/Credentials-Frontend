import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// --- 1. STYLES ---
const containerStyle: React.CSSProperties = { minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' };
const navbarStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', height: '64px', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 10 };
const logoStyle: React.CSSProperties = { fontSize: '20px', fontWeight: 'bold', color: '#2563eb' };
const userActionsStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '15px' };
const userNameStyle: React.CSSProperties = { fontWeight: '500', color: '#374151' };
const logoutLinkStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '500', fontSize: '14px' };
const dateBannerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '20px', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' };
const dateButtonStyle: React.CSSProperties = { padding: '8px 16px', borderRadius: '20px', border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' };
const activeButtonStyle: React.CSSProperties = { ...dateButtonStyle, backgroundColor: '#2563eb', color: 'white', border: 'none' };
const currentDateDisplay: React.CSSProperties = { marginLeft: '30px', fontSize: '14px', color: '#6b7280', paddingLeft: '30px', borderLeft: '1px solid #e5e7eb' };
const mainAreaStyle: React.CSSProperties = { padding: '40px', display: 'flex', justifyContent: 'center' };
const placeholderCard: React.CSSProperties = { backgroundColor: 'white', padding: '40px', borderRadius: '12px', maxWidth: '800px', width: '100%', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' };
const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle: React.CSSProperties = { backgroundColor: 'white', padding: '30px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', maxWidth: '400px', width: '90%' };
const stayButtonStyle: React.CSSProperties = { padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const logoutButtonStyle: React.CSSProperties = { padding: '10px 20px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' };

export default function Dashboard() {
    const navigate = useNavigate();
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // 2. STATE DEFINITIONS
    const [resetKey, setResetKey] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [secondsInactive, setSecondsInactive] = useState(0);
    // Picks up the name saved by Login/Signup
    const [userName] = useState<string>(localStorage.getItem("userName") || "User");
    const [selectedDate, setSelectedDate] = useState(new Date());

    // 3. HELPER FUNCTIONS
    const handleLogout = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        navigate("/login");
    };

    const stayLoggedIn = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setSecondsInactive(0);
        setShowWarning(false);
        setResetKey(prev => prev + 1); 
        console.log("Session Continued - Timer Reset");
    };

    const setOffsetDate = (offset: number) => {
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + offset);
        setSelectedDate(newDate);
    };

    const isSameDay = (offset: number) => {
        const comparisonDate = new Date();
        comparisonDate.setDate(comparisonDate.getDate() + offset);
        return selectedDate.toDateString() === comparisonDate.toDateString();
    };

    // 4. INACTIVITY WATCHDOG
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            setSecondsInactive((prev) => {
                const nextValue = prev + 1;
                if (nextValue % 5 === 0) console.log(`Inactivity: ${nextValue}s`);
                
                if (nextValue === 45) setShowWarning(true);
                
                if (nextValue >= 60) {
                    handleLogout();
                    return prev;
                }
                return nextValue;
            });

            try {
                const decoded: any = jwtDecode(token);
                if (decoded.exp < Date.now() / 1000) handleLogout();
            } catch { handleLogout(); }
        }, 1000);

        // Activity Listeners 
        const resetTimer = () => {
            if (!showWarning) setSecondsInactive(0);
        };

        window.addEventListener("mousemove", resetTimer);
        window.addEventListener("pointermove", resetTimer); // For Trackpads
        window.addEventListener("keydown", resetTimer);
        window.addEventListener("click", resetTimer);
        window.addEventListener("scroll", resetTimer);
        window.addEventListener("wheel", resetTimer);

        const checkSession = async () => {
            try {
                const res = await fetch("https://cred-api.duckdns.org/dashboard-stats", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.status === 401) handleLogout();
            } catch { console.error("Session check failed"); }
        };
        checkSession();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            window.removeEventListener("mousemove", resetTimer);
            window.removeEventListener("pointermove", resetTimer);
            window.removeEventListener("keydown", resetTimer);
            window.removeEventListener("click", resetTimer);
            window.removeEventListener("scroll", resetTimer);
            window.removeEventListener("wheel", resetTimer);
        };
    }, [navigate, showWarning, resetKey]);

    return (
        <div style={containerStyle}>
            {showWarning && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <h2 style={{ color: '#d32f2f' }}>Session Expiring</h2>
                        <p>You've been inactive. Logging out in <strong>{60 - secondsInactive}</strong>s.</p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                            <button onClick={stayLoggedIn} style={stayButtonStyle}>Stay Logged In</button>
                            <button onClick={handleLogout} style={logoutButtonStyle}>Logout</button>
                        </div>
                    </div>
                </div>
            )}

            <nav style={navbarStyle}>
                <div style={logoStyle}>My Dashboard</div>
                <div style={userActionsStyle}>
                    <span style={userNameStyle}>{userName}</span>
                    <span style={{ color: '#4b5563' }}>|</span>
                    <button onClick={handleLogout} style={logoutLinkStyle}>Logout</button>
                </div>
            </nav>

            <div style={dateBannerStyle}>
                <button 
                    onClick={() => setOffsetDate(-1)} 
                    style={isSameDay(-1) ? activeButtonStyle : dateButtonStyle}
                >Yesterday</button>
                <button
                    onClick={() => setOffsetDate(0)}
                    style={isSameDay(0) ? activeButtonStyle : dateButtonStyle}
                >Today</button>
                <button 
                    onClick={() => setOffsetDate(1)} 
                    style={isSameDay(1) ? activeButtonStyle : dateButtonStyle}
                >Tomorrow</button>
                
                <div style={currentDateDisplay}>
                    Viewing: <strong>{selectedDate.toDateString()}</strong>
                </div>
            </div>

            <main style={mainAreaStyle}>
                <div style={placeholderCard}>
                    <h2>Data for {selectedDate.toLocaleDateString()}</h2>
                    <p>Welcome back, {userName}! Your session is monitored and secure.</p>
                </div>
            </main>
        </div>
    );
}