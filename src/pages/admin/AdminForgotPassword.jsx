


// AdminForgotPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [message, setMessage]   = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendOtp = async () => {
    if (!email.trim()) {
      setMessage("Please enter your email");
      return;
    }

    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/admin-panel/forgot-password/send-otp/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to send OTP");
        return;
      }

      // Success → navigate to verify page
      navigate("/admin/verify-otp", { state: { email } });

    } catch (err) {
      setMessage("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />

      <style>{`
        :root {
          --primary: #040947;
          --accent: #6366f1;
          --bg-solid: #040947;
          --text-main: #1e293b;
          --text-muted: #64748b;
          --border-color: #e5e7eb;
          --input-bg: #ffffff;
        }

        *, *::before, *::after {
          box-sizing: border-box;
        }

        html, body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          width: 100%;
          height: 100%;
          max-width: 100vw;
        }

        html::-webkit-scrollbar,
        body::-webkit-scrollbar {
          display: none;
        }

        body {
          font-family: 'Inter', sans-serif;
          background-color: var(--bg-solid);
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='10' y='10' width='80' height='80' rx='20' fill='none' stroke='%23ffffff' stroke-opacity='0.10' stroke-width='1'/%3E%3Crect x='30' y='30' width='40' height='40' rx='10' fill='none' stroke='%23ffffff' stroke-opacity='0.06' stroke-width='1'/%3E%3C/svg%3E");
          color: var(--text-main);
          min-height: 100vh;
        }

        h1, h2, h3 {
          font-family: 'Outfit', sans-serif;
        }

        .forgot-page {
          min-height: 100vh;
          width: 100%;
          max-width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          overflow: hidden;
        }

        .forgot-wrapper {
          width: 100%;
          max-width: 520px;
          background: #ffffff;
          padding: 3.5rem 2.5rem;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(4, 9, 71, 0.5);
        }

        .header-section {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .logo-box {
          width: 110px;
          height: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .forgot-title {
          font-size: 1.85rem;
          font-weight: 800;
          color: #040947;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .forgot-subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          font-weight: 600;
          color: var(--text-main);
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          display: block;
        }

        .input-control {
          width: 100%;
          height: 48px;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background-color: var(--input-bg);
          transition: all 0.2s ease;
          outline: none;
        }

        .input-control:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }

        .error-alert {
          background-color: #fef2f2;
          border: 1px solid #fee2e2;
          color: #991b1b;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .success-alert {
          background-color: #d1fae5;
          border: 1px solid #a7f3d0;
          color: #065f46;
        }

        .btn-submit {
          width: 100%;
          height: 48px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-submit:hover:not(:disabled) {
          background: #0a1172;
          transform: translateY(-1px);
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .foot-info {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .back-link {
          color: var(--primary);
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .forgot-wrapper {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>

      <div className="forgot-page">
        <div className="forgot-wrapper">
          <div className="header-section">
            <div className="logo-box">
              <img src="/Logo.png" alt="University Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h1 className="forgot-title">Reset Password</h1>
            <p className="forgot-subtitle">Enter your email to receive an OTP</p>
          </div>

          {message && (
            <div className={`error-alert ${message.includes("OTP") ? "success-alert" : ""}`}>
              <i className={`fas ${message.includes("OTP") ? "fa-check-circle" : "fa-circle-exclamation"}`}></i>
              <span>{message}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input
              type="email"
              className="input-control"
              placeholder="admin@institution.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button
            className="btn-submit"
            onClick={sendOtp}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status"></span>
                <span>Sending OTP...</span>
              </>
            ) : (
              <>
                <span>Send OTP</span>
                <i className="fas fa-arrow-right"></i>
              </>
            )}
          </button>

          <div className="foot-info">
            <span className="back-link" onClick={() => navigate("/admin")}>
              <i className="fas fa-arrow-left"></i> Back to Login
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminForgotPassword;