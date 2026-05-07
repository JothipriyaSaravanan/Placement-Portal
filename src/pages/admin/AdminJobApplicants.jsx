import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminPageLayout from "../../components/admin/AdminPageLayout";

const API_BASE = "http://127.0.0.1:8000";

export default function AdminJobApplicants() {
  const location = useLocation();
  const navigate = useNavigate();
  const { jobId, companyEmail, jobTitle } = location.state || {};

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination and Filtering State
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!jobId || !companyEmail) {
      setError("Missing job or company information");
      setLoading(false);
      return;
    }

    setLoading(true);
    axios
      .get(`${API_BASE}/companies/applications/?email=${companyEmail}&job_id=${jobId}`, {
        withCredentials: true,
      })
      .then((res) => {
        setStudents(res.data.applications || []);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load applicants");
      })
      .finally(() => setLoading(false));
  }, [jobId, companyEmail]);

  const handleDownloadExcel = () => {
    if (!jobId || !companyEmail) return;
    window.open(
      `${API_BASE}/companies/download-excel/?email=${companyEmail}&job_id=${jobId}`,
      "_blank"
    );
  };

  // Filtered students based on search query
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const student = s.student || {};
      const searchStr = `${student.name} ${student.email} ${student.department} ${student.phone} ${student.passed_out_year} ${student.cgpa}`.toLowerCase();
      return searchStr.includes(searchQuery.toLowerCase());
    });
  }, [students, searchQuery]);

  // Paginated students
  const totalPages = Math.ceil(filteredStudents.length / entriesPerPage) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredStudents.slice(start, start + entriesPerPage);
  }, [filteredStudents, currentPage, entriesPerPage]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchQuery, entriesPerPage]);

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <AdminPageLayout title={jobTitle ? `${jobTitle} - Applicants` : "Job Applicants"} icon="fas fa-users">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700&display=swap');

        .applicants-container {
          padding: 1.5rem 2rem;
          background: #f8fafc;
          min-height: calc(100vh - 80px);
          font-family: 'Inter', sans-serif;
        }

        .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .action-group-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          background: #ffffff;
          color: #1e293b;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .back-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          transform: translateX(-3px);
        }

        .download-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
        }

        .download-btn:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
        }

        /* ─── Filter Bar ────────────────────────────────────────── */
        .filter-bar {
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

        .search-wrapper {
          position: relative;
          flex: 1;
          min-width: 250px;
          max-width: 400px;
        }

        .search-wrapper i {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .search-input {
          width: 100%;
          padding: 0.65rem 1rem 0.65rem 2.5rem;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 0.875rem;
          font-weight: 500;
          outline: none;
          transition: all 0.2s;
        }

        .search-input:focus {
          background: #ffffff;
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .entries-selection {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 500;
        }

        .entries-select {
          padding: 0.5rem 2rem 0.5rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
          outline: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' %3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.5rem center;
          background-size: 1rem;
        }

        /* ─── Table Styling ────────────────────────────────────────── */
        .table-card {
          background: #ffffff;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .table-container {
          overflow-x: auto;
        }

        .applicants-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          min-width: 900px;
        }

        .applicants-table th {
          background: #1e1b4b; /* Premium Deep Indigo Header */
          padding: 1.25rem 1.5rem;
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #ffffff;
          border-bottom: none;
        }

        .applicants-table td {
          padding: 1.1rem 1.5rem;
          font-size: 0.875rem;
          color: #1e293b;
          border-bottom: 1px solid #f1f5f9;
          font-weight: 700; /* Bold contents for all rows */
        }

        /* Nth-row effects (Zebra striping) */
        .applicants-table tbody tr:nth-child(even) {
          background-color: #fcfdfe;
        }

        .applicants-table tbody tr:hover {
          background-color: #f1f5f9;
        }

        .student-name-cell {
          font-weight: 600;
          color: #0f172a;
        }

        .email-cell {
          color: #6366f1;
          font-weight: 500;
        }

        .cgpa-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #f0fdf4;
          color: #166534;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 0.75rem;
          border: 1px solid #dcfce7;
        }

        /* ─── Pagination ─────────────────────────────────────────── */
        .pagination-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        .pagination-info {
          font-size: 0.875rem;
          color: #64748b;
        }

        .pagination-info span {
          color: #1e293b;
          font-weight: 600;
        }

        .pagination-controls {
          display: flex;
          gap: 0.5rem;
        }

        .page-btn {
          padding: 0.5rem 0.85rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          background: #ffffff;
          color: #64748b;
          font-weight: 600;
          font-size: 0.8125rem;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 2.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .page-btn:hover:not(:disabled) {
          background: #f1f5f9;
          color: #1e293b;
          border-color: #cbd5e1;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-btn.active {
          background: #6366f1;
          color: white;
          border-color: #6366f1;
        }

        .empty-state {
          text-align: center;
          padding: 5rem 2rem;
          color: #94a3b8;
        }

        .empty-state i {
          font-size: 3rem;
          margin-bottom: 1rem;
          display: block;
        }

        .error-banner {
          padding: 1rem;
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fee2e2;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          text-align: center;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .filter-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .search-wrapper {
            max-width: none;
          }
          .pagination-bar {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
      `}</style>

      <div className="applicants-container">
        <div className="header-actions">
          <div className="action-group-left">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-left"></i> Back
            </button>
          </div>
          {students.length > 0 && !loading && !error && (
            <button className="download-btn" onClick={handleDownloadExcel}>
              <i className="fas fa-file-excel"></i> Download Excel
            </button>
          )}
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="filter-bar">
          <div className="entries-selection">
            Show 
            <select 
              className="entries-select" 
              value={entriesPerPage} 
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            entries
          </div>

          <div className="search-wrapper">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search applicants by name, email, department..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-card">
          <div className="table-container">
            {loading ? (
              <div className="empty-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading applicants...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-folder-open"></i>
                <p>{searchQuery ? "No matching applicants found." : "No applications found for this job yet."}</p>
              </div>
            ) : (
              <table className="applicants-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Phone</th>
                    <th>Year</th>
                    <th>CGPA</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((s, index) => (
                    <tr key={index}>
                      <td className="student-name-cell">{s.student?.name || "—"}</td>
                      <td className="email-cell">{s.student?.email || "—"}</td>
                      <td>{s.student?.department || "—"}</td>
                      <td>{s.student?.phone || "—"}</td>
                      <td>{s.student?.passed_out_year || "—"}</td>
                      <td>
                        <span className="cgpa-badge">{s.student?.cgpa && s.student?.cgpa !== "N/A" ? s.student.cgpa : "—"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {filteredStudents.length > 0 && (
            <div className="pagination-bar">
              <div className="pagination-info">
                Showing <span>{Math.min((currentPage - 1) * entriesPerPage + 1, filteredStudents.length)}</span> to <span>{Math.min(currentPage * entriesPerPage, filteredStudents.length)}</span> of <span>{filteredStudents.length}</span> entries
              </div>
              <div className="pagination-controls">
                <button 
                  className="page-btn" 
                  disabled={currentPage === 1}
                  onClick={handlePrevPage}
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
                  onClick={handleNextPage}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminPageLayout>
  );
}