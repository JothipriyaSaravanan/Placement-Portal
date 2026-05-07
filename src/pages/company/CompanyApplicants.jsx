
// src/pages/CompanyApplicants.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000";

export default function CompanyApplicants() {
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedStudentEmail, setSelectedStudentEmail] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [activeTab, setActiveTab] = useState("Pending"); // "Pending" or "Selected"
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedAppForLetter, setSelectedAppForLetter] = useState(null);
  const [offerLetterFile, setOfferLetterFile] = useState(null);
  const [offerLetterMessage, setOfferLetterMessage] = useState("");

  const companyEmail = localStorage.getItem("companyEmail");

  useEffect(() => {
    if (!companyEmail) {
      setError("Please login as company first");
      setLoading(false);
      return;
    }

    const fetchApplicants = async () => {
      try {
        const response = await axios.get(
          `${API_BASE}/companies/applicants/?email=${encodeURIComponent(companyEmail)}`
        );

        const allApps = response.data.applications || [];
        setApplicants(allApps);

        // Filter based on active tab
        const filtered = allApps.filter(app => {
          if (activeTab === "Pending") {
            return app.status !== "Selected" && app.status !== "Rejected";
          } else {
            return app.status === "Selected";
          }
        });
        setFilteredApplicants(filtered);
      } catch (err) {
        setError(
          err.response?.data?.error || "Could not load applicants. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [companyEmail, activeTab]);

  // Real-time search filtering
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredApplicants(applicants.filter(app => {
        if (activeTab === "Pending") {
          return app.status !== "Selected" && app.status !== "Rejected";
        } else {
          return app.status === "Selected";
        }
      }));
      return;
    }

    const term = searchTerm.toLowerCase().trim();

    const results = applicants.filter((app) => {
      // Respect tab filter first
      const belongsToTab = activeTab === "Pending" 
        ? (app.status !== "Selected" && app.status !== "Rejected")
        : (app.status === "Selected");
      
      if (!belongsToTab) return false;

      const name = (app.student?.name || "").toLowerCase();
      const email = (app.student?.email || "").toLowerCase();
      const dept = (app.student?.department || "").toLowerCase();
      const jobTitle = (app.job?.title || "").toLowerCase();

      return (
        name.includes(term) ||
        email.includes(term) ||
        dept.includes(term) ||
        jobTitle.includes(term)
      );
    });

    setFilteredApplicants(results);
  }, [searchTerm, applicants, activeTab]);

  const updateStatus = async (applicationId, newStatus) => {
    try {
      const response = await axios.post(
        `${API_BASE}/companies/update-application-status/${applicationId}/`,
        { status: newStatus }
      );

      alert(response.data.message);

      // Refresh list
      setApplicants((prev) =>
        prev.map((app) => {
          if (app.application_id === applicationId) {
            return { ...app, status: newStatus };
          }
          return app;
        })
      );
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update status");
    }
  };

  const handleUploadOfferLetter = async (e) => {
    e.preventDefault();
    if (!offerLetterFile || !selectedAppForLetter) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("company_email", companyEmail);
    formData.append("student_email", selectedAppForLetter.student.email);
    formData.append("job_id", selectedAppForLetter.job.id);
    formData.append("offer_letter", offerLetterFile);
    formData.append("message", offerLetterMessage);

    try {
      await axios.post(`${API_BASE}/companies/upload-offer-letter/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Offer letter uploaded successfully!");
      setShowUploadModal(false);
      setOfferLetterFile(null);
      setOfferLetterMessage("");
    } catch (err) {
      alert(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!selectedStudentEmail || !companyEmail) {
      setProfile(null);
      setProfileError(null);
      return;
    }

    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE}/companies/student-profile/${encodeURIComponent(selectedStudentEmail)}/`,
          { params: { company_email: companyEmail } }
        );
        setProfile(response.data);
      } catch (err) {
        setProfileError("Failed to load student profile");
        console.error("Profile fetch error:", err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [selectedStudentEmail, companyEmail]);

  const closeModal = () => {
    setSelectedStudentEmail(null);
  };

  // Helper to safely get array
  const getArray = (fieldName) => {
    const possible = [fieldName, fieldName + "s", "student_" + fieldName];
    for (const f of possible) {
      if (Array.isArray(profile?.[f])) return profile[f];
    }
    return [];
  };

  const formatFileUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_BASE}${url}`;
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <>
      <style>{`
        :root {
          --bg-main: #f8fafc;
          --card-bg: #ffffff;
          --primary-brand: #4f46e5;
          --text-main: #0f172a;
          --text-secondary: #64748b;
          --border-color: #e2e8f0;
        }

        .applicants-container {
          min-height: 100vh;
          padding: 2.5rem 2rem;
          background: var(--bg-main);
          color: var(--text-main);
        }

        .main-content-wrapper {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-header {
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .section-title {
          font-size: 1.85rem;
          font-weight: 700;
          color: var(--text-main);
          margin: 0;
          letter-spacing: -0.02em;
        }

        .search-area {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          padding: 0.6rem 1.2rem;
          display: flex;
          align-items: center;
          gap: 12px;
          max-width: 500px;
          margin-bottom: 2.5rem;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .search-area i {
          color: var(--text-secondary);
        }

        .search-input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 1rem;
          color: var(--text-main);
        }

        .applicants-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .applicant-card {
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: all 0.3s ease;
          position: relative;
        }

        .applicant-card:hover {
          border-color: var(--primary-brand);
          box-shadow: 0 10px 20px rgba(0,0,0,0.04);
          transform: translateY(-4px);
        }

        .applicant-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .applicant-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-main);
          margin: 0;
        }

        .applicant-subinfo {
          font-size: 0.85rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .job-tag {
          font-size: 0.8rem;
          background: #f1f5f9;
          color: #475569;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          border: 1px solid #e2e8f0;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
        }

        .status-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
          width: fit-content;
        }

        .status-Applied { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }
        .status-Shortlisted { background: #fffbeb; color: #92400e; border: 1px solid #fef3c7; }
        .status-Selected { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
        .status-Rejected { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

        .action-btns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 1rem;
          padding-top: 1.25rem;
          border-top: 1px solid var(--border-color);
        }

        .btn-action {
          padding: 0.6rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .btn-view-profile {
          grid-column: span 2;
          background: #f5f3ff;
          color: #5b21b6;
          border: 1px solid #ddd6fe;
        }

        .btn-view-profile:hover { background: #ede9fe; }

        .btn-shortlist-action {
          background: #fffbeb;
          color: #92400e;
          border: 1px solid #fef3c7;
        }
        .btn-shortlist-action:hover { background: #fef3c7; }

        .btn-select-action {
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
        }
        .btn-select-action:hover { background: #dcfce7; }

        .btn-reject-action {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }
        .btn-reject-action:hover { background: #fee2e2; }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          z-index: 2100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .modal-content {
          background: #ffffff;
          border-radius: 24px;
          width: 100%;
          max-width: 850px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          position: relative;
          color: #000;
        }

        .modal-close-btn {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #64748b;
          z-index: 100;
        }

        .modal-close-btn:hover {
          background: #fee2e2;
          color: #ef4444;
          border-color: #fecaca;
        }

        .profile-header {
          padding: 3rem 3rem 1.5rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .profile-name {
          font-size: 2.2rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .profile-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 0.9rem;
          color: #64748b;
        }

        .profile-badge-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .modal-body {
          padding: 2.5rem 3rem;
        }

        .profile-section {
          margin-bottom: 3rem;
        }

        .section-title-alt {
          font-size: 1.1rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--primary-brand);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .section-title-alt::after {
          content: "";
          height: 1px;
          flex: 1;
          background: #e2e8f0;
        }

        .grid-detail {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .detail-card {
          padding: 1.25rem;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .detail-card-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .detail-card-value {
          font-size: 1rem;
          font-weight: 500;
          color: #0f172a;
        }

        .skill-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .skill-tag-pill {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 0.4rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          color: #334155;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }

        .timeline-item {
          position: relative;
          padding-left: 24px;
          border-left: 2px solid var(--primary-brand);
          margin-bottom: 2rem;
        }

        .timeline-item::before {
          content: "";
          position: absolute;
          left: -7px;
          top: 0;
          width: 12px;
          height: 12px;
          background: #ffffff;
          border: 2px solid var(--primary-brand);
          border-radius: 50%;
        }

        .timeline-title {
          font-weight: 700;
          font-size: 1.1rem;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .timeline-subtitle {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--primary-brand);
          margin-bottom: 8px;
        }

        .timeline-meta {
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 10px;
        }

        .timeline-desc {
          font-size: 0.95rem;
          color: #334155;
          line-height: 1.6;
        }

        .social-link-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 1rem 1.5rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          text-decoration: none;
          color: #334155;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .social-link-box:hover {
          border-color: var(--primary-brand);
          color: var(--primary-brand);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }

        .resume-action-box {
          padding: 2.5rem;
          background: #f1f5f9;
          border-radius: 20px;
          text-align: center;
          border: 2px dashed #cbd5e1;
        }

        .btn-view-resume {
          background: var(--primary-brand);
          color: #ffffff;
          padding: 1rem 2.5rem;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
          transition: all 0.2s ease;
        }

        .btn-view-resume:hover {
          background: #4338ca;
          transform: translateY(-2px);
        }

        @media (max-width: 640px) {
          .grid-detail { grid-template-columns: 1fr; }
          .modal-content { border-radius: 0; max-height: 100vh; }
          .profile-header, .modal-body { padding: 1.5rem; }
          .profile-name { font-size: 1.8rem; }
        }
      `}</style>

      <div className="applicants-container">
        <div className="main-content-wrapper">
          <div className="section-header">
            <h1 className="section-title">Inbound Applicants</h1>
            <div className="tab-navigation-premium" style={{ display: 'flex', gap: '1rem', background: '#f1f5f9', padding: '0.4rem', borderRadius: '14px' }}>
              <button
                className={`tab-btn-modern ${activeTab === 'Pending' ? 'active' : ''}`}
                onClick={() => setActiveTab("Pending")}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === 'Pending' ? '#fff' : 'transparent',
                  color: activeTab === 'Pending' ? '#0f172a' : '#64748b',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  boxShadow: activeTab === 'Pending' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <i className="far fa-clock" style={{ color: activeTab === 'Pending' ? '#4f46e5' : 'inherit' }}></i>
                Queue
              </button>
              <button
                className={`tab-btn-modern ${activeTab === 'Selected' ? 'active' : ''}`}
                onClick={() => setActiveTab("Selected")}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === 'Selected' ? '#fff' : 'transparent',
                  color: activeTab === 'Selected' ? '#166534' : '#64748b',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  boxShadow: activeTab === 'Selected' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <i className="fas fa-check-double" style={{ color: activeTab === 'Selected' ? '#10b981' : 'inherit' }}></i>
                Appointed
              </button>
            </div>
          </div>

          <div className="search-area">
            <i className="fas fa-search"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Filter by name, department, or job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <i
                className="fas fa-times"
                style={{ cursor: "pointer", color: "#94a3b8" }}
                onClick={clearSearch}
              ></i>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem" }}>
              <div className="loading-spinner" style={{ margin: "0 auto 1.5rem" }}></div>
              <p style={{ color: "#64748b" }}>Retreiving application records...</p>
            </div>
          ) : error ? (
            <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "1.5rem", borderRadius: "12px", border: "1px solid #fecaca", textAlign: "center" }}>
              {error}
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div style={{ background: "#ffffff", padding: "4rem", borderRadius: "20px", border: "1px solid #e2e8f0", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📂</div>
              <h3 style={{ margin: "0 0 0.5rem" }}>No Records Found</h3>
              <p style={{ color: "#64748b", margin: 0 }}>
                {searchTerm ? "Adjust your filter criteria" : "All current applications have been processed"}
              </p>
            </div>
          ) : (
            <div className="applicants-grid">
              {filteredApplicants.map((app) => (
                <div key={app.application_id} className="applicant-card">
                  <div className="applicant-header">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <h3 className="applicant-name">{app.student?.name}</h3>
                      <span className={`status-badge status-${app.status || "Applied"}`}>{app.status || "Applied"}</span>
                    </div>
                    <div className="applicant-subinfo">
                      <i className="far fa-envelope"></i>
                      {app.student?.email}
                    </div>
                    <div className="applicant-subinfo">
                      <i className="fas fa-university"></i>
                      {app.student?.department || "N/A"}
                    </div>
                  </div>

                  <div className="job-tag">
                    <i className="fas fa-briefcase"></i>
                    {app.job?.title}
                  </div>

                  <div className="action-btns">
                    <button
                      className="btn-action btn-view-profile"
                      onClick={() => setSelectedStudentEmail(app.student?.email)}
                    >
                      <i className="far fa-user"></i>
                      Review Profile
                    </button>
                    {activeTab === "Pending" ? (
                      <>
                        <button
                          className="btn-action btn-shortlist-action"
                          onClick={() => updateStatus(app.application_id, "Shortlisted")}
                          disabled={app.status === "Shortlisted"}
                        >
                          Shortlist
                        </button>
                        <button
                          className="btn-action btn-select-action"
                          onClick={() => updateStatus(app.application_id, "Selected")}
                        >
                          Select
                        </button>
                        <button
                          className="btn-action btn-reject-action"
                          onClick={() => updateStatus(app.application_id, "Rejected")}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn-action btn-select-action"
                        style={{ gridColumn: "span 2", background: "#f0fdf4", color: "#166534" }}
                        onClick={() => {
                          setSelectedAppForLetter(app);
                          setShowUploadModal(true);
                        }}
                      >
                        <i className="fas fa-file-upload"></i>
                        Upload Offer Letter
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedStudentEmail && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={closeModal}>
                  <i className="fas fa-times"></i>
                </button>

                {profileLoading ? (
                  <div style={{ padding: "8rem 2rem", textAlign: "center" }}>
                    <div className="loading-spinner" style={{ margin: "0 auto 1rem" }}></div>
                    <p>Fetching full credentials...</p>
                  </div>
                ) : profileError ? (
                  <div style={{ padding: "5rem 2rem", textAlign: "center", color: "#ef4444" }}>
                    {profileError}
                  </div>
                ) : profile ? (
                  <>
                    <div className="profile-header">
                      <div className="profile-name">{profile.student?.name}</div>
                      <div className="profile-badges">
                        <div className="profile-badge-item">
                          <i className="far fa-envelope"></i>
                          {profile.student?.email}
                        </div>
                        <div className="profile-badge-item">
                          <i className="fas fa-phone-alt"></i>
                          {profile.student?.phone || "No phone listed"}
                        </div>
                        <div className="profile-badge-item">
                          <i className="fas fa-id-card"></i>
                          Reg: {profile.student?.university_reg_no || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div className="modal-body">
                      {/* Career Essentials */}
                      <div className="profile-section">
                        <div className="section-title-alt">Academic Context</div>
                        <div className="grid-detail">
                          <div className="detail-card">
                            <div className="detail-card-label">Department</div>
                            <div className="detail-card-value">{profile.student?.department || "N/A"}</div>
                          </div>
                          <div className="detail-card">
                            <div className="detail-card-label">Programme</div>
                            <div className="detail-card-value">{profile.student?.programme || "N/A"}</div>
                          </div>
                        </div>
                      </div>

                      {/* Technical Stack */}
                      {profile.skills?.length > 0 && (
                        <div className="profile-section">
                          <div className="section-title-alt">Core Competencies</div>
                          <div className="skill-tags">
                            {profile.skills.map((skill, index) => (
                              <span key={index} className="skill-tag-pill">{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Professional History */}
                      {getArray("internships").length > 0 && (
                        <div className="profile-section">
                          <div className="section-title-alt">Experience</div>
                          {getArray("internships").map((exp, idx) => (
                            <div key={idx} className="timeline-item">
                              <div className="timeline-title">{exp.company_name}</div>
                              <div className="timeline-subtitle">{exp.domain}</div>
                              <div className="timeline-meta">{exp.duration}</div>
                              {exp.description && <div className="timeline-desc">{exp.description}</div>}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Project Portfolio */}
                      {getArray("projects").length > 0 && (
                        <div className="profile-section">
                          <div className="section-title-alt">Key Projects</div>
                          {getArray("projects").map((proj, idx) => (
                            <div key={idx} className="timeline-item" style={{ borderLeftColor: "#8b5cf6" }}>
                              <div className="timeline-title">{proj.title}</div>
                              {proj.technologies && <div className="timeline-meta">Tech: {proj.technologies}</div>}
                              {proj.description && <div className="timeline-desc">{proj.description}</div>}
                              <div style={{ marginTop: "12px", display: "flex", gap: "12px" }}>
                                {proj.github_link && (
                                  <a href={proj.github_link} target="_blank" rel="noopener noreferrer" style={{ color: "#4f46e5", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
                                    Source Code →
                                  </a>
                                )}
                                {proj.live_link && (
                                  <a href={proj.live_link} target="_blank" rel="noopener noreferrer" style={{ color: "#4f46e5", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
                                    View Live →
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Accomplishments */}
                      {getArray("certificates").length > 0 && (
                        <div className="profile-section">
                          <div className="section-title-alt">Credentials</div>
                          <div className="grid-detail">
                            {getArray("certificates").map((cert, idx) => (
                              <div key={idx} className="detail-card">
                                <div className="detail-card-label">{cert.issued_by} • {cert.year_obtained}</div>
                                <div className="detail-card-value" style={{ marginBottom: "8px" }}>{cert.title}</div>
                                {cert.file && (
                                  <a href={formatFileUrl(cert.file)} target="_blank" rel="noopener noreferrer" style={{ color: "#4f46e5", fontSize: "0.8rem", fontWeight: 700, textDecoration: "none" }}>
                                    View Proof →
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resume / Document */}
                      <div className="profile-section">
                        <div className="section-title-alt">Candidate Portfolio</div>
                        <div className="resume-action-box">
                          {profile.resume ? (
                            <>
                              <div style={{ marginBottom: "1.5rem", color: "#475569" }}>The candidate has provided a detailed resume for review.</div>
                              <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="btn-view-resume">
                                <i className="far fa-file-pdf"></i>
                                Download Full Resume
                              </a>
                            </>
                          ) : (
                            <div style={{ color: "#64748b", fontStyle: "italic" }}>No digital resume attached to this application.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          )}

          {showUploadModal && selectedAppForLetter && (
            <div className="modal-overlay-premium" onClick={() => setShowUploadModal(false)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(8px)', zIndex: 2000,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
              }}>
              <div className="modal-content-glass" onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: '550px', width: '100%', background: '#fff',
                  borderRadius: '32px', overflow: 'hidden',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>

                <style>{`
                  @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(40px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                  }
                  .input-group-modern { margin-bottom: 2rem; }
                  .input-group-modern label { display: block; margin-bottom: 0.75rem; font-weight: 700; color: #1e293b; font-size: 0.95rem; }
                  .file-drop-area { 
                    border: 2px dashed #e2e8f0; border-radius: 20px; padding: 2.5rem; text-align: center; 
                    transition: all 0.2s; cursor: pointer; background: #f8fafc;
                  }
                  .file-drop-area:hover { border-color: #4f46e5; background: #f1f5f9; }
                `}</style>

                <div className="modal-header-gradient"
                  style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                    padding: '3rem 2.5rem', color: '#fff', position: 'relative'
                  }}>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>
                      Dispatch Offer
                    </h2>
                    <p style={{ opacity: 0.8, fontSize: '0.95rem', fontWeight: 500 }}>
                      Issuing official document to <span style={{ color: '#818cf8', fontWeight: 700 }}>{selectedAppForLetter.student.name}</span>
                    </p>
                  </div>
                  <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
                </div>

                <div className="modal-body-premium" style={{ padding: '2.5rem' }}>
                  <form onSubmit={handleUploadOfferLetter}>
                    <div className="input-group-modern">
                      <label>Offer Letter Document (PDF)</label>
                      <div className="file-drop-area" onClick={() => document.getElementById('fileInput').click()}>
                        <i className="fas fa-file-upload" style={{ fontSize: '2rem', color: '#4f46e5', marginBottom: '1rem', display: 'block' }}></i>
                        <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                          {offerLetterFile ? offerLetterFile.name : 'Click to browse or drag & drop'}
                        </span>
                        <input
                          id="fileInput"
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setOfferLetterFile(e.target.files[0])}
                          style={{ display: 'none' }}
                          required
                        />
                      </div>
                    </div>

                    <div className="input-group-modern">
                      <label>Complimentary Message</label>
                      <textarea
                        value={offerLetterMessage}
                        onChange={(e) => setOfferLetterMessage(e.target.value)}
                        placeholder="Write a welcoming note for your new hire..."
                        style={{
                          width: '100%', padding: '1.25rem', border: '1px solid #e2e8f0',
                          borderRadius: '16px', minHeight: '120px', fontSize: '0.95rem',
                          outline: 'none', transition: 'border-color 0.2s', background: '#f8fafc'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1rem' }}>
                      <button
                        type="button"
                        onClick={() => setShowUploadModal(false)}
                        style={{
                          flex: 1, padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0',
                          background: '#fff', cursor: 'pointer', fontWeight: 700, color: '#64748b'
                        }}
                      >
                        Discard
                      </button>
                      <button
                        type="submit"
                        disabled={uploading}
                        style={{
                          flex: 1.5, padding: '1rem', borderRadius: '16px', border: 'none',
                          background: 'linear-gradient(90deg, #4f46e5 0%, #6366f1 100%)',
                          color: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: '1rem',
                          boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)'
                        }}
                      >
                        {uploading ? (
                          <><i className="fas fa-circle-notch fa-spin me-2"></i> Syncing...</>
                        ) : (
                          <><i className="fas fa-paper-plane me-2"></i> Send Notification</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}