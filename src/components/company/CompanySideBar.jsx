
// components/company/CompanySideBar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function CompanySideBar() {
  const navigate = useNavigate();

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        :root {
          --sidebar-bg: #011627;
          --sidebar-text: rgba(255, 255, 255, 0.6);
          --sidebar-active-bg: #2563eb;
          --sidebar-active-text: #ffffff;
          --sidebar-hover-bg: rgba(255, 255, 255, 0.05);
          --sidebar-border: rgba(255, 255, 255, 0.1);
          --font-main: 'Plus Jakarta Sans', system-ui, sans-serif;
          --font-brand: 'Outfit', sans-serif;
        }

        .sidebar-wrapper {
          width: 260px;
          height: 100vh;
          background: var(--sidebar-bg);
          border-right: none;
          display: flex;
          flex-direction: column;
          z-index: 1100;
          font-family: var(--font-main);
          box-shadow: 4px 0 24px rgba(0,0,0,0.12);
          transition: all 0.3s ease;
        }

        .sidebar-inner {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 0;
        }

        .sidebar-header {
          padding: 2rem 1.25rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          border-bottom: 1px solid var(--sidebar-border);
          margin-bottom: 1.5rem;
        }

        .sidebar-logo-container {
          width: 85px;
          height: 85px;
          margin-bottom: 0.75rem;
          transition: transform 0.3s ease;
        }

        .sidebar-logo-container:hover {
          transform: scale(1.05);
        }

        .sidebar-logo-container img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 50%;
          filter: brightness(1.1) drop-shadow(0 0 10px rgba(255, 255, 255, 0.1));
        }

        .brand-name-text {
          font-family: var(--font-brand);
          font-size: 1.25rem;
          font-weight: 700; /* Reduced from 800 */
          color: #ffffff;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin: 0;
        }

        .brand-subtitle-text {
          font-size: 0.75rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-top: 4px;
        }

        .nav-section-label {
          font-size: 0.65rem;
          font-weight: 700; /* Reduced from 800 */
          color: rgba(255, 255, 255, 0.3);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin: 0.5rem 0 1rem 1.5rem;
        }

        .nav-list {
          list-style: none;
          padding: 0 1rem;
          margin: 0;
          flex: 1;
        }

        .nav-item {
          margin-bottom: 0.4rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          padding: 0.85rem 1.2rem;
          color: var(--sidebar-text);
          text-decoration: none !important;
          font-size: 0.875rem;
          font-weight: 600; /* Reduced from 700 */
          border-radius: 12px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          gap: 12px;
        }

        .nav-link:hover {
          background: var(--sidebar-hover-bg);
          color: #ffffff;
        }

        .nav-link.active {
          background: var(--sidebar-active-bg);
          color: var(--sidebar-active-text);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
        }

        .nav-icon {
          font-size: 1.1rem;
          width: 24px;
          display: flex;
          justify-content: center;
        }

        .sidebar-footer {
          margin-top: auto;
          padding: 1.5rem 1.25rem 2rem;
          border-top: 1px solid var(--sidebar-border);
        }

        .sidebar-copyright {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-copyright span {
          display: block;
          font-size: 0.7rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sidebar-copyright .copyright-tag {
          font-size: 0.6rem;
          color: rgba(255, 255, 255, 0.2);
          letter-spacing: 1px;
        }

        @media (max-width: 992px) {
          .sidebar-wrapper { width: 88px; }
          .brand-name-text, .brand-subtitle-text, .nav-section-label, .nav-label, .sidebar-copyright { display: none; }
          .sidebar-header { padding: 1.5rem 0.5rem; }
          .sidebar-logo-container { width: 50px; height: 50px; margin-bottom: 0; }
          .nav-link { justify-content: center; padding: 1rem; }
          .nav-icon { margin: 0; font-size: 1.3rem; }
          .sidebar-inner { align-items: center; }
        }
      `}</style>

      <div className="sidebar-wrapper">
        <div className="sidebar-inner">
          <div className="sidebar-header">
            <div className="sidebar-logo-container">
              <img src="/Logo.png" alt="University Logo" onError={(e) => {
                e.target.src = "https://tse1.mm.bing.net/th?id=OIP.E0dRErE6Z8l9R5jZkZp9XQHaHa&pid=Api";
              }} />
            </div>
            <h1 className="brand-name-text">Company Login</h1>
            <p className="brand-subtitle-text">Placement Portal</p>
          </div>

          <p className="nav-section-label">Management</p>

          <ul className="nav-list">
            <li className="nav-item">
              <NavLink
                to="profile"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                <i className="fas fa-building nav-icon"></i>
                <span className="nav-label">Company Profile</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="post-job"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                <i className="fas fa-plus-circle nav-icon"></i>
                <span className="nav-label">Post Job</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="applicants"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                <i className="fas fa-user-tie nav-icon"></i>
                <span className="nav-label">Applicants</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="report"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                <i className="fas fa-chart-bar nav-icon"></i>
                <span className="nav-label">Reports</span>
              </NavLink>
            </li>
          </ul>

          <div className="sidebar-footer">
            <div className="sidebar-copyright">
              <span>© 2026 Periyar University</span>
              <span className="copyright-tag">Placement Portal</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
