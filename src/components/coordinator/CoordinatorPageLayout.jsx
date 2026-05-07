// src/components/coordinator/CoordinatorPageLayout.jsx
import React from 'react';

export default function CoordinatorPageLayout({ title, children }) {
  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />

      <style>{`
        .coordinator-page-wrapper {
          min-height: 100vh;
          padding: 0.5rem 2.5rem 5rem;
          background: #f8f9fc;
          color: #2d3748;
        }

        .page-header {
          text-align: center;
          margin-bottom: 1.5rem;
          color: white;
          text-shadow: 0 2px 12px rgba(0,0,0,0.35);
        }

        .page-title {
          font-size: 2.8rem;
          font-weight: 800;
          margin-bottom: 0.8rem;
          background: linear-gradient(90deg, #c084fc, #a78bfa, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.4px;
        }

        .page-card {
          background: none;
          border-radius: 0;
          padding: 0;
          box-shadow: none;
          backdrop-filter: none;
          border: none;
          transition: none;
          min-height: unset;
          position: relative;
          overflow: visible;
        }

        .page-card:hover {
          /* No lift or shadow */
        }

        /* Optional message container (used in child pages) */
        .page-message {
          padding: 1.2rem 1.6rem;
          border-radius: 1rem;
          margin-bottom: 2rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .page-message.success {
          background: #e9d8fd;
          color: #6b21a8;
          border: 1px solid #c084fc;
        }

        .page-message.error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }

        @media (max-width: 992px) {
          .coordinator-page-wrapper {
            padding: 2.5rem 1.8rem 4rem;
          }
          .page-title {
            font-size: 2.4rem;
          }
          .page-card {
            padding: 2rem 1.8rem;
          }
        }

        @media (max-width: 576px) {
          .coordinator-page-wrapper {
            padding: 2rem 1.2rem 3.5rem;
          }
          .page-title {
            font-size: 2rem;
          }
          .page-card {
            padding: 1.8rem 1.4rem;
            border-radius: 1.3rem;
          }
        }
      `}</style>

      <div className="coordinator-page-wrapper">
        {title && (
          <div className="page-header">
            <h2 className="page-title">{title}</h2>
          </div>
        )}

        <div className="page-card">
          {children}
        </div>
      </div>
    </>
  );
}