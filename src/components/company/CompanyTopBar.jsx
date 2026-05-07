
// components/company/CompanyTopBar.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CompanyTopBar() {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("Company");

  useEffect(() => {
    const name = localStorage.getItem("companyName");
    const email = localStorage.getItem("companyEmail");
    if (name) setCompanyName(name);
    else if (email) setCompanyName(email.split("@")[0] || "Company");
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/company-login");
  };

  return (
    <>
      <style>{`
        .topbar-area {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
          padding: 0 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        }

        .welcome-text {
          font-size: 1.1rem;
          color: #64748b;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-right: auto;
        }

        .welcome-text span {
          color: #0f172a;
          font-weight: 700;
        }

        .directory-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f172a;
          margin-right: auto;
          padding: 0 1.5rem;
          border-right: 2px solid rgba(0, 0, 0, 0.05);
        }

        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .notification-btn {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .notification-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0.6rem 1.25rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: #ef4444;
          background: #fef2f2;
          border: 1px solid #fee2e2;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: #fee2e2;
          transform: translateY(-1px);
        }

        .logout-btn i {
          font-size: 1.1rem;
        }

        @media (max-width: 640px) {
          .topbar-area {
            padding: 1rem;
          }
          .welcome-text {
            font-size: 0.9rem;
          }
          .logout-btn span {
            display: none;
          }
          .logout-btn {
            padding: 0.6rem;
          }
        }
      `}</style>

      <div className="topbar-area">
        <div className="directory-title">
          📁 Directory of the Placement
        </div>

        <div className="welcome-text">
          Good day, <span>{companyName}</span>
        </div>

        <div className="topbar-actions">
           <div className="notification-btn">
              <i className="far fa-bell"></i>
           </div>
           
           <button className="logout-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              <span>Sign Out</span>
           </button>
        </div>
      </div>
    </>
  );
}
