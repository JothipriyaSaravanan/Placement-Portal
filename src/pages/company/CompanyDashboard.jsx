
// pages/company/CompanyDashboard.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import CompanySideBar from "../../components/company/CompanySideBar";
import CompanyTopBar from "../../components/company/CompanyTopBar";

export default function CompanyDashboard() {
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
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <style>{`
        :root {
          --bg-main: #ffffff; /* Premium starting point */
          --bg-soft: #f8fafc;
          --text-main: #0f172a;
          --border-light: #f1f5f9;
        }

        * { margin:0; padding:0; box-sizing:border-box; }

        body {
          background-color: var(--bg-main);
          color: var(--text-main);
          font-family: 'Outfit', sans-serif;
          overflow: hidden;
        }

        .dashboard-layout {
          height: 100vh;
          width: 100vw;
          display: flex;
          overflow: hidden;
        }

        .sidebar-wrapper {
          flex-shrink: 0;
          z-index: 100;
        }

        .main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          background: var(--bg-main);
        }

        .topbar-wrapper {
          flex-shrink: 0;
          border-bottom: 1px solid var(--border-light);
          background: #ffffff;
        }

        .content-wrapper {
          flex: 1;
          overflow-y: auto;
          background: var(--bg-main);
          scroll-behavior: smooth;
        }

        /* Custom Scrollbar */
        .content-wrapper::-webkit-scrollbar {
          width: 6px;
        }
        .content-wrapper::-webkit-scrollbar-track {
          background: transparent;
        }
        .content-wrapper::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .content-wrapper::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>

      <div className="dashboard-layout">
        <div className="sidebar-wrapper">
          <CompanySideBar />
        </div>

        <div className="main-area">
          <div className="topbar-wrapper">
            <CompanyTopBar />
          </div>

          <div className="content-wrapper">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}