// src/pages/admin/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar'; // corrected import
import AdminTopBar from '../../components/admin/AdminTopBar';

export default function AdminLayout() {
  return (
    <>
      {/* Bootstrap & Font Awesome */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
      <link 
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=Sora:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap" 
        rel="stylesheet"
      />

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          height: 100%;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background-color: #f8fafc;
          color: #1e293b;
          overflow: hidden;
        }

        .admin-dashboard-layout {
          height: 100vh;
          width: 100vw;
          display: flex;
          overflow: hidden;
        }

        /* ─── Sidebar ──────────────────────────────────────────────── */
        .admin-sidebar-wrapper {
          width: 250px;
          height: 100vh;
          background: #040947;
          border-right: none;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1000;
          transition: width 0.3s ease;
          overflow: hidden;
          box-shadow: 4px 0 24px rgba(0,0,0,0.05);
        }

        @media (max-width: 992px) {
          .admin-sidebar-wrapper {
            width: 72px;
          }
        }

        /* ─── Main Area ────────────────────────────────────────────── */
        .admin-main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-left: 250px;
          transition: margin-left 0.3s ease;
          background: #f8fafc;
          overflow-x: auto; /* allow content-driven scroll if necessary */
        }

        @media (max-width: 992px) {
          .admin-main-area {
            margin-left: 72px;
          }
        }

        /* ─── Top Bar ──────────────────────────────────────────────── */
        .admin-topbar-wrapper {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          z-index: 999;
          flex-shrink: 0;
          position: sticky;
          top: 0;
        }

        /* ─── Content Area ─────────────────────────────────────────── */
        .admin-content-wrapper {
          flex: 1;
          overflow-y: auto;
          overflow-x: auto; /* allow scroll to prevent clipping */
          padding: 0.5rem 1.5rem 1.5rem;
          -webkit-overflow-scrolling: touch;
        }

        .admin-content-wrapper > * {
          min-height: 70vh;
          transition: box-shadow 0.25s ease;
        }

        .admin-content-wrapper > *:hover {
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
        }

        /* Responsive adjustments */
        @media (max-width: 992px) {
          .admin-content-wrapper {
            padding: 1.5rem;
          }
        }

        @media (max-width: 576px) {
          .admin-content-wrapper {
            padding: 0.5rem 0.75rem 1.5rem;
          }
        }
      `}</style>

      <div className="admin-dashboard-layout">
        {/* Fixed Sidebar */}
        <div className="admin-sidebar-wrapper">
          <AdminSidebar />
        </div>

        {/* Main Area (Topbar + Scrollable Content) */}
        <div className="admin-main-area">
          {/* Sticky Top Bar */}
          <div className="admin-topbar-wrapper">
            <AdminTopBar />
          </div>

          {/* Scrollable Content */}
          <div className="admin-content-wrapper">
            <Outlet /> {/* ← Dashboard, Companies, Jobs, etc. render here */}
          </div>
        </div>
      </div>
    </>
  );
}