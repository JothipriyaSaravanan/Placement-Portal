
// src/components/admin/AdminSidebar.jsx
import { NavLink, useLocation } from "react-router-dom";

export default function AdminSidebar() {
  const location = useLocation();

  const isActiveSection = (basePath) => location.pathname.startsWith(basePath);

  return (
    <>
      <style>{`
        .admin-sidebar-wrapper {
          width: 250px;
          height: 100vh;
          background: #040947;
          border-radius: 0 !important;
          border-right: none;
          transition: width 0.3s ease;
          overflow: hidden;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1000;
        }

        @media (max-width: 992px) {
          .admin-sidebar-wrapper {
            width: 72px;
          }
          .admin-sidebar-title,
          .section-label,
          .profile-section {
            display: none;
          }
          .section-link {
            justify-content: center;
            padding: 1rem 0;
          }
        }

        .admin-sidebar-inner {
          height: 100%;
          padding: 0.25rem 0.5rem;
          display: flex;
          flex-direction: column;
        }

        .admin-sidebar-title {
          padding: 0;
          text-align: center;
          margin-bottom: 0;
        }

        .sidebar-logo {
          width: 110px;
          height: auto;
          display: block;
          margin: 0 auto;
        }

        .profile-section {
          text-align: center;
          margin-top: -0.25rem;
          margin-bottom: 0.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .profile-name {
          font-family: 'Outfit', sans-serif;
          color: white;
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 0.1rem;
          letter-spacing: -0.01rem;
        }

        .profile-role {
          font-family: 'Manrope', sans-serif;
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05rem;
          opacity: 0.9;
        }

        .section-link {
          font-family: 'Plus Jakarta Sans', sans-serif;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.55rem 0.85rem;
          color: rgba(255,255,255,0.9);
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
          border-radius: 0.5rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-bottom: 0.15rem;
          width: 100%;
          box-sizing: border-box;
        }

        .section-link .nav-icon {
          width: 28px;
          height: 28px;
          background: transparent;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }

        .section-link:hover {
          color: #ffffff;
          background: rgba(255,255,255,0.08);
        }

        .section-link.active {
          background: rgba(255,255,255,0.1);
          color: #ffffff;
          font-weight: 600;
        }

        .section-link.active .nav-icon {
          color: #ffffff;
          transform: scale(1.1);
        }

        .admin-sidebar-nav-container {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0.25rem 0;
          margin-bottom: 0.5rem;
          /* Hide scrollbar for IE, Edge and Firefox */
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Hide scrollbar for Chrome, Safari and Opera */
        .admin-sidebar-nav-container::-webkit-scrollbar {
          display: none;
        }

        .sidebar-footer {
          margin-top: auto;
          padding: 0.75rem 0;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .logout-btn {
          width: calc(100% - 1rem);
          margin: 0.4rem 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.8rem 1rem;
          color: #ffffff;
          font-family: 'Sora', sans-serif;
          font-size: 0.8rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ef4444 0%, #991b1b 100%);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 0.6rem;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          overflow: hidden;
          text-transform: uppercase;
          letter-spacing: 0.12rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .logout-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        .logout-btn:hover {
          background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
          letter-spacing: 0.15rem;
        }

        .logout-btn:hover::after {
          transform: translateX(100%);
        }

        .logout-btn:active {
          transform: translateY(0);
        }

        .logout-btn .nav-icon {
          font-size: 1.15rem;
        }

        .admin-sidebar-wrapper {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .admin-sidebar-wrapper::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="admin-sidebar-wrapper">
        <div className="admin-sidebar-inner">
          <div className="admin-sidebar-title">
            <img src="/Logo.png" alt="Logo" className="sidebar-logo" />
          </div>

          <div className="profile-section">
            <div className="profile-name">Admin User</div>
            <div className="profile-role">Placement Director</div>
          </div>

          <div className="admin-sidebar-nav-container">
            <NavLink to="/admin/dashboard" className={({ isActive }) => `section-link ${isActive ? "active" : ""}`}>
              <i className="fas fa-tachometer-alt nav-icon"></i>
              <span className="section-label">Dashboard</span>
            </NavLink>

            <NavLink to="/admin/companies" className={({ isActive }) => `section-link ${isActive || isActiveSection("/admin/companies") ? "active" : ""}`}>
              <i className="fas fa-building nav-icon"></i>
              <span className="section-label">Companies</span>
            </NavLink>

            <NavLink to="/admin/jobs" className={({ isActive }) => `section-link ${isActive || isActiveSection("/admin/jobs") ? "active" : ""}`}>
              <i className="fas fa-briefcase nav-icon"></i>
              <span className="section-label">Job Postings</span>
            </NavLink>

            <NavLink to="/admin/coordinators" className={({ isActive }) => `section-link ${isActive || isActiveSection("/admin/coordinators") ? "active" : ""}`}>
              <i className="fas fa-user-tie nav-icon"></i>
              <span className="section-label">Coordinators</span>
            </NavLink>

            <NavLink to="/admin/programmes" className={({ isActive }) => `section-link ${isActive ? "active" : ""}`}>
              <i className="fas fa-graduation-cap nav-icon"></i>
              <span className="section-label">Programmes</span>
            </NavLink>

            <NavLink to="/admin/students" className={({ isActive }) => `section-link ${isActive || isActiveSection("/admin/students") ? "active" : ""}`}>
              <i className="fas fa-users nav-icon"></i>
              <span className="section-label">Students</span>
            </NavLink>

            <NavLink to="/admin/announcements" className={({ isActive }) => `section-link ${isActive ? "active" : ""}`}>
              <i className="fas fa-bullhorn nav-icon"></i>
              <span className="section-label">Announcements</span>
            </NavLink>

            <NavLink to="/admin/reports" className={({ isActive }) => `section-link ${isActive || isActiveSection("/admin/reports") ? "active" : ""}`}>
              <i className="fas fa-chart-pie nav-icon"></i>
              <span className="section-label">Reports</span>
            </NavLink>

            <NavLink to="/admin/offer-letters" className={({ isActive }) => `section-link ${isActive ? "active" : ""}`}>
              <i className="fas fa-file-contract nav-icon" style={{ color: '#10b981' }}></i>
              <span className="section-label">Offer Letters</span>
            </NavLink>
          </div>

          {/* Logout Footer stays at bottom */}
          <div className="sidebar-footer">
            <button
              className="logout-btn"
              onClick={() => {
                localStorage.clear();
                window.location.href = "/admin";
              }}
            >
              <i className="fas fa-sign-out-alt nav-icon"></i>
              <span className="section-label">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}