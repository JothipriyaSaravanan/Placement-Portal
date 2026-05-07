

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8000/companies/send-otp/",
        { email }
      );

      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/company-verify-otp", { state: { email } });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />

      <style>{`
        :root {
          --brand-primary: #1e3a8a;
          --brand-accent:  #3b82f6;
          --text-deep:     #0f172a;
          --text-muted:    #64748b;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: #0f172a;
          min-height: 100vh;
          font-family: 'Outfit', 'Segoe UI', system-ui, sans-serif;
          overflow-x: hidden;
          color: #f8fafc;
        }

        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          position: relative;
          background: radial-gradient(circle at 0% 0%, #1e293b 0%, #0f172a 100%);
          overflow: hidden;
        }

        /* --- Modern Aura Background --- */
        .aura-container {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .aura-blob {
          position: absolute;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          filter: blur(80px);
          border-radius: 50%;
          animation: drift 25s ease-in-out infinite alternate;
        }

        .blob-1 { top: -10%; left: -10%; background: radial-gradient(circle, rgba(79, 70, 229, 0.12) 0%, transparent 70%); }
        .blob-2 { bottom: -20%; right: -10%; background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%); animation-delay: -5s; }

        @keyframes drift {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(100px, 50px) scale(1.1); }
        }

        .mesh-grid {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.8;
          z-index: 0;
        }

        .svg-pattern-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.22;
          z-index: 1;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M0 0l100 100M100 0L0 100' stroke='%23ffffff' stroke-width='0.6' stroke-opacity='0.4'/%3E%3Ccircle cx='50' cy='50' r='1.8' fill='%23ffffff' fill-opacity='0.5'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 90px 90px;
          pointer-events: none;
        }

        .forgot-wrapper {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 480px;
          background: #ffffff;
          border-radius: 4px;
          padding: 3.5rem 2.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          border: 1px solid #e2e8f0;
          animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(60px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .logo-section { text-align: center; margin-bottom: 2.22rem; }

        .logo-icon {
          width: 100px;
          height: 100px;
          background: transparent;
          margin: 0 auto 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-icon img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .forgot-title { 
          font-size: 1.8rem; 
          font-weight: 700; 
          color: #1e293b; 
          margin-bottom: 0.5rem; 
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .forgot-subtitle { color: #64748b; font-size: 0.95rem; font-weight: 500; }

        .form-label { font-weight: 600; color: #1e293b; margin-bottom: 0.5rem; font-size: 0.95rem; display: block; }

        .input-wrapper { position: relative; margin-bottom: 1.8rem; }

        .form-control {
          height: 52px;
          padding: 0 3rem 0 3.1rem;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          font-size: 0.95rem;
          background: #ffffff;
          transition: all 0.2s ease;
        }

        .form-control:focus {
          border-color: var(--brand-primary);
          background: white;
          box-shadow: 0 0 0 4px rgba(30, 58, 138, 0.1);
        }

        .input-relative {
          position: relative;
          width: 100%;
        }

        .input-icon {
          position: absolute;
          left: 1.2rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          font-size: 1.25rem;
          pointer-events: none;
          z-index: 2;
        }

        .btn-send {
          width: 100%;
          padding: 0.9rem;
          font-size: 1.05rem;
          font-weight: 700;
          color: white;
          background: #1e3a8a;
          border: none;
          border-radius: 4px;
          transition: all 0.2s ease;
          box-shadow: none;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-send:hover:not(:disabled) {
          background: #1e40af;
          box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);
        }

        .btn-send:disabled { opacity: 0.7; cursor: not-allowed; }

        .alert-custom {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
          border-radius: 4px;
          padding: 1rem 1.2rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          font-size: 0.94rem;
        }

        .back-link {
          text-align: center;
          margin-top: 1.8rem;
          font-size: 0.95rem;
          color: #475569;
          font-weight: 500;
        }

        .back-link span {
          color: #1e3a8a;
          font-weight: 700;
          cursor: pointer;
          margin-left: 4px;
        }

        .back-link span:hover { text-decoration: underline; color: #1e40af; }

        @media (max-width: 576px) {
          .forgot-wrapper {
            padding: 1.6rem 1.4rem;
            border-radius: 1.3rem;
            max-width: 90%;
          }

          .forgot-title { font-size: 1.7rem; }
          .forgot-subtitle { font-size: 0.92rem; }

          .form-label { font-size: 0.9rem; }
          .form-control {
            height: 48px;
            font-size: 0.94rem;
            padding: 0 2.8rem 0 2.9rem;
          }

          .input-icon { font-size: 1.2rem; }

          .btn-send { font-size: 1rem; padding: 0.8rem; }

          .star {
            border-left: 20px solid transparent !important;
            border-right: 20px solid transparent !important;
            border-bottom: 40px solid rgba(255,255,255,0.12) !important;
          }

          .star::before,
          .star::after {
            border-left: 20px solid transparent !important;
            border-right: 20px solid transparent !important;
            border-bottom: 40px solid rgba(255,255,255,0.12) !important;
          }

          .star.small {
            border-left: 14px solid transparent !important;
            border-right: 14px solid transparent !important;
            border-bottom: 28px solid rgba(255,255,255,0.10) !important;
          }

          .star.small::before,
          .star.small::after {
            border-left: 14px solid transparent !important;
            border-right: 14px solid transparent !important;
            border-bottom: 28px solid rgba(255,255,255,0.10) !important;
          }
        }

        @media (max-width: 360px) {
          .forgot-wrapper { padding: 1.4rem 1.2rem; }
          .logo-icon { width: 64px; height: 64px; }
          .logo-icon i { font-size: 1.7rem; }
        }
      `}</style>

      <div className="page">
        <div className="aura-container">
          <div className="mesh-grid"></div>
          <div className="svg-pattern-overlay"></div>
          <div className="aura-blob blob-1"></div>
          <div className="aura-blob blob-2"></div>
        </div>

        <div className="forgot-wrapper">
          <div className="logo-section">
            <div className="logo-icon">
              <img src="/Logo.png" alt="University Logo" onError={(e) => {
                e.target.src = "https://tse1.mm.bing.net/th?id=OIP.E0dRErE6Z8l9R5jZkZp9XQHaHa&pid=Api";
              }} />
            </div>
            <h1 className="forgot-title">Forgot Password</h1>
            <p className="forgot-subtitle">Secured Account Recovery</p>
          </div>

          {error && (
            <div className="alert-custom">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          {message && (
            <div className="alert alert-success d-flex align-items-center gap-2">
              <i className="fas fa-check-circle"></i>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-wrapper">
              <label className="form-label">Company Email</label>
              <div className="input-relative">
                <i className="fas fa-envelope input-icon"></i>
                <input
                  type="email"
                  className="form-control"
                  placeholder="company@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <button type="submit" className="btn-send" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Sending OTP...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane me-2"></i> Send OTP
                </>
              )}
            </button>
          </form>

          <div className="back-link">
            Remember your password?{" "}
            <span onClick={() => navigate("/company-login")}>Sign in</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;