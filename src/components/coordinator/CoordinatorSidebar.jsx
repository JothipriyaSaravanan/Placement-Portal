// src/components/coordinator/CoordinatorSidebar.jsx
import React from "react";
import { NavLink, useLocation } from "react-router-dom";

export default function CoordinatorSidebar() {
  const location = useLocation();

  return (
    <>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

      <style>{`
        .coordinator-sidebar-wrapper {
          width: 250px;
          height: 100vh;
          background: #011627;
          border-right: none;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1000;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          box-shadow: 10px 0 30px rgba(0,0,0,0.1);
        }

        @media (max-width: 992px) {
          .coordinator-sidebar-wrapper { width: 80px; }
          .sidebar-brand-name, .section-label { display: none !important; }
          .section-link { justify-content: center !important; padding: 1rem 0 !important; }
          .sidebar-header { padding: 1.5rem 0.5rem !important; }
        }

        .sidebar-header {
          padding: 1.5rem 1.25rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0px;
        }

        .sidebar-logo-icon {
          width: 90px;
          height: 90px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s;
        }
        .sidebar-logo-icon:hover { transform: scale(1.05); }

        .sidebar-logo-icon img { width: 100%; height: 100%; object-fit: contain; }

        .sidebar-brand-name {
          font-family: 'Outfit', sans-serif;
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0;
          margin-top: -8px; /* Move closer to logo */
          color: #ffffff;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .sidebar-subtitle {
          font-size: 0.7rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-top: 4px; /* Keep subtitle readable */
        }

        .sidebar-nav {
          padding: 0 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem; /* Reduced Gap */
          overflow-y: auto;
        }

        .section-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.8rem 1.2rem;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
          font-weight: 700;
          text-decoration: none;
          border-radius: 12px;
          transition: all 0.2s;
        }

        .section-link:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
        }

        .section-link.active {
          background: #2563eb; /* Professional Blue */
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }

        .section-link .nav-icon { font-size: 1.1rem; width: 24px; text-align: center; }

        .logout-btn-container { padding: 1.5rem 1.25rem 2rem; }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem;
          color: rgba(255,255,255,0.7);
          font-size: 0.8rem;
          font-weight: 700;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          justify-content: center;
          letter-spacing: 0.5px;
        }

        .logout-btn:hover {
          background: #dc2626;
          color: white;
          border-color: #dc2626;
        }
      `}</style>

      <div className="coordinator-sidebar-wrapper">
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">
            <img src="/Logo.png" alt="Portal Logo" onError={(e) => {
              e.target.src = "https://tse1.mm.bing.net/th?id=OIP.E0dRErE6Z8l9R5jZkZp9XQHaHa&pid=Api"; // Fallback
            }} />
          </div>
          <h3 className="sidebar-brand-name">Coordinator</h3>
          <span className="sidebar-subtitle">Placement Portal</span>
        </div>

        <div className="sidebar-nav">
          <NavLink to="/coordinator/dashboard" className={({ isActive }) => `section-link ${isActive ? "active" : ""}`}>
            <i className="fas fa-chart-line nav-icon"></i>
            <span className="section-label">Dashboard</span>
          </NavLink>

          <NavLink to="/coordinator/students" className={({ isActive }) => `section-link ${isActive ? "active" : ""}`}>
            <i className="fas fa-user-graduate nav-icon"></i>
            <span className="section-label">Students</span>
          </NavLink>

          <NavLink to="/coordinator/upload" className={({ isActive }) => `section-link ${isActive ? "active" : ""}`}>
            <i className="fas fa-file-excel nav-icon"></i>
            <span className="section-label">Upload Data</span>
          </NavLink>

          <NavLink to="/coordinator/jobs" className={({ isActive }) => `section-link ${isActive ? "active" : ""}`}>
            <i className="fas fa-briefcase nav-icon"></i>
            <span className="section-label">Job Listings</span>
          </NavLink>

          <NavLink to="/coordinator/selected-students-report" className={({ isActive }) => `section-link ${isActive ? "active" : ""}`}>
            <i className="fas fa-file-invoice nav-icon"></i>
            <span className="section-label">Placement Reports</span>
          </NavLink>

          <NavLink to="/coordinator/announcements" className={({ isActive }) => `section-link ${isActive ? "active" : ""}`}>
            <i className="fas fa-bullhorn nav-icon"></i>
            <span className="section-label">My Announcements</span>
          </NavLink>

          <NavLink to="/coordinator/admin-announcements" className={({ isActive }) => `section-link ${isActive ? "active" : ""}`}>
            <i className="fas fa-newspaper nav-icon"></i>
            <span className="section-label">Admin Feed</span>
          </NavLink>
        </div>

        <div className="logout-btn-container">
          <button className="logout-btn" onClick={() => (window.location.href = "/coordinator/login")}>
            <i className="fas fa-sign-out-alt"></i>
            <span className="section-label">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
