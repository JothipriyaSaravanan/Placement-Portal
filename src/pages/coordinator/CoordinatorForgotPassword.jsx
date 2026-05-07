

// src/pages/coordinator/CoordinatorForgotPassword.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function CoordinatorForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Get CSRF token from cookies
  const getCsrfToken = () => {
    const name = "csrftoken";
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const commonHeaders = {
    "Content-Type": "application/json",
    "X-CSRFToken": getCsrfToken() || "",
  };

  const handleSendOTP = async () => {
    if (!email.trim()) {
      setMessage("Please enter your email");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://127.0.0.1:8000/coordinator/password-reset/send-otp/", {
        method: "POST",
        headers: commonHeaders,
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Server sent non-JSON:", text.substring(0, 200));
        setMessage("Unexpected server response. Check Django logs.");
        setIsLoading(false);
        return;
      }

      if (res.ok) {
        setMessage("OTP sent to your email!");
        setStep(2);
      } else {
        setMessage(data.error || "Failed to send OTP.");
      }
    } catch (err) {
      setMessage("Network error – is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setMessage("Please enter the OTP");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://127.0.0.1:8000/coordinator/password-reset/verify-otp/", {
        method: "POST",
        headers: commonHeaders,
        body: JSON.stringify({ email, otp }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("OTP verified successfully!");
        setStep(3);
      } else {
        setMessage(data.error || "Invalid or expired OTP.");
      }
    } catch (err) {
      setMessage("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      setMessage("Please enter a new password");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://127.0.0.1:8000/coordinator/password-reset/reset-password/", {
    method: "POST",
    headers: commonHeaders,
    body: JSON.stringify({ email, otp, password: newPassword }), // <-- here
    credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Password reset successfully! Redirecting...");
        setTimeout(() => navigate("/coordinator/login"), 1800);
      } else {
        setMessage(data.error || "Failed to reset password.");
      }
    } catch (err) {
      setMessage("Server error. Please try again.");
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

        .forgot-page { 
          min-height:100vh; 
          display:flex; 
          align-items:center; 
          justify-content:center; 
          padding:1.5rem; 
          position:relative; 
          overflow:hidden; 
        }

        .forgot-page::before { 
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

        @keyframes floatDot {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
          50%      { transform: translateY(-40px) scale(1.2); opacity: 1; }
        }

        .forgot-wrapper { 
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

        @keyframes slideUp { 
          from { opacity:0; transform:translateY(60px); } 
          to   { opacity:1; transform:translateY(0); } 
        }

        .logo-section { 
          text-align:center; 
          margin-bottom:1.8rem; 
        }

        .logo-icon { 
          width:80px; 
          height:80px; 
          background:linear-gradient(135deg, #7c3aed, #c084fc); 
          border-radius:1.4rem; 
          display:flex; 
          align-items:center; 
          justify-content:center; 
          margin:0 auto 1rem; 
          box-shadow:0 12px 30px rgba(124,58,237,0.42); 
          animation:pulseLogo 2.6s ease-in-out infinite; 
        }

        @keyframes pulseLogo { 
          0%,100%{transform:scale(1);} 
          50%{transform:scale(1.08);} 
        }

        .logo-icon i { 
          font-size:2.2rem; 
          color:white; 
        }

        .forgot-title { 
          font-size:2rem; 
          font-weight:700; 
          color:#2d3748; 
          margin-bottom:0.3rem; 
        }

        .forgot-subtitle { 
          color:#4a5568; 
          font-size:1rem; 
        }

        .form-label { 
          font-weight:600; 
          color:#2d3748; 
          margin-bottom:0.5rem; 
          font-size:0.95rem; 
          display:block; 
          text-align:left; 
        }

        .input-wrapper { 
          position:relative; 
          margin-bottom:1.4rem; 
        }

        .form-control { 
          height:52px; 
          padding:0 3rem 0 3.1rem; 
          border:1px solid #d1d5db; 
          border-radius:1rem; 
          font-size:1rem; 
          background:#f9fafb; 
          transition:all 0.3s ease; 
        }

        .form-control:focus { 
          border-color:#7c3aed; 
          background:white; 
          box-shadow:0 0 0 4px rgba(124,58,237,0.18); 
          outline:none; 
        }

        .input-icon { 
          position:absolute; 
          left:1.2rem; 
          top:50%; 
          transform:translateY(-150%); 
          color:#6b7280; 
          font-size:1.3rem; 
          pointer-events:none; 
          transition:color 0.3s; 
        }

        .input-wrapper:focus-within .input-icon { 
          color:#7c3aed; 
        }

        .btn-action { 
          width:100%; 
          padding:0.9rem; 
          font-size:1.05rem; 
          font-weight:600; 
          color:white; 
          background:linear-gradient(135deg, #7c3aed, #c084fc); 
          border:none; 
          border-radius:1.2rem; 
          transition:all 0.4s ease; 
          box-shadow:0 6px 20px rgba(124,58,237,0.38); 
        }

        .btn-action:hover:not(:disabled) { 
          transform:translateY(-4px); 
          box-shadow:0 14px 35px rgba(124,58,237,0.52); 
        }

        .btn-action:disabled { 
          opacity:0.7; 
          cursor:not-allowed; 
        }

        .alert-custom { 
          background:#fee2e2; 
          color:#991b1b; 
          border:1px solid #fca5a5; 
          border-radius:1rem; 
          padding:1rem 1.3rem; 
          margin-bottom:1.6rem; 
          font-size:0.97rem; 
          animation:shake 0.5s ease-in-out; 
        }

        @keyframes shake { 
          0%,100%{transform:translateX(0);} 
          20%,60%{transform:translateX(-8px);} 
          40%,80%{transform:translateX(8px);} 
        }

        .success-message { 
          background:#e9d8fd; 
          color:#6b21a8; 
          border:1px solid #c084fc; 
          border-radius:1rem; 
          padding:1rem; 
          margin-bottom:1.6rem; 
          text-align:center; 
          font-weight:500; 
        }

        .back-link {
          display: block;
          text-align: right;
          margin: 0.5rem 0 1.5rem;
          color: #7c3aed;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.3s;
        }

        .back-link:hover {
          color: #5b21b6;
          text-decoration: underline;
        }

        @media (max-width:576px) { 
          .forgot-wrapper { 
            padding:1.8rem 1.8rem; 
            border-radius:1.4rem; 
            max-width:400px; 
          }
          .forgot-title { font-size:1.8rem; }
          .logo-icon { width:70px; height:70px; }
        }
      `}</style>

      <div className="forgot-page">
        <div className="floating-dots">
          <div className="dot violet" style={{ width: "12px", height: "12px", top: "10%", left: "8%", animationDelay: "0s" }}></div>
          <div className="dot light" style={{ width: "10px", height: "10px", top: "25%", right: "12%", animationDelay: "-2s" }}></div>
          <div className="dot dark" style={{ width: "14px", height: "14px", bottom: "20%", left: "15%", animationDelay: "-4s" }}></div>
          <div className="dot extra-light" style={{ width: "9px", height: "9px", top: "40%", left: "25%", animationDelay: "-1s" }}></div>
          <div className="dot violet" style={{ width: "13px", height: "13px", bottom: "15%", right: "18%", animationDelay: "-6s" }}></div>
          {/* You can add more dots to match login page exactly */}
        </div>

        <div className="forgot-wrapper">
          <div className="logo-section">
            <div className="logo-icon">
              <i className="fas fa-key"></i>
            </div>
            <h1 className="forgot-title">Reset Password</h1>
            <p className="forgot-subtitle">Recover access to your coordinator account</p>
          </div>

          {message && (
            <div className={message.includes("success") ? "success-message" : "alert-custom"}>
              {message}
            </div>
          )}

          {step === 1 && (
            <div className="input-wrapper">
              <label className="form-label">Email Address</label>
              <i className="fas fa-envelope input-icon"></i>
              <input
                className="form-control"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <button
                className="btn-action mt-4"
                onClick={handleSendOTP}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="input-wrapper">
              <label className="form-label">Enter OTP</label>
              <i className="fas fa-key input-icon"></i>
              <input
                className="form-control"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                disabled={isLoading}
              />
              <button
                className="btn-action mt-4"
                onClick={handleVerifyOTP}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="input-wrapper">
              <label className="form-label">New Password</label>
              <i className="fas fa-lock input-icon"></i>
              <input
                type="password"
                className="form-control"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                className="btn-action mt-4"
                onClick={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          )}

          {/* Styled exactly like "Forgot Password?" in login page */}
          <Link to="/coordinator/login" className="back-link">
            ← Back to Login
          </Link>
        </div>
      </div>
    </>
  );
}