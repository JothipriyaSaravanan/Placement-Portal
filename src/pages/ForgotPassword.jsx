





import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/api/students/forgot-password/", { email });

      if (res.status === 200 || res.status === 201) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setTimeout(() => navigate("/verify-token", { state: { email } }), 3500);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Unable to send reset token. Try again.");
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
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: linear-gradient(135deg, #2E1A47 0%, #4B0082 100%);
          min-height: 100vh;
          font-family: 'Segoe UI', system-ui, sans-serif;
          overflow-x: hidden;
        }

        .forgot-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.2rem;
          position: relative;
          overflow: hidden;
        }

        .forgot-page::before {
          content: '';
          position: absolute;
          inset: -50%;
          background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.08) 0%, transparent 40%);
          animation: rotateBg 35s linear infinite;
          pointer-events: none;
        }

        @keyframes rotateBg {
          0%   { transform: rotate(0deg); }
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
          background: rgba(255,255,255,0.08);
          border-radius: 50%;
          animation: float 12s ease-in-out infinite;
          backdrop-filter: blur(2px);
        }

        .shape:nth-child(1) { width: 140px; height: 140px; top: 12%; left: 8%;  animation-delay: 0s;    }
        .shape:nth-child(2) { width: 180px; height: 180px; top: 28%; right: 10%; animation-delay: -3s;  }
        .shape:nth-child(3) { width: 100px; height: 100px; bottom: 18%; left: 15%; animation-delay: -6s; }
        .shape:nth-child(4) { width: 160px; height: 160px; bottom: 8%;  right: 12%; animation-delay: -9s; }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-35px) rotate(8deg); }
        }

        .forgot-wrapper {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 460px;
          background: rgba(255, 255, 255, 0.94);
          border-radius: 1.5rem;
          padding: 1.8rem 2.2rem;
          box-shadow: 0 16px 48px rgba(0,0,0,0.28);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(75,0,130,0.15);
          animation: slideUp 0.7s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(50px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .logo-section {
          text-align: center;
          margin-bottom: 1.6rem;
        }

        .logo-icon {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #4B0082, #6A0DAD);
          border-radius: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.8rem;
          box-shadow: 0 10px 25px rgba(75,0,130,0.35);
          animation: pulseLogo 2.2s ease-in-out infinite;
        }

        @keyframes pulseLogo {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.06); }
        }

        .logo-icon i {
          font-size: 1.9rem;
          color: white;
        }

        .forgot-title {
          font-size: 1.85rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.2rem;
        }

        .forgot-subtitle {
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
          border-color: #4B0082;
          background: white;
          box-shadow: 0 0 0 4px rgba(75,0,130,0.18);
          outline: none;
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

        .input-wrapper:focus-within .input-icon {
          color: #4B0082;
        }

        .btn-reset {
          width: 100%;
          padding: 0.85rem;
          font-size: 1.03rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #4B0082, #6A0DAD);
          border: none;
          border-radius: 1rem;
          transition: all 0.35s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(75,0,130,0.35);
        }

        .btn-reset:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(75,0,130,0.5);
        }

        .btn-reset::before {
          content: '';
          position: absolute;
          top: 0; left: -120%;
          width: 120%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transition: left 0.6s;
        }

        .btn-reset:hover::before {
          left: 120%;
        }

        .btn-reset:disabled {
          opacity: 0.75;
          cursor: not-allowed;
          transform: none;
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
          20%, 60%  { transform: translateX(-6px); }
          40%, 80%  { transform: translateX(6px); }
        }

        .back-link {
          color: #4B0082;
          font-size: 0.96rem;
          text-align: center;
          display: block;
          margin-top: 1.4rem;
          text-decoration: none;
          cursor: pointer;
        }

        .back-link:hover {
          text-decoration: underline;
          color: #3a0066;
        }

        .toast-container {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 1055;
          min-width: 280px;
        }

        @media (max-width: 576px) {
          .verify-wrapper {
            padding: 1.6rem 1.6rem;
            border-radius: 1.3rem;
            max-width: 360px;
          }
          .verify-title {
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
        /* Mobile adjustments — keep consistent centering */
        @media (max-width: 576px) {
          .form-control {
            height: 48px;
            padding-left: 3rem;
            font-size: 0.95rem;
          }

          .input-icon {
            font-size: 1.18rem;
          }
        }
      `}</style>

      <div className="forgot-page">
        <div className="floating-shapes">
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
        </div>

        <div className="forgot-wrapper">
          <div className="logo-section">
            <div className="logo-icon">
              <i className="fas fa-key"></i>
            </div>
            <h1 className="forgot-title">Reset Password</h1>
            <p className="forgot-subtitle">Enter your email to receive a reset token</p>
          </div>

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
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <i className="fas fa-envelope input-icon"></i>
              </div>
            </div>

            <button
              type="submit"
              className="btn-reset"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Sending...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane me-2"></i>
                  Send Reset Token
                </>
              )}
            </button>
          </form>

          <span className="back-link" onClick={() => navigate("/login")}>
            ← Back to Login
          </span>
        </div>
      </div>

      <div className="toast-container">
        {showToast && (
          <div className="toast align-items-center text-bg-success border-0 show" role="alert">
            <div className="d-flex">
              <div className="toast-body">
                <i className="fas fa-check-circle me-2"></i>
                Token sent to your email!
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setShowToast(false)}
              ></button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ForgotPassword;