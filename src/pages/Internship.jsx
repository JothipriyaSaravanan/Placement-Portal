
import React, { useEffect, useState, useMemo } from "react";

const initialFormState = {
  domain: "",
  company: "",
  start_date: "",
  end_date: "",
  description: "",
};

const Internship = () => {
  const [internships, setInternships] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [activeId, setActiveId] = useState(null);
  const [form, setForm] = useState(initialFormState);
  
  // New features: Search, Pagination, Show Entries
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const email = localStorage.getItem("studentEmail");

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  const loadInternships = async () => {
    if (!email) {
      setError("No email found. Please login again.");
      return;
    }

    setLoadingList(true);
    setError(null);

    try {
      const res = await fetch(
        `http://localhost:8000/api/students/internship/list/?email=${email}`
      );

      if (!res.ok) throw new Error("Failed to load internships");
      const data = await res.json();
      setInternships(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Internship load error:", err);
      setError("Could not load internships.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadInternships();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setModalMode("add");
    setActiveId(null);
    setForm(initialFormState);
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (intern) => {
    setModalMode("edit");
    setActiveId(intern.id);
    setForm({
      domain: intern.domain || "",
      company: intern.company || "",
      start_date: intern.start_date || "",
      end_date: intern.end_date || "",
      description: intern.description || "",
    });
    setError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setShowModal(false);
    setForm(initialFormState);
    setActiveId(null);
  };

  const submitModal = async () => {
    if (!form.domain.trim() || !form.company.trim() || !form.start_date) {
      setError("Domain, company, and start date are required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      domain: form.domain.trim(),
      company: form.company.trim(),
      start_date: form.start_date,
      end_date: form.end_date || null,
      description: form.description.trim(),
    };

    const url =
      modalMode === "add"
        ? "http://localhost:8000/api/students/internship/add/"
        : `http://localhost:8000/api/students/internship/edit/${activeId}/`;

    const body =
      modalMode === "add"
        ? JSON.stringify({ email, ...payload })
        : JSON.stringify(payload);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!res.ok) {
        throw new Error(modalMode === "add" ? "Add failed" : "Update failed");
      }

      closeModal();
      await loadInternships();
    } catch (err) {
      setError(modalMode === "add" ? "Failed to add internship." : "Failed to update internship.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteInternship = async (id) => {
    if (!window.confirm("Delete this internship record?")) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `http://localhost:8000/api/students/internship/delete/${id}/`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Delete failed");
      await loadInternships();
    } catch (err) {
      setError("Could not delete internship.");
    } finally {
      setSubmitting(false);
    }
  };

  // Memoized Filtered & Paginated Internships
  const filteredData = useMemo(() => {
    return internships.filter(item => 
      `${item.domain} ${item.company} ${item.description}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [internships, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / (entriesPerPage === "All" ? filteredData.length : entriesPerPage));
  const currentEntries = useMemo(() => {
    if (entriesPerPage === "All") return filteredData;
    const start = (currentPage - 1) * entriesPerPage;
    return filteredData.slice(start, start + Number(entriesPerPage));
  }, [filteredData, currentPage, entriesPerPage]);

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  return (
    <div className="internship-module">
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />

      <style>{`
        .internship-module {
          font-family: 'Outfit', sans-serif;
          color: #0e7490;
          padding: 2.5rem;
          background: #f8fafc;
          min-height: 100vh;
        }

        .module-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2.5rem;
          gap: 2rem;
        }

        .header-left h1 {
          font-size: 2.25rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.025em;
        }

        .header-left p {
          color: #64748b;
          font-size: 1.1rem;
          margin-top: 0.5rem;
        }

        .btn-add {
          background: #0e7490;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-weight: 600;
          border: none;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          transition: all 0.2s;
          box-shadow: 0 4px 6px -1px rgba(14, 116, 144, 0.3);
        }

        .btn-add:hover {
          background: #0d5d73;
          transform: translateY(-1px);
        }

        /* Filter & Controls */
        .controls-card {
          background: white;
          padding: 1.25rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .search-box {
          position: relative;
          flex: 1;
          max-width: 450px;
        }

        .search-box i {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .search-box input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          outline: none;
          transition: border-color 0.2s;
        }

        .search-box input:focus {
          border-color: #1e1b4b;
          background: white;
        }

        .entries-control {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #64748b;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .entries-control select {
          padding: 0.5rem 2rem 0.5rem 0.75rem;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
        }

        /* Grid */
        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.75rem;
        }

        .intern-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .intern-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.1);
          border-color: #cbd5e1;
        }

        .card-category {
          font-size: 0.75rem;
          font-weight: 700;
          color: #0e7490;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: #ccf7f7;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          width: fit-content;
          margin-bottom: 1rem;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .card-company {
          font-size: 1rem;
          font-weight: 600;
          color: #475569;
          margin: 0.25rem 0 1rem;
        }

        .card-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 1.25rem;
        }

        .card-meta i {
          color: #1e1b4b;
        }

        .card-description {
          font-size: 0.95rem;
          line-height: 1.6;
          color: #334155;
          margin-bottom: 1.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex-grow: 1;
        }

        .card-actions {
          display: flex;
          gap: 0.75rem;
          padding-top: 1.25rem;
          border-top: 1px solid #f1f5f9;
        }

        .btn-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #64748b;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .btn-icon.delete:hover {
          background: #fef2f2;
          border-color: #fecaca;
          color: #ef4444;
        }

        /* Pagination */
        .pagination-footer {
          margin-top: 3rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }

        .page-info {
          font-size: 0.9rem;
          color: #64748b;
        }

        .page-nav {
          display: flex;
          gap: 0.5rem;
        }

        .nav-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: white;
          font-weight: 600;
          color: #475569;
          transition: all 0.2s;
        }

        .nav-btn:hover:not(:disabled) {
          border-color: #0e7490;
          color: #0e7490;
        }

        .nav-btn.active {
          background: #0e7490;
          color: white;
          border-color: #0e7490;
        }

        .nav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Modal styling */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1.5rem;
        }

        .modal-container {
          background: white;
          width: 100%;
          max-width: 650px;
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        .modal-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .modal-body {
          padding: 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group.full {
          grid-column: 1 / -1;
        }

        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #475569;
        }

        .form-group input, .form-group textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          outline: none;
        }

        .form-group input:focus, .form-group textarea:focus {
          border-color: #0e7490;
          box-shadow: 0 0 0 4px rgba(14, 116, 144, 0.1);
        }

        .modal-footer {
          padding: 1.5rem 2rem;
          background: #f8fafc;
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }

        .btn-cancel {
          background: white;
          border: 1px solid #cbd5e1;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
        }

        .btn-submit {
          background: #0e7490;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .btn-submit:hover {
          background: #0d5d73;
        }

        .empty-state {
          grid-column: 1 / -1;
          padding: 4rem;
          text-align: center;
          background: white;
          border: 2px dashed #e2e8f0;
          border-radius: 12px;
        }

        @media (max-width: 768px) {
          .internship-module { padding: 1.5rem 1rem; }
          .module-header { flex-direction: column; align-items: stretch; }
          .controls-card { flex-direction: column; align-items: stretch; }
          .modal-body { grid-template-columns: 1fr; }
        }
      `}</style>

      <header className="module-header">
        <div className="header-left">
          <h1>My Internships</h1>
          <p>Document and manage your professional internship experiences.</p>
        </div>
        <button className="btn-add" onClick={openAddModal}>
          <i className="bi bi-plus-lg"></i>
          Add Experience
        </button>
      </header>

      <div className="controls-card">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input 
            type="text" 
            placeholder="Search by role, company or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="entries-control">
          <span>Show</span>
          <select 
            value={entriesPerPage} 
            onChange={(e) => {
              setEntriesPerPage(e.target.value === "All" ? "All" : Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5 entries</option>
            <option value={10}>10 entries</option>
            <option value={25}>25 entries</option>
            <option value="All">All</option>
          </select>
        </div>
      </div>

      <div className="items-grid">
        {loadingList ? (
          <div className="empty-state">Loading your records...</div>
        ) : currentEntries.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-journal-x" style={{ fontSize: '3rem', color: '#cbd5e1' }}></i>
            <h3 style={{ marginTop: '1rem' }}>No internship records found</h3>
            <p>Start by adding your first internship experience to showcase your career growth.</p>
          </div>
        ) : (
          currentEntries.map((intern) => (
            <div key={intern.id} className="intern-card">
              <div className="card-category">Internship</div>
              <h3 className="card-title">{intern.domain}</h3>
              <p className="card-company">{intern.company}</p>
              
              <div className="card-meta">
                <span><i className="bi bi-calendar3 me-2"></i> {intern.start_date} — {intern.end_date || "Present"}</span>
              </div>

              {intern.description && (
                <p className="card-description">{intern.description}</p>
              )}

              <div className="card-actions">
                <button 
                  className="btn-icon" 
                  onClick={() => openEditModal(intern)}
                  title="Edit Record"
                >
                  <i className="bi bi-pencil"></i>
                </button>
                <button 
                  className="btn-icon delete" 
                  onClick={() => deleteInternship(intern.id)}
                  title="Delete Record"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {entriesPerPage !== "All" && totalPages > 1 && (
        <footer className="pagination-footer">
          <div className="page-info">
            Showing <span>{Math.min((currentPage - 1) * entriesPerPage + 1, filteredData.length)}</span> to <span>{Math.min(currentPage * entriesPerPage, filteredData.length)}</span> of <span>{filteredData.length}</span> experiences
          </div>
          <nav className="page-nav">
            <button 
              className="nav-btn" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i + 1}
                className={`nav-btn ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}

            <button 
              className="nav-btn" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </nav>
        </footer>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{modalMode === "add" ? "Add New Experience" : "Edit Experience"}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Domain / Role *</label>
                <input 
                  type="text" 
                  name="domain" 
                  value={form.domain} 
                  onChange={handleChange} 
                  placeholder="e.g. Full Stack Developer"
                />
              </div>
              <div className="form-group">
                <label>Company *</label>
                <input 
                  type="text" 
                  name="company" 
                  value={form.company} 
                  onChange={handleChange} 
                  placeholder="Organization or Startup name"
                />
              </div>
              <div className="form-group">
                <label>Start date *</label>
                <input type="date" name="start_date" value={form.start_date} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>End date (Optional)</label>
                <input type="date" name="end_date" value={form.end_date} onChange={handleChange} />
              </div>
              <div className="form-group full">
                <label>Description (Optional)</label>
                <textarea 
                  name="description" 
                  value={form.description} 
                  onChange={handleChange} 
                  rows="4"
                  placeholder="Describe your key achievements, technologies used, and responsibilities."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="btn-submit" onClick={submitModal} disabled={submitting}>
                {submitting ? "Processing..." : modalMode === "add" ? "Save Experience" : "Update Experience"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Internship;
