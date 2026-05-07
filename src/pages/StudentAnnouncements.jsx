// src/pages/StudentAnnouncements.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

export default function StudentAnnouncements() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('Newest');
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(6);

  const navigate = useNavigate();
  const studentEmail = localStorage.getItem("studentEmail");

  useEffect(() => {
    if (!studentEmail) {
      navigate('/login');
      return;
    }
    fetchMessages();
  }, [studentEmail, navigate]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/coordinator/student-messages/`, {
        params: { email: studentEmail },
      });
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered and Sorted Messages
  const filteredMessages = useMemo(() => {
    let result = [...messages];

    if (searchText.trim()) {
      const term = searchText.toLowerCase().trim();
      result = result.filter(
        (m) =>
          (m.title || '').toLowerCase().includes(term) ||
          (m.message || '').toLowerCase().includes(term) ||
          (m.sent_by || '').toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'Newest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'Oldest') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'Title A-Z') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });

    return result;
  }, [messages, searchText, sortBy]);

  // Pagination Logic
  const totalEntries = filteredMessages.length;
  const indexOfLastMsg = currentPage * entriesPerPage;
  const indexOfFirstMsg = indexOfLastMsg - entriesPerPage;
  const currentMessages = filteredMessages.slice(indexOfFirstMsg, indexOfLastMsg);
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, sortBy, entriesPerPage]);

  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  // Format date to Indian local time (IST)
  const formatDateIST = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (err) {
      return dateString || "—";
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-white">
        <div className="spinner-border" style={{ width: '3rem', height: '3rem', color: '#7c3aed', borderWidth: '0.2rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-announce-container">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />

      <style>{`
        :root {
          --brand-purple: #7c3aed;
          --brand-purple-light: #8b5cf6;
          --bg-main: #f8fafc;
          --border-ui: #e2e8f0;
          --text-deep: #0f172a;
          --text-muted: #64748b;
        }

        .modern-announce-container {
          font-family: 'Inter', sans-serif;
          background-color: var(--bg-main);
          min-height: 100vh;
          padding: 0.25rem 1.5rem 2rem;
          color: var(--text-deep);
        }

        .page-wrapper {
          max-width: 1400px;
          margin: 0 auto;
        }

        /* --- Header Card --- */
        .header-card {
          background: white;
          border-radius: 0;
          border: 1px solid var(--border-ui);
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .header-banner {
          background: var(--brand-purple);
          padding: 2.5rem 2.5rem;
          color: white;
          position: relative;
        }

        .header-banner h1 {
          font-size: 1.75rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .header-banner p {
          font-size: 0.95rem;
          opacity: 0.9;
          margin-bottom: 0;
          max-width: 700px;
        }

        .banner-icon {
          position: absolute;
          right: 40px;
          bottom: -20px;
          font-size: 10rem;
          opacity: 0.1;
          transform: rotate(-10deg);
        }

        /* --- Toolbar --- */
        .toolbar {
          padding: 1rem 2.5rem;
          background: #fafafa;
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          border-top: 1px solid var(--border-ui);
        }

        .search-container {
          position: relative;
          flex: 1;
          min-width: 280px;
        }

        .search-container i {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          width: 100%;
          padding: 0.65rem 1rem 0.65rem 2.6rem;
          border: 1px solid var(--border-ui);
          border-radius: 0;
          font-size: 0.95rem;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--brand-purple);
        }

        .toolbar-select {
          padding: 0.65rem 1rem;
          border: 1px solid var(--border-ui);
          border-radius: 0;
          font-weight: 600;
          font-size: 0.9rem;
          background: white;
          cursor: pointer;
        }

        .entries-info {
          margin-left: auto;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        /* --- Grid & Cards --- */
        .announcement-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .msg-card {
          background: white;
          border: 1px solid var(--border-ui);
          border-radius: 0;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: all 0.2s;
          height: 100%;
        }

        .msg-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.06);
          border-color: var(--brand-purple-light);
        }

        .msg-card-header {
          padding: 1.5rem 1.75rem;
          border-bottom: 1px solid #f1f5f9;
          position: relative;
        }

        .msg-card-header::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--brand-purple);
        }

        .msg-card-title {
          font-size: 1.15rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-deep);
        }

        .msg-card-body {
          padding: 1.75rem;
          flex: 1;
        }

        .msg-text {
          font-size: 0.925rem;
          line-height: 1.6;
          color: #334155;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .msg-card-footer {
          padding: 1.25rem 1.75rem;
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* --- Pagination --- */
        .pagination-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 0;
          border-top: 1px solid var(--border-ui);
        }

        .page-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-ui);
          border-radius: 0;
          background: white;
          cursor: pointer;
          transition: 0.2s;
          font-weight: 500;
        }

        .page-btn.active {
          background: var(--brand-purple);
          color: white;
          border-color: var(--brand-purple);
        }

        .page-btn:hover:not(.active):not(:disabled) {
          background: #f1f5f9;
        }

        /* --- Empty State --- */
        .empty-view {
          padding: 6rem 2rem;
          text-align: center;
          background: white;
          border: 1px solid var(--border-ui);
        }

        @media (max-width: 768px) {
          .announcement-grid { grid-template-columns: 1fr; }
          .toolbar { flex-direction: column; align-items: stretch; }
          .entries-info { margin-left: 0; text-align: center; }
        }
      `}</style>

      <div className="page-wrapper">
        <div className="header-card">
          <div className="header-banner">
            <h1>Department Announcements</h1>
            <p>Stay informed with the latest updates, important notices, and official messages from your department coordinator.</p>
            <i className="bi bi-megaphone banner-icon"></i>
          </div>

          <div className="toolbar">
            <div className="search-container">
              <i className="bi bi-search"></i>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search announcements..." 
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <select className="toolbar-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="Newest">Newest First</option>
              <option value="Oldest">Oldest First</option>
              <option value="Title A-Z">Title (A-Z)</option>
            </select>

            <select className="toolbar-select" value={entriesPerPage} onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}>
              <option value={6}>6 items per page</option>
              <option value={12}>12 items per page</option>
              <option value={24}>24 items per page</option>
            </select>

            <div className="entries-info">
              Showing {totalEntries > 0 ? indexOfFirstMsg + 1 : 0} to {Math.min(indexOfLastMsg, totalEntries)} of {totalEntries} results
            </div>
          </div>
        </div>

        {currentMessages.length > 0 ? (
          <>
            <div className="announcement-grid">
              {currentMessages.map((msg) => (
                <div key={msg.id} className="msg-card">
                  <div className="msg-card-header">
                    <h2 className="msg-card-title">{msg.title || "Announcement"}</h2>
                  </div>
                  <div className="msg-card-body">
                    <div className="msg-text">{msg.message || "—"}</div>
                  </div>
                  <div className="msg-card-footer">
                    <div className="meta">
                      <i className="bi bi-person-circle"></i>
                      <span>{msg.sent_by || "Coordinator"}</span>
                    </div>
                    <div className="meta">
                      <i className="bi bi-calendar-check"></i>
                      <span>{formatDateIST(msg.date)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalEntries > entriesPerPage && (
              <div className="pagination-bar">
                <span className="text-muted small">Page {currentPage} of {totalPages}</span>
                <div className="d-flex gap-1">
                  <button className="page-btn" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i + 1} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => handlePageChange(i + 1)}>
                      {i + 1}
                    </button>
                  ))}
                  <button className="page-btn" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="empty-view">
            <i className="bi bi-chat-dots-fill text-muted mb-3" style={{ fontSize: '3rem' }}></i>
            <h3 className="fw-bold">No announcements found</h3>
            <p className="text-muted">There are currently no announcements matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}