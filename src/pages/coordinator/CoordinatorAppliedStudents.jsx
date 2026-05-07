// src/pages/coordinator/CoordinatorAppliedStudents.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_BASE = "http://localhost:8000";

export default function CoordinatorAppliedStudents() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const jobId = searchParams.get("job_id") || "";
  const programme = searchParams.get("programme") || "";
  const year = searchParams.get("year") || "";
  const jobTitle = searchParams.get("job_title") || "";
  const department = searchParams.get("department") || "Coordinator Portal";
  const coordinatorName = searchParams.get("coordinator_role") || localStorage.getItem("coordinatorUsername") || "Coordinator";
  const username = searchParams.get("username") || localStorage.getItem("coordinatorUsername") || "";

  // State
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    status: ""
  });
  const [selectedCoverLetter, setSelectedCoverLetter] = useState(null);

  // Fetch Logic
  useEffect(() => {
    if (!jobId) {
      setError("Job ID is missing for this selection.");
      setLoading(false);
      return;
    }

    if (!username) {
      setError("Username is missing. Please log in again.");
      setLoading(false);
      return;
    }

    const fetchApplications = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/coordinator/job-applicants/`, {
          params: { job_id: jobId, username: username },
        });
        setApplications(res.data.applications || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load student applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [jobId, username]);

  // Filtering Logic
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const student = app.student || {};
      const matchesSearch =
        (student.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (student.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (app.job?.title?.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesName = student.name?.toLowerCase().includes(filters.name.toLowerCase());
      const matchesEmail = student.email?.toLowerCase().includes(filters.email.toLowerCase());
      const matchesStatus = filters.status ? app.status === filters.status : true;

      return matchesSearch && matchesName && matchesEmail && matchesStatus;
    });
  }, [applications, searchQuery, filters]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredApplications.length / entriesPerPage) || 1;
  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredApplications.slice(start, start + entriesPerPage);
  }, [filteredApplications, currentPage, entriesPerPage]);

  const downloadCSV = () => {
    if (!jobId || !username) return;
    window.open(`${API_BASE}/coordinator/download-applications/?job_id=${jobId}&username=${username}`, "_blank");
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>Fetching applicants...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button className="btn-action btn-back" onClick={() => navigate("/coordinator/jobs")}>Back to Jobs</button>
        </div>
      </div>
    );
  }

  return (
    <div className="coordinator-applied-students">
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

      <style>{`
        .coordinator-applied-students {
          padding: 2rem;
          background: #f8fafc;
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 2.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .header-title-group { flex: 1; }

        .welcome-text {
          font-size: 0.85rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .main-title {
          font-family: 'Outfit', sans-serif;
          font-size: 2.5rem;
          color: #1e1b4b;
          font-weight: 800;
          margin: 0;
          line-height: 1.1;
        }

        .subtitle-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          margin-top: 1rem;
          background: #eef2ff;
          color: #4f46e5;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.95rem;
          border: 1px solid #e0e7ff;
        }

        .action-group {
          display: flex;
          gap: 1rem;
        }

        .btn-action {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          border: none;
        }

        .btn-back { background: #ffffff; color: #475569; border: 1.5px solid #e2e8f0; }
        .btn-back:hover { background: #f8fafc; border-color: #cbd5e1; }

        .btn-download { background: #1e1b4b; color: #ffffff; }
        .btn-download:hover { background: #0f172a; transform: translateY(-2px); }

        .control-bar {
          background: #ffffff;
          padding: 1.5rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          margin-bottom: 2rem;
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          align-items: center;
          justify-content: space-between;
        }

        .search-container {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-icon {
          position: absolute;
          left: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .filter-group {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .entries-control {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 700;
          color: #475569;
          font-size: 0.9rem;
        }

        .select-input {
          padding: 0.5rem 2rem 0.5rem 1rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 0.4rem;
          background-color: #ffffff;
          cursor: pointer;
          font-weight: 700;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.8rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
          background: #f8fafc;
          transition: all 0.2s;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
        }

        .search-input:focus {
           outline: none;
           border-color: #4f46e5;
           background: #ffffff;
           box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        }

        .search-input::-webkit-search-decoration,
        .search-input::-webkit-search-cancel-button,
        .search-input::-webkit-search-results-button,
        .search-input::-webkit-search-results-decoration {
          display: none;
        }

        /* ─── Professional Table ──────────────────────────────────── */
        .table-wrapper {
          background: #ffffff;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table th {
          background-color: #f8fafc;
          padding: 1.25rem;
          text-align: left;
          color: #64748b;
          font-weight: 700;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-bottom: 2px solid #e2e8f0;
        }

        .table td {
          padding: 1.25rem 1rem;
          border-bottom: 1.5px solid #f1f5f9;
          color: #1e1b4b !important;
          font-size: 0.9rem;
          font-weight: 500;
          vertical-align: middle;
        }

        .student-name { font-weight: 700; display: block; margin-bottom: 4px; }
        .student-email { font-weight: 500; color: #64748b; font-size: 0.85rem; }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 30px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: inline-block;
          border: 1px solid transparent;
        }

        .status-pending { background: #fffcf0; color: #854d0e; border-color: #fef08a; }
        .status-accepted { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
        .status-rejected { background: #fef2f2; color: #991b1b; border-color: #fecaca; }

        .pagination-bar {
          margin-top: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .page-info { font-weight: 600; color: #64748b; font-size: 0.9rem; }

        .pagination-controls { display: flex; gap: 0.5rem; }

        .page-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          color: #1e293b;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 8px;
        }

        .page-btn:hover:not(:disabled) { border-color: #4f46e5; color: #4f46e5; }
        .page-btn.active { background: #4f46e5; color: #ffffff; border-color: #4f46e5; }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .loading-overlay { text-align: center; padding: 10rem 2rem; }
        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #e2e8f0;
          border-top: 5px solid #4f46e5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1.5rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .error-card {
          max-width: 400px;
          margin: 10rem auto;
          background: #ffffff;
          padding: 2.5rem;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
        }

        .error-card i { font-size: 3rem; color: #ef4444; margin-bottom: 1.5rem; }
        .error-card p { font-weight: 700; color: #1e293b; margin-bottom: 2rem; }
      `}</style>

      <div className="page-header">
        <div className="header-title-group">
          <div className="welcome-text">MANAGEMENT PORTAL — {coordinatorName}</div>
          <h1 className="main-title">Applied Students</h1>
          <div className="subtitle-badge">
            <i className="fas fa-briefcase"></i>
            {jobTitle || "View Applications"}
          </div>
        </div>
        <div className="action-group">
          <button className="btn-action btn-back" onClick={() => navigate("/coordinator/jobs")}>
            <i className="fas fa-arrow-left"></i> Back to Jobs
          </button>
          <button className="btn-action btn-download" onClick={downloadCSV}>
            <i className="fas fa-file-csv"></i> Download CSV
          </button>
        </div>
      </div>

      <div className="control-bar">
        <div className="search-container">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            className="search-input"
            placeholder="Search by student name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select
            className="search-input"
            style={{ width: '180px' }}
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Reg No</th>
              <th>Student Details</th>
              <th>Year</th>
              <th>Status</th>
              <th>Applied Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedApplications.length > 0 ? (
              paginatedApplications.map((app) => (
                <tr key={app.application_id}>
                  <td style={{ fontWeight: '700', color: '#64748b' }}>{app.student?.university_reg_no || "N/A"}</td>
                  <td>
                    <span className="student-name">{app.student?.name}</span>
                    <span className="student-email">{app.student?.email}</span>
                  </td>
                  <td style={{ fontWeight: '600' }}>{app.student?.year || year}</td>
                  <td>
                    <span className={`status-badge status-${app.status?.toLowerCase() || 'pending'}`}>
                      {app.status || "Pending"}
                    </span>
                  </td>
                  <td style={{ color: '#64748b', fontWeight: '500' }}>
                    {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "N/A"}
                  </td>
                  <td>
                    <button
                      className="btn-action btn-back"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      onClick={() => setSelectedCoverLetter(app.cover_letter)}
                    >
                      View App
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr key="no-applicants">
                <td colSpan="6" style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                  No applicants found using those filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-bar">
          <div className="page-info">
            Showing {paginatedApplications.length} of {filteredApplications.length} applicants
          </div>
          <div className="pagination-controls">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={`page-${i + 1}`}
                className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}