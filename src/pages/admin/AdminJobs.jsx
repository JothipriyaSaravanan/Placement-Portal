
// src/pages/admin/AdminJobs.jsx
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminPageLayout from "../../components/admin/AdminPageLayout";

const API_BASE = "http://127.0.0.1:8000/admin-panel/";
const STUDENT_API = "http://127.0.0.1:8000/api/students/";

export default function AdminJobs() {
  const { status } = useParams();
  const navigate = useNavigate();

  const validTabs = ["pending", "approved", "rejected"];
  const initialTab = validTabs.includes(status) ? status : "pending";

  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(initialTab);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(true);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [graduationYears, setGraduationYears] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);

  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedProgrammes, setSelectedProgrammes] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);

  // Advanced Filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    company: "",
    location: "",
    title: "",
    salary: "",
    jobType: "",
    department: "",
    programme: "",
    year: ""
  });

  // ────────────────────────────────────────────────
  //                DATA FETCHING
  // ────────────────────────────────────────────────

  useEffect(() => {
    fetch(`${STUDENT_API}years/`)
      .then((res) => res.json())
      .then((data) => setGraduationYears(data.years || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${STUDENT_API}programmes/`)
      .then((res) => res.json())
      .then((data) => setProgrammes(data.programmes || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}coordinators/`)
      .then((res) => res.json())
      .then((data) => {
        const uniqueDepts = [...new Set(data.coordinators?.map((c) => c.department) || [])];
        setDepartments(uniqueDepts);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadJobs(activeTab);
  }, [activeTab]);

  const loadJobs = async (tab) => {
    setLoading(true);
    let url = `${API_BASE}`;
    if (tab === "pending") url += "pending-jobs/";
    else if (tab === "approved") url += "approved-jobs/";
    else url += "rejected-jobs/";

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data = await res.json();

      const key =
        tab === "pending" ? "pending_jobs" :
        tab === "approved" ? "approved_jobs" :
        "rejected_jobs";

      const list = data[key] || [];
      setJobs(list);
      setFilteredJobs(list);
    } catch {
      setMessage("Failed to load jobs");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────
  //                     SEARCH
  // ────────────────────────────────────────────────

  useEffect(() => {
    let result = jobs;

    // Apply global search query
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase().trim();
      result = result.filter((j) =>
        [j.title, j.company, j.location, j.job_type, j.salary_range]
          .some((v) => v?.toLowerCase().includes(term)) ||
        j.departments?.join(" ").toLowerCase().includes(term) ||
        j.programmes?.join(" ").toLowerCase().includes(term) ||
        j.graduation_years?.join(" ").toString().includes(term)
      );
    }

    // Apply specific advanced filters
    if (filters.company.trim()) {
      const term = filters.company.toLowerCase().trim();
      result = result.filter(j => j.company?.toLowerCase().includes(term));
    }
    if (filters.location.trim()) {
      const term = filters.location.toLowerCase().trim();
      result = result.filter(j => j.location?.toLowerCase().includes(term));
    }
    if (filters.title.trim()) {
      const term = filters.title.toLowerCase().trim();
      result = result.filter(j => j.title?.toLowerCase().includes(term));
    }
    if (filters.salary.trim()) {
      const term = filters.salary.toLowerCase().trim();
      result = result.filter(j => j.salary_range?.toLowerCase().includes(term));
    }
    if (filters.jobType) {
      result = result.filter(j => j.job_type === filters.jobType);
    }
    if (filters.department) {
      result = result.filter(j => 
        j.show_to_all_departments || 
        (Array.isArray(j.departments) && j.departments.includes(filters.department))
      );
    }
    if (filters.programme) {
      result = result.filter(j => 
        Array.isArray(j.programmes) && j.programmes.includes(filters.programme)
      );
    }
    if (filters.year) {
      result = result.filter(j => 
        Array.isArray(j.graduation_years) && j.graduation_years.includes(filters.year)
      );
    }

    setFilteredJobs(result);
  }, [searchQuery, filters, jobs]);

  // Paginated jobs
  const totalPages = Math.ceil(filteredJobs.length / entriesPerPage) || 1;
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredJobs.slice(start, start + entriesPerPage);
  }, [filteredJobs, currentPage, entriesPerPage]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when search, filter, or tab changes
  }, [searchQuery, filters, activeTab, entriesPerPage]);

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // ────────────────────────────────────────────────
  //                 APPROVE / REJECT
  // ────────────────────────────────────────────────

  const handleApproveClick = (job) => {
    setSelectedJobId(job.id);
    
    // Normalization helper for both arrays and comma-separated strings
    const normalizeData = (data) => {
      if (Array.isArray(data)) return data.map(s => String(s).trim());
      if (typeof data === 'string') {
        return data.includes(',') 
          ? data.split(',').map(s => s.trim()).filter(Boolean)
          : [data.trim()].filter(Boolean);
      }
      return [];
    };

    const rawProgs = normalizeData(job.programmes);
    const rawDeps = normalizeData(job.departments);
    const rawYears = normalizeData(job.graduation_years);

    // Intelligent Matching (Case-Insensitive)
    const matchedProgs = programmes
      .filter(p => rawProgs.some(rp => rp.toLowerCase() === p.name.trim().toLowerCase()))
      .map(p => p.name);

    const matchedDeps = departments.filter(d => 
      rawDeps.some(rd => rd.toLowerCase() === d.trim().toLowerCase()) ||
      programmes.some(p => matchedProgs.includes(p.name) && p.department.trim().toLowerCase() === d.trim().toLowerCase())
    );

    // Match Graduation Years (String-based comparison for numbers/strings)
    const matchedYears = graduationYears.filter(y => 
      rawYears.some(ry => String(ry).toLowerCase() === String(y).trim().toLowerCase())
    );

    setSelectedProgrammes(matchedProgs);
    setSelectedDepartments(matchedDeps);
    setSelectedYears(matchedYears.length > 0 ? matchedYears : graduationYears); 

    setSelectAll(job.show_to_all_departments || false);
    setShowModal(true);
  };

  const handleAction = async (type, jobId) => {
    const isApprove = type === "approve";
    const url = `${API_BASE}${isApprove ? "approve-job/" : "reject-job/"}`;

    try {
      const body = {
        id: jobId,
        departments: selectAll ? [] : selectedDepartments,
        programmes: selectAll ? [] : selectedProgrammes,
        graduation_years: selectedYears,
        show_to_all_departments: selectAll,
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();

      setMessage(`Job successfully ${isApprove ? "approved" : "rejected"}`);
      setMessageType("success");
      loadJobs(activeTab);
    } catch {
      setMessage("Action failed");
      setMessageType("error");
    } finally {
      setShowModal(false);
    }
  };

  const handleShowDetails = (job) => {
    setSelectedJobDetails(job);
    setShowDetailsModal(true);
  };

  // Always show department, programme, and graduation year columns for all tabs
  const showColumns = true;

  // ────────────────────────────────────────────────
  //                     RENDER
  // ────────────────────────────────────────────────

  return (
    <AdminPageLayout title="Manage Job Approvals" icon="fas fa-briefcase">
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
      />
      <style>{`
        .jobs-wrapper {
          padding: 0;
          background: transparent;
          min-height: 100vh;
          font-family: 'Manrope', sans-serif;
        }

        .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .page-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          color: #000000;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .page-title i {
          color: #10b981; /* Green icon as requested */
        }

        .back-btn {
          padding: 0.6rem 1.25rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          background: #ffffff;
          color: #1e293b;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .back-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateX(-2px);
        }

        .control-bar {
          background: #ffffff;
          padding: 1rem 1.25rem;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          flex-wrap: wrap;
        }

        .search-container {
          position: relative;
          flex: 1;
          min-width: 280px;
          max-width: 450px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #1e293b;
          font-size: 0.9rem;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.8rem;
          border-radius: 0.75rem;
          border: 1.5px solid #f1f5f9;
          background: #f8fafc;
          font-size: 0.9rem;
          font-weight: 500;
          color: #1e293b;
          outline: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .search-input:focus {
          background: #ffffff;
          border-color: #10b981;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .filter-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .tabs-container {
          display: flex;
          gap: 0.25rem;
          background: #f1f5f9;
          padding: 0.35rem;
          border-radius: 0.85rem;
        }

        .advanced-filters-btn {
          padding: 0.75rem 1.25rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          background: #ffffff;
          color: #0f172a;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          height: 100%;
        }

        .advanced-filters-btn:hover {
          background: #f8fafc;
          color: #1e293b;
          border-color: #cbd5e1;
        }

        .advanced-filters-btn.active {
          background: #f0fdf4;
          color: #10b981;
          border-color: #10b981;
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

        .filter-field, .filter-select {
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

        .filter-select {
          padding-left: 2.25rem;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23000' %3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1rem;
        }

        .filter-field:focus, .filter-select:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
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
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          font-size: 0.85rem;
          font-weight: 500;
          color: #000000;
          outline: none;
          transition: all 0.2s;
        }

        .filter-field:focus {
          background: #ffffff;
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

        .tab {
          padding: 0.5rem 1.25rem;
          border: none;
          background: transparent;
          color: #1e293b;
          font-weight: 600;
          font-size: 0.85rem;
          border-radius: 0.6rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab:hover:not(.active) {
          color: #1e293b;
          background: rgba(255,255,255,0.5);
        }

        .tab.active.pending {
          background: #3b82f6;
          color: #ffffff;
        }

        .tab.active.approved {
          background: #10b981;
          color: #ffffff;
        }

        .tab.active.rejected {
          background: #ef4444;
          color: #ffffff;
        }

        /* ─── Table Styling ────────────────────────────────────────── */
        .table-wrapper {
          background: #ffffff;
          border-radius: 0 !important; /* Sharp corners for a formal look */
          border: 1px solid #e2e8f0;
          overflow-x: auto;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          width: 100%;
          max-width: 100%;
        }

        .table {
          width: 100%;
          min-width: 1200px;
          border-collapse: collapse;
          border-spacing: 0;
          margin: 0;
          border-radius: 0 !important;
        }

        .table th {
          background-color: #1e1b4b !important; /* Forced Deep Navy Header */
          text-align: left;
          padding: 1.25rem 0.75rem; 
          font-weight: 800;
          color: #ffffff !important; /* Force high-contrast white */
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-bottom: none;
          border-radius: 0 !important;
        }

        .table td {
          padding: 1.1rem 0.75rem;
          border-bottom: 1px solid #e2e8f0;
          color: #1e1b4b !important; /* Premium Navy for text */
          font-size: 0.875rem;
          vertical-align: middle;
          font-weight: 800 !important; /* Ultra Bold for all contents */
          white-space: nowrap;
        }

        .table tr:last-child td { border-bottom: none; }
        .table tbody tr:hover td { background-color: #f1f5f9 !important; }

        /* Row Specific Highlighting - Applied to cells for high specificity */
        .table tbody tr.internship-row td {
          background-color: #f5f3ff !important; /* Elegant Light Violet */
          border-top: 1px solid #ede9fe;
          border-bottom: 1px solid #ede9fe;
        }
        .table tbody tr.internship-row { border-left: 8px solid #8b5cf6 !important; }

        .table tbody tr.full-time-row td {
          background-color: #ecfdf5 !important; /* Elegant Light Emerald */
          border-top: 1px solid #d1fae5;
          border-bottom: 1px solid #d1fae5;
        }
        .table tbody tr.full-time-row { border-left: 8px solid #10b981 !important; }

        .table tbody tr.part-time-row td {
          background-color: #eff6ff !important; /* Elegant Light Blue */
          border-top: 1px solid #dbeafe;
          border-bottom: 1px solid #dbeafe;
        }
        .table tbody tr.part-time-row { border-left: 8px solid #3b82f6 !important; }

        .table tbody tr.contract-row td {
          background-color: #fffbeb !important; /* Elegant Light Amber */
          border-top: 1px solid #fef3c7;
          border-bottom: 1px solid #fef3c7;
        }
        .table tbody tr.contract-row { border-left: 8px solid #f59e0b !important; }

        /* Generic Badge Styles */
        .badge-type {
          padding: 0.4rem 1rem;
          font-weight: 900; /* Maximum bold for colored text */
          font-size: 0.72rem;
          text-transform: uppercase;
          border-radius: 2rem;
          display: inline-block;
          letter-spacing: 0.08em;
          border-width: 1.5px !important;
        }

        .badge-internship { background-color: #f3e8ff; color: #7e22ce; border: 1.5px solid #e9d5ff !important; }
        .badge-full-time { background-color: #dcfce7; color: #15803d; border: 1.5px solid #bbf7d0 !important; }
        .badge-part-time { background-color: #dbeafe; color: #1d4ed8; border: 1.5px solid #bfdbfe !important; }
        .badge-contract { background-color: #fffbeb; color: #b45309; border: 1.5px solid #fde68a !important; }

        .job-title-cell {
          font-weight: 900 !important;
          color: #1e1b4b;
          line-height: 1.4;
        }

        .company-cell {
          font-weight: 800 !important;
          color: #4f46e5;
        }

        .meta-text {
          color: #1e1b4b;
          font-size: 0.81rem;
          font-weight: 800 !important;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .meta-text.fw-600 {
           font-weight: 800 !important;
        }

        .action-cell {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
          min-width: 320px; /* Ensure enough space for 3 buttons */
        }

        .btn-action {
          padding: 0.55rem 1.1rem;
          border-radius: 0.6rem;
          font-weight: 800; /* Ultra-bold */
          font-size: 0.78rem;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ffffff !important; /* Force high-contrast white */
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .btn-details { background: #4f46e5 !important; }
        .btn-details:hover {
          background: #3730a3 !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(79, 70, 229, 0.3);
        }

        .btn-approve { background: #10b981 !important; }
        .btn-approve:hover {
          background: #059669 !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(16, 185, 129, 0.3);
        }

        .btn-reject { background: #ef4444 !important; }
        .btn-reject:hover {
          background: #dc2626 !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(239, 68, 68, 0.3);
        }

        /* ─── Detail Modal Styling ───────────────────────────────── */
        .detail-card {
          border: 1px solid #f1f5f9;
          border-radius: 1rem;
          padding: 1.25rem;
          background: #ffffff;
          margin-bottom: 0;
          transition: all 0.25s;
        }

        .detail-card:hover {
          border-color: #6366f1;
          background: #fcfcff;
        }

        .detail-label {
          font-size: 0.72rem;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.6rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .detail-value {
          font-size: 1rem;
          color: #0f172a;
          font-weight: 700;
        }

        .detail-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.45rem 0.9rem;
          background: #f1f5f9;
          color: #475569;
          border-radius: 2rem;
          font-size: 0.8rem;
          font-weight: 600;
          margin-right: 0.6rem;
          margin-bottom: 0.6rem;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }

        .detail-badge:hover {
          background: #e2e8f0;
          transform: translateY(-1px);
        }

        .job-desc-box {
          background: #f8fafc;
          border-radius: 1rem;
          padding: 1.5rem;
          border: 1px solid #e2e8f0;
          border-left: 5px solid #6366f1;
          font-size: 1rem;
          line-height: 1.7;
          color: #334155;
          max-height: 350px;
          overflow-y: auto;
          white-space: pre-line;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }

        .modal-details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .section-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 2.5rem 0;
          position: relative;
        }

        .section-divider::after {
          content: attr(data-label);
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          background: #ffffff;
          padding: 0 1rem;
          font-size: 0.7rem;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        @media (max-width: 768px) {
          .modal-details-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ─── Empty State ────────────────────────────────────────── */
        .empty-state {
          text-align: center;
          padding: 5rem 2rem;
          background: #ffffff;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
          margin-top: 1rem;
        }

        .empty-icon {
          font-size: 3.5rem;
          color: #e2e8f0;
          margin-bottom: 1.5rem;
          display: block;
        }

        .empty-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .empty-desc {
          color: #0f172a;
          font-weight: 400;
          font-size: 0.95rem;
          max-width: 400px;
          margin: 0 auto;
        }

        /* ─── Message ─────────────────────────────────────────────── */
        .message {
          padding: 1rem 1.5rem;
          border-radius: 1rem;
          margin-bottom: 1.5rem;
          font-weight: 600;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .message.success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
        .message.error   { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

        /* ─── Modal Refinements ──────────────────────────────────── */
        .modal-content {
          border-radius: 1.25rem;
          border: none;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        .modal-header {
          padding: 1.5rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-title {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.01em;
        }

        .modal-body {
          padding: 2rem;
        }

        .modal-footer {
          padding: 1.25rem 1.5rem;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        .scroll-area {
          max-height: 280px;
          overflow-y: auto;
          background: #ffffff;
          border-radius: 0.75rem;
          padding: 1.25rem;
          margin-bottom: 2rem;
          border: 1px solid #e2e8f0;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }

        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
        }

        .form-check-card {
          padding: 0.75rem 1rem;
          border: 1px solid #f1f5f9;
          border-radius: 0.75rem;
          background: #f8fafc;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        .form-check-card:hover {
          border-color: #10b981;
          background: #ffffff;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .form-check-card .form-check-input {
          margin-top: 0;
          width: 1.1rem;
          height: 1.1rem;
          cursor: pointer;
        }
        
        .form-check-card label {
           cursor: pointer;
           font-size: 0.9rem;
           font-weight: 600;
           color: #334155;
           flex: 1;
           margin: 0;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.8rem;
          font-weight: 800;
          color: #10b981;
          margin: 1.5rem 0 1rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.5); /* Sophisticated Slate tint */
          backdrop-filter: blur(8px) saturate(150%);
          -webkit-backdrop-filter: blur(8px) saturate(150%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
          animation: modalFadeIn 0.3s ease-out;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: #ffffff;
          border-radius: 1.25rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          animation: modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes modalSlideUp {
          from { transform: translateY(20px) scale(0.98); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }

        .action-btn {
          padding: 0.6rem 1.2rem;
          font-size: 0.9rem;
          font-weight: 600;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }

        .action-btn-outline {
          background: #ffffff;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .action-btn-outline:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #1e293b;
        }

        .action-btn-primary {
          background: #10b981;
          color: #ffffff;
        }

        .action-btn-primary:hover {
          background: #059669;
          transform: translateY(-1px);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }
        
        @media (max-width: 768px) {
          .control-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .search-container {
            max-width: 100%;
          }
          .filter-group {
            flex-direction: column;
            align-items: flex-start;
          }
          .header-actions {
            flex-direction: column;
            align-items: flex-start;
          }
          .back-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="jobs-wrapper">
        {/* Messages */}
        {message && (
          <div className={`message ${messageType}`}>
            <i className={`fas fa-${messageType === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
            {message}
          </div>
        )}

        <div className="control-bar">
          <button className="back-btn me-2" onClick={() => navigate("/admin/dashboard")}>
            <i className="fas fa-arrow-left"></i>
            Back
          </button>


          <div className="entries-selection d-flex align-items-center gap-2 me-3" style={{fontSize: '0.85rem', fontWeight: '600', color: '#64748b'}}>
            Show 
            <select 
              className="form-select form-select-sm" 
              style={{width: 'auto', borderRadius: '0.5rem', cursor: 'pointer', border: '1px solid #e2e8f0'}}
              value={entriesPerPage} 
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="search-container">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Quick search everything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <button 
            className={`advanced-filters-btn ${showAdvancedFilters ? 'active' : ''}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <i className={`fas fa-${showAdvancedFilters ? 'times' : 'sliders-h'}`}></i>
            {showAdvancedFilters ? 'Close Filters' : 'Advanced Filters'}
            {(filters.company || filters.location || filters.title || filters.salary) && (
              <span className="badge bg-success ms-1 rounded-pill">!</span>
            )}
          </button>

          <div className="filter-group">
            <span className="filter-label">Status</span>
            <div className="tabs-container">
              {validTabs.map((tab) => (
                <button
                  key={tab}
                  className={`tab ${activeTab === tab ? `active ${tab}` : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="advanced-filter-panel">
            <div className="filter-input-group">
              <label className="filter-input-label">Company Name</label>
              <div className="filter-input-wrapper">
                <i className="fas fa-building"></i>
                <input 
                  type="text" 
                  className="filter-field" 
                  placeholder="e.g. Google"
                  value={filters.company}
                  onChange={(e) => setFilters({...filters, company: e.target.value})}
                />
              </div>
            </div>

            <div className="filter-input-group">
              <label className="filter-input-label">Job Title</label>
              <div className="filter-input-wrapper">
                <i className="fas fa-id-badge"></i>
                <input 
                  type="text" 
                  className="filter-field" 
                  placeholder="e.g. Software Engineer"
                  value={filters.title}
                  onChange={(e) => setFilters({...filters, title: e.target.value})}
                />
              </div>
            </div>

            <div className="filter-input-group">
              <label className="filter-input-label">Location</label>
              <div className="filter-input-wrapper">
                <i className="fas fa-map-marker-alt"></i>
                <input 
                  type="text" 
                  className="filter-field" 
                  placeholder="e.g. Bangalore"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                />
              </div>
            </div>

            <div className="filter-input-group">
              <label className="filter-input-label">Salary Range</label>
              <div className="filter-input-wrapper">
                <i className="fas fa-money-bill-wave"></i>
                <input 
                  type="text" 
                  className="filter-field" 
                  placeholder="e.g. 10 - 20 LPA"
                  value={filters.salary}
                  onChange={(e) => setFilters({...filters, salary: e.target.value})}
                />
              </div>
            </div>

            <div className="filter-input-group">
              <label className="filter-input-label">Job Type</label>
              <div className="filter-input-wrapper">
                <i className="fas fa-clock"></i>
                <select 
                  className="filter-select"
                  value={filters.jobType}
                  onChange={(e) => setFilters({...filters, jobType: e.target.value})}
                >
                  <option value="">All Types</option>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                  <option value="Part-Time">Part-Time</option>
                </select>
              </div>
            </div>

            <div className="filter-input-group">
              <label className="filter-input-label">Department</label>
              <div className="filter-input-wrapper">
                <i className="fas fa-university"></i>
                <select 
                  className="filter-select"
                  value={filters.department}
                  onChange={(e) => setFilters({...filters, department: e.target.value})}
                >
                  <option value="">All Departments</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="filter-input-group">
              <label className="filter-input-label">Programme</label>
              <div className="filter-input-wrapper">
                <i className="fas fa-graduation-cap"></i>
                <select 
                  className="filter-select"
                  value={filters.programme}
                  onChange={(e) => setFilters({...filters, programme: e.target.value})}
                >
                  <option value="">All Programmes</option>
                  {programmes.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                </select>
              </div>
            </div>

            <div className="filter-input-group">
              <label className="filter-input-label">Batch Year</label>
              <div className="filter-input-wrapper">
                <i className="fas fa-calendar-alt"></i>
                <select 
                  className="filter-select"
                  value={filters.year}
                  onChange={(e) => setFilters({...filters, year: e.target.value})}
                >
                  <option value="">All Years</option>
                  {graduationYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <button 
              className="clear-filters-btn"
              onClick={() => setFilters({
                company: "", location: "", title: "", salary: "", 
                jobType: "", department: "", programme: "", year: ""
              })}
            >
              <i className="fas fa-undo me-1"></i>
              Reset
            </button>
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            <i className="fas fa-circle-notch fa-spin empty-icon" style={{color: '#10b981'}}></i>
            <div className="empty-title">Loading job postings...</div>
            <div className="empty-desc">Please wait while we fetch the latest listings.</div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="empty-state">
            <i className={`fas fa-${activeTab === 'approved' ? 'check-double' : activeTab === 'rejected' ? 'ban' : 'clock'} empty-icon`}></i>
            <div className="empty-title">No {activeTab} jobs found</div>
            <div className="empty-desc">
              {searchQuery 
                ? `We couldn't find any results matching "${searchQuery}".`
                : `There are currently no job postings in the ${activeTab} category.`}
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Salary</th>
                    <th>Departments</th>
                    <th>Programmes</th>
                    <th>Years</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedJobs.map((job) => (
                    <tr key={job.id} className={`${job.job_type?.toLowerCase().replace('_', '-')}-row`}>
                      <td data-label="Title" className="job-title-cell">
                        {job.title || "—"}
                      </td>
                      <td data-label="Company" className="company-cell">
                        <i className="fas fa-building me-1 opacity-75"></i>
                        {job.company || "—"}
                      </td>
                      <td data-label="Location">
                        <div className="meta-text">
                          <i className="fas fa-map-marker-alt"></i>
                          {job.location || "—"}
                        </div>
                      </td>
                      <td data-label="Type">
                         <span className={`badge-type badge-${job.job_type?.toLowerCase().replace('_', '-')}`}>
                           {job.job_type?.replace('_', ' ') || "—"}
                         </span>
                      </td>
                      <td data-label="Salary">{job.salary_range || "—"}</td>
                      <td data-label="Departments">
                        <div className="meta-text fw-600">
                          {job.show_to_all_departments
                            ? "All Departments"
                            : Array.isArray(job.departments)
                              ? job.departments.join(", ")
                              : job.departments || "—"}
                        </div>
                      </td>
                      <td data-label="Programmes">
                        <div className="meta-text fw-600">
                          {Array.isArray(job.programmes)
                            ? job.programmes.join(", ")
                            : job.programmes || "—"}
                        </div>
                      </td>
                      <td data-label="Years">
                        <div className="meta-text fw-600">
                          <i className="fas fa-calendar-alt me-1 opacity-50"></i>
                          {Array.isArray(job.graduation_years)
                            ? job.graduation_years.join(", ")
                            : job.graduation_years || "—"}
                        </div>
                      </td>
                      <td data-label="Actions">
                        <div className="action-cell">
                          <button
                            className="btn-action btn-details"
                            onClick={() => handleShowDetails(job)}
                          >
                            <i className="fas fa-info-circle"></i>
                            Full Details
                          </button>
                          {activeTab !== "approved" && (
                            <button
                              className="btn-action btn-approve"
                              onClick={() => handleApproveClick(job)}
                            >
                              <i className="fas fa-check"></i>
                              Approve
                            </button>
                          )}
                          {activeTab !== "rejected" && (
                            <button
                              className="btn-action btn-reject"
                              onClick={() => handleAction("reject", job.id)}
                            >
                              <i className="fas fa-times"></i>
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
            
            <div className="pagination-bar d-flex justify-content-between align-items-center p-3 border-top" style={{background: '#f8fafc', borderBottomLeftRadius: '1rem', borderBottomRightRadius: '1rem'}}>
              <div style={{fontSize: '0.875rem', color: '#64748b'}}>
                Showing <span>{Math.min((currentPage - 1) * entriesPerPage + 1, filteredJobs.length)}</span> to <span>{Math.min(currentPage * entriesPerPage, filteredJobs.length)}</span> of <span>{filteredJobs.length}</span> entries
              </div>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-sm btn-outline-secondary" 
                  disabled={currentPage === 1}
                  onClick={handlePrevPage}
                  style={{borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.8rem', padding: '0.4rem 0.8rem'}}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i} 
                    className={`btn btn-sm ${currentPage === i + 1 ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => setCurrentPage(i + 1)}
                    style={{borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.8rem', padding: '0.4rem 0.8rem'}}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  className="btn btn-sm btn-outline-secondary" 
                  disabled={currentPage === totalPages}
                  onClick={handleNextPage}
                  style={{borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.8rem', padding: '0.4rem 0.8rem'}}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Job Visibility Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" style={{maxWidth: '750px', width: '95%', padding: '0'}} onClick={e => e.stopPropagation()}>
                
                <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center" style={{borderTopLeftRadius: '1.25rem', borderTopRightRadius: '1.25rem'}}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="p-3 rounded-circle bg-success bg-opacity-10 text-success">
                      <i className="fas fa-eye fa-lg"></i>
                    </div>
                    <div>
                      <h5 className="modal-title mb-0 fw-800">Visibility Settings</h5>
                      <p className="text-secondary mb-0 small fw-500">Configure who can see and apply for this job</p>
                    </div>
                  </div>
                  <button type="button" className="btn-close shadow-none" onClick={() => setShowModal(false)}></button>
                </div>

                <div className="modal-body p-4" style={{maxHeight: '70vh', overflowY: 'auto'}}>
                  <div className="alert alert-info border-0 d-flex align-items-center gap-3 mb-4 rounded-4 shadow-sm bg-primary bg-opacity-10 text-primary">
                    <i className="fas fa-info-circle fa-lg"></i>
                    <p className="mb-0 small fw-500">Targeting the right audience ensures higher quality applications and relevant placements.</p>
                  </div>

                  <div className="form-check-card mb-4 border-primary border-opacity-25 bg-white py-3">
                    <input
                      className="form-check-input ms-0 me-2"
                      type="checkbox"
                      id="selectAll"
                      checked={selectAll}
                      onChange={() => {
                        setSelectAll(!selectAll);
                        if (!selectAll) {
                          setSelectedDepartments([]);
                          setSelectedProgrammes([]);
                        }
                      }}
                    />
                    <label className="form-check-label fw-800 text-primary" htmlFor="selectAll">
                      Global Visibility (Show to All Departments & Programmes)
                    </label>
                  </div>

                  {!selectAll && (
                    <>
                      <div className="section-header">
                        <i className="fas fa-graduation-cap"></i> Programmes
                      </div>
                      <div className="scroll-area mb-4">
                        <div className="checkbox-grid">
                          {programmes.map((p) => (
                            <div key={p.name} className="form-check-card">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`prog-${p.name}`}
                                checked={selectedProgrammes.includes(p.name)}
                                onChange={() => {
                                  setSelectedProgrammes((prev) =>
                                    prev.includes(p.name)
                                      ? prev.filter((x) => x !== p.name)
                                      : [...prev, p.name]
                                  );
                                  if (!selectedDepartments.includes(p.department)) {
                                    setSelectedDepartments((prev) => [...prev, p.department]);
                                  }
                                }}
                              />
                              <label className="form-check-label fw-800 text-dark" htmlFor={`prog-${p.name}`}>
                                {p.name} <br/>
                                <small className="text-secondary fw-500">{p.department}</small>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="section-header">
                        <i className="fas fa-calendar-check"></i> Graduation Years
                      </div>
                      <div className="scroll-area">
                        <div className="checkbox-grid">
                          {graduationYears.map((y) => (
                            <div key={y} className="form-check-card">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`year-${y}`}
                                checked={selectedYears.includes(y)}
                                onChange={() =>
                                  setSelectedYears((prev) =>
                                    prev.includes(y) ? prev.filter((x) => x !== y) : [...prev, y]
                                  )
                                }
                              />
                              <label className="form-check-label fw-800 text-dark" htmlFor={`year-${y}`}>
                                Class of {y}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="modal-footer p-4 border-top bg-light" style={{borderBottomLeftRadius: '1.25rem', borderBottomRightRadius: '1.25rem'}}>
                  <button
                    type="button"
                    className="btn btn-light fw-700 px-4 py-2 border rounded-3"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-success fw-700 px-4 py-2 rounded-3 shadow-sm ms-2"
                    style={{backgroundColor: '#10b981'}}
                    onClick={() => handleAction("approve", selectedJobId)}
                  >
                    Confirm & Approve Job
                  </button>
                </div>
            </div>
          </div>
        )}

        {/* Full Application Details Modal */}
        {showDetailsModal && selectedJobDetails && (
          <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
            <div className="modal-content" style={{maxWidth: '850px', width: '95%', padding: '0'}} onClick={e => e.stopPropagation()}>
              
              {/* Decorative Header */}
              <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center" style={{borderTopLeftRadius: '1.25rem', borderTopRightRadius: '1.25rem'}}>
                <div className="d-flex align-items-center gap-4">
                  <div className="bg-white shadow-sm p-3 rounded-4 d-flex align-items-center justify-content-center" style={{width: '64px', height: '64px'}}>
                    <i className="fas fa-building fa-2x text-primary opacity-50"></i>
                  </div>
                  <div>
                    <h4 className="fw-800 mb-1" style={{fontFamily: 'Outfit', letterSpacing: '-0.02em'}}>
                      {selectedJobDetails.title}
                    </h4>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-primary bg-opacity-10 text-primary fw-700 px-2">Job Opening</span>
                      <span className="text-secondary small fw-500">• Posted by <strong>{selectedJobDetails.company}</strong></span>
                    </div>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn-close shadow-none" 
                  onClick={() => setShowDetailsModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4" style={{maxHeight: '75vh', overflowY: 'auto'}}>
                
                {/* Status Alert if not approved */}
                {activeTab === 'pending' && (
                  <div className="alert alert-warning border-0 d-flex align-items-center gap-3 mb-4 rounded-4 shadow-sm">
                    <i className="fas fa-shield-alt fa-lg"></i>
                    <div>
                      <h6 className="mb-0 fw-700">Verification Required</h6>
                      <p className="mb-0 small opacity-75">Please review the details thoroughly before granting access to students.</p>
                    </div>
                  </div>
                )}

                <div className="modal-details-grid">
                  <div className="detail-card">
                    <div className="detail-label">
                      <i className="fas fa-map-marker-alt"></i> Location
                    </div>
                    <div className="detail-value">{selectedJobDetails.location || "On-site / Remote not specified"}</div>
                  </div>
                  
                  <div className="detail-card">
                    <div className="detail-label">
                      <i className="fas fa-money-bill-wave"></i> Package / Salary
                    </div>
                    <div className="detail-value text-success">
                      {selectedJobDetails.salary_range || "Competitive / Not Disclosed"}
                    </div>
                  </div>

                  <div className="detail-card">
                    <div className="detail-label">
                      <i className="fas fa-briefcase"></i> Employment Type
                    </div>
                    <div className="detail-value">{selectedJobDetails.job_type}</div>
                  </div>

                  <div className="detail-card">
                    <div className="detail-label">
                      <i className="fas fa-hourglass-end"></i> Application Deadline
                    </div>
                    <div className="detail-value text-danger">
                      {selectedJobDetails.application_deadline 
                        ? new Date(selectedJobDetails.application_deadline).toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric'}) 
                        : "Ongoing Enrollment"}
                    </div>
                  </div>
                </div>

                <div className="section-divider" data-label="Job Scope"></div>

                <div className="mb-5">
                  <div className="detail-label mb-3">
                    <i className="fas fa-file-alt"></i> Detailed Description & Candidate Requirements
                  </div>
                  <div className="job-desc-box">
                    {selectedJobDetails.description || "The company has not provided a text-based description for this role."}
                  </div>
                </div>

                <div className="section-divider" data-label="Student Eligibility"></div>

                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="detail-label mb-3">
                      <i className="fas fa-university"></i> Eligible Departments
                    </div>
                    <div className="d-flex flex-wrap">
                      {selectedJobDetails.show_to_all_departments ? (
                        <span className="detail-badge bg-primary text-white border-0">All Departments</span>
                      ) : Array.isArray(selectedJobDetails.departments) && selectedJobDetails.departments.length > 0 ? (
                        selectedJobDetails.departments.map(dept => (
                          <span key={dept} className="detail-badge">{dept}</span>
                        ))
                      ) : selectedJobDetails.departments ? (
                        <span className="detail-badge">{selectedJobDetails.departments}</span>
                      ) : (
                        <span className="text-muted small">No specific departments set.</span>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="detail-label mb-3">
                      <i className="fas fa-calendar-check"></i> Target Graduating Batches
                    </div>
                    <div className="d-flex flex-wrap">
                      {Array.isArray(selectedJobDetails.graduation_years) && selectedJobDetails.graduation_years.length > 0 ? (
                        selectedJobDetails.graduation_years.map(year => (
                          <span key={year} className="detail-badge" style={{background: '#f0fdf4', color: '#16a34a', borderColor: '#dcfce7'}}>Class of {year}</span>
                        ))
                      ) : selectedJobDetails.graduation_years ? (
                        <span className="detail-badge" style={{background: '#f0fdf4', color: '#16a34a', borderColor: '#dcfce7'}}>{selectedJobDetails.graduation_years}</span>
                      ) : (
                        <span className="text-muted small">No batch restrictions.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer p-4 border-top bg-light" style={{borderBottomLeftRadius: '1.25rem', borderBottomRightRadius: '1.25rem'}}>
                <button 
                  type="button" 
                  className="btn btn-light fw-700 px-4 py-2 border rounded-3"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close View
                </button>
                
                {activeTab === "pending" && (
                  <button 
                    type="button" 
                    className="btn btn-success fw-700 px-4 py-2 rounded-3 shadow-sm ms-2"
                    style={{backgroundColor: '#10b981'}}
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleApproveClick(selectedJobDetails.id);
                    }}
                  >
                    Confirm & Approve Job
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
}
