

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CoordinatorRegister() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async () => {
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/coordinator/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, department }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Coordinator registered successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/coordinator/login");
        }, 1400);
      } else {
        setMessage(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
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
        .register-page { 
          min-height:100vh; 
          display:flex; 
          align-items:center; 
          justify-content:center; 
          padding:1.5rem; 
          position:relative; 
          overflow:hidden; 
        }
        .register-page::before { 
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

        .dot-1  { width:12px; height:12px; top:10%; left:8%; animation-delay:0s; animation-duration:15s; }
        .dot-2  { width:10px; height:10px; top:25%; right:12%; animation-delay:-2s; animation-duration:18s; }
        .dot-3  { width:14px; height:14px; bottom:20%; left:15%; animation-delay:-4s; animation-duration:14s; }
        .dot-4  { width:9px; height:9px; top:40%; left:25%; animation-delay:-1s; animation-duration:16s; }
        .dot-5  { width:13px; height:13px; bottom:15%; right:18%; animation-delay:-6s; animation-duration:17s; }
        .dot-6  { width:11px; height:11px; top:55%; right:10%; animation-delay:-3s; animation-duration:13s; }
        .dot-7  { width:8px; height:8px; bottom:35%; left:5%; animation-delay:-8s; animation-duration:19s; }
        .dot-8  { width:15px; height:15px; top:18%; right:22%; animation-delay:-5s; animation-duration:14s; }
        .dot-9  { width:10px; height:10px; bottom:45%; left:32%; animation-delay:-7s; animation-duration:16s; }
        .dot-10 { width:12px; height:12px; top:70%; left:12%; animation-delay:-9s; animation-duration:15s; }
        .dot-11 { width:11px; height:11px; top:15%; left:45%; animation-delay:-2.5s; animation-duration:17s; }
        .dot-12 { width:9px; height:9px; top:60%; right:30%; animation-delay:-10s; animation-duration:13s; }
        .dot-13 { width:14px; height:14px; bottom:28%; right:8%; animation-delay:-1.5s; animation-duration:18s; }
        .dot-14 { width:10px; height:10px; top:35%; left:60%; animation-delay:-6.5s; animation-duration:14s; }
        .dot-15 { width:13px; height:13px; bottom:10%; left:42%; animation-delay:-4s; animation-duration:16s; }
        .dot-16 { width:8px; height:8px; top:48%; right:45%; animation-delay:-8.5s; animation-duration:19s; }
        .dot-17 { width:12px; height:12px; top:80%; left:20%; animation-delay:-3s; animation-duration:15s; }
        .dot-18 { width:11px; height:11px; bottom:55%; right:25%; animation-delay:-7.5s; animation-duration:17s; }
        .dot-19 { width:15px; height:15px; top:30%; left:70%; animation-delay:-5s; animation-duration:13s; }
        .dot-20 { width:9px; height:9px; bottom:38%; left:55%; animation-delay:-9.5s; animation-duration:18s; }
        .dot-21 { width:10px; height:10px; top:65%; left:35%; animation-delay:-1s; animation-duration:14s; }
        .dot-22 { width:13px; height:13px; bottom:18%; right:40%; animation-delay:-6s; animation-duration:16s; }
        .dot-23 { width:11px; height:11px; top:22%; right:55%; animation-delay:-4.5s; animation-duration:19s; }
        .dot-24 { width:12px; height:12px; bottom:42%; left:18%; animation-delay:-8s; animation-duration:15s; }

        @keyframes floatDot {
          0%, 100%   { transform: translate(0, 0) scale(1); opacity: 0.7; }
          50%        { transform: translateY(-40px) scale(1.2); opacity: 1; }
        }

        .register-wrapper { 
          position:relative; 
          z-index:1; 
          width:100%; 
          max-width:460px; 
          background:rgba(255,255,255,0.93); 
          border-radius:1.6rem; 
          padding:2.2rem 2.4rem; 
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

        .register-title { font-size:2rem; font-weight:700; color:#2d3748; margin-bottom:0.3rem; }
        .register-subtitle { color:#4a5568; font-size:1rem; }

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

        .btn-register { 
          width:100%; padding:0.9rem; font-size:1.05rem; font-weight:600; color:white; 
          background:linear-gradient(135deg, #7c3aed, #c084fc); border:none; border-radius:1.2rem; 
          transition:all 0.4s ease; box-shadow:0 6px 20px rgba(124,58,237,0.38); 
        }
        .btn-register:hover:not(:disabled) { 
          transform:translateY(-4px); box-shadow:0 14px 35px rgba(124,58,237,0.52); 
        }
        .btn-register:disabled { opacity:0.7; cursor:not-allowed; }

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

        @media (max-width:576px) { 
          .register-wrapper { padding:1.8rem 1.8rem; border-radius:1.4rem; max-width:400px; }
          .register-title { font-size:1.8rem; }
          .logo-icon { width:70px; height:70px; }
        }
      `}</style>

      <div className="register-page">
        <div className="floating-dots">
          <div className="dot violet dot-1"></div>
          <div className="dot light dot-2"></div>
          <div className="dot dark dot-3"></div>
          <div className="dot extra-light dot-4"></div>
          <div className="dot violet dot-5"></div>
          <div className="dot light dot-6"></div>
          <div className="dot dark dot-7"></div>
          <div className="dot violet dot-8"></div>
          <div className="dot extra-light dot-9"></div>
          <div className="dot light dot-10"></div>
          <div className="dot dark dot-11"></div>
          <div className="dot violet dot-12"></div>
          <div className="dot light dot-13"></div>
          <div className="dot extra-light dot-14"></div>
          <div className="dot dark dot-15"></div>
          <div className="dot violet dot-16"></div>
          <div className="dot light dot-17"></div>
          <div className="dot dark dot-18"></div>
          <div className="dot extra-light dot-19"></div>
          <div className="dot violet dot-20"></div>
          <div className="dot light dot-21"></div>
          <div className="dot dark dot-22"></div>
          <div className="dot violet dot-23"></div>
          <div className="dot extra-light dot-24"></div>
        </div>

        <div className="register-wrapper">
          <div className="logo-section">
            <div className="logo-icon">
              <i className="fas fa-user-plus"></i>
            </div>
            <h1 className="register-title">Coordinator Register</h1>
            <p className="register-subtitle">Create your department account</p>
          </div>

          {message && (
            <div className={message.includes("successfully") ? "success-message" : "alert-custom"}>
              {message}
            </div>
          )}

          <div className="input-wrapper">
            <label className="form-label">Username</label>
            <i className="fas fa-user input-icon"></i>
            <input
              className="form-control"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              autoFocus
            />
          </div>

          <div className="input-wrapper">
            <label className="form-label">Password</label>
            <i className="fas fa-lock input-icon"></i>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
            </button>
          </div>

          <div className="input-wrapper">
            <label className="form-label">Department</label>
            <i className="fas fa-building input-icon"></i>
            <input
              className="form-control"
              placeholder="e.g. CSE / ECE / IT / MECH"
              value={department}
              onChange={(e) => setDepartment(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            />
          </div>

          <button
            className="btn-register"
            onClick={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Creating account...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus me-2"></i> Register
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}