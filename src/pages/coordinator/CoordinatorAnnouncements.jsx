import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CoordinatorPageLayout from "../../components/coordinator/CoordinatorPageLayout";

const API_BASE = "http://localhost:8000";

export default function CoordinatorAnnouncements() {
  const navigate = useNavigate();
  const username = localStorage.getItem("coordinatorUsername");
  const department = localStorage.getItem("department") || "Department";

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formMessage, setFormMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  // Hide formMessage after 2 seconds
  useEffect(() => {
    if (formMessage) {
      const timer = setTimeout(() => {
        setFormMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formMessage]);

  useEffect(() => {
    if (!username) {
      navigate("/coordinator/login");
      return;
    }
    fetchAnnouncements();
  }, [username, navigate]);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(`${API_BASE}/coordinator/my-announcements/`, {
        params: { username },
      });
      setAnnouncements(res.data.messages || []);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setFormMessage("Validation Failed: Please provide both a title and a detailed message.");
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setFormMessage("");

    try {
      if (editingId) {
        await axios.post(`${API_BASE}/coordinator/edit-message/`, {
          id: editingId,
          username,
          title,
          message,
        });
        setFormMessage("The registry entry has been successfully updated.");
      } else {
        await axios.post(`${API_BASE}/coordinator/send-message/`, {
          username,
          title,
          message,
        });
        setFormMessage("The announcement has been officially published to the registry.");
      }
      setIsSuccess(true);
      setTitle("");
      setMessage("");
      setEditingId(null);
      fetchAnnouncements();
    } catch (err) {
      setFormMessage("System Error: Unable to synchronize with the registry. Please verify your connection.");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setTitle(item.title);
    setMessage(item.message);
    setEditingId(item.id);

    // Scroll smoothly to the form
    const formEl = document.getElementById("announcement-form-container");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleDeleteClick = (id) => {
    setIdToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;

    try {
      await axios.post(`${API_BASE}/coordinator/delete-message/`, { id: idToDelete, username });
      setFormMessage("Announcement successfully purged from the registry.");
      setIsSuccess(true);
      setShowDeleteModal(false);
      setIdToDelete(null);
      fetchAnnouncements();
    } catch (err) {
      setFormMessage("Operation Failed: Could not delete the requested entry.");
      setIsSuccess(false);
      setShowDeleteModal(false);
    }
  };

  const handleDelete = async (id) => {
    // This legacy function is now handled by modal flow
    handleDeleteClick(id);
  };

  return (
    <CoordinatorPageLayout>
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />

      <style>{`
        .announcements-page {
          background-color: #f8fafc;
          min-height: 100vh;
          padding: 0 2.5rem 2.5rem 2.5rem;
          font-family: 'Inter', sans-serif;
          color: #1e293b;
        }

        .registry-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Institutional Banner Style */
        .page-banner {
          background: #ea580c;
          padding: 2rem 4rem;
          border-radius: 20px;
          margin-bottom: 1.5rem;
          position: relative;
          overflow: hidden;
          color: #ffffff;
          border-bottom: 4px solid #c2410c;
          display: flex;
          align-items: center;
          gap: 2.5rem;
        }

        .banner-pattern {
          position: absolute;
          top: 0;
          right: 0;
          width: 450px;
          height: 100%;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%);
          transform: skewX(-20deg) translateX(30%);
        }

        .banner-icon-bg {
          font-size: 4rem;
          color: rgba(255, 255, 255, 0.2);
          transform: rotate(-15deg);
        }

        .page-banner h1 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.02em;
          text-transform: uppercase;
        }

        .page-banner p {
          margin: 0.75rem 0 0 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.85rem;
          font-weight: 500;
          max-width: 600px;
        }

        .dept-meta {
          position: absolute;
          top: 2rem;
          right: 3rem;
          background: #ffffff;
          color: #ea580c;
          padding: 0.6rem 1.25rem;
          border-radius: 6px;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          border: 1px solid rgba(234, 88, 12, 0.2);
          box-shadow: none;
          z-index: 10;
        }

        /* Registry Breadcrumbs */
        .registry-nav {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.5rem;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 600;
          background: #ffffff;
          padding: 0.75rem 1.5rem;
          border-radius: 99px;
          width: fit-content;
          border: 1px solid #f1f5f9;
        }

        .nav-link { color: #ea580c; text-decoration: none; }
        .nav-separator { color: #cbd5e1; }

        /* Form Card - Premium Design */
        .registry-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 3rem;
          margin-bottom: 3rem;
          transition: all 0.3s ease;
          box-shadow: none;
        }

        .registry-card:focus-within {
          border-color: #ea580c;
          box-shadow: none;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f1f5f9;
        }

        .card-header h2 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.4rem;
          font-weight: 800;
          margin: 0;
          color: #0f172a;
          letter-spacing: -0.01em;
        }

        .status-alert {
          padding: 1rem 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          font-weight: 600;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .alert-success { background: #f0fdf4; color: #166534; border: 1.5px solid #bbf7d0; }
        .alert-error { background: #fef2f2; color: #991b1b; border: 1.5px solid #fecaca; }

        .input-group {
          margin-bottom: 1.75rem;
        }

        .registry-label {
          display: block;
          font-weight: 700;
          font-size: 0.85rem;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.75rem;
        }

        .registry-input, .registry-textarea {
          width: 100%;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          padding: 1rem 1.25rem;
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          color: #1e293b;
          transition: all 0.2s;
        }

        .registry-input:focus, .registry-textarea:focus {
          outline: none;
          border-color: #ea580c;
          background: #ffffff;
        }

        .publish-btn {
          background: #ea580c;
          color: #ffffff;
          border: none;
          padding: 1.1rem 3rem;
          border-radius: 12px;
          font-weight: 800;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 4px 6px -1px rgba(234, 88, 12, 0.2);
        }

        .publish-btn:hover:not(:disabled) {
          background: #c2410c;
          transform: translateY(-1px);
        }

        .publish-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Announcement Archive - Advanced Design */
        .archive-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        .archive-item {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          box-shadow: none;
          display: flex;
          flex-direction: column;
        }

        .archive-item:hover {
          border-color: #ea580c;
          transform: translateY(-4px);
          box-shadow: none;
        }

        .archive-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 6px;
          height: 100%;
          background: #ea580c;
          opacity: 0.8;
        }

        .item-main-content {
          padding: 2rem;
          flex-grow: 1;
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          gap: 1.5rem;
        }

        .item-title-area {
          flex: 1;
        }

        .item-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.4rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }

        .item-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 0.75rem;
        }

        .item-tag {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          background: #fff7ed;
          color: #ea580c;
          border: 1px solid #ffedd5;
        }

        .item-date {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .item-body {
          color: #334155;
          font-size: 1rem;
          line-height: 1.7;
          margin: 0;
          white-space: pre-wrap;
          padding: 1.25rem;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
        }

        .item-footer {
          padding: 1.25rem 2rem;
          background: #ffffff;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-info {
          display: flex;
          gap: 1.5rem;
        }

        .info-stat {
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-transform: uppercase;
        }

        .item-actions {
          display: flex;
          gap: 0.75rem;
        }

        .action-btn {
          padding: 0.6rem 1rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: 1.5px solid transparent;
        }

        .btn-edit-entry {
          background: #f8fafc;
          color: #475569;
          border-color: #e2e8f0;
        }

        .btn-edit-entry:hover {
          background: #ffffff;
          color: #ea580c;
          border-color: #ea580c;
          box-shadow: 0 4px 12px rgba(234, 88, 12, 0.1);
        }

        .btn-purge {
          background: #fef2f2;
          color: #dc2626;
          border-color: #fee2e2;
        }

        .btn-purge:hover {
          background: #dc2626;
          color: #ffffff;
          border-color: #dc2626;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
        }

        .no-records {
          text-align: center;
          padding: 5rem 2rem;
          background: #ffffff;
          border: 2px dashed #e2e8f0;
          border-radius: 16px;
          color: #94a3b8;
        }

        /* Modal Design */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          background: #ffffff;
          padding: 2.5rem;
          border-radius: 20px;
          max-width: 450px;
          width: 90%;
          border: 1px solid #e2e8f0;
          text-align: center;
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .modal-icon {
          width: 64px;
          height: 64px;
          background: #fef2f2;
          color: #dc2626;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 1.5rem;
          border: 1px solid #fee2e2;
        }

        .modal-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.75rem;
        }

        .modal-text {
          color: #64748b;
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .modal-btn {
          padding: 0.8rem 1.75rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }

        .btn-cancel {
          background: #f8fafc;
          color: #475569;
          border-color: #e2e8f0;
        }

        .btn-cancel:hover {
          background: #f1f5f9;
        }

        .btn-confirm-delete {
          background: #dc2626;
          color: #ffffff;
        }

        .btn-confirm-delete:hover {
          background: #b91c1c;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        @media (max-width: 768px) {
          .announcements-page { padding: 1.5rem; }
          .page-banner { padding: 2rem; }
          .page-banner h1 { font-size: 1.8rem; }
          .dept-meta { position: static; margin-bottom: 1rem; display: inline-block; }
        }
      `}</style>

      <div className="announcements-page">
        <div className="registry-container">
          <header className="page-banner">
            <div className="banner-pattern" />
            
            <div className="dept-meta">
              <i className="fas fa-university me-2"></i>
              {department.replace(/_/g, " ")} Registry
            </div>

            <div className="banner-icon-bg">
              <i className="fas fa-bullhorn"></i>
            </div>

            <div className="banner-main-text" style={{ position: 'relative', zIndex: 1 }}>
              <h1>Announcements</h1>
              <p>Publish department-wide mandates, recruitment notifications, and orientation schedules to the student body.</p>
            </div>
          </header>

          <nav className="registry-nav">
            <span className="nav-link">Coordinator</span>
            <span className="nav-separator">/</span>
            <span style={{ color: '#0f172a' }}>Announcement Registry</span>
          </nav>

          {/* Creation Form */}
          <div className="registry-card" id="announcement-form-container">
            <div className="card-header">
              <i className="fas fa-pen-nib" style={{ color: '#ea580c' }}></i>
              <h2>{editingId ? "Modify Existing Registry Entry" : "Create Official Announcement"}</h2>
            </div>

            {formMessage && (
              <div className={`status-alert ${isSuccess ? "alert-success" : "alert-error"}`}>
                <i className={`fas ${isSuccess ? "fa-check-circle" : "fa-exclamation-triangle"}`}></i>
                {formMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="registry-label">Communication Title</label>
                <input
                  type="text"
                  className="registry-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Mandatory Pre-Placement Session for 2026 Batch"
                />
              </div>

              <div className="input-group">
                <label className="registry-label">Detailed Content</label>
                <textarea
                  className="registry-textarea"
                  rows="6"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide the complete details of the announcement here..."
                />
              </div>

              <div className="mt-4">
                <button type="submit" className="publish-btn" disabled={loading}>
                  {loading ? (
                    <><i className="fas fa-sync fa-spin"></i> Processing...</>
                  ) : editingId ? (
                    <><i className="fas fa-save"></i> Update Entry</>
                  ) : (
                    <><i className="fas fa-bullhorn"></i> Finalize & Publish</>
                  )}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="action-link btn-edit ms-3"
                    onClick={() => {
                      setEditingId(null);
                      setTitle("");
                      setMessage("");
                    }}
                    style={{ border: 'none', background: 'transparent', display: 'inline-flex' }}
                  >
                    Cancel Editing
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Previous Announcements */}
          <section>
            <div className="card-header" style={{ border: 'none', marginBottom: '1.5rem' }}>
              <i className="fas fa-history" style={{ color: '#ea580c' }}></i>
              <h2>Communication Archive</h2>
            </div>

            {announcements.length === 0 ? (
              <div className="no-records">
                <i className="fas fa-inbox fa-3x mb-3" style={{ opacity: 0.3 }}></i>
                <p>The communication registry is currently empty.</p>
              </div>
            ) : (
              <div className="archive-grid">
                {announcements.map((item) => (
                  <div key={item.id} className="archive-item">
                    <div className="item-main-content">
                      <div className="item-header">
                        <div className="item-title-area">
                          <h3 className="item-title">{item.title}</h3>
                          <div className="item-meta">
                            <span className="item-tag">Official Registry Entry</span>
                            <span className="item-date">
                              <i className="far fa-calendar-alt"></i>
                              {item.date || "Just now"}
                            </span>
                          </div>
                        </div>
                        <div className="item-icon">
                          <i className="fas fa-quote-right" style={{ color: '#f1f5f9', fontSize: '2rem' }}></i>
                        </div>
                      </div>

                      <div className="item-body">{item.message}</div>
                    </div>

                    <div className="item-footer">
                      <div className="footer-info">
                        <div className="info-stat">
                          <i className="fas fa-hashtag"></i>
                          ID: {String(item.id).padStart(4, '0')}
                        </div>
                        <div className="info-stat">
                          <i className="fas fa-shield-alt"></i>
                          Verified Entry
                        </div>
                      </div>
                      
                      <div className="item-actions">
                        <button
                          className="action-btn btn-edit-entry"
                          onClick={() => handleEdit(item)}
                        >
                          <i className="fas fa-edit"></i> Modify
                        </button>
                        <button
                          className="action-btn btn-purge"
                          onClick={() => handleDeleteClick(item.id)}
                        >
                          <i className="fas fa-trash-alt"></i> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h3 className="modal-title">Confirm Deletion</h3>
                <p className="modal-text">
                  Are you sure you want to remove this announcement? 
                  This action is permanent and will notify affected students.
                </p>
                <div className="modal-actions">
                  <button className="modal-btn btn-cancel" onClick={() => setShowDeleteModal(false)}>
                    Keep Entry
                  </button>
                  <button className="modal-btn btn-confirm-delete" onClick={confirmDelete}>
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CoordinatorPageLayout>
  );
}

