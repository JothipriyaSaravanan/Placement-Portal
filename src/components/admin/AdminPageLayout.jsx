// src/components/admin/AdminPageLayout.jsx
import React from 'react';

export default function AdminPageLayout({ title, icon, children }) {
  return (
    <>
      <style>{`
        .admin-page-container {
          min-height: calc(100vh - 80px);
          padding: 0.75rem 1rem 4rem; /* More compact padding to save space */
          background: #f8fafc;
          width: 100%;
        }

        .admin-page-title {
          font-size: 1.6rem;
          font-weight: 700;
          text-align: center;
          color: #f97316;
          margin: 0 0 1rem 0;
          letter-spacing: -0.01em;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .admin-page-title i {
          color: #f97316;
          font-size: 1.5rem;
        }

        /* Message styles - shown directly under title */
        .admin-message {
          max-width: 1100px;
          margin: 0 auto 2rem auto;
          padding: 1rem 1.6rem;
          border-radius: 0.8rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .admin-message.success {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .admin-message.error {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        /* Loading / empty states */
        .admin-loading,
        .admin-empty {
          text-align: center;
          padding: 6rem 1rem;
          color: #64748b;
          font-size: 1.25rem;
          font-weight: 500;
        }

        /* Make sure tables/buttons look good without card wrapper */
        .table-responsive {
          margin: 0 auto;
          max-width: 1400px;
          border-radius: 0.9rem;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }

        .table thead th {
          background: #f1f5f9;
          color: #1e293b;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.92rem;
          padding: 1.1rem 1.25rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .table td {
          padding: 1.1rem 1.25rem;
        }

        .action-btn {
          padding: 0.55rem 1.3rem;
          font-size: 0.93rem;
          font-weight: 600;
          border: none;
          border-radius: 9999px;
          color: white;
          transition: all 0.25s ease;
        }

        .btn-approve {
          background: linear-gradient(135deg, #10b981, #34d399);
        }

        .btn-reject {
          background: linear-gradient(135deg, #ef4444, #f87171);
        }

        .action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 5px 14px rgba(0,0,0,0.15);
        }

        @media (max-width: 992px) {
          .admin-page-container {
            padding: 2rem 1.5rem;
          }
          .admin-page-title {
            font-size: 2.1rem;
          }
        }

        @media (max-width: 576px) {
          .admin-page-container {
            padding: 1.5rem 0.75rem;
          }
          .admin-page-title {
            font-size: 1.7rem;
          }
        }
      `}</style>

      <div className="admin-page-container">
        {title && (
          <h2 className="admin-page-title">
            {icon && <i className={icon}></i>}
            {title}
          </h2>
        )}

        {/* Messages, tabs, tables, etc. appear directly here – no card wrapper */}
        {children}
      </div>
    </>
  );
}