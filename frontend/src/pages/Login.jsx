import "./Login.css";

import { useState } from "react";
import { loginUser } from "../services/authServices";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const data = await loginUser(phone, password);
            localStorage.setItem("token", data.token);
            console.log("Login successfully ");
            navigate("/");
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login-page">
            <section className="login-card">
                <header className="login-brand">
                    <div className="brand-logo" aria-hidden="true">CS</div>
                    <h1>Credit System</h1>
                    <p>Manage your credit with confidence</p>
                </header>

                <div className="login-heading">
                    <h2>Welcome back</h2>
                    <p>Sign in to continue to your account</p>
                </div>

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="phone">Phone number</label>
                        <input
                            id="phone"
                            type="text"
                            autoComplete="username"
                            placeholder="Enter your phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-wrapper">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                className="password-toggle"
                                type="button"
                                onClick={() => setShowPassword((visible) => !visible)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="login-error" role="alert">{error}</p>
                    )}

                    <button className="login-button" type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Log in"}
                    </button>
                </form>

                <footer className="login-footer">
                    Secure sign in to your account
                </footer>
            </section>
        </main>
    );
}

export default Login;