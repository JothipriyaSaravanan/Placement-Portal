// src/components/coordinator/CoordinatorTopBar.jsx
import React from "react";

export default function CoordinatorTopBar() {
  const username = localStorage.getItem("coordinatorUsername") || "Coordinator";
  const department = localStorage.getItem("department") || "Global Dept";

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      
      <style>{`
        .topbar-wrapper {
          height: 80px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2.5rem;
          border-bottom: 1px solid #f1f5f9;
          font-family: 'Plus Jakarta Sans', sans-serif;
          z-index: 900;
          position: sticky;
          top: 0;
          gap: 1.5rem;
        }

        .directory-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1e293b;
          padding-right: 1.5rem;
          border-right: 2px solid #e2e8f0;
          white-space: nowrap;
        }

        .search-container {
          display: flex;
          align-items: center;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.6rem 1.25rem;
          border-radius: 14px;
          width: 380px;
          gap: 12px;
          transition: all 0.3s;
        }

        .search-container:focus-within {
          border-color: #002147;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(0, 33, 71, 0.05);
        }

        .search-input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 0.9rem;
          color: #1e293b;
          width: 100%;
          font-weight: 500;
        }

        .search-input::placeholder { color: #94a3b8; }

        .user-profile-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .notification-btn {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          font-size: 1.15rem;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .notification-btn:hover {
          background: #f8fafc;
          color: #002147;
          border-color: #002147;
        }

        .notif-dot {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid white;
        }

        .topbar-divider {
          height: 28px;
          width: 1px;
          background: #e2e8f0;
        }

        .profile-info {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 14px;
          transition: all 0.2s;
        }

        .profile-info:hover { background: #f8fafc; }

        .avatar-circle {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #002147;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-family: 'Outfit', sans-serif;
          box-shadow: 0 4px 12px rgba(0, 33, 71, 0.2);
        }

        .user-meta { display: flex; flex-direction: column; line-height: 1.2; }
        .user-name { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
        .user-role { font-size: 0.75rem; color: #64748b; font-weight: 600; }

        @media (max-width: 768px) {
          .search-container { display: none; }
          .topbar-wrapper { padding: 0 1.5rem; }
          .user-meta { display: none; }
        }
      `}</style>

      <div className="topbar-wrapper">
        <div className="directory-title">
          📁 Directory of the Placement
        </div>

        <div className="search-container">
          <i className="fas fa-search" style={{ color: '#94a3b8', fontSize: '0.9rem' }}></i>
          <input type="text" className="search-input" placeholder="Search for stats, students, reports..." />
        </div>

        <div className="user-profile-section">
          <button className="notification-btn">
            <i className="far fa-bell"></i>
            <div className="notif-dot"></div>
          </button>

          <div className="topbar-divider"></div>

          <div className="profile-info">
            <div className="user-meta text-end">
              <span className="user-name">Good day!</span>
              <span className="user-role">{department} Coordinator</span>
            </div>
            <div className="avatar-circle">
              {username.charAt(0).toUpperCase()}
            </div>
            <i className="fas fa-chevron-down" style={{ fontSize: '0.7rem', color: '#94a3b8' }}></i>
          </div>
        </div>
      </div>
    </>
  );
}