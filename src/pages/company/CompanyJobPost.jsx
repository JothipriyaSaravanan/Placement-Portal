// src/pages/CompanyJobPost.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000";

export default function CompanyJobPost() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    salary_range: "",
    job_type: "full_time",
    last_date_to_apply: "",
    skills: "",
    departments: "",
    programmes: "",
    graduation_years: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const companyEmail = localStorage.getItem("companyEmail");

  useEffect(() => {
    if (!companyEmail) {
      setError("Company email not found. Please login again.");
      setLoadingJobs(false);
      return;
    }
    fetchCompanyJobs();
    
    // Auto-refresh every 30 seconds to update applicants count
    const refreshInterval = setInterval(fetchCompanyJobs, 30000);
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    let result = [...jobs];

    // Search Term Filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((job) => (
        (job.title || "").toLowerCase().includes(term) ||
        (job.location || "").toLowerCase().includes(term) ||
        (job.job_type || "").toLowerCase().includes(term) ||
        (job.description || "").toLowerCase().includes(term) ||
        (Array.isArray(job.skills) && job.skills.some((s) => s.toLowerCase().includes(term))) ||
        (Array.isArray(job.departments) && job.departments.some((d) => d.toLowerCase().includes(term))) ||
        (Array.isArray(job.programmes) && job.programmes.some((p) => p.toLowerCase().includes(term)))
      ));
    }

    // Status Filter
    if (filterStatus !== "all") {
      const isActive = filterStatus === "active";
      result = result.filter(job => job.is_active === isActive);
    }

    // Job Type Filter
    if (filterType !== "all") {
      result = result.filter(job => job.job_type === filterType);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      if (sortBy === "oldest") return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
      return 0;
    });

    setFilteredJobs(result);
  }, [searchTerm, filterStatus, filterType, sortBy, jobs]);

  const fetchCompanyJobs = async () => {
    try {
      setLoadingJobs(true);
      setError(null);
      
      // Fetch both jobs and applicants in parallel
      const [jobsRes, applicantsRes] = await Promise.all([
        axios.get(`${API_BASE}/companies/jobs/my/?email=${companyEmail}`),
        axios.get(`${API_BASE}/companies/applicants/?email=${encodeURIComponent(companyEmail)}`)
      ]);
      
      const jobList = jobsRes.data?.jobs || [];
      const applicants = applicantsRes.data?.applications || [];
      
      // Calculate applicants count per job
      const applicantsByJobId = {};
      applicants.forEach(app => {
        const jobId = app.job?.id;
        if (jobId) {
          applicantsByJobId[jobId] = (applicantsByJobId[jobId] || 0) + 1;
        }
      });
      
      // Merge applicants count into jobs
      const jobsWithCounts = jobList.map(job => ({
        ...job,
        applicants_count: applicantsByJobId[job.id] || 0
      }));
      
      setJobs(jobsWithCounts);
      setFilteredJobs(jobsWithCounts);
    } catch (err) {
      console.error(err);
      setError("Failed to load jobs. Please check your connection.");
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      salary_range: "",
      job_type: "full_time",
      last_date_to_apply: "",
      skills: "",
      departments: "",
      programmes: "",
      graduation_years: "",
    });
    setIsEditing(false);
    setEditingJobId(null);
    setShowEditModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    try {
      const payload = {
        ...formData,
        email: companyEmail,
        skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
        departments: formData.departments.split(",").map((d) => d.trim()).filter(Boolean),
        programmes: formData.programmes.split(",").map((p) => p.trim()).filter(Boolean),
        graduation_years: formData.graduation_years.split(",").map((y) => y.trim()).filter(Boolean),
      };

      if (isEditing && editingJobId) {
        await axios.patch(`${API_BASE}/companies/jobs/${editingJobId}/edit/?email=${companyEmail}`, payload);
        setMessage("Job updated successfully!");
        setMessageType("success");
      } else {
        await axios.post(`${API_BASE}/companies/jobs/create/`, payload);
        setMessage("Job posted successfully!");
        setMessageType("success");
      }

      resetForm();
      fetchCompanyJobs();
    } catch (err) {
      setMessage("Error: " + (err.response?.data?.error || err.message));
      setMessageType("error");
      console.error(err);
    }
  };

  const handleEdit = (job) => {
    setIsEditing(true);
    setEditingJobId(job.id);
    setFormData({
      title: job.title || "",
      description: job.description || "",
      location: job.location || "",
      salary_range: job.salary_range || "",
      job_type: job.job_type || "full_time",
      last_date_to_apply: job.last_date_to_apply || "",
      skills: Array.isArray(job.skills) ? job.skills.join(", ") : "",
      departments: Array.isArray(job.departments) ? job.departments.join(", ") : "",
      programmes: Array.isArray(job.programmes) ? job.programmes.join(", ") : "",
      graduation_years: Array.isArray(job.graduation_years) ? job.graduation_years.join(", ") : "",
    });
    setShowEditModal(true);
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Delete this job? This action cannot be undone.")) return;

    try {
      await axios.delete(`${API_BASE}/companies/jobs/${jobId}/delete/?email=${companyEmail}`);
      setMessage("Job deleted successfully!");
      setMessageType("success");
      fetchCompanyJobs();
    } catch (err) {
      setMessage("Failed to delete job");
      setMessageType("error");
    }
  };

  const handleToggleStatus = async (job, currentStatus) => {
    try {
      // Create payload with all required fields or just the toggle if backend supports partial
      const payload = {
        title: job.title,
        is_active: !currentStatus
      };
      await axios.patch(`${API_BASE}/companies/jobs/${job.id}/edit/?email=${companyEmail}`, payload);
      setMessage(`Job status updated to ${!currentStatus ? "Active" : "Closed"}`);
      setMessageType("success");
      fetchCompanyJobs();
    } catch (err) {
      setMessage("Failed to update status");
      setMessageType("error");
    }
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

        .jobpost-container {
          min-height: 100vh;
          padding: 2.5rem 2rem;
          background: var(--bg-main);
          color: var(--text-main);
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .stat-card {
          background: #ffffff;
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .icon-total { color: #2563eb; }
        .icon-active { color: #16a34a; }
        .icon-closed { color: #dc2626; }
        .icon-apps { color: #9333ea; }

        .stat-info { display: flex; flex-direction: column; }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text-main); line-height: 1.2; }
        .stat-label { font-size: 0.85rem; color: var(--text-secondary); font-weight: 500; }

        .main-content-wrapper {
          max-width: 1100px;
          margin: 0 auto;
        }

        .section-header {
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .section-title {
          font-size: 1.85rem;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.02em;
        }

        .card {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.06);
          overflow: hidden;
          margin-bottom: 2.5rem;
        }

        .card-body {
          padding: 2rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .full-width {
          grid-column: span 2;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .form-input, .form-select, .form-textarea {
          padding: 0.75rem 1rem;
          border: 1px solid var(--border-color);
          border-radius: 10px;
          font-size: 0.95rem;
          background: #ffffff;
          color: var(--text-main);
          transition: all 0.2s ease;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          outline: none;
          border-color: var(--primary-brand);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .form-textarea {
          min-height: 120px;
          resize: vertical;
        }

        .btn-primary {
          background: var(--primary-brand);
          color: white;
          padding: 0.75rem 2rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary:hover {
          background: #4338ca;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
        }

        .btn-secondary {
          background: #ffffff;
          color: var(--text-main);
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-weight: 600;
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .search-container {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          padding: 0.25rem 1rem;
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 300px;
          max-width: 450px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .search-container:focus-within {
          border-color: var(--primary-brand);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .search-container i {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .search-input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 0.95rem;
          padding: 0.6rem 0;
          color: var(--text-main);
          background: transparent;
        }

        .filters-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .filter-select {
          padding: 0.6rem 2.5rem 0.6rem 0.75rem;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          font-size: 0.875rem;
          font-weight: 600;
          background-color: #ffffff;
          cursor: pointer;
          color: var(--text-main);
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1rem;
        }

        .filter-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          margin-right: 4px;
        }

        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.5rem;
        }

        .job-card {
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          transition: all 0.3s ease;
          position: relative;
        }

        .job-card:hover {
          border-color: var(--primary-brand);
          box-shadow: 0 10px 20px rgba(0,0,0,0.04);
          transform: translateY(-4px);
        }

        .job-status {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
        }

        .status-active {
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .status-inactive {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .job-card-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-main);
          margin: 0;
          padding-right: 4rem;
          margin-bottom: 0.5rem;
        }

        .job-location {
          font-size: 0.9rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .job-details-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .detail-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .detail-value {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-main);
        }

        .job-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 0.5rem;
        }

        .tag {
          font-size: 0.75rem;
          background: #f1f5f9;
          color: #475569;
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .job-actions {
          display: flex;
          gap: 12px;
          padding-top: 1.25rem;
          border-top: 1px solid var(--border-color);
          margin-top: auto;
          align-items: center;
          flex-wrap: wrap;
        }

        .action-btn {
          height: 40px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          white-space: nowrap;
          border: 1px solid transparent;
          padding: 0 12px;
        }

        .btn-view-apps {
          background: #fdf4ff;
          color: #7e22ce;
          border-color: #f5d0fe;
          flex: 1;
          min-width: 120px;
        }

        .btn-view-apps:hover {
          background: #fae8ff;
        }

        .btn-edit-action {
          background: #f5f3ff;
          color: #5b21b6;
          border-color: #ddd6fe;
          flex: 1;
          min-width: 80px;
        }

        .btn-edit-action:hover {
          background: #ede9fe;
        }

        .btn-delete-action {
          background: #fff1f2;
          color: #9f1239;
          border-color: #fecdd3;
          padding: 0;
          width: 42px;
          height: 40px;
          flex: none;
        }

        .btn-delete-action:hover {
          background: #ffe4e6;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          z-index: 2100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .modal-content {
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .modal-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          background: #ffffff;
          z-index: 10;
        }

        .modal-body {
          padding: 2rem;
        }

        .modal-footer {
          padding: 1.5rem 2rem;
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background: #f8fafc;
        }

        .message {
          padding: 1rem;
          border-radius: 10px;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
        }

        .message-success {
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .message-error {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 3px solid #e2e8f0;
          border-top: 3px solid var(--primary-brand);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr; }
          .full-width { grid-column: span 1; }
          .jobpost-container { padding: 1.5rem 1rem; }
        }
      `}</style>

      <div className="jobpost-container">
        <div className="main-content-wrapper">
          <div className="section-header">
            <h2 className="section-title">Post a New Job</h2>
          </div>

          <div className="card">
            <div className="card-body">
              {message && (
                <div className={`message ${messageType === "success" ? "message-success" : "message-error"}`}>
                  <i className={`fas ${messageType === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`}></i>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Job Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="e.g. Senior Software Engineer"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Job Type *</label>
                    <select name="job_type" value={formData.job_type} onChange={handleChange} className="form-select">
                      <option value="full_time">Full Time</option>
                      <option value="internship">Internship</option>
                      <option value="part_time">Part Time</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Skills (comma separated)</label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="e.g. React, Node.js, AWS"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="e.g. Remote or City, Country"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Salary Range</label>
                    <input
                      type="text"
                      name="salary_range"
                      value={formData.salary_range}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="e.g. $80k - $120k / Year"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Last Date to Apply</label>
                    <input
                      type="date"
                      name="last_date_to_apply"
                      value={formData.last_date_to_apply}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Eligible Departments</label>
                    <input
                      type="text"
                      name="departments"
                      value={formData.departments}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="CSE, IT, ECE"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Eligible Programmes</label>
                    <input
                      type="text"
                      name="programmes"
                      value={formData.programmes}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="B.Tech, M.Tech, MCA"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Eligible Graduation Years</label>
                    <input
                      type="text"
                      name="graduation_years"
                      value={formData.graduation_years}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="2024, 2025"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Job Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      className="form-textarea"
                      placeholder="Describe the role, responsibilities, and requirements..."
                    />
                  </div>
                </div>

                <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" className="btn-primary">
                    <i className="fas fa-paper-plane"></i>
                    Post Opening
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon icon-total"><i className="fas fa-briefcase"></i></div>
              <div className="stat-info">
                <span className="stat-value">{jobs.length}</span>
                <span className="stat-label">Total Jobs</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon icon-active"><i className="fas fa-check-circle"></i></div>
              <div className="stat-info">
                <span className="stat-value">{jobs.filter(j => j.is_active).length}</span>
                <span className="stat-label">Active</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon icon-closed"><i className="fas fa-times-circle"></i></div>
              <div className="stat-info">
                <span className="stat-value">{jobs.filter(j => !j.is_active).length}</span>
                <span className="stat-label">Closed</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon icon-apps"><i className="fas fa-users"></i></div>
              <div className="stat-info">
                <span className="stat-value">{jobs.reduce((acc, job) => acc + (job.applicants_count || 0), 0)}</span>
                <span className="stat-label">Applicants</span>
              </div>
            </div>
          </div>

          <div className="section-header">
            <h2 className="section-title">Your Job Postings</h2>
            <button 
              onClick={fetchCompanyJobs}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#f0f9ff",
                border: "1px solid #0ea5e9",
                borderRadius: "8px",
                color: "#0369a1",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#0ea5e9";
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#f0f9ff";
                e.target.style.color = "#0369a1";
              }}
            >
              <i className="fas fa-sync-alt"></i>
              Refresh
            </button>
          </div>

          <div className="controls-row">
            <div className="search-container">
              <i className="fas fa-search"></i>
              <input
                type="text"
                className="search-input"
                placeholder="Search by title, location, or skills..."
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

            <div className="filters-group">
              <div className="filter-item">
                <span className="filter-label">Status</span>
                <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="closed">Closed Only</option>
                </select>
              </div>

              <div className="filter-item">
                <span className="filter-label">Type</span>
                <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="all">All Types</option>
                  <option value="full_time">Full Time</option>
                  <option value="internship">Internship</option>
                  <option value="part_time">Part Time</option>
                </select>
              </div>

              <div className="filter-item">
                <span className="filter-label">Sort</span>
                <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {loadingJobs ? (
            <div style={{ textAlign: "center", padding: "4rem" }}>
              <div className="loading-spinner" style={{ margin: "0 auto 1rem" }}></div>
              <p style={{ color: "var(--text-secondary)" }}>Fetching your recorded positions...</p>
            </div>
          ) : error ? (
            <div className="message message-error">{error}</div>
          ) : filteredJobs.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "4rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
              <h3 style={{ margin: "0 0 0.5rem" }}>No Jobs Found</h3>
              <p style={{ color: "#64748b", margin: 0 }}>
                {searchTerm ? "Try a different search term" : "You haven't posted any jobs yet"}
              </p>
            </div>
          ) : (
            <div className="jobs-grid">
              {filteredJobs.map((job) => (
                <div key={job.id} className="job-card">
                  <span className={`job-status ${job.is_active ? "status-active" : "status-inactive"}`}>
                    {job.is_active ? "Active" : "Closed"}
                  </span>
                  
                  <div className="job-card-header">
                    <h3>{job.title}</h3>
                    <div className="job-location">
                      <i className="fas fa-map-marker-alt"></i>
                      {job.location || "Remote"}
                    </div>
                  </div>

                  <div className="job-details-list">
                    <div className="detail-item">
                      <span className="detail-label">Type</span>
                      <span className="detail-value">{job.job_type?.replace("_", " ") || "Full Time"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Salary</span>
                      <span className="detail-value">{job.salary_range || "Competitive"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Department</span>
                      <span className="detail-value">{job.departments?.[0] || "All"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Apply By</span>
                      <span className="detail-value" style={{ color: "#ef4444" }}>
                        {job.last_date_to_apply || "Rolling"}
                      </span>
                    </div>
                  </div>

                  {job.skills?.length > 0 && (
                    <div className="job-tags">
                      {job.skills.slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="tag">{skill}</span>
                      ))}
                      {job.skills.length > 4 && <span className="tag">+{job.skills.length - 4} more</span>}
                    </div>
                  )}

                  <div className="job-actions">
                    <button onClick={() => window.location.href='/company/applicants'} className="action-btn btn-view-apps">
                      <i className="fas fa-users"></i>
                      Apps ({job.applicants_count || 0})
                    </button>
                    <button onClick={() => handleEdit(job)} className="action-btn btn-edit-action">
                      <i className="far fa-edit"></i>
                      Edit
                    </button>
                
                    <button onClick={() => handleDelete(job.id)} className="action-btn btn-delete-action" title="Delete">
                      <i className="far fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="section-title" style={{ margin: 0 }}>Edit Position</h2>
              <button 
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#64748b" }} 
                onClick={() => setShowEditModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Job Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Job Type *</label>
                    <select name="job_type" value={formData.job_type} onChange={handleChange} className="form-select">
                      <option value="full_time">Full Time</option>
                      <option value="internship">Internship</option>
                      <option value="part_time">Part Time</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Skills</label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Salary Range</label>
                    <input
                      type="text"
                      name="salary_range"
                      value={formData.salary_range}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Last Date to Apply</label>
                    <input
                      type="date"
                      name="last_date_to_apply"
                      value={formData.last_date_to_apply}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Eligible Departments</label>
                    <input
                      type="text"
                      name="departments"
                      value={formData.departments}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Eligible Programmes</label>
                    <input
                      type="text"
                      name="programmes"
                      value={formData.programmes}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      className="form-textarea"
                    />
                  </div>
                </div>

                <div className="modal-footer" style={{ margin: "2rem -2rem -2rem", borderRadius: "0 0 20px 20px" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </>
  );
}