// src/pages/RequestVerification.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function RequestVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledEmail = location.state?.email || "";

  const [form, setForm] = useState({
    username: "",
    email: prefilledEmail,
    department: "",
    year: "",
    contact: "",
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (msg) setMsg(""); // clear error when user starts typing
  };

  const submit = async () => {
    setLoading(true);
    setMsg("");

    // Basic client-side validation
    if (!form.email || !form.username || !form.department || !form.year || !form.contact) {
      setMsg("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:8000/api/students/request-verification/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (res.ok) {
        navigate("/verification-pending", {
          state: { email: form.email },
        });
      } else {
        setMsg(data.error || "Failed to submit verification request");
      }
    } catch (err) {
      setMsg("Network error - is the backend running?");
      console.error(err);
    } finally {
      setLoading(false);
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
          background: linear-gradient(135deg, #556B2F 0%, #8FBC8F 100%);
          min-height: 100vh;
          font-family: 'Segoe UI', system-ui, sans-serif;
          overflow-x: hidden;
        }
        .page-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem 1rem;
          position: relative;
          overflow: hidden;
        }
        .page-container::before {
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
        .form-wrapper {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 480px;
          background: rgba(255, 255, 255, 0.94);
          border-radius: 1.5rem;
          padding: 2rem 2.2rem;
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
          margin-bottom: 1.8rem;
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
        .page-title {
          font-size: 1.85rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.3rem;
        }
        .page-subtitle {
          color: #4a5568;
          font-size: 0.97rem;
        }
        .form-label {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.45rem;
          font-size: 0.95rem;
          display: block;
          text-align: left;
        }
        .input-wrapper {
          position: relative;
          margin-bottom: 1.3rem;
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
        .input-icon {
          position: absolute;
          left: 1.1rem;
          top: 50%;
          transform: translateY(15%);
          color: #6b7280;
          font-size: 1.25rem;
          pointer-events: none;
          transition: color 0.25s;
        }
        .btn-submit {
          width: 100%;
          padding: 0.9rem;
          font-size: 1.05rem;
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
        .btn-submit:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(85,107,47,0.45);
        }
        .btn-submit::before {
          content: '';
          position: absolute;
          top: 0; left: -120%;
          width: 120%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          transition: left 0.6s;
        }
        .btn-submit:hover::before {
          left: 120%;
        }
        .btn-submit:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }
        .alert-custom {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
          border-radius: 0.85rem;
          padding: 0.95rem 1.3rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          font-size: 0.96rem;
          animation: shake 0.4s ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .info-text {
          text-align: center;
          margin-top: 1.6rem;
          color: #4b5563;
          font-size: 0.93rem;
        }
        @media (max-width: 576px) {
          .form-wrapper {
            padding: 1.8rem 1.6rem;
            border-radius: 1.3rem;
          }
          .page-title {
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
        }
      `}</style>

      <div className="page-container">
        <div className="floating-shapes">
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
        </div>

        <div className="form-wrapper">
          {/* Logo & Title */}
          <div className="logo-section">
            <div className="logo-icon">
              <i className="fas fa-user-plus"></i>
            </div>
            <h1 className="page-title">Request Verification</h1>
            <p className="page-subtitle">
              Please provide your details to get verified
            </p>
          </div>

          {/* Error Message */}
          {msg && (
            <div className="alert-custom">
              <i className="fas fa-circle-exclamation"></i>
              {msg}
            </div>
          )}

          {/* Form Fields */}
          <div className="input-wrapper">
            <label className="form-label">Full Name / Username</label>
            <input
              type="text"
              name="username"
              className="form-control"
              placeholder="Enter your full name or username"
              value={form.username}
              onChange={handleChange}
              required
            />
            <i className="fas fa-user input-icon"></i>
          </div>

          <div className="input-wrapper">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="your.email@college.edu"
              value={form.email}
              onChange={handleChange}
              required
            />
            <i className="fas fa-envelope input-icon"></i>
          </div>

          <div className="input-wrapper">
            <label className="form-label">Department</label>
            <input
              type="text"
              name="department"
              className="form-control"
              placeholder="e.g. Computer Science, ECE, Mechanical"
              value={form.department}
              onChange={handleChange}
              required
            />
            <i className="fas fa-building input-icon"></i>
          </div>

          <div className="input-wrapper">
            <label className="form-label">Year of Study</label>
            <input
              type="text"
              name="year"
              className="form-control"
              placeholder="e.g. 3rd Year, Final Year, 2025-2026"
              value={form.year}
              onChange={handleChange}
              required
            />
            <i className="fas fa-calendar-alt input-icon"></i>
          </div>

          <div className="input-wrapper">
            <label className="form-label">Contact Number</label>
            <input
              type="tel"
              name="contact"
              className="form-control"
              placeholder="Enter your mobile number"
              value={form.contact}
              onChange={handleChange}
              required
            />
            <i className="fas fa-phone input-icon"></i>
          </div>

          <button
            className="btn-submit"
            onClick={submit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Submitting...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane me-2"></i>
                Submit Request
              </>
            )}
          </button>

          <p className="info-text">
            Once verified, you'll be able to access the placement portal
          </p>
        </div>
      </div>
    </>
  );
}