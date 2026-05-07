





import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CompanyLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/companies/login/", form);

      // Store user data in localStorage
      localStorage.setItem("companyId", res.data.company_id);
      localStorage.setItem("companyName", res.data.name || "");
      localStorage.setItem("companyEmail", res.data.email || form.email); // fallback to input if not in response

      // Show success toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1400);

      // Redirect to the correct dashboard path (matches your App.jsx nested routes)
      setTimeout(() => {
        navigate("/company/dashboard");  // ← FIXED: this is the correct path
      }, 1800);
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/company-forgot-password", { state: { email: form.email } });
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
          --primary-start: #6366f1;
          --primary-end: #8b5cf6;
          --primary-glow: rgba(99, 102, 241, 0.5);
          --focus-ring: rgba(99, 102, 241, 0.18);
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

        .login-page {
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
        .blob-3 { top: 40%; left: 30%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(30, 58, 138, 0.15) 0%, transparent 70%); animation-duration: 35s; }

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
        }

        /* --- Digital Constellation Web SVG Pattern --- */
        .svg-pattern-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.22;
          z-index: 1;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M0 0l100 100M100 0L0 100' stroke='%23ffffff' stroke-width='0.6' stroke-opacity='0.4'/%3E%3Ccircle cx='50' cy='50' r='1.8' fill='%23ffffff' fill-opacity='0.5'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 90px 90px;
          pointer-events: none;
        }

        .login-wrapper {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 480px;
          background: #ffffff;
          border-radius: 4px;
          padding: 3rem 2.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          border: 1px solid #e2e8f0;
          animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(60px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .logo-section { text-align: center; margin-bottom: 1.8rem; }

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



        .login-title { 
          font-size: 1.8rem; 
          font-weight: 700; 
          color: #1e293b; 
          margin-bottom: 0.5rem; 
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .login-subtitle { color: #64748b; font-size: 0.95rem; font-weight: 500; }

        .form-label { font-weight: 600; color: #1e293b; margin-bottom: 0.5rem; font-size: 0.95rem; display: block; }

        .input-wrapper { position: relative; margin-bottom: 1.4rem; }

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
          border-color: var(--primary-start);
          background: white;
          box-shadow: 0 0 0 4px var(--focus-ring);
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
          font-size: 1.3rem;
          pointer-events: none;
          transition: color 0.25s;
          z-index: 2;
        }

        .input-wrapper:focus-within .input-icon { color: var(--primary-start); }

        .eye-btn {
          position: absolute;
          right: 1.2rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #64748b;
          font-size: 1.3rem;
          cursor: pointer;
          padding: 0;
        }

        .eye-btn:hover { color: #1e293b; }

        .forgot-link {
          color: var(--primary-start);
          font-size: 0.93rem;
          text-align: right;
          display: block;
          margin: -0.5rem 0 1.5rem;
          cursor: pointer;
        }

        .forgot-link:hover { text-decoration: underline; color: #4f46e5; }

        .btn-login {
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

        .btn-login:hover:not(:disabled) {
          background: #1e40af;
          box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);
        }



        .btn-login:disabled { opacity: 0.7; cursor: not-allowed; }

        .alert-custom {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
          border-radius: 1rem;
          padding: 1.1rem 1.3rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          font-size: 0.96rem;
          animation: shake 0.45s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-7px); }
          40%, 80% { transform: translateX(7px); }
        }

        .toast-container {
          position: fixed;
          top: 1.5rem;
          right: 1.5rem;
          z-index: 1055;
          min-width: 280px;
        }

        .register-text {
          text-align: center;
          margin-top: 1.8rem;
          font-size: 0.97rem;
          color: #475569;
        }

        .register-link {
          color: var(--primary-start);
          font-weight: 600;
          cursor: pointer;
        }

        .register-link:hover { text-decoration: underline; color: #4f46e5; }

        @media (max-width: 576px) {
          .login-wrapper {
            padding: 1.6rem 1.4rem;
            border-radius: 1.3rem;
            max-width: 90%;
          }

          .login-title { font-size: 1.7rem; }
          .login-subtitle { font-size: 0.92rem; }

          .form-label { font-size: 0.9rem; }
          .form-control {
            height: 48px;
            font-size: 0.94rem;
            padding: 0 2.8rem 0 2.9rem;
          }

          .input-icon,
          .eye-btn { font-size: 1.2rem; }

          .forgot-link { font-size: 0.88rem; }
          .btn-login { font-size: 1rem; padding: 0.8rem; }

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
          .login-wrapper { padding: 1.4rem 1.2rem; }
          .logo-icon { width: 64px; height: 64px; }
          .logo-icon i { font-size: 1.7rem; }
        }
      `}</style>

      <div className="login-page">
        <div className="aura-container">
          <div className="mesh-grid"></div>
          <div className="svg-pattern-overlay"></div>
          <div className="aura-blob blob-1"></div>
          <div className="aura-blob blob-2"></div>
          <div className="aura-blob blob-3"></div>
        </div>

        <div className="login-wrapper">
          <div className="logo-section">
            <div className="logo-icon">
              <img src="/Logo.png" alt="University Logo" onError={(e) => {
                e.target.src = "https://tse1.mm.bing.net/th?id=OIP.E0dRErE6Z8l9R5jZkZp9XQHaHa&pid=Api";
              }} />
            </div>
            <h1 className="login-title">Company Portal</h1>
            <p className="login-subtitle">Secured Enterprise Access</p>
          </div>

          {error && (
            <div className="alert-custom">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-wrapper">
              <label className="form-label">Email Address</label>
              <div className="input-relative">
                <i className="fas fa-envelope input-icon"></i>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="company@business.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="input-wrapper">
              <label className="form-label">Password</label>
              <div className="input-relative">
                <i className="fas fa-lock input-icon"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            <span className="forgot-link" onClick={handleForgotPassword}>
              Forgot your password?
            </span>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Signing in...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt me-2"></i> Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <div className="toast-container">
          {showToast && (
            <div className="toast align-items-center text-bg-success border-0 show" role="alert">
              <div className="d-flex">
                <div className="toast-body">
                  <i className="fas fa-check-circle me-2"></i>
                  Login successful! Redirecting...
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
      </div>
    </>
  );
};

export default CompanyLogin;