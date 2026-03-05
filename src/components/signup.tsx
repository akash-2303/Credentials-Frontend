import { z } from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// 1. Zod schema (Unchanged)
const SignupSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], 
});

type signupFormData = z.infer<typeof SignupSchema>;

export default function Signup() {
    const navigate = useNavigate();
    
    // State for toggling password visibility
    const [showPassword, setShowPassword] = useState(false);
    
    const [form, setForm] = useState<signupFormData>({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState<string | null>(null);
    

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const result = SignupSchema.safeParse(form);
        if (!result.success) {
            setError(result.error.issues[0].message);
            return;
        }

        try {
            const response = await fetch("https://cred-api.duckdns.org/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: result.data.name,
                    email: result.data.email,
                    password: result.data.password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.access_token);
                localStorage.setItem("userName", data.user.name);
                navigate("/dashboard");
            } else {
                setError(data.detail || "Signup failed");
            }
        } catch (err) {
            setError("Backend is offline or unreachable");
        }
    }

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h1 style={{ marginBottom: '20px', textAlign: 'center', color: '#333' }}>
                    Create Account
                </h1>
                
                {error && <div style={errorBoxStyle}>{error}</div>}
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        name="name"
                        type="text"
                        placeholder="Full Name"
                        value={form.name}
                        onChange={handleChange}
                        style={inputStyle}
                    />

                    <input
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        value={form.email}
                        onChange={handleChange}
                        style={inputStyle}
                    />

                    {/* Password Field with Toggle */}
                    <div style={passwordContainerStyle}>
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password (Min 8 chars)"
                            value={form.password}
                            onChange={handleChange}
                            style={{ ...inputStyle, width: '100%', border: 'none', paddingRight: '40px' }}
                        />
                        <span 
                            onClick={() => setShowPassword(!showPassword)} 
                            style={toggleIconStyle}
                        >
                            {showPassword ? "🙈" : "👁️"}
                        </span>
                    </div>

                    {/* Confirm Password Field with Toggle */}
                    <div style={passwordContainerStyle}>
                        <input
                            name="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            style={{ ...inputStyle, width: '100%', border: 'none', paddingRight: '40px' }}
                        />
                    </div>

                    <button type="submit" style={buttonStyle}>
                        Sign Up
                    </button>

                    
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
                    Already have an account? <span style={{ color: '#007bff', cursor: 'pointer' }} onClick={() => navigate("/login")}>Login</span>
                </p>
            </div>
        </div>
    );
}

// --- Styles ---

const containerStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'center', alignItems: 'center', 
    minHeight: '100vh', width: '100vw', backgroundColor: '#f4f7f6', fontFamily: 'sans-serif'
};

const cardStyle: React.CSSProperties = {
    width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: 'white', 
    borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

const inputStyle: React.CSSProperties = {
    padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
};

const passwordContainerStyle: React.CSSProperties = {
    position: 'relative', display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '6px', backgroundColor: 'white'
};

const toggleIconStyle: React.CSSProperties = {
    position: 'absolute', right: '10px', cursor: 'pointer', fontSize: '18px', userSelect: 'none'
};

const buttonStyle: React.CSSProperties = {
    padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', 
    borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px'
};

const errorBoxStyle: React.CSSProperties = {
    color: "#721c24", backgroundColor: "#f8d7da", padding: "10px", 
    borderRadius: "4px", fontSize: "14px", marginBottom: "15px", textAlign: "center"
};