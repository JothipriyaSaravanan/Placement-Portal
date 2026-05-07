// src/pages/PendingVerification.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PendingVerification() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email;

  const [statusMsg, setStatusMsg] = useState("Verification in progress...");

  useEffect(() => {
    if (!email) {
      navigate("/request-verification");
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/students/smart-email-check/?email=${encodeURIComponent(email)}`
        );
        const data = await res.json();

        setStatusMsg(data.message || "Checking verification status...");

        if (data.status === "approved") {
          clearInterval(interval);
          navigate("/register", { state: { email } });
        }

        if (data.status === "registered" || data.status === "already_registered") {
          clearInterval(interval);
          navigate("/login", { state: { email } });
        }
      } catch (err) {
        setStatusMsg("Unable to check status. Please try again later.");
        console.error("Status check error:", err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [email, navigate]);

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
        .pending-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.2rem;
          position: relative;
          overflow: hidden;
        }
        .pending-page::before {
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
        .pending-wrapper {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 460px;
          background: rgba(255, 255, 255, 0.94);
          border-radius: 1.5rem;
          padding: 2rem 2.2rem;
          box-shadow: 0 16px 48px rgba(0,0,0,0.22);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.25);
          animation: slideUp 0.7s ease-out;
          text-align: center;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .logo-section {
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
          margin: 0 auto 0.9rem;
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
        .pending-title {
          font-size: 1.85rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.4rem;
        }
        .pending-subtitle {
          color: #4a5568;
          font-size: 0.97rem;
          margin-bottom: 1.5rem;
        }
        .email-display {
          background: #f1f5f9;
          padding: 1rem;
          border-radius: 0.85rem;
          margin: 1.5rem 0;
          font-size: 1.02rem;
          color: #2d3748;
        }
        .spinner-wrapper {
          margin: 2rem auto;
        }
        .status-message {
          font-size: 1.05rem;
          font-weight: 500;
          color: #374151;
          margin: 1.5rem 0 1rem;
        }
        .info-text {
          color: #4b5563;
          font-size: 0.94rem;
          line-height: 1.5;
        }
        @media (max-width: 576px) {
          .pending-wrapper {
            padding: 1.8rem 1.6rem;
            border-radius: 1.3rem;
          }
          .pending-title {
            font-size: 1.7rem;
          }
          .logo-icon {
            width: 65px;
            height: 65px;
          }
          .logo-icon i {
            font-size: 1.8rem;
          }
        }
      `}</style>

      <div className="pending-page">
        <div className="floating-shapes">
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
        </div>

        <div className="pending-wrapper">
          {/* Logo & Title */}
          <div className="logo-section">
            <div className="logo-icon">
              <i className="fas fa-hourglass-half"></i>
            </div>
            <h1 className="pending-title">Verification In Progress</h1>
            <p className="pending-subtitle">
              We're reviewing your details
            </p>
          </div>

          {/* Email Display */}
          <div className="email-display">
            <strong>Email:</strong> {email || "Not provided"}
          </div>

          {/* Loading Spinner */}
          <div className="spinner-wrapper">
            <div
              className="spinner-border text-success"
              style={{ width: "3.5rem", height: "3.5rem" }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>

          {/* Status Message */}
          <p className="status-message">{statusMsg}</p>

          <p className="info-text">
            Please wait patiently while the admin team verifies your account.<br />
            This usually takes a few minutes to a few hours.
          </p>
        </div>
      </div>
    </>
  );
}