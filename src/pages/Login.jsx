
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Email and password are required");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/api/students/login/", {
        email: formData.email.trim(),
        password: formData.password.trim(),
      });
      

      if (res.status === 200) {
  const email = formData.email.trim();

  // Store email temporarily
  localStorage.setItem("studentEmail", email);

  // Fetch the full student profile
  const profileRes = await axios.get(`http://localhost:8000/api/students/profile/`, {
    params: { email }
  });

  const student = profileRes.data; // Assuming backend returns full student info
  localStorage.setItem("student", JSON.stringify(student)); // Store full info

  setShowToast(true);
  setTimeout(() => {
    setShowToast(false);
    navigate("/dashboard");
  }, 2200);
}
    } catch (err) {
      if (err.response?.status === 401 && err.response?.data?.needs_regno_as_password) {
        setError(
          "First-time login: Please use your University Registration Number as password"
        );
      } else if (err.response?.status === 423) {
        setError(
          "Account needs setup. Use your Registration Number as initial password."
        );
      } else {
        setError(
          err.response?.data?.error ||
            "Invalid email or password. Please try again."
        );
      }
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

        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.2rem;
          position: relative;
          overflow: hidden;
        }

        .login-page::before {
          content: '';
          position: absolute;
          inset: -50%;
          background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.08) 0%, transparent 40%);
          animation: rotateBg 40s linear infinite;
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
          animation: float 14s ease-in-out infinite;
          backdrop-filter: blur(2px);
        }

        .shape:nth-child(1) { width: 160px; height: 160px; top: 10%; left: 7%;   animation-delay: 0s;   }
        .shape:nth-child(2) { width: 200px; height: 200px; top: 35%; right: 12%;  animation-delay: -4s;  }
        .shape:nth-child(3) { width: 120px; height: 120px; bottom: 22%; left: 18%; animation-delay: -7s; }
        .shape:nth-child(4) { width: 180px; height: 180px; bottom: 10%; right: 8%; animation-delay: -11s;}

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-40px) rotate(10deg); }
        }

        .login-wrapper {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 460px;
          background: rgba(255, 255, 255, 0.94);
          border-radius: 1.5rem;
          padding: 2rem 2.4rem;
          box-shadow: 0 16px 48px rgba(0,0,0,0.28);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(75,0,130,0.15);
          animation: slideUp 0.7s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(60px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .logo-section {
          text-align: center;
          margin-bottom: 1.8rem;
        }

        .logo-icon {
          width: 78px;
          height: 78px;
          background: linear-gradient(135deg, #4B0082, #6A0DAD);
          border-radius: 1.3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          box-shadow: 0 10px 25px rgba(75,0,130,0.35);
          animation: pulseLogo 2.3s ease-in-out infinite;
        }

        @keyframes pulseLogo {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.07); }
        }

        .logo-icon i {
          font-size: 2.1rem;
          color: white;
        }

        .login-title {
          font-size: 1.9rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.3rem;
        }

        .login-subtitle {
          color: #4a5568;
          font-size: 0.97rem;
        }

        .form-label {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.45rem;
          font-size: 0.95rem;
          display: block;
        }

        .input-wrapper {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .form-control {
          height: 52px;
          padding: 0 3rem 0 3.1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.9rem;
          font-size: 0.98rem;
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
          left: 1.2rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          font-size: 1.3rem;
          pointer-events: none;
          transition: color 0.25s;
          z-index: 2;
        }

        .input-wrapper:focus-within .input-icon {
          color: #4B0082;
        }

        .eye-btn {
          position: absolute;
          right: 1.2rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6b7280;
          font-size: 1.3rem;
          cursor: pointer;
          padding: 0;
        }

        .eye-btn:hover {
          color: #374151;
        }

        .btn-login {
          width: 100%;
          padding: 0.9rem;
          font-size: 1.05rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #4B0082, #6A0DAD);
          border: none;
          border-radius: 1rem;
          transition: all 0.35s ease;
          position: relative;
          overflow: hidden;
          box-shadow: none;
        }

        .btn-login:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: none;
        }

        .btn-login::before {
          content: '';
          position: absolute;
          top: 0; left: -120%;
          width: 120%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transition: left 0.6s;
        }

        .btn-login:hover::before {
          left: 120%;
        }

        .btn-login:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }

        .alert-custom {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
          border-radius: 0.9rem;
          padding: 0.95rem 1.3rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.96rem;
          animation: shake 0.45s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60%  { transform: translateX(-7px); }
          40%, 80%  { transform: translateX(7px); }
        }

        .forgot-link {
          color: #4B0082;
          font-size: 0.97rem;
          text-align: right;
          display: block;
          margin-bottom: 1.6rem;
          text-decoration: none;
          cursor: pointer;
        }

        .forgot-link:hover {
          text-decoration: underline;
          color: #3a0066;
        }

        .toast-container {
          position: fixed;
          top: 1.2rem;
          right: 1.2rem;
          z-index: 1055;
          min-width: 300px;
        }

        @media (max-width: 576px) {
          .login-wrapper {
            padding: 1.8rem 1.8rem;
            max-width: 380px;
            border-radius: 1.4rem;
          }
          .login-title {
            font-size: 1.75rem;
          }
          .logo-icon {
            width: 70px;
            height: 70px;
          }
          .form-control {
            height: 50px;
            padding: 0 2.8rem 0 2.9rem;
          }
        }
      `}</style>

      <div className="login-page">
        <div className="floating-shapes">
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
        </div>

        <div className="login-wrapper">
          <div className="logo-section">
            <div className="logo-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h1 className="login-title">Student Login</h1>
            <p className="login-subtitle">Access your placement portal</p>
          </div>

          {error && (
            <div className="alert-custom">
              <i className="fas fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="input-wrapper">
              <label className="form-label">Email address</label>
              <div className="input-relative">
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="your.name@periyaruniversity.ac.in"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <i className="fas fa-envelope input-icon"></i>
              </div>
            </div>

            {/* Password */}
            <div className="input-wrapper">
              <label className="form-label">Password</label>
              <div className="input-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  name="password"
                  placeholder="Enter your password"
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

            <span className="forgot-link" onClick={() => navigate("/forgot-password")}>
              Forgot password?
            </span>

            <button
              type="submit"
              className="btn-login"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Signing in...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Login
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="toast-container">
        {showToast && (
          <div className="toast align-items-center text-bg-success border-0 show" role="alert">
            <div className="d-flex">
              <div className="toast-body">
                <i className="fas fa-check-circle me-2"></i>
                Login successful! Redirecting to dashboard...
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

export default Login;