// src/pages/admin/AdminCompanies.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminPageLayout from "../../components/admin/AdminPageLayout";

const API_BASE = "http://localhost:8000";

export default function AdminCompanies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'approved', 'pending'
  const [formError, setFormError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  // Advanced Filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advFilters, setAdvFilters] = useState({
    name: "",
    email: "",
    date: ""
  });

  const fetchCompanies = () => {
    setLoading(true);
    axios
      .get(`${API_BASE}/admin-panel/companies/`, {
        withCredentials: true,
      })
      .then((res) => {
        setCompanies(res.data.companies || res.data || []);
      })
      .catch((err) => {
        setError("Failed to load companies");
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      await axios.post(
        `${API_BASE}/admin-panel/companies/create/`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      setShowModal(false);
      setFormData({ name: "", email: "", password: "" });
      fetchCompanies(); // Refresh list
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to create company");
    } finally {
      setFormLoading(false);
    }
  };

  // Filter companies by search and status
  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "approved" && c.is_approved) ||
      (filter === "pending" && !c.is_approved);

    // Advanced Filters
    const matchesAdvName = !advFilters.name.trim() || c.name?.toLowerCase().includes(advFilters.name.toLowerCase().trim());
    const matchesAdvEmail = !advFilters.email.trim() || c.email?.toLowerCase().includes(advFilters.email.toLowerCase().trim());
    const matchesAdvDate = !advFilters.date || new Date(c.created_at).toISOString().split('T')[0].includes(advFilters.date);

    return matchesSearch && matchesFilter && matchesAdvName && matchesAdvEmail && matchesAdvDate;
  });

  const stats = {
    total: companies.length,
    approved: companies.filter(c => c.is_approved).length,
    pending: companies.filter(c => !c.is_approved).length
  };

  return (
    <AdminPageLayout title="Companies" icon="fas fa-building">
      <style>{`
        .admin-companies-wrapper {
          min-height: 100vh;
          padding: 0;
          background: transparent;
          color: #1e293b;
        }

        .page-header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }

        .page-title {
          font-family: 'Manrope', sans-serif;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          color: #000000;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .page-title i {
          color: #10b981;
        }

        .control-bar {
          background: #ffffff;
          padding: 1rem 1.25rem;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .search-container {
          position: relative;
          flex: 1;
          max-width: 460px;
        }

        .create-btn {
          padding: 0.6rem 1.2rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: white;
          background: #6366f1;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .search-container i {
          position: absolute;
          left: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          color: #000000;
          font-size: 0.9rem;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          font-size: 0.95rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          outline: none;
          background: #f8fafc;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .search-input:focus {
          border-color: #6366f1;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.08);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .filter-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #000000;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .filter-tabs {
          display: flex;
          background: #f1f5f9;
          padding: 0.25rem;
          border-radius: 0.75rem;
          gap: 0.25rem;
        }

        .filter-tab {
          padding: 0.5rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #000000;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: transparent;
        }

        .filter-tab:hover {
          color: #1e293b;
        }

        .filter-tab.active.all {
          background: #6366f1;
          color: white;
        }

        .filter-tab.active.approved {
          background: #10b981;
          color: white;
        }

        .filter-tab.active.pending {
          background: #f59e0b;
          color: white;
        }

        .advanced-filters-btn {
          padding: 0.7rem 1.25rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.75rem;
          background: #ffffff;
          color: #000000;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          height: auto;
        }

        .advanced-filters-btn:hover {
          background: #f8fafc;
          border-color: #1e293b;
        }

        .advanced-filters-btn.active {
          background: #f0fdf4;
          color: #16a34a;
          border-color: #16a34a;
        }

        .advanced-filter-panel {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          animation: slideInDown 0.3s ease-out;
        }

        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .filter-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-input-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #000000;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .filter-input-wrapper {
          position: relative;
        }

        .filter-input-wrapper i {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.85rem;
          color: #000000;
        }

        .filter-field {
          width: 100%;
          padding: 0.65rem 1rem 0.65rem 2.25rem;
          border-radius: 0.6rem;
          border: 1.5px solid #cbd5e1;
          background: #ffffff;
          font-size: 0.85rem;
          font-weight: 500;
          color: #000000;
          outline: none;
          transition: all 0.2s;
        }

        .filter-field:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .clear-filters-btn {
          padding: 0.65rem 1rem;
          border: none;
          background: #fef2f2;
          color: #ef4444;
          font-weight: 700;
          font-size: 0.75rem;
          border-radius: 0.6rem;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          align-self: flex-end;
        }

        .clear-filters-btn:hover {
          background: #fee2e2;
          transform: translateY(-1px);
        }

        /* ─── Filter Tabs ────────────────────────────────────────── */
        .filter-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          scrollbar-width: none;
        }

        .filter-tab {
          padding: 0.6rem 1.25rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #000000;
          background: #f1f5f9;
          border-radius: 0.75rem;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          border: 1px solid transparent;
        }

        .filter-tab:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .filter-tab.active {
          background: #6366f1;
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
        }

        /* ─── Quick Stats ────────────────────────────────────────── */
        .summary-stats {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .stat-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #000000;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: 'Manrope', sans-serif;
        }

        .stat-count {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
          font-family: 'Manrope', sans-serif;
        }

        .page-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.75rem;
          font-weight: 600;
          text-align: left;
          margin-bottom: 1.5rem;
          color: #000000;
        }

        .message {
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          font-weight: 500;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .message.error {
          background: #fef2f2;
          color: #ef4444;
          border: 1px solid #fee2e2;
        }

        /* ─── Company Cards Refined ────────────────────────────── */
        .companies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.5rem;
        }

        .company-card {
          background: #ffffff;
          border-radius: 1rem;
          padding: 1.75rem;
          border: 1px solid #cbd5e1;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .company-card:hover {
          border-color: #6366f1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); /* Neutral shadow, no glow */
          transform: translateY(-2px);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .company-name {
          font-family: 'Manrope', sans-serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
          line-height: 1.5;
        }

        .card-body {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
          color: #000000;
          font-weight: 500;
        }

        .info-row i {
          width: 16px;
          color: #10b981;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.6rem;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 9999px;
          margin-top: 0.5rem;
        }

        .status-approved {
          background: #f0fdf4;
          color: #16a34a;
        }

        .status-pending {
          background: #fff7ed;
          color: #d97706;
        }

        .empty-state,
        .loading-text {
          text-align: center;
          padding: 6rem 1rem;
          color: #94a3b8;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .empty-state i {
          font-size: 4rem;
          color: #e2e8f0;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          color: #000000;
          font-weight: 600;
          margin: 0;
        }

        .empty-state p {
          max-width: 300px;
          margin: 0;
          font-size: 0.95rem;
          color: #000000;
        }

        @media (max-width: 768px) {
          .top-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .search-bar {
            max-width: 100%;
          }
        }

        /* ─── Modal Styles ────────────────────────────────────────── */
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
          padding: 1.5rem;
          animation: fadeIn 0.2s ease;
        }

        .modal-content {
          background: white;
          width: 100%;
          max-width: 500px;
          border-radius: 1.25rem;
          padding: 2.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          position: relative;
          animation: slideUp 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
          margin-bottom: 2rem;
          text-align: center;
        }

        .modal-header h2 {
          font-family: 'Manrope', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .modal-header p {
          color: #111827;
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1.5px solid #e2e8f0;
          outline: none;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .form-group input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }

        .modal-error {
          background: #fef2f2;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: 0.75rem;
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
          font-weight: 500;
          text-align: center;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .modal-actions button {
          flex: 1;
          padding: 0.75rem;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        .btn-cancel:hover {
          background: #e2e8f0;
        }

        .btn-submit {
          background: #6366f1;
          color: white;
          border: none;
        }

        .btn-submit:hover {
          background: #4f46e5;
          transform: translateY(-1px);
        }

        .btn-submit:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>

      <div className="admin-companies-wrapper">
        <div className="page-header-flex">
          <h1 className="page-title">
            <i className="fas fa-building"></i>
            Registered Companies
          </h1>
          <button
            className="create-btn"
            onClick={() => setShowModal(true)}
          >
            <i className="fas fa-plus"></i>
            Create Company
          </button>
        </div>

        <div className="summary-stats">
          <div className="stat-item">
            <div className="stat-dot" style={{ background: '#6366f1' }}></div>
            <span className="stat-label">Total</span>
            <span className="stat-count">{stats.total}</span>
          </div>
          <div className="stat-item">
            <div className="stat-dot" style={{ background: '#10b981' }}></div>
            <span className="stat-label">Approved</span>
            <span className="stat-count">{stats.approved}</span>
          </div>
          <div className="stat-item">
            <div className="stat-dot" style={{ background: '#f59e0b' }}></div>
            <span className="stat-label">Pending</span>
            <span className="stat-count">{stats.pending}</span>
          </div>
        </div>

        <div className="control-bar">
          <div className="search-container">
            <i className="fas fa-search"></i>
            <input
              className="search-input"
              type="text"
              placeholder="Quick search everything..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search companies"
            />
          </div>

          <button
            className={`advanced-filters-btn ${showAdvancedFilters ? 'active' : ''}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <i className={`fas fa-${showAdvancedFilters ? 'times' : 'sliders-h'}`}></i>
            {showAdvancedFilters ? 'Close Filters' : 'Advanced Filters'}
            {(advFilters.name || advFilters.email || advFilters.date) && (
              <span className="badge bg-success ms-1 rounded-pill">!</span>
            )}
          </button>

          <div className="filter-group">
            <span className="filter-label">Filter Status</span>
            <div className="filter-tabs">
              <button
                className={`filter-tab ${filter === 'all' ? 'active all' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-tab ${filter === 'approved' ? 'active approved' : ''}`}
                onClick={() => setFilter('approved')}
              >
                Approved
              </button>
              <button
                className={`filter-tab ${filter === 'pending' ? 'active pending' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Pending
              </button>
            </div>
          </div>
        </div>

            {showAdvancedFilters && (
              <div className="advanced-filter-panel">
                <div className="filter-input-group">
                  <label className="filter-input-label">Specific Company Name</label>
                  <div className="filter-input-wrapper">
                    <i className="fas fa-building"></i>
                    <input
                      type="text"
                      className="filter-field"
                      placeholder="e.g. Microsoft"
                      value={advFilters.name}
                      onChange={(e) => setAdvFilters({ ...advFilters, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="filter-input-group">
                  <label className="filter-input-label">Corporate Email / Domain</label>
                  <div className="filter-input-wrapper">
                    <i className="fas fa-envelope"></i>
                    <input
                      type="text"
                      className="filter-field"
                      placeholder="e.g. @google.com"
                      value={advFilters.email}
                      onChange={(e) => setAdvFilters({ ...advFilters, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="filter-input-group">
                  <label className="filter-input-label">Registration Date</label>
                  <div className="filter-input-wrapper">
                    <i className="fas fa-calendar-day"></i>
                    <input
                      type="date"
                      className="filter-field"
                      value={advFilters.date}
                      onChange={(e) => setAdvFilters({ ...advFilters, date: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  className="clear-filters-btn"
                  onClick={() => setAdvFilters({ name: "", email: "", date: "" })}
                >
                  <i className="fas fa-undo me-1"></i>
                  Reset
                </button>
              </div>
            )}
            {/* Create Company Modal */}
            {showModal && (
              <div className="modal-overlay" onClick={() => setShowModal(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Create New Company</h2>
                    <p>Register a company to the placement portal</p>
                  </div>

                  {formError && <div className="modal-error">{formError}</div>}

                  <form onSubmit={handleCreateCompany}>
                    <div className="form-group">
                      <label>Company Name</label>
                      <input
                        name="name"
                        type="text"
                        placeholder="e.g. Google India"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        name="email"
                        type="email"
                        placeholder="company@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Temporary Password</label>
                      <input
                        name="password"
                        type="password"
                        placeholder="Minimum 6 characters"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="modal-actions">
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => {
                          setShowModal(false);
                          setFormError("");
                          setFormData({ name: "", email: "", password: "" });
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-submit"
                        disabled={formLoading}
                      >
                        {formLoading ? "Creating..." : "Register Company"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="content-container">
              {error && <div className="message error">{error}</div>}

              {loading ? (
                <div className="loading-text">
                  <div className="spinner-border text-primary" role="status"></div>
                  <span>Loading registered companies...</span>
                </div>
              ) : companies.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-building-circle-exclamation"></i>
                  <h3>No Companies Registered</h3>
                  <p>Start by creating a new company profile to manage placements.</p>
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-search"></i>
                  <h3>No Matches Found</h3>
                  <p>Try adjusting your search or filters to find what you're looking for.</p>
                </div>
              ) : (
                <div className="companies-grid">
                  {filteredCompanies.map((c) => (
                    <div
                      key={c.id}
                      className="company-card"
                      onClick={() => navigate(`/admin/companies/${c.email}/jobs`, { state: { email: c.email } })}
                    >
                      <div className="card-header">
                        <h3 className="company-name">{c.name}</h3>
                        <div className={`status-badge ${c.is_approved ? "status-approved" : "status-pending"}`}>
                          {c.is_approved ? "Approved" : "Pending"}
                        </div>
                      </div>

                      <div className="card-body">
                        <div className="info-row">
                          <i className="fas fa-envelope"></i>
                          <span>{c.email}</span>
                        </div>
                        <div className="info-row">
                          <i className="fas fa-calendar-alt"></i>
                          <span>Registered on {new Date(c.created_at || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          </AdminPageLayout>
          );
}