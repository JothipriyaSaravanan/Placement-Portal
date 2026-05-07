// src/pages/coordinator/StudentsList.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8000";

export default function StudentsList() {
  const [programmes, setProgrammes] = useState([]);
  const [selectedProgramme, setSelectedProgramme] = useState("");
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [contactModal, setContactModal] = useState({ show: false, type: null, value: null, studentName: null });

  const navigate = useNavigate();
  const coordinatorUsername = localStorage.getItem("coordinatorUsername") || "";
  const department = localStorage.getItem("department") || "Department";

  const handleEmailClick = (student) => {
    setContactModal({ 
      show: true, 
      type: 'email', 
      value: student.email,
      studentName: student.name
    });
  };

  const handlePhoneClick = (student) => {
    setContactModal({ 
      show: true, 
      type: 'phone', 
      value: student.phone,
      studentName: student.name
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setContactModal({ show: false, type: null, value: null, studentName: null });
  };

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.university_reg_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredStudents.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredStudents.length / entriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const downloadCSV = () => {
    if (students.length === 0) return;
    const headers = ["Reg No", "Name", "UG/PG", "Programme", "Email", "Phone", "Year"];
    const rows = students.map(s => [
      s.university_reg_no, s.name, s.ug_pg, s.programme, s.email, s.phone, s.passed_out_year
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Students_${selectedProgramme}_${selectedBatch}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (!coordinatorUsername) {
      navigate("/coordinator/login");
      return;
    }
    fetchInitialData();
  }, [coordinatorUsername]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/coordinator/by-coordinator/${coordinatorUsername}/`
      );
      setProgrammes(res.data.programmes || []);
      setBatches(res.data.batch_years || []);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the profile service.");
    } finally {
      setLoading(false);
    }
  };

  const handleProgrammeClick = async (prog) => {
    setSelectedProgramme(prog);
    setSelectedBatch("");
    setStudents([]);
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/coordinator/by-coordinator/${coordinatorUsername}/`,
        { params: { programme: prog } }
      );
      setBatches(res.data.batch_years || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load batches for this programme.");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchClick = async (batch) => {
    setSelectedBatch(batch);
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/coordinator/by-coordinator/${coordinatorUsername}/`,
        { params: { programme: selectedProgramme, batch: batch } }
      );
      setStudents(res.data.students || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load students for this batch.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        .students-view-wrapper {
          padding: 0.5rem 2.5rem 2rem;
          max-width: 1550px;
          margin: 0 auto;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .breadcrumb-nav {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .breadcrumb-item { cursor: pointer; transition: color 0.2s; }
        .breadcrumb-item:hover { color: #7c3aed; }
        .breadcrumb-item.active { color: #475569; pointer-events: none; }

        .page-header {
          margin-bottom: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.75rem;
          gap: 2rem;
        }

        .header-main { flex: 1; }
        .header-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.6rem;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }

        .header-subtitle { color: #64748b; font-size: 0.9rem; margin-top: 4px; display: block; font-weight: 500; }

        /* ─── Global Stats Bar (Redesigned) ─── */
        .stats-bar {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .stat-card {
          position: relative;
          overflow: hidden;
          border-radius: 0;           /* Sharp Corners */
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
          color: #ffffff;
          border-bottom: 5px solid rgba(0,0,0,0.2); /* Solid bottom accent */
          box-shadow: 4px 4px 0px rgba(0,0,0,0.05);
        }

        .stat-card:hover { 
          transform: translateY(-4px); 
          box-shadow: 4px 4px 0px rgba(0,0,0,0.15); /* Hard shadow only */
        }

        .stat-card.teal { background: #059669; }
        .stat-card.blue { background: #1e3a8a; }
        .stat-card.purple { background: #4c1d95; }

        .stat-icon-wrapper {
          width: 44px;
          height: 44px;
          background: rgba(0,0,0,0.1);
          border-radius: 0; /* Sharp icon box */
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
          z-index: 2;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .stat-card.teal .stat-icon-wrapper { color: #ffffff; }
        .stat-card.blue .stat-icon-wrapper { color: #ffffff; }
        .stat-card.purple .stat-icon-wrapper { color: #ffffff; }

        .stat-info { display: flex; flex-direction: column; z-index: 2; }
        .stat-value { font-size: 2rem; font-weight: 800; line-height: 1; margin-bottom: 4px; }
        .stat-label { font-size: 0.9rem; font-weight: 600; opacity: 0.9; }

        .stat-decoration {
          position: absolute;
          right: -15px;
          bottom: -15px;
          font-size: 6rem;
          opacity: 0.15;
          transform: rotate(-15deg);
          pointer-events: none;
          z-index: 1;
        }

        .program-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.5rem;
        }

        .selection-card {
          background: #ffffff;
          border: 2.5px solid #1e293b; /* Strong professional border */
          border-radius: 0;           /* Sharp institutional corners */
          padding: 3.5rem 2rem;       /* Larger size */
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1.8rem;
          box-shadow: 8px 8px 0px rgba(30, 41, 59, 0.05); /* Architectural hard shadow */
          position: relative;
        }

        .selection-card:hover {
          background: #f8fafc;
          border-color: #0f172a;
          transform: translate(-3px, -3px);
          box-shadow: 6px 6px 0px #cbd5e1; /* Neutral grey hard shadow */
        }

        .card-icon {
          width: 60px;
          height: 60px;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1e293b;
          font-size: 1.5rem;
          transition: all 0.2s;
        }

        .selection-card:hover .card-icon { 
          background: #0f172a; 
          color: #ffffff; 
          border-color: #0f172a;
        }

        .card-info-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          width: 100%;
        }

        .card-name { 
          font-family: 'Outfit', sans-serif; 
          font-size: 1.4rem; 
          font-weight: 800; 
          color: #0f172a; 
          margin: 0; 
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .card-meta { 
          font-size: 0.8rem; 
          color: #64748b; 
          font-weight: 800; 
          text-transform: uppercase; 
          letter-spacing: 2px;
          border: 1.5px solid #e2e8f0;
          padding: 0.6rem 1.2rem;
          display: inline-block;
          margin: 0 auto;
          transition: all 0.2s;
        }

        .selection-card:hover .card-meta {
          color: #0f172a;
          border-color: #0f172a;
          background: #f1f5f9;
        }

        /* ─── Advanced Controls Header ─── */
        .controls-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          align-items: center;
          justify-content: space-between;
        }

        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          background: white;
          border: 2px solid #94a3b8; /* Consistent border */
          border-radius: 12px;
          padding: 0.6rem 1rem;
          gap: 12px;
          max-width: 400px;
        }

        .search-input { border: none; outline: none; width: 100%; font-size: 0.85rem; font-weight: 600; color: #1e293b; }
        .search-input::placeholder { color: #94a3b8; }

        .action-btn {
          background: #ffffff;
          border: 2px solid #94a3b8; /* Consistent border */
          padding: 0.6rem 1rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-btn:hover { border-color: #7c3aed; color: #7c3aed; background: #f8fafc; }

        /* ─── Table UI ─── */
        .modern-table th { 
          padding: 1.25rem 1rem; 
          font-size: 0.75rem; 
          font-weight: 800; 
          color: #64748b; 
          text-transform: uppercase; 
          letter-spacing: 1px;
          border-bottom: 1px solid #f1f5f9;
        }
        .modern-table td { padding: 1.25rem 1rem; vertical-align: middle; border-bottom: 1px solid #f1f5f9; }
        
        .user-id { font-weight: 700; color: #64748b; font-size: 0.85rem; font-family: 'Sora', sans-serif; }
        .user-name { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
        .user-email { font-size: 0.85rem; color: #94a3b8; }
        
        .tag {
          padding: 0.35rem 0.85rem;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 700;
          background: #f1f5f9;
          color: #475569;
        }

        /* ─── Loading Overlay ─── */
        .loading-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 6rem 0;
          color: #64748b;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #7c3aed;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        .error-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 80vh;
        }
        .error-card {
          background: white;
          padding: 3rem;
          border-radius: 24px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
        .error-card i { font-size: 3rem; color: #ef4444; margin-bottom: 1rem; }
        .error-card button { 
          background: #7c3aed; color: white; border: none; padding: 0.75rem 2rem; 
          border-radius: 12px; font-weight: 700; margin-top: 1.5rem; 
        }

        /* ─── Pagination & Entries ─── */
        .entries-select {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.5rem 2.5rem 0.5rem 1rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          outline: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1rem;
        }

        .pagination-wrap {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1.5rem;
          padding: 1rem 0;
          border-top: 1px solid #f1f5f9;
        }

        .page-info { font-size: 0.85rem; color: #64748b; font-weight: 600; }

        .page-buttons { display: flex; gap: 6px; }
        .page-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1.5px solid #e2e8f0;
          background: white;
          font-size: 0.85rem;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .page-btn:hover { border-color: #7c3aed; color: #7c3aed; background: #f8fafc; }
        .page-btn.active { background: #7c3aed; color: white; border-color: #7c3aed; }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ─── Table Redesign ─── */
        .table-container {
          background: white;
          padding: 0;
          border: none; /* Removed heavy border as requested */
          box-shadow: none;
          overflow: visible;
        }

        .modern-table { width: 100%; border-collapse: collapse; }
        .modern-table thead th {
          background: #5b21b6; /* Vibrant Rich Violet */
          padding: 1.25rem;
          font-size: 0.75rem;
          font-weight: 800;
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: 1.25px;
          text-align: left;
          border-bottom: 3px solid #4c1d95;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .modern-table tbody tr {
          transition: background 0.2s;
          border-bottom: 1px solid #f1f5f9;
        }

        .modern-table tbody tr:nth-child(even) {
          background: #fcfdfe; /* Subtle zebra striping */
        }

        .modern-table tbody tr:hover {
          background: #f1f5f9;
        }

        .modern-table td {
          padding: 1.25rem;
          vertical-align: middle;
        }
      `}</style>

      <div className="students-view-wrapper">
        {/* Navigation Breadcrumbs */}
        <div className="breadcrumb-nav">
          <span className="breadcrumb-item" onClick={() => { setSelectedProgramme(""); setSelectedBatch(""); }}>{department}</span>
          <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem', opacity: 0.5 }}></i>
          <span className={`breadcrumb-item ${!selectedProgramme ? 'active' : ''}`} onClick={() => { setSelectedProgramme(""); setSelectedBatch(""); }}>Programmes</span>
          {selectedProgramme && (
            <>
              <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem', opacity: 0.5 }}></i>
              <span className={`breadcrumb-item ${!selectedBatch ? 'active' : ''}`} onClick={() => setSelectedBatch("")}>
                {selectedProgramme.replace(/_/g, " ")}
              </span>
            </>
          )}
          {selectedBatch && (
            <>
              <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem', opacity: 0.5 }}></i>
              <span className="breadcrumb-item active">Batch {selectedBatch}</span>
            </>
          )}
        </div>

        {/* Page Header */}
        <div className="page-header">
          <div className="header-main">
            <h1 className="header-title">
              {!selectedProgramme ? "Departments & Programmes" : !selectedBatch ? "Batch Selection" : "Student Directory"}
            </h1>
            <span className="header-subtitle">
              Manage and explore students within the <strong>{department.replace(/_/g, ' ')}</strong> department.
            </span>
          </div>
          
          <div className="search-box d-none d-lg-flex">
            <i className="fas fa-search" style={{ color: '#94a3b8', fontSize: '0.9rem' }}></i>
            <input 
              type="text" 
              className="search-input" 
              placeholder={selectedBatch ? "Filter this list..." : "Global student search..."} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Global Stats */}
        <div className="stats-bar">
          <div className="stat-card teal">
            <div className="stat-icon-wrapper">
              <i className="fas fa-layer-group"></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">{programmes.length}</span>
              <span className="stat-label">Programmes</span>
            </div>
            <i className="fas fa-layer-group stat-decoration"></i>
          </div>
          
          <div className="stat-card blue">
            <div className="stat-icon-wrapper">
              <i className="fas fa-archive"></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">{batches.length || '-'}</span>
              <span className="stat-label">Active Batches</span>
            </div>
            <i className="fas fa-archive stat-decoration"></i>
          </div>

          <div className="stat-card purple">
            <div className="stat-icon-wrapper">
              <i className="fas fa-user-graduate"></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">{selectedBatch ? filteredStudents.length : '-'}</span>
              <span className="stat-label">Total Records</span>
            </div>
            <i className="fas fa-user-graduate stat-decoration"></i>
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p className="fw-bold">Fetching latest data...</p>
          </div>
        ) : (
          <>
            {/* 1. Programme Selection */}
            {!selectedProgramme && (
              <div className="program-grid">
                {programmes.map((prog) => (
                  <div key={prog} className="selection-card" onClick={() => handleProgrammeClick(prog)}>
                    <div className="card-icon"><i className="fas fa-graduation-cap"></i></div>
                    <div className="card-info-wrap">
                      <h3 className="card-name">{prog.replace(/_/g, " ")}</h3>
                      <span className="card-meta">View Batches</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2. Batch Selection */}
            {selectedProgramme && !selectedBatch && (
              <div className="program-grid">
                {batches.map((year) => (
                  <div key={year} className="selection-card" onClick={() => handleBatchClick(year)}>
                    <div className="card-icon"><i className="fas fa-calendar-alt"></i></div>
                    <div className="card-info-wrap">
                      <h3 className="card-name">Batch {year}</h3>
                      <span className="card-meta">Open Directory</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. Student Table */}
            {selectedProgramme && selectedBatch && (
              <>
                <div className="controls-header">
                  <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2">
                      <span className="page-info">Show</span>
                      <select 
                        className="entries-select" 
                        value={entriesPerPage}
                        onChange={(e) => {
                          setEntriesPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="page-info">Entries</span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
                      Showing <strong>{indexOfFirstEntry + 1}</strong> to <strong>{Math.min(indexOfLastEntry, filteredStudents.length)}</strong> of <strong>{filteredStudents.length}</strong>
                    </span>
                    <button className="action-btn" onClick={downloadCSV}>
                      <i className="fas fa-file-export"></i>
                      Export CSV
                    </button>
                  </div>
                </div>

                <div className="table-container">
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-users-slash mb-3" style={{ fontSize: '2.5rem', opacity: 0.2 }}></i>
                      <p className="text-muted fw-bold">No students match your search.</p>
                    </div>
                  ) : (
                    <>
                      <table className="modern-table">
                        <thead>
                          <tr>
                            <th>Registration No</th>
                            <th>Student Details</th>
                            <th>Degree</th>
                            <th>Batch</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentEntries.map((s) => (
                            <tr key={s.id || s.university_reg_no}>
                              <td><span className="user-id">{s.university_reg_no}</span></td>
                              <td>
                                <div className="d-flex flex-column">
                                  <span className="user-name">{s.name}</span>
                                  <span className="user-email">{s.email}</span>
                                </div>
                              </td>
                              <td><span className="tag">{s.ug_pg}</span></td>
                              <td><span className="tag" style={{ background: '#7c3aed', color: 'white' }}>{s.passed_out_year}</span></td>
                              <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button 
                                    className="btn btn-sm btn-light border" 
                                    title="Email Student"
                                    onClick={() => handleEmailClick(s)}
                                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                  >
                                    <i className="far fa-envelope text-primary"></i>
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-light border" 
                                    title="Call Student"
                                    onClick={() => handlePhoneClick(s)}
                                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                  >
                                    <i className="fas fa-phone-alt text-success"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Pagination Controls */}
                      <div className="pagination-wrap">
                        <span className="page-info">
                          Page {currentPage} of {totalPages || 1}
                        </span>
                        <div className="page-buttons">
                          <button 
                            className="page-btn" 
                            disabled={currentPage === 1}
                            onClick={() => paginate(currentPage - 1)}
                          >
                            <i className="fas fa-chevron-left"></i>
                          </button>
                          
                          {[...Array(totalPages)].map((_, i) => {
                            // Show max 5 page buttons
                            if (totalPages > 5) {
                              if (i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)) {
                                return (
                                  <button 
                                    key={i} 
                                    className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                    onClick={() => paginate(i + 1)}
                                  >
                                    {i + 1}
                                  </button>
                                );
                              } else if (i + 1 === currentPage - 2 || i + 1 === currentPage + 2) {
                                return <span key={i} style={{ padding: '0 4px', color: '#cbd5e1' }}>...</span>;
                              }
                              return null;
                            }
                            return (
                              <button 
                                key={i} 
                                className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                onClick={() => paginate(i + 1)}
                              >
                                {i + 1}
                              </button>
                            );
                          })}

                          <button 
                            className="page-btn" 
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => paginate(currentPage + 1)}
                          >
                            <i className="fas fa-chevron-right"></i>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* Contact Modal */}
        {contactModal.show && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }} onClick={() => setContactModal({ show: false, type: null, value: null, studentName: null })}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '2rem',
              minWidth: '320px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'slideUp 0.3s ease-out'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, marginBottom: '0.5rem', color: '#1e293b', fontSize: '1.1rem', fontWeight: 700 }}>
                  {contactModal.studentName}
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                  {contactModal.type === 'email' ? 'Email Address' : 'Phone Number'}
                </p>
              </div>

              <div style={{
                backgroundColor: '#f8fafc',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem',
                wordBreak: 'break-all',
                fontWeight: 600,
                color: '#1e293b',
                fontSize: '0.95rem'
              }}>
                {contactModal.value || 'Not available'}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => copyToClipboard(contactModal.value)}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    backgroundColor: '#7c3aed',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#6d28d9'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#7c3aed'}
                >
                  <i className="fas fa-copy"></i> Copy
                </button>
                <button
                  onClick={() => setContactModal({ show: false, type: null, value: null, studentName: null })}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#e2e8f0';
                    e.target.style.color = '#475569';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#f1f5f9';
                    e.target.style.color = '#64748b';
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            <style>{`
              @keyframes slideUp {
                from {
                  transform: translateY(20px);
                  opacity: 0;
                }
                to {
                  transform: translateY(0);
                  opacity: 1;
                }
              }
            `}</style>
          </div>
        )}
      </div>
    </>
  );
}