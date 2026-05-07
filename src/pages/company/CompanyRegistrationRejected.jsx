import { useLocation, useNavigate } from "react-router-dom";

const CompanyRegistrationRejected = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "your company email";

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
          --primary-end:   #8b5cf6;
          --primary-glow:  rgba(99, 102, 241, 0.5);
          --focus-ring:    rgba(99, 102, 241, 0.18);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: linear-gradient(135deg, #0f172a, #1e3a8a, var(--primary-start));
          min-height: 100vh;
          font-family: 'Segoe UI', system-ui, sans-serif;
          overflow-x: hidden;
        }

        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
        }

        .floating-shapes {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .star {
          position: absolute;
          width: 0;
          height: 0;
          border-left: 28px solid transparent;
          border-right: 28px solid transparent;
          border-bottom: 56px solid rgba(255, 255, 255, 0.13);
          transform-origin: center;
          animation: floatStar 22s ease-in-out infinite;
          filter: blur(1px);
        }

        .star::before,
        .star::after {
          content: "";
          position: absolute;
          top: 0;
          left: -28px;
          width: 0;
          height: 0;
          border-left: 28px solid transparent;
          border-right: 28px solid transparent;
          border-bottom: 56px solid rgba(255, 255, 255, 0.13);
        }

        .star::before { transform: rotate(72deg); }
        .star::after  { transform: rotate(-72deg); }

        .star.small {
          border-left: 18px solid transparent;
          border-right: 18px solid transparent;
          border-bottom: 36px solid rgba(255, 255, 255, 0.11);
        }

        .star.small::before,
        .star.small::after {
          border-left: 18px solid transparent;
          border-right: 18px solid transparent;
          border-bottom: 36px solid rgba(255, 255, 255, 0.11);
        }

        .star:nth-child(1)  { top: 10%; left: 8%;   animation-delay: 0s;   transform: rotate(18deg) scale(0.9); }
        .star:nth-child(2)  { top: 18%; right: 12%; animation-delay: -3s;  transform: rotate(-22deg) scale(1.05); }
        .star:nth-child(3)  { top: 32%; left: 15%;  animation-delay: -6s;  transform: rotate(35deg) scale(0.75); }
        .star:nth-child(4)  { bottom: 22%; left: 10%; animation-delay: -9s; transform: rotate(-15deg) scale(0.95); }
        .star:nth-child(5)  { bottom: 15%; right: 14%; animation-delay: -12s; transform: rotate(28deg) scale(0.85); }
        .star:nth-child(6)  { top: 45%; right: 18%; animation-delay: -15s; transform: rotate(-30deg) scale(1.1); }
        .star:nth-child(7)  { bottom: 35%; left: 20%; animation-delay: -18s; transform: rotate(40deg) scale(0.7); }
        .star:nth-child(8)  { top: 55%; left: 25%;  animation-delay: -21s; transform: rotate(10deg) scale(0.9); }

        @keyframes floatStar {
          0%, 100% { transform: translateY(0) rotate(var(--rot, 0deg)); }
          50%      { transform: translateY(-110px) rotate(calc(var(--rot, 0deg) + 14deg)); }
        }

        .rejected-wrapper {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 480px;
          background: rgba(255, 255, 255, 0.93);
          border-radius: 1.6rem;
          padding: 2.8rem 2.5rem;
          box-shadow: 0 20px 60px rgba(0,0,0,0.24);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.3);
          animation: slideUp 0.8s ease-out;
          text-align: center;
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
          width: 90px;
          height: 90px;
          background: linear-gradient(135deg, #ef4444, #f87171);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.4rem;
          color: white;
          font-size: 2.6rem;
          box-shadow: 0 12px 35px rgba(239, 68, 68, 0.5);
          animation: pulseLogo 2.6s ease-in-out infinite;
        }

        @keyframes pulseLogo {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.08); }
        }

        .title {
          font-size: 2.1rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1rem;
        }

        .subtitle, .info-text {
          color: #475569;
          font-size: 1.05rem;
          line-height: 1.6;
          margin-bottom: 1.2rem;
        }

        .info-text strong {
          color: #1e293b;
        }

        .btn-back {
          width: 100%;
          padding: 0.95rem;
          font-size: 1.05rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, var(--primary-start), var(--primary-end));
          border: none;
          border-radius: 1.1rem;
          transition: all 0.35s ease;
          box-shadow: 0 6px 20px var(--primary-glow);
        }

        .btn-back:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 35px var(--primary-glow);
        }

        @media (max-width: 576px) {
          .rejected-wrapper {
            padding: 2rem 1.6rem;
            max-width: 90%;
          }

          .title { font-size: 1.8rem; }
          .subtitle, .info-text { font-size: 0.98rem; }
          .logo-icon { width: 80px; height: 80px; font-size: 2.2rem; }
          .btn-back { font-size: 1rem; padding: 0.85rem; }

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
          .rejected-wrapper { padding: 1.8rem 1.4rem; }
          .logo-icon { width: 70px; height: 70px; font-size: 2rem; }
        }
      `}</style>

      <div className="page">
        <div className="floating-shapes">
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star small"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star small"></div>
          <div className="star"></div>
        </div>

        <div className="rejected-wrapper">
          <div className="logo-section">
            <div className="logo-icon">✖</div>
            <h2 className="title">Registration Rejected</h2>
          </div>

          <p className="subtitle">
            Your company registration for <strong>{email}</strong> was rejected.
          </p>

          <p className="info-text">
            This may be due to incomplete information, policy violation, duplicate entry, or other reasons checked by admin.
          </p>

          <p className="info-text">
            Please contact support or submit a new request with updated/corrected details.
          </p>

          <button className="btn-back" onClick={() => navigate("/company-verification")}>
            Back to Email Check
          </button>
        </div>
      </div>
    </>
  );
};

export default CompanyRegistrationRejected;