


// src/pages/coordinator/CoordinatorLogin.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";  // ← Added Link import

export default function CoordinatorLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/coordinator/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",           // Important for session/cookies
      });

      const data = await res.json();
if (res.ok) {
  localStorage.setItem("coordinatorUsername", data.username);

  // ✅ FIXED KEYS
  localStorage.setItem("department", data.department || "");
  localStorage.setItem("programme", data.programme || "");
  localStorage.setItem("batch", data.batch || "");

  localStorage.setItem("coordinatorId", data.username);

  setMessage(`Welcome Coordinator (${data.department || "department"})`);

  setTimeout(() => {
    navigate("/coordinator/dashboard");
  }, 1200);
}else {
        setMessage(data.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />

      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body { 
          background: linear-gradient(135deg, #6b46c1 0%, #9f7aea 100%); 
          min-height:100vh; 
          font-family:'Segoe UI',system-ui,sans-serif; 
          overflow-x:hidden; 
        }
        .login-page { 
          min-height:100vh; 
          display:flex; 
          align-items:center; 
          justify-content:center; 
          padding:1.5rem; 
          position:relative; 
          overflow:hidden; 
        }
        .login-page::before { 
          content:''; 
          position:absolute; 
          inset:0; 
          background:radial-gradient(circle at 20% 80%, rgba(255,255,255,0.12) 0%, transparent 60%); 
          animation:gentlePulse 20s ease-in-out infinite; 
          pointer-events:none; 
        }
        @keyframes gentlePulse { 0%,100%{opacity:0.7;} 50%{opacity:1;} }

        .floating-dots {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .dot {
          position: absolute;
          background: rgba(255, 255, 255, 0.75);
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(255,255,255,0.4);
          animation: floatDot 12s infinite ease-in-out;
        }
        .dot.violet   { background: #c084fc; box-shadow: 0 0 16px #c084fc99; }
        .dot.light    { background: #e9d5ff; box-shadow: 0 0 14px #e9d5ff88; }
        .dot.dark     { background: #7c3aed; box-shadow: 0 0 18px #7c3aedaa; }
        .dot.extra-light { background: #f3e8ff; box-shadow: 0 0 12px #f3e8ff77; }

        /* ... (all your dot positions remain the same) ... */

        @keyframes floatDot {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
          50%      { transform: translateY(-40px) scale(1.2); opacity: 1; }
        }

        .login-wrapper { 
          position:relative; 
          z-index:1; 
          width:100%; 
          max-width:460px; 
          background:rgba(255,255,255,0.93); 
          border-radius:1.6rem; 
          padding:2rem 2.4rem; 
          box-shadow:0 20px 60px rgba(0,0,0,0.24); 
          backdrop-filter:blur(16px); 
          border:1px solid rgba(255,255,255,0.28); 
          animation:slideUp 0.8s ease-out; 
        }
        @keyframes slideUp { from{opacity:0;transform:translateY(60px);} to{opacity:1;transform:translateY(0);} }

        .logo-section { text-align:center; margin-bottom:1.8rem; }
        .logo-icon { 
          width:80px; height:80px; 
          background:linear-gradient(135deg, #7c3aed, #c084fc); 
          border-radius:1.4rem; 
          display:flex; align-items:center; justify-content:center; 
          margin:0 auto 1rem; 
          box-shadow:0 12px 30px rgba(124,58,237,0.42); 
          animation:pulseLogo 2.6s ease-in-out infinite; 
        }
        @keyframes pulseLogo { 0%,100%{transform:scale(1);} 50%{transform:scale(1.08);} }
        .logo-icon i { font-size:2.2rem; color:white; }

        .login-title { font-size:2rem; font-weight:700; color:#2d3748; margin-bottom:0.3rem; }
        .login-subtitle { color:#4a5568; font-size:1rem; }

        .form-label { font-weight:600; color:#2d3748; margin-bottom:0.5rem; font-size:0.95rem; display:block; text-align:left; }
        .input-wrapper { position:relative; margin-bottom:1.4rem; }
        .form-control { 
          height:52px; padding:0 3rem 0 3.1rem; 
          border:1px solid #d1d5db; border-radius:1rem; 
          font-size:1rem; background:#f9fafb; 
          transition:all 0.3s ease; 
        }
        .form-control:focus { 
          border-color:#7c3aed; background:white; 
          box-shadow:0 0 0 4px rgba(124,58,237,0.18); outline:none; 
        }
        .input-icon { 
          position:absolute; left:1.2rem; top:50%; transform:translateY(15%); 
          color:#6b7280; font-size:1.3rem; pointer-events:none; transition:color 0.3s; 
        }
        .input-wrapper:focus-within .input-icon { color:#7c3aed; }

        .eye-btn { 
          position:absolute; right:1.2rem; top:50%; transform:translateY(15%); 
          background:none; border:none; color:#6b7280; font-size:1.3rem; cursor:pointer; 
        }
        .eye-btn:hover { color:#374151; }

        .btn-login { 
          width:100%; padding:0.9rem; font-size:1.05rem; font-weight:600; color:white; 
          background:linear-gradient(135deg, #7c3aed, #c084fc); border:none; border-radius:1.2rem; 
          transition:all 0.4s ease; box-shadow:none;
        }
        .btn-login:hover:not(:disabled) { 
          transform:translateY(-4px); box-shadow:none;
        }
        .btn-login:disabled { opacity:0.7; cursor:not-allowed; }

        .alert-custom { 
          background:#fee2e2; color:#991b1b; border:1px solid #fca5a5; 
          border-radius:1rem; padding:1rem 1.3rem; margin-bottom:1.6rem; 
          font-size:0.97rem; animation:shake 0.5s ease-in-out; 
        }
        @keyframes shake { 0%,100%{transform:translateX(0);} 20%,60%{transform:translateX(-8px);} 40%,80%{transform:translateX(8px);} }

        .success-message { 
          background:#e9d8fd; color:#6b21a8; border:1px solid #c084fc; 
          border-radius:1rem; padding:1rem; margin-bottom:1.6rem; 
          text-align:center; font-weight:500; 
        }

        .forgot-link {
          display: block;
          text-align: right;
          margin: 0.5rem 0 1.5rem;
          color: #7c3aed;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.3s;
        }
        .forgot-link:hover {
          color: #5b21b6;
          text-decoration: underline;
        }

        @media (max-width:576px) { 
          .login-wrapper { padding:1.8rem 1.8rem; border-radius:1.4rem; max-width:400px; }
          .login-title { font-size:1.8rem; }
          .logo-icon { width:70px; height:70px; }
        }
      `}</style>

      <div className="login-page">
        <div className="floating-dots">
          {/* Your existing 24 dots remain unchanged */}
          <div className="dot violet dot-1"></div>
          <div className="dot light dot-2"></div>
          {/* ... all other dots ... */}
          <div className="dot extra-light dot-24"></div>
        </div>

        <div className="login-wrapper">
          <div className="logo-section">
            <img 
              src="/Logo.png" 
              alt="University Logo" 
              className="university-logo" 
              style={{ height: "100px", marginBottom: "1.5rem" }} 
              onError={(e) => { e.target.onerror = null; e.target.src="/logo.png"; }}
            />
            <h1 className="login-title">Coordinator Login</h1>
            <p className="login-subtitle">Access your department dashboard</p>
          </div>

          {message && (
            <div className={message.includes("Welcome") ? "success-message" : "alert-custom"}>
              {message}
            </div>
          )}

          <div className="input-wrapper">
            <label className="form-label">Username or Email</label>
            <i className="fas fa-user input-icon"></i>
            <input
              className="form-control"
              placeholder="Enter your username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoFocus
            />
          </div>

          <div className="input-wrapper">
            <label className="form-label">Password</label>
            <i className="fas fa-lock input-icon"></i>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
            </button>
          </div>

          {/* Fixed "Forgot Password?" link */}
          <Link to="/coordinator/forgot-password" className="forgot-link">
            Forgot Password?
          </Link>

          <button
            className="btn-login"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Signing in...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt me-2"></i> Login
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}