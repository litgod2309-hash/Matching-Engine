import { useState } from "react";
import { getUsers, saveUsers, setCurrentUser } from "../services/storage";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = () => {
    setError("");
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError("Please enter a username.");
      return;
    }
    if (!password) {
      setError("Please enter a password.");
      return;
    }

    const users = getUsers();

    if (mode === "signup") {
      // --- Sign Up ---
      const exists = users.find(
        (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase(),
      );
      if (exists) {
        setError("Username already taken. Please log in instead.");
        return;
      }
      if (password.length < 4) {
        setError("Password must be at least 4 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      const newUser = { username: trimmedUsername, password };
      users.push(newUser);
      saveUsers(users);
      setCurrentUser(newUser);
      navigate("/dashboard");
    } else {
      // --- Log In ---
      const user = users.find(
        (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase(),
      );

      if (!user) {
        setError("No account found. Please sign up first.");
        // Redirect them to sign up after a short delay so they read the message
        setTimeout(() => switchMode("signup"), 1800);
        return;
      }
      if (user.password !== password) {
        setError("Incorrect password. Please try again.");
        return;
      }

      setCurrentUser(user);
      navigate("/dashboard");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  const isSignup = mode === "signup";

  return (
    <div className="login-wrapper">
      {/* ── Left panel ── */}
      <div className="login-left">
        {/* Brand */}
        <div className="left-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <span className="brand-name">Stock Engine</span>
        </div>

        {/* Animated chart */}
        <svg
          className="left-chart"
          viewBox="0 0 800 200"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            className="chart-fill"
            d="M0,160 C60,140 100,170 160,130 C220,90 260,110 320,80
               C380,50 420,90 480,60 C540,30 580,70 640,45
               C700,20 740,50 800,30 L800,200 L0,200 Z"
            fill="url(#chartGrad)"
          />
          <path
            className="chart-line"
            d="M0,160 C60,140 100,170 160,130 C220,90 260,110 320,80
               C380,50 420,90 480,60 C540,30 580,70 640,45
               C700,20 740,50 800,30"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
          />
        </svg>

        {/* Copy */}
        <div className="left-copy">
          <h1>
            Trade Smarter.
            <br />
            <em>Move Faster.</em>
          </h1>
          <p>
            Real-time order management, portfolio tracking, and execution tools
            built for serious traders.
          </p>
          <div className="ticker-row">
            <div className="ticker-pill">
              <span className="sym">AAPL</span>
              <span className="val up">+1.84%</span>
            </div>
            <div className="ticker-pill">
              <span className="sym">TSLA</span>
              <span className="val down">−0.62%</span>
            </div>
            <div className="ticker-pill">
              <span className="sym">NIFTY</span>
              <span className="val up">+0.43%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="login-card">
        <div className="login-logo">
          {isSignup ? "Create Account" : "Welcome Back!"}
        </div>
        <p className="login-tagline">
          {isSignup
            ? "Sign up for your Stock Engine terminal."
            : "Log in to your Stock Engine terminal."}
        </p>

        {/* Username */}
        <div className="login-input-wrapper">
          <label className="form-label">Username</label>
          <input
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Password */}
        <div className="login-input-wrapper">
          <label className="form-label">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Confirm Password — only on sign up */}
        {isSignup && (
          <div className="login-input-wrapper">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        )}

        {/* Error message */}
        {error && <p className="login-error">{error}</p>}

        <div className="login-meta">
          <a href="#">Need help?</a>
        </div>

        <button className="login-btn" onClick={handleSubmit}>
          {isSignup ? "Sign Up" : "Log In"}
        </button>

        <div className="login-divider">
          <span>{isSignup ? "Already have an account?" : "New here?"}</span>
        </div>

        <p className="login-hint">
          {isSignup ? (
            <>
              Already registered?{" "}
              <span
                className="login-switch-link"
                onClick={() => switchMode("login")}
              >
                Log in
              </span>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <span
                className="login-switch-link"
                onClick={() => switchMode("signup")}
              >
                Sign up
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
