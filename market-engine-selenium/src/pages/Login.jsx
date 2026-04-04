import { useState } from "react";
import { getUsers, saveUsers, setCurrentUser } from "../services/storage";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    let users = getUsers();

    let user = users.find((u) => u.username === username);

    if (!user) {
      user = { username };
      users.push(user);
      saveUsers(users);
    }

    setCurrentUser(user);
    navigate("/dashboard");
  };

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
        <div className="login-logo">Welcome Back!</div>
        <p className="login-tagline">Log in to your Stock Engine terminal.</p>

        <div className="login-input-wrapper">
          <label className="form-label">Username</label>
          <input
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        <div className="login-meta">
          <a href="#">Need help?</a>
        </div>

        <button className="login-btn" onClick={handleLogin}>
          Login / Sign Up
        </button>

        <div className="login-divider">
          <span>New here?</span>
        </div>

        <p className="login-hint">New usernames are registered automatically</p>
      </div>
    </div>
  );
}
