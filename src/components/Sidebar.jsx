import React from "react";
import { NavLink } from "react-router-dom";
import logo from '/Logo.png';

const Sidebar = ({ onNavigate, onClose }) => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <>
      <style>{`
        .sidebar-wrapper {
          width: 280px;
          height: 100vh;
          background: #021a11 !important; /* ONLY CHANGE: Deep Green Color */
          border-right: 1px solid rgba(255,255,255,0.1);
          transition: width 0.3s ease;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          padding: 0.7rem 0 0 0;
          justify-content: flex-start;
        }

        .sidebar-header {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 1.5rem;
          margin-bottom: 0.7rem; /* Reduced margin to move header up */
        }

        .mobile-close-btn {
          display: none;
          position: absolute;
          right: 0.8rem;
          top: 0.1rem;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          line-height: 1;
          cursor: pointer;
        }

        .mobile-close-btn:hover {
          background: rgba(255, 255, 255, 0.22);
        }

        .sidebar-logo {
          width: 80px;
          height: 80px;
          margin-bottom: 0.15rem; /* Reduced margin to move logo up */
        }

        .sidebar-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
          text-align: center;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          line-height: 1.08;
          margin-bottom: 0.15rem; /* Reduced margin to move title up */
        }
        
        .sidebar-subtitle {
          font-size: 0.85rem;
          color: #94a3b8;
          text-align: center;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 0;
        }

        .sidebar-wrapper .nav-list {
          list-style: none;
          padding: 0 1.5rem;
          margin: 0;
          flex-grow: 1;
        }

        .sidebar-wrapper .nav-item {
          margin-bottom: 0.25rem;
        }

        .sidebar-wrapper .nav-link {
          display: flex !important;
          align-items: center !important;
          gap: 1rem !important;
          padding: 0.8rem 1rem !important;
          color: #94a3b8 !important;
          text-decoration: none !important;
          font-size: 1rem !important;
          font-weight: 600 !important;
          border-radius: 8px !important;
          transition: 0.2s ease !important;
          background: transparent !important;
        }

        .sidebar-wrapper .nav-link:hover {
          color: #ffffff !important;
        }

        .sidebar-wrapper .nav-link.active {
          color: #ffffff !important;
          font-weight: 700 !important;
          box-shadow: 0 4px 12px rgba(17, 24, 39, 0.28);
        }

        .sidebar-wrapper .nav-item:nth-child(1) .nav-link.active {
          background: #2f6fd6 !important;
        }

        .sidebar-wrapper .nav-item:nth-child(2) .nav-link.active {
          background: #0e7490 !important;
        }

        .sidebar-wrapper .nav-item:nth-child(3) .nav-link.active {
          background: #4f46e5 !important;
        }
        .sidebar-wrapper .nav-item:nth-child(3) .nav-link:hover {
          background: #4f46e5 !important;
          color: #fff !important;
        }

        .sidebar-wrapper .nav-item:nth-child(4) .nav-link.active {
          background: #0f766e !important;
        }

        .sidebar-wrapper .nav-item:nth-child(5) .nav-link.active {
          background: #9a3412 !important;
        }

        .sidebar-wrapper .nav-item:nth-child(6) .nav-link.active {
          background: #047857 !important;
        }

        .sidebar-wrapper .nav-item:nth-child(7) .nav-link.active {
          background: #7c3aed !important;
        }
          .sidebar-wrapper .nav-item:nth-child(8) .nav-link.active {
          background: #aa972f !important;
        }
        .sidebar-wrapper .nav-item:nth-child(9) .nav-link.active {
          background: #f2791d!important;
        }


        .sidebar-wrapper .nav-item:nth-child(1) .nav-link:hover {
          background: rgba(47, 111, 214, 0.18) !important;
        }

        .sidebar-wrapper .nav-item:nth-child(2) .nav-link:hover {
          background: rgba(14, 116, 144, 0.18) !important;
        }

        .sidebar-wrapper .nav-item:nth-child(3) .nav-link:hover {
          background: rgba(79, 70, 229, 0.18) !important;
        }

        .sidebar-wrapper .nav-item:nth-child(4) .nav-link:hover {
          background: rgba(15, 118, 110, 0.18) !important;
        }

        .sidebar-wrapper .nav-item:nth-child(5) .nav-link:hover {
          background: rgba(154, 52, 18, 0.18) !important;
        }

        .sidebar-wrapper .nav-item:nth-child(6) .nav-link:hover {
          background: rgba(4, 120, 87, 0.18) !important;
        }

        .sidebar-wrapper .nav-item:nth-child(7) .nav-link:hover {
          background: rgba(124, 58, 237, 0.18) !important;
        }

        .sidebar-wrapper .nav-link.active .nav-icon {
          color: var(--white) !important;
        }

        .sidebar-wrapper .nav-icon {
          font-size: 1.15rem !important;
          min-width: 20px !important;
          text-align: center !important;
        }
        
        .nav-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .student-logout-btn-container {
          margin-top: auto;
          padding: 1.5rem 1.25rem 2rem;
        }

        .student-logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          justify-content: center;
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
          letter-spacing: 0.5px;
        }

        .student-logout-btn:hover {
          background: #dc2626;
          border-color: #dc2626;
          color: #ffffff;
        }

        @media (max-width: 992px) {
<<<<<<< HEAD
          .mobile-close-btn {
            display: inline-flex;
          }
=======
          .mobile-close-btn { display: inline-flex; }
>>>>>>> 7003d1870f2464a396633cd4630aabe70cb67dd6
        }
      `}</style>

      <div className="sidebar-wrapper">
        <div className="sidebar-header">
          <button
            type="button"
            className="mobile-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <i className="fas fa-times"></i>
          </button>
          <img src={logo} alt="Periyar University Logo" className="sidebar-logo" />
          <h3 className="sidebar-title">Periyar University</h3>
          <p className="sidebar-subtitle">Student Portal</p>
        </div>

        <ul className="nav-list">
          <li className="nav-item">
            <NavLink
              to="profile"
              onClick={onNavigate}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <i className="fas fa-user nav-icon"></i>
              <span className="nav-label">Profile</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="internship"
              onClick={onNavigate}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <i className="fas fa-briefcase nav-icon"></i>
              <span className="nav-label">Internship</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="projects"
              onClick={onNavigate}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <i className="fas fa-code nav-icon"></i>
              <span className="nav-label">Projects</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="skills"
              onClick={onNavigate}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <i className="fas fa-tools nav-icon"></i>
              <span className="nav-label">Skills</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="companies"
              onClick={onNavigate}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <i className="fas fa-building nav-icon"></i>
              <span className="nav-label">Companies</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="status"
              onClick={onNavigate}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <i className="fas fa-check-circle nav-icon"></i>
              <span className="nav-label">Status</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="announcements"
              onClick={onNavigate}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <i className="fas fa-bullhorn nav-icon"></i>
              <span className="nav-label">Announcements</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="admin-feed"
              onClick={onNavigate}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <i className="fas fa-user-shield nav-icon"></i>
              <span className="nav-label">Admin Feed</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink to="offer-letters" onClick={onNavigate} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <i className="fas fa-file-invoice nav-icon" style={{ color: '#10b981' }}></i>
              <span className="nav-label">Offer Letters</span>
            </NavLink>
          </li>
        </ul>
  

        <div className="student-logout-btn-container">
          <button className="student-logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;