// AdminRegister.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "", // added for better UX
  });

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/admin-panel/register/",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      // Success feedback
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1200);

      // Redirect to login after short delay
      setTimeout(() => navigate("/admin"), 1600);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap"
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

        .register-page {
          min-height: 100vh;
          width: 100%;
          max-width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          overflow: hidden;
        }

        .register-wrapper {
          width: 100%;
          max-width: 520px;
          background: #ffffff;
          padding: 2rem 2.5rem;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(4, 9, 71, 0.5);
        }

        .header-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-box {
          width: 110px;
          height: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .register-title {
          font-size: 1.85rem;
          font-weight: 800;
          color: #040947;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .register-subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
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

        .password-field {
          position: relative;
        }

        .eye-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0.25rem;
        }

        .eye-toggle:hover {
          color: var(--text-main);
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
          margin-top: 0.5rem;
        }

        .btn-submit:hover:not(:disabled) {
          background: #0a1172;
          transform: translateY(-1px);
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .error-alert {
          background-color: #fef2f2;
          border: 1px solid #fee2e2;
          color: #991b1b;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          margin-bottom: 1.25rem;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .foot-info {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .signin-link {
          color: var(--primary);
          font-weight: 600;
          text-decoration: none;
          margin-left: 0.25rem;
          cursor: pointer;
        }

        .signin-link:hover {
          text-decoration: underline;
        }

        .toast-box {
          position: fixed;
          top: 2rem;
          right: 2rem;
          z-index: 1000;
          background: #059669;
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @media (max-width: 480px) {
          .register-wrapper {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>

      <div className="register-page">
        <div className="register-wrapper">
          <div className="header-section">
            <div className="logo-box">
              <img src="/Logo.png" alt="University Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h1 className="register-title">Create Admin Account</h1>
            <p className="register-subtitle">Restricted access — authorized personnel only</p>
          </div>

          {error && (
            <div className="error-alert">
              <i className="fas fa-circle-exclamation"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="input-control"
                name="email"
                placeholder="admin@institution.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-control"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="password-field">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="input-control"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <i className="fas fa-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          <div className="foot-info">
            Already have access?
            <span className="signin-link" onClick={() => navigate("/admin")}>
              Sign In
            </span>
          </div>
        </div>

        {showToast && (
          <div className="toast-box">
            <i className="fas fa-circle-check"></i>
            <span>Account created successfully. Redirecting to login...</span>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminRegister;