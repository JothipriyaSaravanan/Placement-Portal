// src/pages/EmailEntry.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function EmailEntry() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.get(
        `http://localhost:8000/api/students/smart-email-check/?email=${encodeURIComponent(email)}`
      );
      const data = res.data;

      // ─── Debug logs (you can remove later) ───
      console.log("=== DEBUG ===");
      console.log("Full response:", data);
      console.log("status value:", data.status);
      console.log("status type:", typeof data.status);

      if (data.status === "registered") {
        navigate("/login", { state: { email } });
      } else if (data.status === "approved") {
        navigate("/register", { state: { email } });
      } else if (data.status === "pending") {
        navigate("/verification-pending", { state: { email } });
      } else if (data.status === "not_found") {
        navigate("/request-verification", { state: { email } });
      } else {
        const debugMsg = `Unexpected status received: "${data.status || 'MISSING'}"`;
        setError(debugMsg);
        console.warn(debugMsg, "Full data:", data);
      }
    } catch (err) {
      setError("Cannot connect to server. Is backend running?");
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Bootstrap & Font Awesome */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          background: linear-gradient(135deg, #556B2F 0%, #8FBC8F 100%);
          min-height: 100vh;
          font-family: 'Segoe UI', system-ui, sans-serif;
          overflow-x: hidden;
        }
        .entry-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.2rem;
          position: relative;
          overflow: hidden;
        }
        .entry-page::before {
          content: '';
          position: absolute;
          inset: -50%;
          background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.12) 0%, transparent 40%);
          animation: rotateBg 35s linear infinite;
          pointer-events: none;
        }
        @keyframes rotateBg {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .floating-shapes {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .shape {
          position: absolute;
          background: rgba(255,255,255,0.12);
          border-radius: 50%;
          animation: float 12s ease-in-out infinite;
          backdrop-filter: blur(2px);
        }
        .shape:nth-child(1) { width: 140px; height: 140px; top: 12%; left: 8%; animation-delay: 0s; }
        .shape:nth-child(2) { width: 180px; height: 180px; top: 28%; right: 10%; animation-delay: -3s; }
        .shape:nth-child(3) { width: 100px; height: 100px; bottom: 18%; left: 15%; animation-delay: -6s; }
        .shape:nth-child(4) { width: 160px; height: 160px; bottom: 8%; right: 12%; animation-delay: -9s; }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-35px) rotate(8deg); }
        }
        .entry-wrapper {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 460px;
          background: rgba(255, 255, 255, 0.94);
          border-radius: 1.5rem;
          padding: 1.8rem 2.2rem;
          box-shadow: 0 16px 48px rgba(0,0,0,0.22);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.25);
          animation: slideUp 0.7s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .logo-section {
          text-align: center;
          margin-bottom: 1.6rem;
        }
        .logo-icon {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #556B2F, #8FBC8F);
          border-radius: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.8rem;
          box-shadow: 0 10px 25px rgba(85,107,47,0.35);
          animation: pulseLogo 2.2s ease-in-out infinite;
        }
        @keyframes pulseLogo {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        .logo-icon i {
          font-size: 1.9rem;
          color: white;
        }
        .entry-title {
          font-size: 1.85rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.2rem;
        }
        .entry-subtitle {
          color: #4a5568;
          font-size: 0.95rem;
        }
        .form-label {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.4rem;
          font-size: 0.94rem;
          display: block;
          text-align: left;
        }
        .input-wrapper {
          position: relative;
          margin-bottom: 1.4rem;
        }
        .form-control {
          height: 50px;
          padding: 0 2.8rem 0 2.9rem;
          border: 1px solid #d1d5db;
          border-radius: 0.85rem;
          font-size: 0.97rem;
          background: #f9fafb;
          transition: all 0.25s ease;
        }
        .form-control:focus {
          border-color: #556B2F;
          background: white;
          box-shadow: 0 0 0 4px rgba(85,107,47,0.14);
        }
        .input-wrapper:focus-within .input-icon {
          color: #556B2F;
        }
        .input-relative {
          position: relative;
          width: 100%;
        }

        .input-icon {
          position: absolute;
          left: 1.1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          font-size: 1.25rem;
          pointer-events: none;
          transition: color 0.25s;
          z-index: 2;
        }
        .btn-continue {
          width: 100%;
          padding: 0.85rem;
          font-size: 1.03rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #556B2F, #8FBC8F);
          border: none;
          border-radius: 1rem;
          transition: all 0.35s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(85,107,47,0.3);
        }
        .btn-continue:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(85,107,47,0.45);
        }
        .btn-continue::before {
          content: '';
          position: absolute;
          top: 0; left: -120%;
          width: 120%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          transition: left 0.6s;
        }
        .btn-continue:hover::before {
          left: 120%;
        }
        .btn-continue:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }
        .alert-custom {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
          border-radius: 0.85rem;
          padding: 0.9rem 1.2rem;
          margin-bottom: 1.4rem;
          display: flex;
          align-items: center;
          gap: 0.7rem;
          font-size: 0.95rem;
          animation: shake 0.4s ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        @media (max-width: 576px) {
          .entry-wrapper {
            padding: 1.6rem 1.6rem;
            border-radius: 1.3rem;
            max-width: 360px;
          }
          .entry-title {
            font-size: 1.7rem;
          }
          .logo-icon {
            width: 65px;
            height: 65px;
          }
          .logo-icon i {
            font-size: 1.8rem;
          }
          .form-control {
            height: 48px;
            padding: 0 2.6rem 0 2.7rem;
          }
          .input-icon {
            top: 50%;
          }
        }
      `}</style>

      <div className="entry-page">
        <div className="floating-shapes">
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
        </div>

        <div className="entry-wrapper">
          {/* Logo & Title */}
          <div className="logo-section">
            <div className="logo-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h1 className="entry-title">Welcome!</h1>
            <p className="entry-subtitle">Enter your email to continue</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert-custom">
              <i className="fas fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-wrapper">
              <label className="form-label">Email Address</label>
              <div className="input-relative">
                <input
                  type="email"
                  className="form-control"
                  placeholder="abc@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
                <i className="fas fa-envelope input-icon"></i>
              </div>
            </div>

            <button
              type="submit"
              className="btn-continue"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Checking...
                </>
              ) : (
                <>
                  <i className="fas fa-arrow-right me-2"></i>
                  Continue
                </>
              )}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: "1.6rem",
              fontSize: "0.92rem",
              color: "#4b5563",
            }}
          >
            We'll redirect you based on your account status
          </p>
        </div>
      </div>
    </>
  );
}