import { z } from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// 1. Zod login schema
const LoginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

type loginFormData = z.infer<typeof LoginSchema>;

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState<loginFormData>({
        email: "",
        password: "",
    });

    const [error, setError] = useState<string | null>(null);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        // Validate BEFORE fetching
        const result = LoginSchema.safeParse(form);
        if (!result.success) {
            setError(result.error.issues[0].message);
            return;
        }

        try {
            const response = await fetch("https://cred-api.duckdns.org/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(result.data),
            });

            const data = await response.json();

            if (response.ok) {
                // 1. Store the JWT token (The most important part)
                localStorage.setItem("token", data.access_token);

                // 2. Store the user name for display purposes
                localStorage.setItem("userName", data.user.name);

                console.log("Welcome Back!", data.message);
                navigate("/dashboard");
            }

            // if (response.ok) {
            //     // This key 'userName' must match the key in ProtectedRoute
            //     localStorage.setItem("userName", data.user.name);
            //     console.log("Welcome Back!", data.message);
            //     navigate("/dashboard");
            // }

            else {
                setError(data.detail || "Login Failed");
            }
        } catch (err) {
            setError("Server is offline");
        }
    }

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h1 style={{ marginBottom: '20px', textAlign: 'center', color: '#333' }}>
                    Login
                </h1>

                {error && (
                    <p style={errorBoxStyle}>
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        value={form.email}
                        onChange={handleChange}
                        style={inputStyle}
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        style={inputStyle}
                    />

                    <button type="submit" style={buttonStyle}>
                        Sign In
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
                    Don't have an account? <span style={{ color: '#007bff', cursor: 'pointer' }} onClick={() => navigate("/signup")}>Sign up</span>
                </p>
            </div>
        </div>
    );
}

// --- Styles ---

const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#f4f7f6',
    fontFamily: 'sans-serif'
};

const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '400px',
    padding: '40px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

const inputStyle: React.CSSProperties = {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    outline: 'none'
};

const buttonStyle: React.CSSProperties = {
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px'
};

const errorBoxStyle: React.CSSProperties = {
    color: "#721c24",
    backgroundColor: "#f8d7da",
    padding: "10px",
    borderRadius: "4px",
    fontSize: "14px",
    marginBottom: "15px",
    textAlign: "center"
};
