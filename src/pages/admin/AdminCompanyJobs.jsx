import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import AdminPageLayout from "../../components/admin/AdminPageLayout";

const API_BASE = "http://127.0.0.1:8000"; // adjust if needed

export default function AdminCompanyJobs() {
  const navigate = useNavigate();
  const location = useLocation();
  const companyEmail = location.state?.email;

  const [companyName, setCompanyName] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Basic Search
  const [search, setSearch] = useState("");
  
  // Advanced Filters
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  useEffect(() => {
    if (!companyEmail) {
      setError("No company email provided");
      setLoading(false);
      return;
    }

    axios
      .get(`${API_BASE}/companies/jobs/by-company/?email=${companyEmail}`, {
        withCredentials: true,
      })
      .then((res) => {
        setCompanyName(res.data.company_name || "Company Jobs");
        setJobs(res.data.jobs || []);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load jobs");
      })
      .finally(() => setLoading(false));
  }, [companyEmail]);

  // Derive unique departments and job types for filters
  const uniqueDepts = useMemo(() => {
    const set = new Set();
    jobs.forEach(j => {
      if (Array.isArray(j.departments)) {
        j.departments.forEach(d => set.add(d));
      }
    });
    return Array.from(set).sort();
  }, [jobs]);

  const uniqueJobTypes = useMemo(() => {
    const set = new Set(jobs.map(j => j.job_type).filter(Boolean));
    return Array.from(set).sort();
  }, [jobs]);

  // Main Filtering Logic
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const q = search.toLowerCase();
      const matchesSearch = 
        job.title?.toLowerCase().includes(q) ||
        job.job_type?.toLowerCase().includes(q);
      
      const matchesType = jobTypeFilter === "all" || job.job_type === jobTypeFilter;
      const matchesDept = deptFilter === "all" || (Array.isArray(job.departments) && job.departments.includes(deptFilter));

      return matchesSearch && matchesType && matchesDept;
    });
  }, [jobs, search, jobTypeFilter, deptFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredJobs.length / entriesPerPage);
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredJobs.slice(start, start + entriesPerPage);
  }, [filteredJobs, currentPage, entriesPerPage]);

  useEffect(() => {
    setCurrentPage(1); // Reset page on filter change
  }, [search, jobTypeFilter, deptFilter, entriesPerPage]);

  // Quick Stats
  const activeJobs = filteredJobs.filter(j => !j.last_date_to_apply || new Date(j.last_date_to_apply) >= new Date()).length;

  return (
    <AdminPageLayout title={`Registry: ${companyName}`} icon="fas fa-briefcase">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        .admin-jobs-root {
          font-family: 'Inter', sans-serif;
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem 2rem 4rem;
          color: #1e293b;
        }

        /* --- Header Section --- */
        .professional-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
          background: white;
          padding: 2.5rem 3rem;
          border-radius: 4px;
          border: 1px solid #d1d5db;
          border-left: 8px solid #c5a059;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }

        .header-main h1 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.8rem;
          font-weight: 800;
          color: #002147;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: -0.01em;
        }

        .header-main p {
          margin: 0.5rem 0 0;
          font-size: 0.95rem;
          color: #64748b;
          font-weight: 500;
        }

        .btn-back {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.7rem 1.4rem;
          background: #002147;
          color: white;
          border-radius: 4px;
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-decoration: none;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }

        .btn-back:hover {
          background: #1e293b;
          transform: translateX(-3px);
        }

        /* --- Stats Row --- */
        .stats-dashboard {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-banner {
          background: white;
          border: 1px solid #d1d5db;
          padding: 1.5rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          transition: border-color 0.2s;
        }

        .stat-banner:hover { border-color: #c5a059; }

        .stat-icon {
          width: 48px;
          height: 48px;
          background: #f1f5f9;
          color: #002147;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }

        .stat-data .val {
          display: block;
          font-family: 'Outfit', sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: #002147;
          line-height: 1.1;
        }

        .stat-data .lab {
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* --- Search & Filter Bar --- */
        .control-row {
          background: white;
          padding: 1.5rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
          align-items: center;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .search-group {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-group i {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .registry-input {
          width: 100%;
          padding: 0.8rem 1rem 0.8rem 2.8rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.2s;
          background: #fdfdfd;
        }

        .registry-input:focus {
          border-color: #002147;
          background: white;
          box-shadow: 0 0 0 3px rgba(0, 33, 71, 0.05);
        }

        .filter-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .btn-filter-toggle {
          padding: 0.75rem 1.2rem;
          background: #f8fafc;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          color: #1e293b;
          font-weight: 700;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }

        .btn-filter-toggle:hover { background: #f1f5f9; border-color: #002147; }
        .btn-filter-toggle.active { background: #002147; color: white; border-color: #002147; }

        .entries-select-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
        }

        .registry-select {
          padding: 0.6rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
          font-weight: 700;
          color: #1e293b;
          cursor: pointer;
          outline: none;
        }

        /* --- Advanced Filter Panel --- */
        .advanced-panel {
          background: #f8fafc;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 1.5rem 2rem;
          margin-bottom: 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .filter-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-item label {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 0.05em;
        }

        /* --- Jobs Grid --- */
        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 2rem;
        }

        .job-card {
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 2rem;
          position: relative;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .job-card:hover {
          border-color: #002147;
          transform: translateY(-4px);
          box-shadow: 0 12px 20px -10px rgba(0, 33, 71, 0.15);
        }

        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .job-card h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: #002147;
          margin: 0;
          max-width: 75%;
          line-height: 1.25;
        }

        .type-badge {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          padding: 0.3rem 0.6rem;
          border-radius: 2px;
          background: #f1f5f9;
          color: #475569;
          letter-spacing: 0.05em;
          border: 1px solid #e2e8f0;
        }

        .job-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
          color: #475569;
          font-weight: 500;
        }

        .detail-row i {
          width: 16px;
          color: #c5a059;
          font-size: 1rem;
        }

        .detail-row .tag {
          background: #fbf8f1;
          color: #b08d48;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .job-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.25rem;
          border-top: 1px solid #f1f5f9;
        }

        .deadline-tag {
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .deadline-tag.urgent { color: #ef4444; }

        .btn-view-apps {
          font-size: 0.75rem;
          font-weight: 800;
          color: #002147;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .btn-view-apps:hover { color: #c5a059; }

        /* --- Pagination --- */
        .pagination-area {
          margin-top: 3rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 2rem;
          border-top: 1px solid #d1d5db;
        }

        .page-info { font-size: 0.85rem; color: #64748b; font-weight: 500; }

        .page-controls { display: flex; gap: 0.4rem; }

        .page-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 700;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .page-btn:hover:not(:disabled) { border-color: #002147; color: #002147; }
        .page-btn.active { background: #002147; color: white; border-color: #002147; }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .empty-state {
          text-align: center;
          padding: 6rem 2rem;
          background: white;
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          color: #64748b;
        }

        .empty-state i { font-size: 3rem; margin-bottom: 1rem; color: #cbd5e1; }
      `}</style>

      <div className="admin-jobs-root">
        {/* --- HEADER --- */}
        <header className="professional-header">
          <div className="header-main">
            <h1>Jobs Archive: {companyName}</h1>
            <p>University Placement Management & Occupational Registry</p>
          </div>
          <button className="btn-back" onClick={() => navigate("/admin/companies")}>
            <i className="fas fa-arrow-left"></i>
            Exit to Directory
          </button>
        </header>

        {/* --- STATS --- */}
        <section className="stats-dashboard">
          <div className="stat-banner">
            <div className="stat-icon"><i className="fas fa-briefcase"></i></div>
            <div className="stat-data">
              <span className="val">{jobs.length}</span>
              <span className="lab">Total Posted</span>
            </div>
          </div>
          <div className="stat-banner">
            <div className="stat-icon" style={{color: '#10b981'}}><i className="fas fa-check-circle"></i></div>
            <div className="stat-data">
              <span className="val">{activeJobs}</span>
              <span className="lab">Active Roles</span>
            </div>
          </div>
          <div className="stat-banner">
            <div className="stat-icon" style={{color: '#c5a059'}}><i className="fas fa-university"></i></div>
            <div className="stat-data">
              <span className="val">{uniqueDepts.length}</span>
              <span className="lab">Target Departments</span>
            </div>
          </div>
        </section>

        {/* --- CONTROLS --- */}
        <div className="control-row">
          <div className="search-group">
            <i className="fas fa-search"></i>
            <input 
              className="registry-input"
              type="text" 
              placeholder="Search by job title or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-actions">
            <button 
              className={`btn-filter-toggle ${showAdvanced ? "active" : ""}`}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <i className={`fas fa-${showAdvanced ? "times" : "sliders-h"}`}></i>
              {showAdvanced ? "Close Filters" : "Advanced Filters"}
            </button>

            <div className="entries-select-group">
              <span>Show</span>
              <select 
                className="registry-select"
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              >
                <option value={5}>5 Roles</option>
                <option value={10}>10 Roles</option>
                <option value={20}>20 Roles</option>
                <option value={50}>50 Roles</option>
                <option value={10000}>Show All</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- ADVANCED PANEL --- */}
        {showAdvanced && (
          <div className="advanced-panel">
            <div className="filter-item">
              <label>Occupation Type</label>
              <select className="registry-select" value={jobTypeFilter} onChange={(e) => setJobTypeFilter(e.target.value)}>
                <option value="all">All Types</option>
                {uniqueJobTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="filter-item">
              <label>Academic Department</label>
              <select className="registry-select" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                <option value="all">Global Access (All)</option>
                {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="filter-item" style={{justifyContent: 'flex-end', alignItems: 'flex-end'}}>
              <button 
                className="btn-back" 
                style={{background: '#f1f5f9', color: '#475569', fontSize: '0.7rem'}}
                onClick={() => { setJobTypeFilter("all"); setDeptFilter("all"); setSearch(""); }}
              >
                Reset System Filters
              </button>
            </div>
          </div>
        )}

        {/* --- CONTENT --- */}
        <main className="content-container">
          {error && <div className="message error">{error}</div>}

          {loading ? (
            <div style={{textAlign: 'center', padding: '4rem'}}>
              <div className="spinner-border text-primary"></div>
              <p style={{marginTop: '1rem', color: '#64748b', fontWeight: 600}}>Accessing Secure Archives...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-folder-open"></i>
              <h3>No Records Found</h3>
              <p>This recruiter has not initialized any placement opportunities yet.</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-search"></i>
              <h3>Refine Your Query</h3>
              <p>Adjust your parameters to locate specific institutional roles.</p>
            </div>
          ) : (
            <>
              <div className="jobs-grid">
                {paginatedJobs.map((job) => {
                  const isExpired = job.last_date_to_apply && new Date(job.last_date_to_apply) < new Date();
                  return (
                    <div
                      key={job.id}
                      className="job-card"
                      onClick={() =>
                        navigate("/admin/job-applicants", {
                          state: {
                            jobId: job.id,
                            companyEmail: companyEmail,
                            jobTitle: job.title,
                          },
                        })
                      }
                    >
                      <div className="job-header">
                        <h3>{job.title}</h3>
                        <span className="type-badge">{job.job_type || "N/A"}</span>
                      </div>

                      <div className="job-details">
                        <div className="detail-row">
                          <i className="fas fa-building"></i>
                          <span>{companyName}</span>
                        </div>
                        <div className="detail-row">
                          <i className="fas fa-graduation-cap"></i>
                          <span className="tag">{job.departments?.join(", ") || "Open Registry"}</span>
                        </div>
                      </div>

                      <div className="job-footer">
                        <div className={`deadline-tag ${isExpired ? "urgent" : ""}`}>
                          <i className="far fa-calendar-alt"></i>
                          {job.last_date_to_apply
                            ? `Closes ${new Date(job.last_date_to_apply).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}`
                            : "Perpetual Listing"}
                        </div>
                        <button className="btn-view-apps">
                          Track Candidates <i className="fas fa-chevron-right"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* --- PAGINATION --- */}
              {totalPages > 1 && (
                <div className="pagination-area">
                  <div className="page-info">
                    Showing {(currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, filteredJobs.length)} of {filteredJobs.length} listings
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
        </main>
      </div>
    </AdminPageLayout>
  );
}