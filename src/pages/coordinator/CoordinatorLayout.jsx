// src/pages/coordinator/CoordinatorLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import CoordinatorSidebar from "../../components/coordinator/CoordinatorSidebar";
import CoordinatorTopBar from "../../components/coordinator/CoordinatorTopBar";

export default function CoordinatorLayout() {
  return (
    <>
      <style>{`
        /* 2. Main Layout Container must be a perfect 100vh box */
        .coordinator-layout {
          height: 100vh !important;
          width: 100vw !important;
          display: flex;
          background: #f8fafc;
          overflow: hidden !important;
          position: fixed;
          top: 0;
          left: 0;
        }

        .coordinator-sidebar-space {
          flex-shrink: 0;
          width: 250px;
          height: 100vh;
          overflow: hidden !important;
        }

        /* 3. Main Area occupies the rest of the space */
        .coordinator-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden !important;
          position: relative;
        }

        /* 4. ONLY this area should have a vertical scrollbar */
        .coordinator-content {
          height: calc(100vh - 80px); /* Adjust for 80px TopBar height */
          overflow-y: auto !important;
          overflow-x: hidden !important;
          background: #f8fafc;
          width: 100%;
          box-sizing: border-box;
        }

        /* Mobile adjustments */
        @media (max-width: 992px) {
          .coordinator-sidebar-space {
            width: 80px;
          }
        }

        @media (max-width: 576px) {
          .coordinator-sidebar-space {
            width: 0;
          }
        }
      `}</style>

      <div className="coordinator-layout">
        <aside className="coordinator-sidebar-space">
          <CoordinatorSidebar />
        </aside>

        <div className="coordinator-main">
          <CoordinatorTopBar />

          <div className="coordinator-content">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
