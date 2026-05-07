




import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminPageLayout from "../../components/admin/AdminPageLayout";
import * as XLSX from 'xlsx';

const API_BASE = "http://localhost:8000";

// --- Custom Modern Icons (SVG) ---
const IconChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>
);
const IconChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"></path></svg>
);
const IconDownload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);
const IconPrinter = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
);
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const IconUsers = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);
const IconHome = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
);
const IconLayoutGrid = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
);

export default function AdminReports() {
  const [groupedData, setGroupedData] = useState({});
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  
  // --- Pagination & Multi-level Filters ---
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [companyFilter, setCompanyFilter] = useState("");
  const [jobTitleFilter, setJobTitleFilter] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_BASE}/admin-panel/reports/`)
      .then((res) => {
        setGroupedData(res.data || {});
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // --- Filtered Lists ---
  const filteredDeptsMain = Object.keys(groupedData).filter((dept) =>
    dept.toLowerCase().includes(search.toLowerCase())
  ).sort();

  const programmesForDept = selectedDept ? Object.keys(groupedData[selectedDept] || {}) : [];
  const filteredProgrammesMain = programmesForDept.filter((prog) =>
    prog.toLowerCase().includes(search.toLowerCase())
  ).sort();

  const batchesForProgramme = (selectedDept && selectedProgramme)
    ? Object.keys(groupedData[selectedDept]?.[selectedProgramme] || {})
    : [];
  const filteredBatchesMain = batchesForProgramme
    .filter((batch) => (groupedData[selectedDept]?.[selectedProgramme]?.[batch] || []).length > 0)
    .filter((batch) => batch.toLowerCase().includes(search.toLowerCase()))
    .sort();

  // --- Student Table Filters ---
  const studentsRaw = useMemo(() => {
    if (selectedDept && selectedProgramme && selectedBatch) {
      return groupedData[selectedDept]?.[selectedProgramme]?.[selectedBatch] || [];
    }
    return [];
  }, [selectedDept, selectedProgramme, selectedBatch, groupedData]);

  const filteredStudentsMain = useMemo(() => {
    let list = studentsRaw;
    if (studentSearch.trim()) {
      const term = studentSearch.toLowerCase();
      list = list.filter((item) => (
        (item.university_reg_no || "").toLowerCase().includes(term) ||
        (item.student_name || "").toLowerCase().includes(term) ||
        (item.student_email || "").toLowerCase().includes(term) ||
        (item.company || "").toLowerCase().includes(term) ||
        (item.job_title || "").toLowerCase().includes(term)
      ));
    }
    if (companyFilter) list = list.filter(item => item.company === companyFilter);
    if (jobTitleFilter) list = list.filter(item => item.job_title === jobTitleFilter);
    return list;
  }, [studentsRaw, studentSearch, companyFilter, jobTitleFilter]);

  // --- Unified Pagination Calculation ---
  const currentLevelList = !selectedDept ? filteredDeptsMain : 
                           !selectedProgramme ? filteredProgrammesMain :
                           !selectedBatch ? filteredBatchesMain : filteredStudentsMain;

  const totalPages = Math.ceil(currentLevelList.length / entriesPerPage);
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return currentLevelList.slice(start, start + entriesPerPage);
  }, [currentLevelList, currentPage, entriesPerPage]);

  // --- Derived Select Options ---
  const uniqueCompanies = useMemo(() => {
    const set = new Set(studentsRaw.map(s => s.company).filter(Boolean));
    return Array.from(set).sort();
  }, [studentsRaw]);

  const uniqueJobTitles = useMemo(() => {
    const set = new Set(studentsRaw.map(s => s.job_title).filter(Boolean));
    return Array.from(set).sort();
  }, [studentsRaw]);

  // --- Stats Calculations ---
  const totalSelectedInDept = useMemo(() => {
    if (!selectedDept) return 0;
    let count = 0;
    const progs = groupedData[selectedDept] || {};
    Object.values(progs).forEach(batches => {
      Object.values(batches).forEach(students => count += (students?.length || 0));
    });
    return count;
  }, [selectedDept, groupedData]);

  const handleExportExcel = () => {
    if (!currentLevelList.length) {
      alert("No data to export!");
      return;
    }

    let exportData = [];
    let fileName = "Report";

    if (selectedBatch) {
      // Export Students
      exportData = filteredStudentsMain.map(s => ({
        "University Reg No": s.university_reg_no || "N/A",
        "Student Name": s.student_name || "N/A",
        "Email": s.student_email || "N/A",
        "Company": s.company || "N/A",
        "Job Title": s.job_title || "N/A",
        "Selected At": s.selected_at || "N/A"
      }));
      fileName = `Placement_Report_${selectedDept}_${selectedProgramme}_${selectedBatch}`;
    } else if (selectedProgramme) {
      // Export Batches
      exportData = filteredBatchesMain.map(batch => ({
        "Batch": batch,
        "Programme": selectedProgramme,
        "Department": selectedDept,
        "Students Count": (groupedData[selectedDept]?.[selectedProgramme]?.[batch] || []).length
      }));
      fileName = `Batches_Report_${selectedDept}_${selectedProgramme}`;
    } else if (selectedDept) {
      // Export Programmes
      exportData = filteredProgrammesMain.map(prog => ({
        "Programme": prog,
        "Department": selectedDept,
        "Batches Count": Object.keys(groupedData[selectedDept]?.[prog] || {}).length
      }));
      fileName = `Programmes_Report_${selectedDept}`;
    } else {
      // Export Departments
      exportData = filteredDeptsMain.map(dept => ({
        "Department": dept,
        "Programmes Count": Object.keys(groupedData[dept] || {}).length
      }));
      fileName = `Departments_Report`;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <AdminPageLayout title="Placement Reports" icon="fas fa-file-invoice">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');

        :root {
          --registry-navy: #002147;
          --registry-gold: #c5a059;
          --registry-gold-soft: #fbf8f1;
          --registry-slate: #1e293b;
          --registry-bg: #fdfdfd;
          --registry-card-bg: #ffffff;
          --registry-border: #d1d5db;
          --registry-navy-soft: #f1f5f9;
          --registry-text: #0f172a;
          --registry-muted: #4b5563;
        }

        .reports-page-root {
          font-family: 'Inter', sans-serif;
          max-width: 1400px;
          margin: 0 auto;
          padding: 2.5rem 2rem;
          color: var(--registry-text);
          background-color: var(--registry-bg);
          min-height: 100vh;
        }

        /* --- Modern Breadcrumbs --- */
        .modern-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
          padding: 0.6rem 1.2rem;
          background: var(--registry-navy-soft);
          border: 1px solid var(--registry-border);
          border-radius: 4px;
          width: fit-content;
        }

        .breadcrumb-node {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--registry-muted);
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .breadcrumb-node:hover { color: var(--registry-gold); }
        .breadcrumb-node.active { color: var(--registry-navy); font-weight: 800; cursor: default; }
        .breadcrumb-separator { color: var(--registry-border); opacity: 0.3; }

        /* --- Institutional Header --- */
        .modern-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
          background: white;
          padding: 2.5rem 3rem;
          border-radius: 2px;
          border: 1px solid var(--registry-border);
          border-left: 8px solid var(--registry-gold);
        }

        .header-title-group h1 {
          font-family: 'Outfit', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: var(--registry-navy);
          margin: 0;
          letter-spacing: -0.01em;
          text-transform: uppercase;
        }

        .header-title-group p {
          margin: 0.5rem 0 0;
          font-size: 1rem;
          color: var(--registry-muted);
          max-width: 700px;
          line-height: 1.5;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-modern {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem 1.5rem;
          border: none;
          background: var(--registry-navy);
          color: white;
          font-weight: 700;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 2px;
        }

        .btn-modern:hover {
          background: var(--registry-slate);
          transform: translateY(-2px);
        }

        .btn-modern.primary {
          background: var(--registry-gold);
          color: white;
        }

        .btn-modern.primary:hover {
          background: #b08d48;
        }

        .stats-dashboard {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .modern-stat-card {
          padding: 2rem;
          background: var(--registry-card-bg);
          border: 1px solid var(--registry-border);
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          transition: all 0.2s;
        }

        .modern-stat-card:hover { 
          border-color: var(--registry-navy);
          background: var(--registry-navy-soft);
        }

        .stat-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          background: var(--registry-gold-soft);
          color: var(--registry-gold);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-details .stat-val {
          display: block;
          font-family: 'Outfit', sans-serif;
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--registry-navy);
          line-height: 1;
        }

        .stat-details .stat-lab {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--registry-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* --- Content Layout --- */
        .modern-content-wrapper {
          background: var(--registry-card-bg);
          border-radius: 4px;
          padding: 2.5rem;
          min-height: 500px;
          border: 1px solid var(--registry-border);
        }

        .search-control-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1.5rem;
        }

        .modern-search-box {
          position: relative;
          flex: 1;
          max-width: 500px;
        }

        .modern-search-input {
          width: 100%;
          padding: 0.9rem 1.25rem 0.9rem 3rem;
          border: 1px solid var(--registry-border);
          border-radius: 12px;
          font-size: 0.95rem;
          color: var(--registry-text);
          transition: all 0.25s;
          background: var(--registry-bg);
        }

        .modern-search-input:focus {
          outline: none;
          border-color: var(--registry-navy);
          background: white;
        }

        .modern-search-icon {
          position: absolute;
          left: 1.1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--registry-muted);
        }

        .modern-item-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .modern-nav-card {
          padding: 2rem;
          background: white;
          border: 1px solid var(--registry-border);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .modern-nav-card:hover {
          border-color: var(--registry-navy);
          background: var(--registry-navy-soft);
        }

        .modern-nav-card h3 {
          margin: 0;
          font-family: 'Outfit', sans-serif;
          font-size: 1.35rem;
          font-weight: 600;
          color: var(--registry-navy);
        }

        .modern-nav-card .card-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1.5rem;
        }

        .card-info .info-tag {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--registry-gold);
          background: var(--registry-gold-soft);
          padding: 0.35rem 0.8rem;
          border-radius: 6px;
        }

        .card-info .chevron-tag {
          color: var(--registry-muted);
          transition: transform 0.2s;
        }

        .modern-nav-card:hover .chevron-tag { color: var(--registry-navy); transform: translateX(5px); }

        /* --- Sophisticated Tables --- */
        .modern-table-frame {
          border: 1px solid var(--registry-border);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 0.5rem;
        }

        .modern-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .modern-table th {
          background: var(--registry-bg);
          color: var(--registry-navy);
          padding: 1.1rem 1rem;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid var(--registry-border);
        }

        .modern-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--registry-border);
          font-size: 0.92rem;
          color: var(--registry-text);
        }

        .modern-table tr:last-child td { border-bottom: none; }
        .modern-table tr:hover { background: var(--registry-navy-soft); }

        .reg-no-cell { font-family: 'Outfit', sans-serif; font-weight: 600; color: var(--registry-navy); }
        .name-cell { font-weight: 500; }
        .company-cell { color: var(--registry-gold); font-weight: 600; }

        /* --- Secondary Filter Bar --- */
        .filter-control-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .registry-select {
          padding: 0.6rem 1rem;
          border: 1px solid var(--registry-border);
          border-radius: 4px;
          background: white;
          color: var(--registry-text);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          outline: none;
        }

        .registry-select:focus {
          border-color: var(--registry-navy);
        }

        .entries-label {
          font-size: 0.85rem;
          color: var(--registry-muted);
          font-weight: 600;
        }

        /* --- Pagination UI --- */
        .pagination-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--registry-border);
        }

        .pagination-info {
          font-size: 0.85rem;
          color: var(--registry-muted);
          font-weight: 500;
        }

        .pagination-controls {
          display: flex;
          gap: 0.35rem;
        }

        .page-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--registry-border);
          background: white;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--registry-text);
          cursor: pointer;
          transition: all 0.2s;
        }

        .page-btn:hover:not(:disabled) {
          border-color: var(--registry-navy);
          color: var(--registry-navy);
        }

        .page-btn.active {
          background: var(--registry-navy);
          color: white;
          border-color: var(--registry-navy);
        }

        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* --- System States --- */
        .modern-empty-state {
          padding: 6rem 2rem;
          text-align: center;
          border: 2px dashed var(--registry-border);
          border-radius: 20px;
          background: var(--registry-card-bg);
        }

        .modern-empty-state p { color: var(--registry-muted); font-size: 1.1rem; }

        .modern-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8rem 2rem;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid var(--registry-navy-soft);
          border-top: 4px solid var(--registry-navy);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1.5rem;
        }

        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        @media (max-width: 1024px) {
          .stats-dashboard { grid-template-columns: 1fr; }
          .modern-header { flex-direction: column; align-items: flex-start; }
          .modern-item-grid { grid-template-columns: 1fr; }
        }

        @media print {
          .modern-breadcrumbs, .header-actions, .search-control-bar, .modern-item-grid { display: none !important; }
          .modern-content-wrapper { border: none; box-shadow: none; padding: 0; }
          .reports-page-root { padding: 0; }
        }
      `}</style>

      <div className="reports-page-root">
        {/* --- DYNAMIC BREADCRUMBS --- */}
        <nav className="modern-breadcrumbs">
          <div className="breadcrumb-node" onClick={() => {
            setSelectedDept(null);
            setSelectedProgramme(null);
            setSelectedBatch(null);
            setSearch("");
          }}>
            <IconHome /> Registry
          </div>
          
          {selectedDept && (
            <>
              <span className="breadcrumb-separator"><IconChevronRight /></span>
              <div className={`breadcrumb-node ${!selectedProgramme ? "active" : ""}`} onClick={() => {
                setSelectedProgramme(null);
                setSelectedBatch(null);
              }}>
                {selectedDept}
              </div>
            </>
          )}

          {selectedProgramme && (
            <>
              <span className="breadcrumb-separator"><IconChevronRight /></span>
              <div className={`breadcrumb-node ${!selectedBatch ? "active" : ""}`} onClick={() => setSelectedBatch(null)}>
                {selectedProgramme}
              </div>
            </>
          )}

          {selectedBatch && (
            <>
              <span className="breadcrumb-separator"><IconChevronRight /></span>
              <div className="breadcrumb-node active">{selectedBatch}</div>
            </>
          )}
        </nav>

        {/* --- PROFESSIONAL HEADER --- */}
        <header className="modern-header">
          <div className="header-title-group">
            <h1>
              {selectedBatch ? `${selectedBatch} Placement Report` : 
               selectedProgramme ? `Batches for ${selectedProgramme}` : 
               selectedDept ? `${selectedDept} Programmes` : "Departmental Reports"}
            </h1>
            <p>
              {selectedBatch 
                ? `Comprehensive list of students placed in the class of ${selectedBatch}. You can filter records and export them to CSV.`
                : selectedProgramme 
                  ? "Select a specific graduation batch to access detailed student outcomes."
                  : selectedDept 
                    ? `Explore specialized academic programmes registered under the department of ${selectedDept}.`
                    : "Central management system for university-wide placement archiving and departmental performance tracking."}
            </p>
          </div>

          <div className="header-actions">
            {!loading && (
              <button className="btn-modern primary" onClick={handleExportExcel}>
                <IconDownload /> Export Excel
              </button>
            )}
            
            {selectedBatch && (
              <button className="btn-modern" onClick={() => window.print()}>
                <IconPrinter /> Print View
              </button>
            )}

            {selectedDept && (
              <button className="btn-modern" onClick={() => {
                if(selectedBatch) setSelectedBatch(null);
                else if(selectedProgramme) setSelectedProgramme(null);
                else setSelectedDept(null);
              }}>
                <IconChevronLeft /> Go Back
              </button>
            )}
            
            {!selectedDept && !loading && (
              <button className="btn-modern" onClick={() => navigate("/admin/dashboard")}>
                Return Dashboard
              </button>
            )}
          </div>
        </header>

        {/* --- PERFORMANCE DASHBOARD --- */}
        <section className="stats-dashboard">
          <div className="modern-stat-card">
            <div className="stat-icon-wrapper"><IconLayoutGrid /></div>
            <div className="stat-details">
              <span className="stat-val">{Object.keys(groupedData).length}</span>
              <span className="stat-lab">Total Departments</span>
            </div>
          </div>
          <div className="modern-stat-card">
            <div className="stat-icon-wrapper"><IconUsers /></div>
            <div className="stat-details">
              <span className="stat-val">
                {selectedDept 
                  ? programmesForDept.length 
                  : Object.values(groupedData).reduce((sum, dept) => sum + Object.keys(dept).length, 0)}
              </span>
              <span className="stat-lab">Available Programmes</span>
            </div>
          </div>
          <div className="modern-stat-card">
            <div className="stat-icon-wrapper"><IconUsers /></div>
            <div className="stat-details">
              <span className="stat-val" style={{color: 'var(--registry-navy)'}}>
                {selectedBatch 
                  ? filteredStudentsMain.length 
                  : selectedDept 
                    ? totalSelectedInDept 
                    : "---"}
              </span>
              <span className="stat-lab">{selectedBatch ? "Total Enrolled" : "Dept Volume"}</span>
            </div>
          </div>
        </section>

        {/* --- MAIN DATA CONTAINER --- */}
        <main className="modern-content-wrapper">
          {loading ? (
            <div className="modern-loading">
              <div className="spinner"></div>
              <p>Preparing Secure Registry Access...</p>
            </div>
          ) : (
            <>
              {/* --- UNIFIED SEARCH & ENTRIES BAR --- */}
              <div className="search-control-bar">
                <div className="modern-search-box">
                  <span className="modern-search-icon"><IconSearch /></span>
                  <input 
                    className="modern-search-input"
                    type="text" 
                    placeholder={selectedBatch ? "Search students by name/reg no..." : "Filter records..."}
                    value={selectedBatch ? studentSearch : search}
                    onChange={(e) => {
                      if(selectedBatch) setStudentSearch(e.target.value);
                      else setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                
                <div className="filter-group">
                  <span className="entries-label">Show</span>
                  <select 
                    className="registry-select"
                    value={entriesPerPage}
                    onChange={(e) => {
                      setEntriesPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    {[10, 25, 50, 100].map(val => <option key={val} value={val}>{val} entries</option>)}
                  </select>
                </div>
              </div>

              {/* --- STUDENT-ONLY FILTERS --- */}
              {selectedBatch && (
                <div className="filter-control-row" style={{justifyContent: 'flex-end'}}>
                  <div className="filter-group">
                    <select 
                      className="registry-select"
                      value={companyFilter}
                      onChange={(e) => { setCompanyFilter(e.target.value); setCurrentPage(1); }}
                    >
                      <option value="">All Companies</option>
                      {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <select 
                      className="registry-select"
                      value={jobTitleFilter}
                      onChange={(e) => { setJobTitleFilter(e.target.value); setCurrentPage(1); }}
                    >
                      <option value="">All Job Titles</option>
                      {uniqueJobTitles.map(j => <option key={j} value={j}>{j}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="view-content-area">
                {!selectedDept ? (
                  paginatedList.length === 0 ? (
                    <div className="modern-empty-state"><p>No matching departments found.</p></div>
                  ) : (
                    <div className="modern-item-grid">
                      {paginatedList.map(dept => (
                        <div key={dept} className="modern-nav-card" onClick={() => { setSelectedDept(dept); setSearch(""); setCurrentPage(1); }}>
                          <h3>{dept.replace(/_/g, " ")}</h3>
                          <div className="card-info">
                            <span className="info-tag">{Object.keys(groupedData[dept] || {}).length} PROGS</span>
                            <span className="chevron-tag"><IconChevronRight /></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : !selectedProgramme ? (
                  paginatedList.length === 0 ? (
                    <div className="modern-empty-state"><p>No programmes found for this department.</p></div>
                  ) : (
                    <div className="modern-item-grid">
                      {paginatedList.map(prog => (
                        <div key={prog} className="modern-nav-card" onClick={() => { setSelectedProgramme(prog); setSearch(""); setCurrentPage(1); }}>
                          <h3>{prog}</h3>
                          <div className="card-info">
                            <span className="info-tag">EXPLORE BATCHES</span>
                            <span className="chevron-tag"><IconChevronRight /></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : !selectedBatch ? (
                  paginatedList.length === 0 ? (
                    <div className="modern-empty-state"><p>No batch records found for this programme.</p></div>
                  ) : (
                    <div className="modern-item-grid">
                      {paginatedList.map(batch => (
                        <div key={batch} className="modern-nav-card" onClick={() => { setSelectedBatch(batch); setStudentSearch(""); setCurrentPage(1); }}>
                          <h3>Classification {batch}</h3>
                          <div className="card-info">
                            <span className="info-tag" style={{background: 'var(--registry-navy)', color: 'white'}}>
                              {(groupedData[selectedDept]?.[selectedProgramme]?.[batch] || []).length} PLACED
                            </span>
                            <span className="chevron-tag"><IconChevronRight /></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="modern-table-frame">
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Univ. Reg No</th>
                          <th>Full Name</th>
                          <th>Email ID</th>
                          <th>Recruiter</th>
                          <th>Job Profile</th>
                          <th>Selection Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedList.length === 0 ? (
                          <tr><td colSpan="6" className="modern-empty-state" style={{border: 'none'}}>No students match these criteria.</td></tr>
                        ) : (
                          paginatedList.map((item, index) => (
                            <tr key={index}>
                              <td className="reg-no-cell">{item.university_reg_no || "—"}</td>
                              <td className="name-cell">{item.student_name || "—"}</td>
                              <td style={{color: 'var(--registry-muted)'}}>{item.student_email || "—"}</td>
                              <td className="company-cell">{item.company || "—"}</td>
                              <td>{item.job_title || "—"}</td>
                              <td>{item.selected_at && item.selected_at !== "na" ? new Date(item.selected_at).toLocaleDateString() : "—"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* --- UNIFIED PAGINATION FOOTER --- */}
              {totalPages > 0 && (
                <div className="pagination-footer">
                  <div className="pagination-info">
                    Showing {(currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, currentLevelList.length)} of {currentLevelList.length} records
                  </div>
                  <div className="pagination-controls">
                    <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><IconChevronLeft /></button>
                    {[...Array(totalPages)].map((_, i) => (
                      (i + 1 === 1 || i + 1 === totalPages || Math.abs(i + 1 - currentPage) <= 1) ? (
                        <button key={i} className={`page-btn ${currentPage === i + 1 ? "active" : ""}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                      ) : (i + 1 === 2 || i + 1 === totalPages - 1) ? <span key={i} style={{padding: '0 0.5rem'}}>...</span> : null
                    ))}
                    <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                      <span style={{transform: 'rotate(180deg)', display: 'inline-block'}}><IconChevronRight /></span>
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
