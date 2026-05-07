// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const Dashboard = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const openSidebar = () => setMobileSidebarOpen(true);
  const closeSidebar = () => setMobileSidebarOpen(false);

  return (
    <>
      {/* Global fonts & bootstrap */}
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
        .dashboard-layout {
          min-height: 100dvh;
          height: 100dvh;
          width: 100%;
          display: flex;
          overflow: hidden;
          background-color: var(--bg-sidebar);
          position: relative;
        }

        .dashboard-sidebar-shell {
          flex-shrink: 0;
          z-index: 1001;
        }

        .main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          min-height: 0;
          background: var(--bg-main);
          border-top-left-radius: 24px;
          border-bottom-left-radius: 24px;
          box-shadow: -5px 0 20px rgba(0, 0, 0, 0.1);
          margin: 8px 8px 8px 0;
        }

        .topbar-wrapper {
          z-index: 90;
          flex-shrink: 0;
          position: relative;
        }

        .menu-toggle {
          display: none;
          position: absolute;
          right: 0.8rem;
          top: 50%;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          align-items: center;
          justify-content: center;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
          color: #0f172a;
          font-size: 1rem;
          z-index: 1200;
        }

        .sidebar-backdrop {
          display: none;
        }

        .content-wrapper {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 1.5rem 2rem;
          -webkit-overflow-scrolling: touch;
        }

        .content-wrapper > * {
          background: none;
          border-radius: 0;
          padding: 0;
          box-shadow: none;
          border: none;
          min-height: auto;
        }

        @media (max-width: 992px) {
          .menu-toggle {
            display: inline-flex;
          }

          .dashboard-sidebar-shell {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            width: 280px;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            box-shadow: 6px 0 24px rgba(15, 23, 42, 0.35);
          }

          .dashboard-sidebar-shell.open {
            transform: translateX(0);
          }

          .sidebar-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.45);
            z-index: 1000;
          }

          .main-area {
            margin: 0;
            border-radius: 0;
            box-shadow: none;
            width: 100%;
          }

          .topbar-wrapper {
            padding-right: 2.9rem;
          }

          .content-wrapper {
            padding: 1.4rem 1.6rem;
          }
        }

        @media (max-width: 576px) {
          .topbar-wrapper {
            padding: 0.8rem 3.2rem 0.8rem 1rem;
          }

          .menu-toggle {
            right: 0.7rem;
          }

          .content-wrapper {
            padding: 1.2rem 1.4rem;
          }
        }

        .content-wrapper::-webkit-scrollbar,
        .dashboard-sidebar-shell::-webkit-scrollbar {
          width: 0;
          background: transparent;
        }
      `}</style>

      <div className="dashboard-layout">
        {mobileSidebarOpen && <div className="sidebar-backdrop" onClick={closeSidebar}></div>}

        {/* Sidebar */}
        <div className={`dashboard-sidebar-shell ${mobileSidebarOpen ? "open" : ""}`}>
          <Sidebar onNavigate={closeSidebar} onClose={closeSidebar} />
        </div>

        {/* Main content area */}
        <div className="main-area">
          <div className="topbar-wrapper">
            <button
              className="menu-toggle"
              onClick={openSidebar}
              aria-label="Open menu"
              type="button"
            >
              <i className="fas fa-bars"></i>
            </button>
            <Topbar />
          </div>

          <div className="content-wrapper">
            <Outlet />   {/* ← Profile, Internship, Companies, Status, etc. render here */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;