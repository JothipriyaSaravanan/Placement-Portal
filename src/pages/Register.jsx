
// src/pages/Register.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledEmail = location.state?.email || "";

  const [formData, setFormData] = useState({
    username: "",
    email: prefilledEmail,
    password: "",
    department: "",
    year: "",
    contact: "",
  });

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Optional: extra client-side check
    if (!formData.email) {
      setError("Email is required. Please start from the beginning.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8000/api/students/register/",
        formData
      );

      if (res.status === 201 || res.status === 200) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        // After toast, go to login (or directly to dashboard if you prefer)
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "Registration failed. Please check your details."
      );
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
          background: linear-gradient(135deg, #556B2F 0%, #8FBC8F 100%);
          min-height: 100vh;
          font-family: 'Segoe UI', system-ui, sans-serif;
          overflow-x: hidden;
        }

        .register-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.2rem;
          position: relative;
          overflow: hidden;
        }

        .register-page::before {
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

        .shape:nth-child(1) { width:140px; height:140px; top:12%; left:8%; animation-delay:0s; }
        .shape:nth-child(2) { width:180px; height:180px; top:28%; right:10%; animation-delay:-3s; }
        .shape:nth-child(3) { width:100px; height:100px; bottom:18%; left:15%; animation-delay:-6s; }
        .shape:nth-child(4) { width:160px; height:160px; bottom:8%; right:12%; animation-delay:-9s; }

        @keyframes float {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50%     { transform: translateY(-35px) rotate(8deg); }
        }

        .register-wrapper {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 520px;
          background: rgba(255, 255, 255, 0.94);
          border-radius: 1.5rem;
          padding: 1.8rem 2.4rem;
          box-shadow: 0 16px 48px rgba(0,0,0,0.22);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.25);
          animation: slideUp 0.7s ease-out;
        }

        @keyframes slideUp {
          from { opacity:0; transform:translateY(50px); }
          to   { opacity:1; transform:translateY(0); }
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
          0%,100% { transform:scale(1); }
          50%     { transform:scale(1.06); }
        }

        .logo-icon i { font-size: 1.9rem; color:white; }

        .register-title {
          font-size: 1.9rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.2rem;
        }

        .register-subtitle {
          color: #4a5568;
          font-size: 0.96rem;
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
          margin-bottom: 1.2rem;
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

        .form-control:disabled {
          background: #e5e7eb;
          color: #4b5563;
          cursor: not-allowed;
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
          color: #556B2F;
        }

        .eye-btn {
          position: absolute;
          right: 1.1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6b7280;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0;
        }

        .eye-btn:hover { color: #374151; }

        .btn-register {
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

        .btn-register:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(85,107,47,0.45);
        }

        .btn-register::before {
          content: '';
          position: absolute;
          top: 0; left: -120%;
          width: 120%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          transition: left 0.6s;
        }

        .btn-register:hover::before {
          left: 120%;
        }

        .btn-register:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }

        .error-message {
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
          0%,100% { transform:translateX(0); }
          20%,60% { transform:translateX(-6px); }
          40%,80% { transform:translateX(6px); }
        }

        .login-link {
          text-align: center;
          margin-top: 1.6rem;
          font-size: 0.96rem;
          color: #4b5563;
        }

        .login-link span {
          color: #556B2F;
          font-weight: 600;
          cursor: pointer;
        }

        .login-link span:hover {
          text-decoration: underline;
          color: #4a5d23;
        }

        .toast-container {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 1055;
          min-width: 260px;
        }

        @media (max-width: 576px) {
          .register-wrapper {
            padding: 1.6rem 1.8rem;
            max-width: 420px;
          }
          .register-title { font-size: 1.7rem; }
          .logo-icon { width:65px; height:65px; }
          .form-control { height:48px; }
        }
      `}</style>

      <div className="register-page">
        <div className="floating-shapes">
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
        </div>

        <div className="register-wrapper">
          <div className="logo-section">
            <div className="logo-icon">
              <i className="fas fa-user-plus"></i>
            </div>
            <h1 className="register-title">Create Account</h1>
            <p className="register-subtitle">Join the placement portal</p>
          </div>

          {error && (
            <div className="error-message">
              <i className="fas fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-wrapper">
              <label className="form-label">Username</label>
              <div className="input-relative">
                <input
                  className="form-control"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
                <i className="fas fa-user input-icon"></i>
              </div>
            </div>

            <div className="input-wrapper">
              <label className="form-label">Email Address</label>
              <div className="input-relative">
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="your.email@college.edu"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!!prefilledEmail}  // disable if came from previous step
                  required
                />
                <i className="fas fa-envelope input-icon"></i>
              </div>
            </div>

            <div className="input-wrapper">
              <label className="form-label">Password</label>
              <div className="input-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <i className="fas fa-lock input-icon"></i>
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            <div className="input-wrapper">
              <label className="form-label">Department</label>
              <div className="input-relative">
                <input
                  className="form-control"
                  name="department"
                  placeholder="e.g. Computer Science, ECE"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
                <i className="fas fa-building input-icon"></i>
              </div>
            </div>

            <div className="input-wrapper">
              <label className="form-label">Year of Study</label>
              <div className="input-relative">
                <input
                  type="text"
                  className="form-control"
                  name="year"
                  placeholder="e.g. 3rd Year, Final Year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                />
                <i className="fas fa-calendar-alt input-icon"></i>
              </div>
            </div>

            <div className="input-wrapper">
              <label className="form-label">Contact Number</label>
              <div className="input-relative">
                <input
                  type="tel"
                  className="form-control"
                  name="contact"
                  placeholder="Enter your mobile number"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                />
                <i className="fas fa-phone input-icon"></i>
              </div>
            </div>

            <button type="submit" className="btn-register" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-check me-2"></i>
                  Sign Up
                </>
              )}
            </button>
          </form>

          <div className="login-link">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Sign In</span>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <div className="toast-container">
        {showToast && (
          <div className="toast align-items-center text-bg-success border-0 show" role="alert">
            <div className="d-flex">
              <div className="toast-body">
                <i className="fas fa-check-circle me-2"></i>
                Registration successful! Redirecting to login...
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

export default Register;