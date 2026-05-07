// src/pages/coordinator/AdminAnnouncementsForCoordinator.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

export default function AdminAnnouncementsForCoordinator() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);
const fetchAnnouncements = async () => {
  try {
    const department = localStorage.getItem("department");

    if (!department || department === "null") {
      console.error("Department missing in localStorage");
      return;
    }

    const res = await axios.get(`${API}/coordinator/announcements/`, {
      params: {
        department,
      },
    });

    setAnnouncements(res.data.announcements || []);
  } catch (err) {
    console.error("Error fetching announcements:", err);
  }
};

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
      />

      <style>{`
        :root {
          --registry-ruby: #9d174d;
          --registry-ruby-light: #fef2f2;
          --registry-ruby-hover: #be123c;
          --text-deep: #0f172a;
          --text-muted: #64748b;
          --surface-bg: #f8fafc;
          --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
          --card-shadow-hover: 0 10px 15px -3px rgba(157, 23, 77, 0.1), 0 4px 6px -4px rgba(157, 23, 77, 0.1);
        }

        .registry-container {
          font-family: 'Outfit', sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem 2.5rem;
          background: #ffffff;
          min-height: 100vh;
          position: relative;
        }

        /* --- Institutional Seal Decor --- */
        .registry-container::before {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, #fdf2f8 0%, transparent 70%);
          z-index: 0;
          pointer-events: none;
        }

        /* --- Breadcrumb --- */
        .breadcrumb {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: var(--text-muted);
          font-size: 0.7rem;
          font-weight: 600;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        /* --- Header Section --- */
        .page-header {
          position: relative;
          z-index: 1;
          border-bottom: 3px solid var(--registry-ruby);
          padding-bottom: 2rem;
          margin-bottom: 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 2rem;
        }

        .header-flex {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .university-logo {
          height: 100px;
          width: auto;
          object-fit: contain;
          border-right: 2px solid var(--registry-ruby);
          padding-right: 2rem;
        }

        .header-title-group h1 {
          font-size: 2.4rem;
          font-weight: 800;
          color: var(--text-deep);
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .header-title-group p {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-top: 0.5rem;
          font-weight: 400;
          max-width: 600px;
        }

        .header-stats {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          text-align: right;
        }

        .stat-value {
          display: block;
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--registry-ruby);
        }

        .stat-label {
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* --- Announcements Grid --- */
        .announcements-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .announcement-card {
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-left: 4px solid var(--registry-ruby);
          padding: 2rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .announcement-card:hover {
          background: var(--bg-main);
          border-color: var(--registry-ruby-border);
          transform: translateX(4px);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .announcement-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-main);
          margin: 0;
          line-height: 1.3;
          flex: 1;
        }

        .important-tag {
          background: var(--registry-ruby);
          color: white;
          padding: 0.3rem 0.6rem;
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .announcement-meta {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 500;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .meta-item i {
          color: var(--registry-ruby);
          font-size: 1rem;
        }

        .announcement-body {
          color: #334155;
          font-size: 0.92rem;
          line-height: 1.7;
          white-space: pre-wrap;
          margin-top: 0.5rem;
        }

        .no-data-state {
          text-align: center;
          padding: 6rem 2rem;
          background: var(--bg-main);
          border: 2px dashed var(--border-color);
          border-radius: 12px;
          color: var(--text-muted);
        }

        .no-data-state i {
          font-size: 3rem;
          margin-bottom: 1.5rem;
          display: block;
          color: var(--registry-ruby-border);
        }

        .no-data-state h3 {
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }
          .header-stats {
            width: 100%;
            justify-content: space-between;
          }
          .registry-container {
            padding: 2rem 1rem;
          }
          .header-flex {
            flex-direction: row;
            align-items: center;
            gap: 1.5rem;
          }
          .university-logo {
            height: 70px;
            padding-right: 1.5rem;
          }
          .header-title-group h1 {
            font-size: 1.8rem;
          }
        }
      `}</style>

      <div className="registry-container">
        <nav className="breadcrumb">
          <span>Coordinator</span>
          <i className="bi bi-chevron-right"></i>
          <span style={{ color: "var(--registry-ruby)", fontWeight: "700" }}>Admin Feed</span>
        </nav>

        <header className="page-header">
          <div className="header-flex">
            <img src="/Logo.png" alt="University Logo" className="university-logo" />
            <div className="header-title-group">
              <h1>Official Announcements</h1>
              <p>Formal communications from the Placement Administration Department.</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">{announcements.length}</span>
              <span className="stat-label">Total Postings</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {announcements.filter(a => a.important).length}
              </span>
              <span className="stat-label">Urgent Alerts</span>
            </div>
          </div>
        </header>

        {announcements.length === 0 ? (
          <div className="no-data-state">
            <i className="bi bi-mailbox2"></i>
            <h3>The bulletin is currently empty</h3>
            <p>New official announcements will be posted here as they become available.</p>
          </div>
        ) : (
          <div className="announcements-grid">
            {announcements.map((ann) => (
              <div key={ann.id} className="announcement-card">
                <div className="card-top">
                  <h2 className="announcement-title">{ann.title}</h2>
                  {ann.important && (
                    <span className="important-tag">Registry Priority</span>
                  )}
                </div>

                <div className="announcement-meta">
                  <div className="meta-item">
                    <i className="bi bi-shield-check"></i>
                    <span>Authorized by {ann.created_by || "Admin Office"}</span>
                  </div>
                  <div className="meta-item">
                    <i className="bi bi-calendar3"></i>
                    <span>Published on {formatDate(ann.created_at)}</span>
                  </div>
                </div>

                <div className="announcement-body">{ann.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

