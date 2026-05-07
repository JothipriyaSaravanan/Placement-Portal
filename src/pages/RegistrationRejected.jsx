// src/pages/RegistrationRejected.jsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const RegistrationRejected = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  // Block direct access
  useEffect(() => {
    if (!email) {
      navigate("/", { replace: true });
    }
  }, [email, navigate]);

  if (!email) return null;

  return (
    <>
      {/* Bootstrap & Font Awesome – same as Login */}
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
          background: linear-gradient(135deg,#556B2F 0%,#8FBC8F 100%); 
          min-height:100vh; 
          font-family:'Segoe UI',system-ui,sans-serif; 
          overflow-x:hidden; 
        }
        .page-container { 
          min-height:100vh; 
          display:flex; 
          align-items:center; 
          justify-content:center; 
          padding:1.2rem; 
          position:relative; 
          overflow:hidden; 
        }
        .page-container::before { 
          content:''; 
          position:absolute; 
          inset:-50%; 
          background:radial-gradient(circle at 30% 20%,rgba(255,255,255,0.12) 0%,transparent 40%); 
          animation:rotateBg 35s linear infinite; 
          pointer-events:none; 
        }
        @keyframes rotateBg { 
          0%{transform:rotate(0deg);} 
          100%{transform:rotate(360deg);} 
        }
        .floating-shapes { 
          position:absolute; 
          inset:0; 
          pointer-events:none; 
          z-index:0; 
        }
        .shape { 
          position:absolute; 
          background:rgba(255,255,255,0.12); 
          border-radius:50%; 
          animation:float 12s ease-in-out infinite; 
          backdrop-filter:blur(2px); 
        }
        .shape:nth-child(1){width:140px;height:140px;top:12%;left:8%;animation-delay:0s;}
        .shape:nth-child(2){width:180px;height:180px;top:28%;right:10%;animation-delay:-3s;}
        .shape:nth-child(3){width:100px;height:100px;bottom:18%;left:15%;animation-delay:-6s;}
        .shape:nth-child(4){width:160px;height:160px;bottom:8%;right:12%;animation-delay:-9s;}
        @keyframes float { 
          0%,100%{transform:translateY(0) rotate(0deg);} 
          50%{transform:translateY(-35px) rotate(8deg);} 
        }
        .card-wrapper { 
          position:relative; 
          z-index:1; 
          width:100%; 
          max-width:460px; 
          background:rgba(255,255,255,0.94); 
          border-radius:1.5rem; 
          padding:2.2rem 2.4rem; 
          box-shadow:0 16px 48px rgba(0,0,0,0.22); 
          backdrop-filter:blur(14px); 
          border:1px solid rgba(255,255,255,0.25); 
          animation:slideUp 0.7s ease-out; 
          text-align:center;
        }
        @keyframes slideUp { 
          from{opacity:0;transform:translateY(50px);} 
          to{opacity:1;transform:translateY(0);} 
        }
        .logo-section { 
          text-align:center; 
          margin-bottom:1.8rem; 
        }
        .logo-icon { 
          width:70px; 
          height:70px; 
          background:linear-gradient(135deg,#556B2F,#8FBC8F); 
          border-radius:1.2rem; 
          display:flex; 
          align-items:center; 
          justify-content:center; 
          margin:0 auto 0.8rem; 
          box-shadow:0 10px 25px rgba(85,107,47,0.35); 
          animation:pulseLogo 2.2s ease-in-out infinite; 
        }
        @keyframes pulseLogo { 
          0%,100%{transform:scale(1);} 
          50%{transform:scale(1.06);} 
        }
        .logo-icon i { 
          font-size:1.9rem; 
          color:white; 
        }
        .page-title { 
          font-size:1.85rem; 
          font-weight:700; 
          color:#2d3748; 
          margin-bottom:0.4rem; 
        }
        .page-subtitle { 
          color:#dc3545; 
          font-size:1.05rem; 
          font-weight:500; 
          margin-bottom:1.2rem; 
        }
        .email-highlight { 
          color:#556B2F; 
          font-weight:600; 
        }
        .info-text { 
          color:#4a5568; 
          font-size:0.98rem; 
          line-height:1.55; 
          margin-bottom:1.8rem; 
        }
        .contact-text { 
          font-size:0.94rem; 
          color:#6b7280; 
        }
        .btn-back { 
          width:100%; 
          padding:0.85rem; 
          font-size:1.03rem; 
          font-weight:600; 
          color:white; 
          background:linear-gradient(135deg,#556B2F,#8FBC8F); 
          border:none; 
          border-radius:1rem; 
          transition:all 0.35s ease; 
          position:relative; 
          overflow:hidden; 
          box-shadow:0 5px 15px rgba(85,107,47,0.3); 
          margin-top:1.2rem; 
        }
        .btn-back:hover { 
          transform:translateY(-3px); 
          box-shadow:0 12px 30px rgba(85,107,47,0.45); 
        }
        .icon-xl { 
          font-size:3.8rem; 
          color:#dc3545; 
          margin-bottom:1.4rem; 
        }
        @media (max-width:576px) { 
          .card-wrapper { 
            padding:1.8rem 1.8rem; 
            border-radius:1.3rem; 
            max-width:380px; 
          } 
          .page-title { font-size:1.7rem; } 
          .logo-icon { width:65px; height:65px; } 
          .logo-icon i { font-size:1.8rem; } 
        }
      `}</style>

      <div className="page-container">
        <div className="floating-shapes">
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
        </div>

        <div className="card-wrapper">
          <div className="logo-section">
            <div className="logo-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h1 className="page-title">Registration Cancelled</h1>
            <p className="page-subtitle">
              <i className="fas fa-times-circle icon-xl"></i>
            </p>
          </div>

          <p className="info-text">
            The registration for <span className="email-highlight">{email}</span> was{" "}
            <strong>rejected</strong> by the administrator.
          </p>

          <p className="info-text contact-text">
            Please contact the placement office if you believe this was a mistake.
          </p>

          <button 
            className="btn-back"
            onClick={() => navigate("/")}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Home
          </button>
        </div>
      </div>
    </>
  );
};

export default RegistrationRejected;