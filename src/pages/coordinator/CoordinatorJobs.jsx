
// src/pages/coordinator/CoordinatorJobs.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8000";

export default function CoordinatorJobs() {
  const navigate = useNavigate();

  const [programmes, setProgrammes] = useState([]);
  const [selectedProgramme, setSelectedProgramme] = useState(null);

  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);

  const [jobs, setJobs] = useState([]);
  const [searchJob, setSearchJob] = useState("");
  const [jobType, setJobType] = useState("active");

  const [loading, setLoading] = useState(true);
  const [yearsLoading, setYearsLoading] = useState(false);
  const [error, setError] = useState("");

  const coordinatorName =
    localStorage.getItem("coordinatorUsername") || "Coordinator";
  const department = localStorage.getItem("department") || "";

  useEffect(() => {
    if (!department) {
      navigate("/coordinator/login");
      return;
    }
    fetchProgrammes();
  }, []);

  const fetchProgrammes = async () => {
    try {
      const res = await axios.get(`${API_BASE}/coordinator/programmes/`, {
        params: { department },
      });
      setProgrammes(res.data.programmes || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load programmes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProgramme) {
      fetchAvailableGraduationYears();
    }
  }, [selectedProgramme]);

  const fetchAvailableGraduationYears = async () => {
    try {
      setYearsLoading(true);
      setError("");
      setAvailableYears([]);
      setJobs([]);

      const yearsRes = await axios.get(`${API_BASE}/api/students/years/`, {
        params: {
          department,
          programme: selectedProgramme,
        },
      });

      let years = yearsRes.data.years || [];
      years = years.sort((a, b) => b - a);

      if (years.length === 0) {
        setAvailableYears([]);
        return;
      }

      const yearJobChecks = years.map(async (year) => {
        try {
          const jobsRes = await axios.get(`${API_BASE}/companies/jobs/`, {
            params: {
              department,
              programme: selectedProgramme,
              graduation_year: year,
              status: "all",
            },
          });

          return (jobsRes.data.jobs || []).length > 0 ? year : null;
        } catch {
          return null;
        }
      });

      const results = await Promise.all(yearJobChecks);
      const yearsWithJobs = results.filter((y) => y !== null);

      setAvailableYears(yearsWithJobs);
    } catch (err) {
      console.error(err);
      setError("Failed to load available batches.");
    } finally {
      setYearsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedYear !== null) {
      fetchJobs();
    }
  }, [selectedYear, jobType]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      let endpoint = `${API_BASE}/companies/jobs/`;
      const params = {
        department,
        programme: selectedProgramme,
        graduation_year: selectedYear,
      };

      if (jobType === "active") {
        endpoint = `${API_BASE}/companies/jobs/active/`;
        params.status = "active";
      } else {
        params.status = "all";
      }

      const res = await axios.get(endpoint, {
        params,
      });

      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      (job.title || "").toLowerCase().includes(searchJob.toLowerCase()) ||
      (job.company || "").toLowerCase().includes(searchJob.toLowerCase()) ||
      (job.job_location || "").toLowerCase().includes(searchJob.toLowerCase())
  );

  const handleViewApplicants = (job) => {
    const companyEmail =
      job?.company_email ||
      job?.companyEmail ||
      job?.company?.email ||
      "";

    const query = new URLSearchParams({
      department,
      programme: selectedProgramme || "",
      year: selectedYear !== null ? String(selectedYear) : "",
      job_id: job?.id ? String(job.id) : "",
      email: companyEmail,
      job_title: job?.title || "",
      username: coordinatorName,
      coordinator_role: coordinatorName,
    });

    navigate(`/coordinator/applied-students?${query.toString()}`, {
      state: {
        jobId: job?.id || null,
        companyEmail,
        jobTitle: job?.title || "",
        department,
        programme: selectedProgramme || "",
        year: selectedYear || "",
        username: coordinatorName,
      },
    });
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        .coordinator-page {
          background-color: #fcfdfe;
          min-height: 100vh;
          padding: 2rem;
          font-family: 'Inter', sans-serif;
          color: #1e293b;
        }

        .registry-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Advanced Hub Header (Image-like Card Design) */
        .dashboard-banner {
          background: #9d174d; /* Muted Deep Ruby Pink - Less Eye Strain */
          padding: 2rem 3.5rem;
          border-radius: 20px;
          margin-bottom: 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          overflow: hidden;
          border: none;
        }

        /* Abstract Sharp Decorations */
        .banner-shape-1 {
          position: absolute;
          top: -20px;
          right: -20px;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 40px;
          transform: rotate(15deg);
        }

        .banner-shape-2 {
          position: absolute;
          bottom: -50px;
          left: 10%;
          width: 200px;
          height: 200px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 999px;
        }

        .banner-content {
          position: relative;
          z-index: 2;
          max-width: 60%;
        }

        .banner-content h1 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.03em;
          text-transform: uppercase;
        }

        .banner-content p {
          margin: 0.5rem 0 1.5rem 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.85rem;
          font-weight: 500;
          line-height: 1.5;
        }

        .banner-stats {
          display: flex;
          gap: 2rem;
          margin-top: 1rem;
        }

        .stat-badge {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          padding: 0.6rem 1.25rem;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .banner-illustration {
          position: relative;
          z-index: 2;
          width: 100px;
          height: 100px;
          background: #ffffff;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          color: #9d174d;
          flex-shrink: 0;
          margin-top: 1.5rem;
        }

        .banner-illustration i {
          transform: rotate(-10deg);
        }

        .dept-indicator-small {
          background: rgba(255, 255, 255, 1);
          color: #9d174d;
          padding: 0.5rem 1.4rem;
          border-radius: 999px;
          font-size: 0.65rem;
          font-weight: 800;
          position: absolute;
          top: 1.5rem;
          right: 3rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          border: 1.5px solid #9d174d;
          z-index: 5;
        }

        /* Registry Sections */
        .section-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 1rem;
        }

        .section-header h2 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .nav-breadcrumb {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          color: #64748b;
        }

        .breadcrumb-item {
          cursor: pointer;
          font-weight: 600;
          transition: color 0.2s;
        }
        .breadcrumb-item:hover { color: #9d174d; }
        .breadcrumb-active { color: #0f172a; font-weight: 700; }

        /* Modern Programme Badges */
        .programme-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .programme-card {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 2rem 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 160px;
        }

        .programme-card:hover {
          border-color: #9d174d;
          background: #fff1f2;
          transform: translateY(-2px);
        }

        .programme-card h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.25rem;
          font-weight: 800;
          color: #1e293b;
          margin: 0.75rem 0 0 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .programme-card::after {
          content: 'VIEW BATCHES';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: #9d174d;
          color: white;
          font-size: 0.75rem;
          font-weight: 900;
          padding: 0.6rem;
          transform: translateY(100%);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: 1px;
        }

        .programme-card:hover::after {
          transform: translateY(0);
        }

        /* Action Controls */
        .registry-controls {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          gap: 1.5rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .control-group {
          display: flex;
          gap: 0.5rem;
          background: #f8fafc;
          padding: 0.4rem;
          border-radius: 8px;
          border: 1.5px solid #e2e8f0;
        }

        .tab-btn {
          padding: 0.6rem 1.5rem;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: #64748b;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-btn.active {
          background: #ffffff;
          color: #9d174d;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .registry-search {
          flex-grow: 1;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          outline: none;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          transition: all 0.2s;
        }
        .registry-search:focus { border-color: #9d174d; background: #ffffff; }

        /* Institutional Table */
        .registry-table-wrap {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }

        .registry-table { width: 100%; border-collapse: collapse; }
        .registry-table th {
          background: #9d174d;
          color: white;
          padding: 1.25rem;
          font-family: 'Inter', sans-serif;
          font-weight: 800;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          text-align: left;
          border-bottom: 3px solid #831843;
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

        .btn-action {
          background: #f1f5f9;
          border: 1.5px solid #cbd5e1;
          color: #0f172a;
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-action:hover {
          background: #e11d48;
          border-color: #e11d48;
          color: white;
        }

        .back-nav {
          background: #0f172a;
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .empty-state {
          padding: 5rem 2rem;
          text-align: center;
          color: #64748b;
          font-weight: 500;
          font-size: 1.1rem;
        }
      `}</style>

      <div className="coordinator-page">
        <div className="registry-container">
          <header className="dashboard-banner">
            <div className="banner-shape-1"></div>
            <div className="banner-shape-2"></div>
            
            <div className="dept-indicator-small">
              <i className="fas fa-university me-1"></i> {department}
            </div>

            <div className="banner-content">
              <h1>Opportunities Hub</h1>
              <p>Discover and manage active career pathways, job records, and applicant synchronization for your department's registry.</p>
              
              <div className="banner-stats">
                <div className="stat-badge">
                  <i className="fas fa-layer-group"></i> {programmes.length} Programmes Registered
                </div>
                <div className="stat-badge">
                  <i className="fas fa-briefcase"></i> {coordinatorName.split(' ')[0]} Active Management
                </div>
              </div>
            </div>

            <div className="banner-illustration">
              <i className="fas fa-briefcase"></i>
            </div>
          </header>

          <nav className="nav-breadcrumb">
            <span
              className={`breadcrumb-item ${!selectedProgramme ? "breadcrumb-active" : ""}`}
              onClick={() => { setSelectedProgramme(null); setSelectedYear(null); }}
            >
              All Programmes
            </span>
            {selectedProgramme && (
              <>
                <i className="fas fa-chevron-right mx-1 small"></i>
                <span
                  className={`breadcrumb-item ${!selectedYear ? "breadcrumb-active" : ""}`}
                  onClick={() => setSelectedYear(null)}
                >
                  {selectedProgramme.replace(/_/g, " ")}
                </span>
              </>
            )}
            {selectedYear && (
              <>
                <i className="fas fa-chevron-right mx-1 small"></i>
                <span className="breadcrumb-active">Batch {selectedYear}</span>
              </>
            )}
          </nav>

          {!selectedProgramme && (
            <section>
              <div className="section-header">
                <h2>Select Programme Registry</h2>
              </div>
              <div className="programme-grid">
                {programmes.map((prog) => (
                  <div key={prog} className="programme-card" onClick={() => setSelectedProgramme(prog)}>
                    <i className="fas fa-folder-open mb-3 fa-2x" style={{ color: '#9d174d' }}></i>
                    <h3>{prog.replace(/_/g, " ")}</h3>
                  </div>
                ))}
              </div>
            </section>
          )}

          {selectedProgramme && !selectedYear && (
            <section>
              <button className="back-nav" onClick={() => setSelectedProgramme(null)}>
                <i className="fas fa-arrow-left"></i> Return to Programmes
              </button>
              <div className="section-header">
                <h2>Select Batch Year</h2>
              </div>
              {yearsLoading ? (
                <div className="empty-state">Synchronizing registry batches...</div>
              ) : (
                <div className="programme-grid">
                  {availableYears.map((year) => (
                    <div key={year} className="programme-card" onClick={() => setSelectedYear(year)}>
                      <i className="fas fa-calendar-alt mb-3 fa-2x" style={{ color: '#9d174d' }}></i>
                      <h3>Batch {year}</h3>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {selectedProgramme && selectedYear && (
            <section>
              <button className="back-nav" onClick={() => setSelectedYear(null)}>
                <i className="fas fa-arrow-left"></i> Back to Batches
              </button>

              <div className="section-header">
                <h2>Job Registry: {selectedProgramme.replace(/_/g, " ")} — {selectedYear}</h2>
              </div>

              <div className="registry-controls">
                <div className="control-group">
                  <button
                    className={`tab-btn ${jobType === "active" ? "active" : ""}`}
                    onClick={() => setJobType("active")}
                  >
                    Active Listings
                  </button>
                  <button
                    className={`tab-btn ${jobType === "all" ? "active" : ""}`}
                    onClick={() => setJobType("all")}
                  >
                    Complete Archive
                  </button>
                </div>

                <input
                  className="registry-search"
                  type="text"
                  placeholder="Filter by company, role or location..."
                  value={searchJob}
                  onChange={(e) => setSearchJob(e.target.value)}
                />
              </div>

              {filteredJobs.length === 0 ? (
                <div className="empty-state">No matching records found in the registry for this criteria.</div>
              ) : (
                <div className="registry-table-wrap">
                  <table className="registry-table">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Company Name</th>
                        <th>Work Location</th>
                        <th>Remuneration</th>
                        <th>Deadline</th>
                        <th>Applicants</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJobs.map((job) => (
                        <tr key={job.id}>
                          <td style={{ fontWeight: '700', color: '#0f172a' }}>{job.title}</td>
                          <td>{job.company}</td>
                          <td>{job.job_location}</td>
                          <td>{job.salary_range}</td>
                          <td>{job.last_date_to_apply}</td>
                          <td>
                            <button className="btn-action" onClick={() => handleViewApplicants(job)}>
                              <i className="fas fa-users"></i> View Applicants
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </>
  );
}
