// src/pages/admin/StudentsByCoordinator.jsx
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AdminPageLayout from "../../components/admin/AdminPageLayout";

export default function StudentsByCoordinator() {
  const { coordinatorId } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [coordinator, setCoordinator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Advanced Filter States
  const [regNoSearch, setRegNoSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [selectedProgramme, setSelectedProgramme] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const [batchYears, setBatchYears] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchSearch, setBatchSearch] = useState("");

  // New Search Filters
  const [phoneSearch, setPhoneSearch] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const [selectedGender, setSelectedGender] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Batch Pagination
  const [batchCurrentPage, setBatchCurrentPage] = useState(1);
  const batchItemsPerPage = 8;

  // Load batch years first
  useEffect(() => {
    if (!coordinatorId) return;

    setLoading(true);
    setError("");

    axios
      .get(
        `http://localhost:8000/admin-panel/students/by-coordinator/${coordinatorId}/`,
        { withCredentials: true }
      )
      .then((res) => {
        if (res.data.batch_years) {
          const validYears = res.data.batch_years.filter(
            (year) => year && year.toString().trim() !== ""
          );
          setBatchYears(validYears);
        }
        setCoordinator(res.data.coordinator || null);
      })
      .catch(() => {
        setError("Failed to load batch years");
      })
      .finally(() => setLoading(false));
  }, [coordinatorId]);

  // Load students when batch selected
  const loadStudentsByBatch = (year) => {
    setSelectedBatch(year);
    setLoading(true);
    setError("");
    setRegNoSearch("");
    setNameSearch("");
    setPhoneSearch("");
    setEmailSearch("");
    setSelectedGender("all");
    setSelectedProgramme("all");
    setSelectedLevel("all");

    axios
      .get(
        `http://localhost:8000/admin-panel/students/by-coordinator/${coordinatorId}/?batch=${year}`,
        { withCredentials: true }
      )
      .then((res) => {
        const studentList = res.data.students || [];
        setStudents(studentList);
      })
      .catch(() => {
        setError("Failed to load students");
      })
      .finally(() => setLoading(false));
  };

  // Advanced Filtering Logic
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesRegNo = (student.university_reg_no || "").toLowerCase().includes(regNoSearch.toLowerCase().trim());
      const matchesName = (student.name || "").toLowerCase().includes(nameSearch.toLowerCase().trim());
      const matchesPhone = (student.phone || "").toLowerCase().includes(phoneSearch.toLowerCase().trim());
      const matchesEmail = (student.email || "").toLowerCase().includes(emailSearch.toLowerCase().trim());
      const matchesGender = selectedGender === "all" || student.gender === selectedGender;
      const matchesProgramme = selectedProgramme === "all" || student.programme === selectedProgramme;
      const matchesLevel = selectedLevel === "all" || student.ug_pg === selectedLevel;
      
      return matchesRegNo && matchesName && matchesPhone && matchesEmail && matchesGender && matchesProgramme && matchesLevel;
    });
  }, [students, regNoSearch, nameSearch, phoneSearch, emailSearch, selectedGender, selectedProgramme, selectedLevel]);

  // Derived Values for UI
  const programmes = useMemo(() => {
    const list = students.map(s => s.programme).filter(Boolean);
    return [...new Set(list)];
  }, [students]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [regNoSearch, nameSearch, phoneSearch, emailSearch, selectedGender, selectedProgramme, selectedLevel, itemsPerPage]);

  useEffect(() => {
    setBatchCurrentPage(1);
  }, [batchSearch]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = itemsPerPage === 'all' 
    ? filteredStudents 
    : filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(filteredStudents.length / itemsPerPage);

  const filteredBatches = useMemo(() => {
    return batchYears.filter((year) =>
      year.toString().toLowerCase().includes(batchSearch.toLowerCase())
    );
  }, [batchYears, batchSearch]);

  const totalBatchPages = Math.ceil(filteredBatches.length / batchItemsPerPage);
  const currentBatches = filteredBatches.slice(
    (batchCurrentPage - 1) * batchItemsPerPage,
    batchCurrentPage * batchItemsPerPage
  );

  return (
    <AdminPageLayout title={selectedBatch ? `Batch ${selectedBatch} - ${coordinator?.department || ""}` : `Students Registry`} icon="fas fa-user-graduate">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;700;800&display=swap');

        .students-view-container {
          padding: 1rem 0 4rem;
          animation: fadeIn 0.5s ease-out;
          max-width: 1200px;
          margin: 0 auto;
          font-family: 'Inter', sans-serif;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ─── Compact Stats Dashboard ────────────────────────────────────────── */
        .stats-dashboard {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .stat-card-mini {
          padding: 1.25rem 1.5rem;
          border-radius: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-height: 90px;
          transition: all 0.3s ease;
          border: none;
          position: relative;
          overflow: hidden;
          color: #ffffff;
        }

        .stat-card-mini:hover {
          transform: translateY(-5px);
        }

        .stat-card-mini.card-1 { 
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        }
        .stat-card-mini.card-2 { 
          background: linear-gradient(135deg, #10b981 0%, #047857 100%);
        }
        .stat-card-mini.card-3 { 
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .stat-icon-floating {
          position: absolute;
          bottom: -10px;
          right: -5px;
          font-size: 3.5rem;
          opacity: 0.15;
          transform: rotate(-10deg);
          color: #ffffff;
          transition: all 0.5s ease;
        }

        .stat-card-mini:hover .stat-icon-floating {
          transform: rotate(0deg) scale(1.05);
          opacity: 0.25;
        }

        .stat-content h4 {
          margin: 0;
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 800;
          opacity: 1;
        }

        .stat-content p {
          margin: 0.25rem 0 0;
          font-family: 'Outfit', sans-serif;
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .stat-footer-text {
          margin-top: 0.25rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          opacity: 0.95;
          z-index: 1;
          letter-spacing: 0.05em;
        }

        .header-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .nav-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
        }

        .back-link-p {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          color: #0369a1;
          font-weight: 600;
          text-decoration: none;
          background: transparent;
          padding: 0.65rem 1.1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid #e2e8f0;
          font-size: 0.85rem;
          text-transform: uppercase;
        }

        .back-link-p:hover {
          border-color: #0369a1;
          background: #f0f9ff;
        }

        .search-premium {
          flex: 1;
          max-width: 450px;
          position: relative;
        }

        .search-premium input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.95rem;
          outline: none;
          font-weight: 500;
          background: #f1f5f9;
          color: #000000;
          transition: all 0.2s;
        }

        .search-premium input:focus {
          border-color: #0369a1;
          background: transparent;
        }

        .search-premium i {
          position: absolute;
          left: 1.4rem;
          top: 50%;
          transform: translateY(-50%);
          color: #0369a1;
          font-size: 1rem;
        }

        /* ─── Batch Table Design ────────────────────────────────────────── */
        .batch-table-header {
          display: grid;
          grid-template-columns: 1fr 1fr 120px;
          padding: 1.25rem 2rem;
          background: #0369a1;
          color: #ffffff;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          margin-bottom: 0px;
          border-radius: 0;
        }

        .batch-list-p {
          display: flex;
          flex-direction: column;
          background: transparent;
        }

        .batch-row-p {
          background: transparent;
          padding: 1.25rem 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr 120px;
          align-items: center;
          transition: all 0.2s ease;
          position: relative;
          border-bottom: 1px solid #e2e8f0;
          cursor: pointer;
        }

        .batch-row-p:nth-child(even) {
          background: #f1f5f9;
        }

        .batch-row-p:hover {
          background: #e0f2fe !important;
          transform: scale(1.002);
        }

        .batch-info h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: #000000;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .batch-tag-p {
          display: inline-flex;
          padding: 0.3rem 0.75rem;
          background: #f0f9ff;
          color: #0369a1;
          border-radius: 0.4rem;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          border: 1px solid #bae6fd;
        }

        .explore-btn {
          background: #0369a1;
          color: #ffffff;
          border: none;
          padding: 0.5rem 1.25rem;
          border-radius: 0.4rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
        }

        .explore-btn:hover {
          background: #075985;
          transform: scale(1.05);
        }

        /* ─── Pagination Toolbar ────────────────────────────────────────── */
        .pagination-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1rem 1.5rem;
          background: transparent;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
        }

        .show-entries {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.85rem;
          color: #000000;
          font-weight: 600;
        }

        .show-entries select {
          padding: 0.45rem 0.75rem;
          border-radius: 0.4rem;
          border: 1px solid #e2e8f0;
          outline: none;
          font-weight: 700;
          color: #000000;
          cursor: pointer;
          background: transparent;
        }

        .pagination-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pagination-btn {
          width: 38px;
          height: 38px;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          background: transparent;
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pagination-btn:hover {
          background: #f0f9ff;
          color: #0369a1;
          transform: translateY(-1px);
        }

        .pagination-btn.active {
          background: #0369a1;
          color: #ffffff;
          border-color: #0369a1;
        }

        .pagination-btn.disabled {
          opacity: 0.4;
          cursor: not-allowed;
          pointer-events: none;
        }

        /* ─── Student Table Design ────────────────────────────────────────── */
        .table-card {
          background: transparent;
          border: none;
          border-radius: 0;
          overflow: hidden;
        }

        .students-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.95rem;
        }

        .students-table th {
          background: #0369a1;
          color: #ffffff;
          text-align: left;
          padding: 1.25rem 1.5rem;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          border-bottom: 2px solid rgba(255,255,255,0.1);
        }

        .students-table td {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          color: #000000;
          font-weight: 500;
        }

        .students-table tr:nth-child(even) {
          background: #f1f5f9;
        }

        .students-table tr:hover td {
          background: #e0f2fe;
        }

        .badge-ugpg {
          padding: 0.3rem 0.75rem;
          background: #f0f9ff;
          color: #0369a1;
          border-radius: 0.4rem;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          border: 1px solid #bae6fd;
        }

        .empty-p {
          text-align: center;
          padding: 5rem 2rem;
          color: #000000;
          font-weight: 600;
          font-size: 1rem;
        }

        .loading-p {
          text-align: center;
          padding: 5rem;
          font-weight: 700;
          color: #0369a1;
          font-size: 1.5rem;
          font-family: 'Outfit', sans-serif;
        }

        /* Advanced Filter Panel */
        .premium-filter-panel {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          padding: 1.5rem;
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

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #000000;
          letter-spacing: 0.05em;
        }

        .filter-group input, .filter-group select {
          padding: 0.65rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          outline: none;
          font-weight: 600;
          background: transparent;
          font-size: 0.85rem;
          color: #000000;
          transition: all 0.2s;
        }

        .filter-group input:focus, .filter-group select:focus {
          border-color: #0369a1;
          box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.1);
        }

        /* Premium Empty State */
        .premium-empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 1.5rem;
          margin: 2rem 0;
          animation: fadeIn 0.6s ease-out;
        }

        .empty-icon-wrapper {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: #0369a1;
          font-size: 2.5rem;
          box-shadow: 0 10px 20px rgba(3, 105, 161, 0.05);
        }

        .premium-empty-state h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }

        .premium-empty-state p {
          color: #64748b;
          max-width: 400px;
          margin: 0 auto 2rem;
          line-height: 1.6;
        }

        .empty-action-btn {
          background: #0369a1;
          color: #ffffff;
          border: none;
          padding: 0.8rem 2rem;
          border-radius: 0.75rem;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
        }

        .empty-action-btn:hover {
          background: #075985;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(3, 105, 161, 0.2);
        }

        /* Multi-column filter layout */
        .filter-grid-premium {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1.25rem;
          background: #ffffff;
          border: 1.5px solid #000000;
          padding: 1.5rem;
          border-radius: 1rem;
          margin-bottom: 2rem;
        }
      `}</style>

      <div className="students-view-container">
        {/* Improved Dashboard Stats */}
        <div className="stats-dashboard">
          <div className="stat-card-mini card-1" style={{cursor: 'default'}}>
            <div className="stat-icon-floating"><i className="fas fa-users"></i></div>
            <div className="stat-content">
              <h4>Total Enrolled</h4>
              <p>{students.length}</p>
            </div>
            <div className="stat-footer-text">Student Base</div>
          </div>
          
          <div className="stat-card-mini card-2" style={{cursor: 'default'}}>
            <div className="stat-icon-floating"><i className="fas fa-user-graduate"></i></div>
            <div className="stat-content">
              <h4>UG Students</h4>
              <p>{students.filter(s => s.ug_pg === 'UG').length}</p>
            </div>
            <div className="stat-footer-text">Undergraduate</div>
          </div>

          <div className="stat-card-mini card-3" style={{cursor: 'default'}}>
            <div className="stat-icon-floating"><i className="fas fa-folder-open"></i></div>
            <div className="stat-content">
              <h4>PG Students</h4>
              <p>{students.filter(s => s.ug_pg === 'PG').length}</p>
            </div>
            <div className="stat-footer-text">Postgraduate</div>
          </div>
        </div>

        <div className="header-section">
          <div className="nav-row">
            <button 
              className="back-link-p" 
              onClick={() => selectedBatch ? setSelectedBatch(null) : navigate("/admin/students")}
            >
              <i className="fas fa-arrow-left"></i>
              {selectedBatch ? "Back to Batches" : "Back to Registry"}
            </button>

            {!selectedBatch && (
              <div className="search-premium">
                <i className="fas fa-search"></i>
                <input 
                  type="text" 
                  placeholder="Search batch year..."
                  value={batchSearch}
                  onChange={(e) => setBatchSearch(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {selectedBatch && students.length > 0 && (
          <div className="filter-grid-premium">
            <div className="filter-group">
              <label>Reg No.</label>
              <input 
                type="text" 
                placeholder="Ex: 211501..." 
                value={regNoSearch}
                onChange={(e) => setRegNoSearch(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Student Name</label>
              <input 
                type="text" 
                placeholder="Search name..." 
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Phone Number</label>
              <input 
                type="text" 
                placeholder="Search phone..." 
                value={phoneSearch}
                onChange={(e) => setPhoneSearch(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Email Address</label>
              <input 
                type="text" 
                placeholder="Search email..." 
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Programme</label>
              <select 
                value={selectedProgramme}
                onChange={(e) => setSelectedProgramme(e.target.value)}
              >
                <option value="all">All Programmes</option>
                {programmes.map(p => (
                  <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Level</label>
              <select 
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="UG">Undergraduate (UG)</option>
                <option value="PG">Postgraduate (PG)</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Gender</label>
              <select 
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
              >
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-p">Sychronizing Registry...</div>
        ) : !selectedBatch ? (
          batchYears.length === 0 ? (
            <div className="premium-empty-state">
              <div className="empty-icon-wrapper">
                <i className="fas fa-layer-group"></i>
              </div>
              <h3>No Batches Found</h3>
              <p>We couldn't find any academic batches for this coordinator. Please ensure students are registered under this department.</p>
              <button className="empty-action-btn" onClick={() => navigate("/admin/students")}>
                <i className="fas fa-arrow-left"></i>
                Return to Registry
              </button>
            </div>
          ) : (
            <div className="batch-view-p">
              <div className="batch-table-header">
                <span>Batch Year</span>
                <span>Category</span>
                <span style={{textAlign: 'right'}}>Action</span>
              </div>
              
              <div className="batch-list-p">
                {currentBatches.map((year) => (
                  <div key={year} className="batch-row-p" onClick={() => loadStudentsByBatch(year)}>
                    <div className="batch-info">
                      <h3>
                        <i className="fas fa-calendar-alt" style={{fontSize: '1.2rem', color: '#0369a1'}}></i>
                        {year}
                      </h3>
                    </div>
                    <div>
                      <span className="batch-tag-p">Academic Batch</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                      <button className="explore-btn" onClick={() => loadStudentsByBatch(year)}>
                        Explore
                        <i className="fas fa-chevron-right" style={{marginLeft: '0.5rem'}}></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {totalBatchPages > 1 && (
                <div className="pagination-toolbar" style={{marginTop: '2rem'}}>
                  <div className="show-entries">
                    <span>Showing {currentBatches.length} of {filteredBatches.length} Batches</span>
                  </div>
                  <div className="pagination-wrap">
                    <button 
                      className={`pagination-btn ${batchCurrentPage === 1 ? 'disabled' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setBatchCurrentPage(batchCurrentPage - 1); }}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    {[...Array(totalBatchPages)].map((_, i) => (
                      <button 
                        key={i + 1}
                        className={`pagination-btn ${batchCurrentPage === i + 1 ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setBatchCurrentPage(i + 1); }}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button 
                      className={`pagination-btn ${batchCurrentPage === totalBatchPages ? 'disabled' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setBatchCurrentPage(batchCurrentPage + 1); }}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="table-card">
            {filteredStudents.length === 0 ? (
              <div className="premium-empty-state">
                <div className="empty-icon-wrapper">
                  <i className="fas fa-user-slash"></i>
                </div>
                <h3>No Matching Students</h3>
                <p>We couldn't find any students matching your current filter criteria for Academic Batch {selectedBatch}.</p>
                <button className="empty-action-btn" onClick={() => {
                  setRegNoSearch("");
                  setNameSearch("");
                  setPhoneSearch("");
                  setEmailSearch("");
                  setSelectedGender("all");
                  setSelectedProgramme("all");
                  setSelectedLevel("all");
                }}>
                  <i className="fas fa-sync-alt"></i>
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div style={{overflowX: 'auto'}}>
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>Registration No</th>
                        <th>Student Name</th>
                        <th>Level</th>
                        <th>Programme / Major</th>
                        <th>Contact Email</th>
                        <th>Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((s) => (
                        <tr key={s.id}>
                          <td style={{color: '#0369a1', fontWeight: 800, fontFamily: 'Outfit'}}>{s.university_reg_no}</td>
                          <td style={{fontWeight: 600}}>{s.name}</td>
                          <td><span className="badge-ugpg">{s.ug_pg}</span></td>
                          <td style={{opacity: 0.7}}>{s.programme?.replace(/_/g, ' ')}</td>
                          <td style={{fontSize: '0.85rem'}}>{s.email || "—"}</td>
                          <td>{s.phone || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Toolbar Restored */}
                <div className="pagination-toolbar" style={{marginTop: '2rem'}}>
                  <div className="show-entries">
                    <span>Show</span>
                    <select 
                      value={itemsPerPage} 
                      onChange={(e) => setItemsPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    >
                      <option value={10}>10 Entries</option>
                      <option value={20}>20 Entries</option>
                      <option value={50}>50 Entries</option>
                      <option value="all">Show All</option>
                    </select>
                    <span>of {filteredStudents.length} records</span>
                  </div>

                  <div className="pagination-wrap">
                    <button 
                      className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button 
                        key={i + 1}
                        className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button 
                      className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
}