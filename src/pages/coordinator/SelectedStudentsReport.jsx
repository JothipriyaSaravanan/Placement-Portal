


// src/pages/coordinator/SelectedStudentsReport.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8000";

export default function SelectedStudentsReport() {
  const navigate = useNavigate();

  const coordinatorName = localStorage.getItem("coordinatorUsername") || "Coordinator";
  const department = localStorage.getItem("department") || "";

  const [programmes, setProgrammes] = useState([]);
  const [selectedProgramme, setSelectedProgramme] = useState(null);

  const [report, setReport] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const [studentSearchTerm, setStudentSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // CHECK LOGIN + FETCH PROGRAMMES
  useEffect(() => {
    if (!localStorage.getItem("coordinatorUsername")) {
      navigate("/coordinator/login");
      return;
    }
    fetchProgrammes();
  }, [navigate]);

  const fetchProgrammes = async () => {
    try {
      setLoading(true);
      const encodedDept = encodeURIComponent(department);
      const res = await axios.get(
        `${API_BASE}/coordinator/programmes/?department=${encodedDept}`
      );
      setProgrammes(res.data.programmes || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch programmes.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async (programme) => {
    try {
      setLoading(true);
      setError("");

      const encodedDept = encodeURIComponent(department);
      const encodedProgramme = encodeURIComponent(programme);

      const res = await axios.get(
        `${API_BASE}/coordinator/selected-students-report/?department=${encodedDept}&programme=${encodedProgramme}`
      );

      const data = res.data.selected_students || [];

      const normalizedData = data.map((item) => ({
        ...item,
        passed_out_year: Number(item.passed_out_year),
      }));

      setReport(normalizedData);

      const uniqueBatches = [...new Set(normalizedData.map((item) => item.passed_out_year))]
        .filter(Boolean)
        .sort((a, b) => b - a);

      setBatches(uniqueBatches);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch selected students report.");
    } finally {
      setLoading(false);
    }
  };

  // Filtered students
  const filteredStudents = report
    .filter((item) =>
      selectedBatch ? Number(item.passed_out_year) === Number(selectedBatch) : true
    )
    .filter((item) => {
      if (!studentSearchTerm.trim()) return true;
      const term = studentSearchTerm.toLowerCase();
      return (
        (item.university_reg_no || "").toLowerCase().includes(term) ||
        (item.student_name || "").toLowerCase().includes(term) ||
        (item.student_email || "").toLowerCase().includes(term) ||
        (item.company || "").toLowerCase().includes(term) ||
        (item.job_title || "").toLowerCase().includes(term)
      );
    });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');

        .reports-page {
          background-color: #f8fafc;
          min-height: 100vh;
          padding: 2rem;
          font-family: 'Inter', sans-serif;
          color: #0f172a;
        }

        .registry-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Expensive Hub Banner (Indigo Theme) */
        .hub-banner {
          background: #312e81; /* Royal Indigo Institutional */
          padding: 2rem 3.5rem; /* Reduced height from 2.5rem */
          border-radius: 20px;
          margin-bottom: 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          overflow: hidden;
          border: none;
        }

        /* Sharp Structural Shapes */
        .banner-accent-1 {
          position: absolute;
          top: -30px;
          left: -30px;
          width: 250px;
          height: 250px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 50px;
          transform: rotate(45deg);
        }

        .banner-accent-2 {
          position: absolute;
          bottom: -50px;
          right: 5%;
          width: 180px;
          height: 180px;
          background: rgba(0, 0, 0, 0.15);
          border-radius: 999px;
        }

        .banner-content {
          position: relative;
          z-index: 2;
        }

        .banner-content h1 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem; /* Reduced for consistency */
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.03em;
          text-transform: uppercase;
        }

        .banner-content p {
          margin: 0.5rem 0 1.5rem 0; /* Tightened from 0.8rem / 1.8rem */
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.85rem; /* Slightly smaller for compactness */
          font-weight: 500;
          max-width: 600px;
          line-height: 1.4;
        }

        .stats-strip {
          display: flex;
          gap: 1.5rem;
        }

        .stat-pillar {
          background: rgba(255, 255, 255, 0.1);
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          padding: 0.6rem 1.25rem;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dept-tag {
          background: #ffffff;
          color: #312e81;
          padding: 0.4rem 1.2rem;
          border-radius: 999px;
          font-size: 0.65rem;
          font-weight: 800;
          position: absolute;
          top: 2rem;
          right: 3.5rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          border: 1.5px solid #312e81;
          z-index: 5;
        }

        .banner-icon {
          width: 90px; /* Reduced from 110px */
          height: 90px;
          background: #ffffff;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem; /* Reduced from 3rem */
          color: #312e81;
          z-index: 2;
          transform: rotate(-5deg);
          flex-shrink: 0;
          margin-top: 1.5rem; /* Adjusted for alignment */
        }

        /* Navigation Breadcrumbs */
        .nav-crumbs {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
          font-size: 0.9rem;
          color: #64748b;
          font-weight: 600;
        }

        .crumb-item {
          cursor: pointer;
          transition: color 0.2s;
        }
        .crumb-item:hover { color: #312e81; }
        .crumb-active { color: #0f172a; font-weight: 800; }

        /* Folders Grid */
        .folders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .folder-card {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 2rem 1.5rem; /* Increased back for proper spacing */
          text-align: center;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 165px; /* Balanced height */
        }

        .folder-card:hover {
          border-color: #312e81;
          background: #f5f7ff;
          transform: translateY(-4px);
        }

        .folder-card i {
          color: #312e81;
          font-size: 2.4rem; /* Reduced from 2.8rem */
          margin-bottom: 0.75rem; /* Reduced from 1.25rem for tighter alignment */
        }

        .folder-card h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.3rem;
          font-weight: 800;
          color: #1e1b4b;
          margin: 0;
          padding-bottom: 0.5rem; /* Safe buffer from hover footer */
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .folder-card::after {
          content: 'OPEN REGISTRY';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          background: #312e81;
          color: white;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.6rem; /* Tightened from 0.75rem */
          transform: translateY(100%);
          transition: transform 0.2s;
          letter-spacing: 1px;
        }

        .folder-card:hover::after {
          transform: translateY(0);
        }

        /* Data Control Suite */
        .registry-suite {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 15px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .search-box {
          flex: 1;
          position: relative;
        }

        .search-box i {
          position: absolute;
          left: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .search-box input {
          width: 100%;
          padding: 0.85rem 1rem 0.85rem 3rem;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          outline: none;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          transition: all 0.2s;
        }
        .search-box input:focus { border-color: #312e81; background: #ffffff; }

        /* Professional Report Table */
        .table-registry-wrap {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 15px;
          overflow: hidden;
        }

        .registry-table { width: 100%; border-collapse: collapse; }
        
        .registry-table th {
          background: #1e1b4b; /* Darkest Navy */
          color: #ffffff;
          padding: 1.4rem 1.25rem;
          font-family: 'Inter', sans-serif;
          font-weight: 800;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          text-align: left;
          border-bottom: 4px solid #312e81;
        }

        .registry-table td {
          padding: 1.25rem;
          border-bottom: 1.5px solid #f1f5f9;
          font-size: 0.95rem;
          font-weight: 500;
          color: #334155;
        }

        .registry-table tr:hover td {
          background: #f8fafc;
        }

        .id-badge {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #0f172a;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          font-family: monospace;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .status-pill {
          background: #ecfdf5;
          color: #059669;
          padding: 0.3rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        /* State UI */
        .empty-registry {
          text-align: center;
          padding: 6rem 2rem;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 15px;
          color: #64748b;
        }

        .empty-registry i { font-size: 4rem; margin-bottom: 1.5rem; color: #cbd5e1; }
        .empty-registry h3 { font-family: 'Outfit', sans-serif; color: #0f172a; margin-bottom: 0.5rem; }

        .loading-registry {
          padding: 10rem;
          text-align: center;
          color: #312e81;
          font-weight: 700;
          letter-spacing: 1px;
        }
      `}</style>

      <div className="reports-page">
        <div className="registry-container">
          
          <header className="hub-banner">
            <div className="banner-accent-1"></div>
            <div className="banner-accent-2"></div>
            
            <div className="dept-tag">
              <i className="fas fa-university me-1"></i> {department}
            </div>

            <div className="banner-content">
              <h1>Placement Registry Hub</h1>
              <p>Analyze official selection reports, student placement records, and institutional recruitment synchronization for your department.</p>
              
              <div className="stats-strip">
                <div className="stat-pillar">
                  <i className="fas fa-file-contract"></i> Official Reports
                </div>
                <div className="stat-pillar">
                  <i className="fas fa-check-circle"></i> Verified Selections
                </div>
              </div>
            </div>

            <div className="banner-icon">
              <i className="fas fa-file-invoice"></i>
            </div>
          </header>

          <nav className="nav-crumbs">
            <span 
              className={`crumb-item ${!selectedProgramme ? "crumb-active" : ""}`}
              onClick={() => { setSelectedProgramme(null); setSelectedBatch(null); }}
            >
              All Registry Folders
            </span>
            {selectedProgramme && (
              <>
                <i className="fas fa-chevron-right mx-2 text-muted" style={{ fontSize: '0.7rem' }}></i>
                <span 
                  className={`crumb-item ${!selectedBatch ? "crumb-active" : ""}`}
                  onClick={() => setSelectedBatch(null)}
                >
                  {selectedProgramme.replace(/_/g, " ")}
                </span>
              </>
            )}
            {selectedBatch && (
              <>
                <i className="fas fa-chevron-right mx-2 text-muted" style={{ fontSize: '0.7rem' }}></i>
                <span className="crumb-active">Batch {selectedBatch}</span>
              </>
            )}
          </nav>

          {loading && <div className="loading-registry">INITIALIZING SECURE REGISTRY...</div>}
          {error && <div className="error-message">SYSTEM ALERT: {error}</div>}

          {!loading && !error && (
            <>
              {/* STEP 1: SELECT PROGRAMME */}
              {!selectedProgramme && (
                <div className="folders-grid">
                  {programmes.map((prog) => (
                    <div 
                      key={prog} 
                      className="folder-card"
                      onClick={() => {
                        setSelectedProgramme(prog);
                        fetchReport(prog);
                      }}
                    >
                      <i className="fas fa-folder-open"></i>
                      <h3>{prog.replace(/_/g, " ")}</h3>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 2: SELECT BATCH */}
              {selectedProgramme && !selectedBatch && (
                <>
                  {batches.length === 0 ? (
                    <div className="empty-registry">
                      <i className="fas fa-folder-closed"></i>
                      <h3>No Records Available</h3>
                      <p>Currently, there are no verified placement records for this programme registry.</p>
                    </div>
                  ) : (
                    <div className="folders-grid">
                      {batches.map((year) => (
                        <div 
                          key={year} 
                          className="folder-card"
                          onClick={() => setSelectedBatch(year)}
                        >
                          <i className="fas fa-archive"></i>
                          <h3>Batch {year}</h3>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* STEP 3: REGISTRY TABLE */}
              {selectedBatch && (
                <>
                  <div className="registry-suite">
                    <div className="search-box">
                      <i className="fas fa-search"></i>
                      <input 
                        type="text" 
                        placeholder="Search Registry by ID, Name, or Company..."
                        value={studentSearchTerm}
                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {filteredStudents.length === 0 ? (
                    <div className="empty-registry">
                      <i className="fas fa-search-minus"></i>
                      <h3>Zero Search Results</h3>
                      <p>No placement records match your current search parameters in this batch.</p>
                    </div>
                  ) : (
                    <div className="table-registry-wrap">
                      <table className="registry-table">
                        <thead>
                          <tr>
                            <th>ID / REG NO</th>
                            <th>STUDENT NAME</th>
                            <th>INSTITUTIONAL EMAIL</th>
                            <th>COMPANY ENTITY</th>
                            <th>DESIGNATION</th>
                            <th>STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.map((item, index) => (
                            <tr key={index}>
                              <td><span className="id-badge">{item.university_reg_no || "—"}</span></td>
                              <td>{item.student_name || "—"}</td>
                              <td>{item.student_email || "—"}</td>
                              <td style={{ fontWeight: '700', color: '#312e81' }}>{item.company || "—"}</td>
                              <td>{item.job_title || "—"}</td>
                              <td><span className="status-pill">PLACED</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
}