


// src/pages/CompanyReport.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000";

export default function CompanyReport() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Profile modal states
  const [selectedStudentEmail, setSelectedStudentEmail] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Track which application is being updated (for button loading)
  const [updatingAppId, setUpdatingAppId] = useState(null);

  // Pagination & Filtering States
  const [entriesPerPage, setEntriesPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [deptFilter, setDeptFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const companyEmail = localStorage.getItem("companyEmail");

  const fetchApplications = async (status = "") => {
    setLoading(true);

    let url = `${API_BASE}/companies/applications/?email=${encodeURIComponent(companyEmail)}`;
    if (status && status !== "all") {
      url += `&status=${status}`;
    }

    try {
      const res = await axios.get(url);
      const apps = res.data.applications || [];
      setApplications(apps);
      setFilteredApplications(apps);
      setActiveFilter(status || "all");
      setCurrentPage(1); // Reset to page 1 on search/filter/status change
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatFileUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_BASE}${url}`;
  };

  // Derived unique depts/jobs for advanced filters
  const uniqueDepts = React.useMemo(() => {
    const depts = new Set(applications.map(app => app.student?.department).filter(Boolean));
    return Array.from(depts).sort();
  }, [applications]);

  const uniqueJobs = React.useMemo(() => {
    const jobs = new Set(applications.map(app => app.job?.title).filter(Boolean));
    return Array.from(jobs).sort();
  }, [applications]);

  // Client-side filtering, sorting, and processed data
  const processedApplications = React.useMemo(() => {
    let result = [...applications];

    // Status Filter (handled by API mostly, but keeping for consistency)
    if (activeFilter !== "all") {
      result = result.filter(app => (app.status || "").toLowerCase() === activeFilter.toLowerCase());
    }

    // Search Filtering
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((app) => {
        const jobTitle = (app.job?.title || "").toLowerCase();
        const candidateName = (app.student?.name || "").toLowerCase();
        const dept = (app.student?.department || "").toLowerCase();
        return jobTitle.includes(term) || dept.includes(term) || candidateName.includes(term);
      });
    }

    // Advanced Filters
    if (deptFilter !== "all") {
      result = result.filter(app => app.student?.department === deptFilter);
    }
    if (jobFilter !== "all") {
      result = result.filter(app => app.job?.title === jobFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      if (sortBy === "oldest") return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      if (sortBy === "name_az") return (a.student?.name || "").localeCompare(b.student?.name || "");
      if (sortBy === "name_za") return (b.student?.name || "").localeCompare(a.student?.name || "");
      return 0;
    });

    return result;
  }, [applications, searchTerm, deptFilter, jobFilter, sortBy, activeFilter]);

  // Pagination slices
  const paginatedApplications = React.useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return processedApplications.slice(start, start + entriesPerPage);
  }, [processedApplications, currentPage, entriesPerPage]);

  const totalPages = Math.ceil(processedApplications.length / entriesPerPage);

  useEffect(() => {
    setCurrentPage(1); // Reset page on filter changes
  }, [searchTerm, deptFilter, jobFilter, sortBy, entriesPerPage, activeFilter]);

  useEffect(() => {
    if (companyEmail) fetchApplications();
  }, [companyEmail]);

  const handleStatusChange = (status) => {
    fetchApplications(status);
    setSearchTerm("");
  };

  const updateStatus = async (applicationId, newStatus) => {
    setUpdatingAppId(applicationId);

    try {
      const response = await axios.post(
        `${API_BASE}/companies/update-application-status/${applicationId}/`,
        { status: newStatus }
      );

      alert(response.data.message || "Status updated successfully!");

      // Remove card if Selected or Rejected
      if (newStatus === "Selected" || newStatus === "Rejected") {
        setApplications((prev) =>
          prev.filter((app) => app.application_id !== applicationId)
        );
        setFilteredApplications((prev) =>
          prev.filter((app) => app.application_id !== applicationId)
        );
      } else {
        // For Shortlisted → refresh to show updated status
        await fetchApplications(activeFilter);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update status");
      console.error("Status update error:", err);
    } finally {
      setUpdatingAppId(null);
    }
  };

  // Fetch student profile
  useEffect(() => {
    if (!selectedStudentEmail || !companyEmail) {
      setProfile(null);
      setProfileError(null);
      return;
    }

    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE}/companies/student-profile/${encodeURIComponent(selectedStudentEmail)}/`,
          { params: { company_email: companyEmail } }
        );
        setProfile(response.data);
      } catch (err) {
        setProfileError("Failed to load student profile");
        console.error(err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [selectedStudentEmail, companyEmail]);

  const closeModal = () => {
    setSelectedStudentEmail(null);
  };

  const getArray = (fieldName) => {
    const possible = [fieldName, fieldName + "s", "student_" + fieldName];
    for (const f of possible) {
      if (Array.isArray(profile?.[f])) return profile[f];
    }
    return [];
  };

  return (
    <>

      <style>{`
        :root {
          --bg-main: #f8fafc;
          --card-bg: #ffffff;
          --primary-brand: #4f46e5;
          --text-main: #0f172a;
          --text-secondary: #64748b;
          --border-color: #e2e8f0;
        }

        .report-container {
          min-height: 100vh;
          padding: 2.5rem 2rem;
          background: var(--bg-main);
          color: var(--text-main);
        }

        .main-content-wrapper {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-header {
          margin-bottom: 2.5rem;
          text-align: center;
        }

        .section-title {
          font-size: 2.25rem;
          font-weight: 700; /* Reduced from 850 */
          color: var(--text-main);
          margin-bottom: 0.5rem;
          letter-spacing: -0.03em;
        }

        .section-subtitle {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        /* Filter Tabs */
        .filter-tabs {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 2rem;
          background: #f1f5f9;
          padding: 6px;
          border-radius: 14px;
          width: fit-content;
          margin-left: auto;
          margin-right: auto;
          border: 1px solid #e2e8f0;
        }

        .filter-tab-btn {
          padding: 0.6rem 1.5rem;
          border-radius: 10px;
          border: none;
          font-weight: 600; /* Reduced from 700 */
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          color: #64748b;
          background: transparent;
        }

        .filter-tab-btn.active {
          background: #ffffff;
          color: var(--primary-brand);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .filter-tab-btn:hover:not(.active) {
          color: #334155;
          background: rgba(255,255,255,0.5);
        }

        /* Search Section */
        .search-area {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          padding: 0.75rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 12px;
          max-width: 600px;
          margin: 0 auto 3rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .search-area i {
          color: var(--text-secondary);
        }

        .search-input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 1rem;
          color: var(--text-main);
          background: transparent;
        }

        /* --- New Registry Control Styles --- */
        .registry-filters-bar {
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1.25rem 1.5rem;
          margin: 1.5rem auto 2.5rem;
          max-width: 1200px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .bar-left, .bar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .btn-filter-toggle {
          padding: 0.6rem 1.2rem;
          background: #f8fafc;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: #475569;
          font-weight: 600;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-filter-toggle.active {
          background: var(--primary-brand);
          color: white;
          border-color: var(--primary-brand);
        }

        .entries-selector {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 600;
        }

        .entries-selector select, .filter-select {
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          background: white;
          font-weight: 600;
          color: var(--text-main);
          outline: none;
          cursor: pointer;
        }

        .advanced-panel {
          background: #f8fafc;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1.5rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-secondary);
          letter-spacing: 0.05em;
        }

        /* --- Pagination --- */
        .pagination-area {
          margin-top: 4rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .page-info {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .page-controls {
          display: flex;
          gap: 0.5rem;
        }

        .page-btn {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-weight: 700;
          color: var(--text-main);
          cursor: pointer;
          transition: 0.2s;
          font-size: 0.9rem;
        }

        .page-btn:hover:not(:disabled) {
          border-color: var(--primary-brand);
          color: var(--primary-brand);
        }

        .page-btn.active {
          background: var(--primary-brand);
          color: white;
          border-color: var(--primary-brand);
        }

        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Applications Grid */
        .applications-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.5rem;
        }

        .app-card {
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          transition: all 0.3s ease;
          position: relative;
        }

        .app-card:hover {
          border-color: var(--primary-brand);
          box-shadow: 0 12px 24px rgba(0,0,0,0.04);
          transform: translateY(-4px);
        }

        .app-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .candidate-name {
          font-size: 1.3rem;
          font-weight: 700; /* Reduced from 800 */
          color: var(--text-main);
          margin: 0;
          letter-spacing: -0.01em;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .info-row i {
          width: 16px;
          color: #94a3b8;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 600; /* Reduced from 700 */
          text-transform: uppercase;
          padding: 0.3rem 0.75rem;
          border-radius: 999px;
          width: fit-content;
        }

        .status-applied { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
        .status-shortlisted { background: #fffbeb; color: #92400e; border: 1px solid #fef3c7; }
        .status-selected { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
        .status-rejected { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

        .action-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 0.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }

        .action-button {
          padding: 0.65rem;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600; /* Reduced from 700 */
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #ffffff;
        }

        .btn-full {
          grid-column: span 2;
          background: var(--primary-brand);
          color: #ffffff;
          border-color: var(--primary-brand);
        }

        .btn-full:hover {
          background: #4338ca;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
        }

        .btn-status-update {
          background: #f8fafc;
          color: #334155;
        }

        .btn-status-update:hover:not(:disabled) {
          background: #ffffff;
          border-color: var(--primary-brand);
          color: var(--primary-brand);
        }

        .btn-status-update:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Loading States */
        .loading-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 6rem 2rem;
          gap: 1.5rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: var(--primary-brand);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Modal Overrides - consistent with Applicants page */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          z-index: 3000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .modal-content {
          background: #ffffff;
          border-radius: 24px;
          width: 100%;
          max-width: 850px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          position: relative;
        }

        .modal-close-trigger {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          z-index: 100;
        }

        .profile-hero {
          padding: 3.5rem 3rem 1.5rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .profile-name-lg {
          font-size: 2.25rem;
          font-weight: 700; /* Reduced from 850 */
          color: #0f172a;
          letter-spacing: -0.03em;
          margin-bottom: 0.75rem;
        }

        .hero-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          color: #64748b;
          font-size: 0.95rem;
        }

        .hero-meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modal-canvas {
          padding: 2.5rem 3rem;
        }

        .canvas-section {
          margin-bottom: 3rem;
        }

        .canvas-section-title {
          font-size: 1rem;
          font-weight: 600; /* Reduced from 750 */
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--primary-brand);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .canvas-section-title::after {
          content: "";
          height: 1px;
          flex: 1;
          background: #e2e8f0;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }

        .data-point {
          padding: 1.25rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
        }

        .data-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .data-value {
          font-size: 1.05rem;
          font-weight: 600; /* Reduced from 700 */
          color: #0f172a;
        }

        .skill-cluster {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .skill-bubble {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          font-weight: 600; /* Reduced from 700 */
          font-size: 0.875rem;
          color: #334155;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }

        .entry-block {
          position: relative;
          padding-left: 28px;
          border-left: 2.5px solid var(--primary-brand);
          margin-bottom: 2rem;
        }

        .entry-block::before {
          content: "";
          position: absolute;
          left: -8.5px;
          top: 0;
          width: 14px;
          height: 14px;
          background: #ffffff;
          border: 2.5px solid var(--primary-brand);
          border-radius: 50%;
        }

        .entry-title {
          font-weight: 700; /* Reduced from 800 */
          font-size: 1.15rem;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .entry-org {
          color: var(--primary-brand);
          font-weight: 600; /* Reduced from 700 */
          font-size: 0.95rem;
          margin-bottom: 6px;
        }

        .entry-time {
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 10px;
        }

        .entry-body {
          font-size: 1rem;
          color: #334155;
          line-height: 1.6;
        }

        .portfolio-button {
          background: var(--primary-brand);
          color: #ffffff;
          padding: 1.1rem 2.5rem;
          border-radius: 14px;
          font-weight: 700; /* Reduced from 800 */
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.25);
          transition: all 0.2s ease;
        }

        .portfolio-button:hover {
          background: #4338ca;
          transform: translateY(-2px);
          box-shadow: 0 12px 20px -3px rgba(79, 70, 229, 0.35);
        }

        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr; }
          .modal-content { border-radius: 0; max-height: 100vh; }
          .profile-hero { padding: 2.5rem 1.5rem 1.5rem; }
          .modal-canvas { padding: 2rem 1.5rem; }
          .profile-name-lg { font-size: 1.85rem; }
        }
      `}</style>

      <div className="report-container">
        <div className="main-content-wrapper">
          <div className="section-header">
            <h1 className="section-title">Consolidated Reports</h1>
            <p className="section-subtitle">Manage and track candidate lifecycle across all listings</p>
          </div>

          <div className="filter-tabs">
            {["all", "shortlisted", "selected", "rejected"].map((filter) => (
              <button
                key={filter}
                onClick={() => handleStatusChange(filter)}
                className={`filter-tab-btn ${activeFilter === filter ? "active" : ""}`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          <div className="search-area">
            <i className="fas fa-search"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Search by candidate name, job title, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <i 
                className="fas fa-times" 
                style={{ cursor: "pointer", color: "#94a3b8" }} 
                onClick={() => setSearchTerm("")}
              ></i>
            )}
          </div>

          <div className="registry-filters-bar">
            <div className="bar-left">
              <button 
                className={`btn-filter-toggle ${showAdvanced ? "active" : ""}`}
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <i className={`fas fa-${showAdvanced ? "times" : "sliders-h"}`}></i>
                {showAdvanced ? "Hide Advanced Filters" : "Advanced Filters"}
              </button>
              
              <div className="entries-selector">
                <span>Show</span>
                <select value={entriesPerPage} onChange={(e) => setEntriesPerPage(Number(e.target.value))}>
                  <option value={6}>6 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={24}>24 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>

            <div className="bar-right">
              <div className="entries-selector">
                <span>Sort by:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name_az">Name A-Z</option>
                  <option value="name_za">Name Z-A</option>
                </select>
              </div>
            </div>
          </div>

          {showAdvanced && (
            <div className="advanced-panel">
              <div className="filter-group">
                <label>Target Department</label>
                <select className="filter-select" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                  <option value="all">All Departments</option>
                  {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Job Posting</label>
                <select className="filter-select" value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
                  <option value="all">All Role Types</option>
                  {uniqueJobs.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <div className="filter-group" style={{ justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                <button 
                  onClick={() => { setDeptFilter("all"); setJobFilter("all"); setSearchTerm(""); }}
                  style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', textTransform: 'uppercase' }}
                >
                  Reset Parameters
                </button>
              </div>
            </div>
          )}
          {loading ? (
            <div className="loading-wrap">
              <div className="spinner"></div>
              <p style={{ color: "#64748b", fontWeight: 500 }}>Fetching latest reports...</p>
            </div>
          ) : processedApplications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "5rem 2rem", background: "#ffffff", borderRadius: "24px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "1.5rem" }}>📁</div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a" }}>No Matching Records</h2>
              <p style={{ color: "#64748b" }}>We couldn't find any applications matching your current filters.</p>
              <button 
                onClick={() => { handleStatusChange("all"); setDeptFilter("all"); setJobFilter("all"); setSearchTerm(""); }}
                style={{ marginTop: "1rem", padding: "0.6rem 1.5rem", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#f8fafc", fontWeight: 600, cursor: "pointer" }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="applications-grid">
                {paginatedApplications.map((app) => {
                  const status = (app.status || "Applied").trim();
                  const isUpdating = updatingAppId === app.application_id;

                  return (
                    <div key={app.application_id} className="app-card">
                      <div className="app-header">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                          <h3 className="candidate-name">{app.student?.name}</h3>
                          <span className={`status-pill status-${status.toLowerCase()}`}>
                             {status}
                          </span>
                        </div>
                        <div className="info-row">
                          <i className="far fa-envelope"></i>
                          {app.student?.email}
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                         <div className="info-row" style={{ color: "#334155", fontWeight: 600 }}>
                            <i className="fas fa-briefcase"></i>
                            {app.job?.title}
                         </div>
                         <div className="info-row">
                            <i className="fas fa-university"></i>
                            {app.student?.department || "Department N/A"}
                         </div>
                      </div>

                      <div className="action-container">
                        <button
                          className="action-button btn-full"
                          onClick={() => setSelectedStudentEmail(app.student?.email)}
                        >
                          <i className="far fa-id-badge"></i>
                          Review Credentials
                        </button>

                        <button
                          className="action-button btn-status-update"
                          onClick={() => updateStatus(app.application_id, "Shortlisted")}
                          disabled={status.toLowerCase() === "shortlisted" || isUpdating}
                        >
                          Shortlist
                        </button>

                        <button
                          className="action-button btn-status-update"
                          onClick={() => updateStatus(app.application_id, "Selected")}
                          disabled={status.toLowerCase() === "selected" || isUpdating}
                          style={{ color: "#166534" }}
                        >
                          Select
                        </button>
                        
                        <button
                          className="action-button btn-status-update"
                          onClick={() => updateStatus(app.application_id, "Rejected")}
                          disabled={status.toLowerCase() === "rejected" || isUpdating}
                          style={{ color: "#991b1b", gridColumn: "span 2" }}
                        >
                          Mark as Rejected
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="pagination-area">
                  <div className="page-info">
                    Showing {(currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, processedApplications.length)} of {processedApplications.length} candidates
                  </div>
                  <div className="page-controls">
                    <button 
                      className="page-btn" 
                      disabled={currentPage === 1} 
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button 
                        key={i} 
                        className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button 
                      className="page-btn" 
                      disabled={currentPage === totalPages} 
                      onClick={() => setCurrentPage(p => p + 1)}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedStudentEmail && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-trigger" onClick={closeModal}>
              <i className="fas fa-times"></i>
            </button>

            {profileLoading ? (
              <div className="loading-wrap">
                <div className="spinner"></div>
                <p>Accessing student records...</p>
              </div>
            ) : profileError ? (
              <div style={{ padding: "6rem 2rem", textAlign: "center", color: "#ef4444" }}>
                {profileError}
              </div>
            ) : profile ? (
              <>
                <div className="profile-hero">
                  <h1 className="profile-name-lg">{profile.student?.name}</h1>
                  <div className="hero-meta">
                    <div className="hero-meta-item">
                      <i className="far fa-envelope"></i>
                      {profile.student?.email}
                    </div>
                    <div className="hero-meta-item">
                      <i className="fas fa-phone-alt"></i>
                      {profile.student?.phone || "Private"}
                    </div>
                    <div className="hero-meta-item">
                      <i className="fas fa-hashtag"></i>
                      Reg: {profile.student?.university_reg_no || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="modal-canvas">
                  {/* Basic Profile */}
                  <div className="canvas-section">
                    <div className="canvas-section-title">Academic Details</div>
                    <div className="detail-grid">
                      <div className="data-point">
                        <div className="data-label">Department</div>
                        <div className="data-value">{profile.student?.department || "N/A"}</div>
                      </div>
                      <div className="data-point">
                        <div className="data-label">Programme</div>
                        <div className="data-value">{profile.student?.programme || "N/A"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  {profile.skills?.length > 0 && (
                    <div className="canvas-section">
                      <div className="canvas-section-title">Skill Inventory</div>
                      <div className="skill-cluster">
                        {profile.skills.map((skill, index) => (
                          <div key={index} className="skill-bubble">{skill}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Professional History */}
                  {getArray("internships").length > 0 && (
                    <div className="canvas-section">
                      <div className="canvas-section-title">Work Experience</div>
                      {getArray("internships").map((exp, idx) => (
                        <div key={idx} className="entry-block">
                          <div className="entry-title">{exp.company_name}</div>
                          <div className="entry-org">{exp.domain}</div>
                          <div className="entry-time">{exp.duration}</div>
                          {exp.description && <div className="entry-body">{exp.description}</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Project Portfolio */}
                  {getArray("projects").length > 0 && (
                    <div className="canvas-section">
                      <div className="canvas-section-title">Project Portfolio</div>
                      {getArray("projects").map((proj, idx) => (
                        <div key={idx} className="entry-block" style={{ borderLeftColor: "#8b5cf6" }}>
                          <div className="entry-title">{proj.title}</div>
                          {proj.technologies && <div className="entry-org">Stack: {proj.technologies}</div>}
                          {proj.description && <div className="entry-body">{proj.description}</div>}
                          <div style={{ marginTop: "12px", display: "flex", gap: "16px" }}>
                            {proj.github_link && (
                              <a href={proj.github_link} target="_blank" rel="noopener noreferrer" style={{ color: "#4f46e5", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none" }}>
                                Codebase →
                              </a>
                            )}
                            {proj.live_link && (
                              <a href={proj.live_link} target="_blank" rel="noopener noreferrer" style={{ color: "#4f46e5", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none" }}>
                                Live Preview →
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Certifications */}
                  {getArray("certificates").length > 0 && (
                    <div className="canvas-section">
                      <div className="canvas-section-title">Verified Credentials</div>
                      <div className="detail-grid">
                        {getArray("certificates").map((cert, idx) => (
                          <div key={idx} className="data-point">
                            <div className="data-label">{cert.issued_by} • {cert.year_obtained}</div>
                            <div className="data-value" style={{ marginBottom: "10px" }}>{cert.title}</div>
                            {cert.file && (
                              <a href={formatFileUrl(cert.file)} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary-brand)", fontWeight: 600, fontSize: "0.8rem", textDecoration: "none" }}>
                                View Evidence →
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Digital Assets */}
                  <div className="canvas-section">
                    <div className="canvas-section-title">Digital Portfolio</div>
                    <div style={{ padding: "3rem", background: "#f1f5f9", borderRadius: "24px", border: "2px dashed #cbd5e1", textAlign: "center" }}>
                      {profile.resume ? (
                        <>
                          <p style={{ color: "#475569", marginBottom: "1.5rem" }}>The candidate has uploaded a formal curriculum vitae.</p>
                          <a href={formatFileUrl(profile.resume)} target="_blank" rel="noopener noreferrer" className="portfolio-button">
                             <i className="far fa-file-alt"></i>
                             Download Comprehensive Resume
                          </a>
                        </>
                      ) : (
                        <p style={{ color: "#64748b", fontStyle: "italic" }}>No external document attached</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}