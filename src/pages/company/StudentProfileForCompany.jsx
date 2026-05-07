


// src/pages/company/StudentProfileForCompany.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function StudentProfileForCompany() {
  const { email: studentEmail } = useParams();
  const navigate = useNavigate();
  const companyEmail = localStorage.getItem("companyEmail");

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentEmail || !companyEmail) {
      setError("Missing required information");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/companies/student-profile/${encodeURIComponent(studentEmail)}/`,
          {
            params: { company_email: companyEmail },
          }
        );
        setProfile(response.data);
      } catch (err) {
        let msg = "Failed to load profile";
        if (err.response) {
          if (err.response.status === 404) msg = "Profile not found";
          else if (err.response.status === 403) msg = "Access denied";
          else if (err.response.status >= 500) msg = "Server error";
          else msg = err.response.data?.error || msg;
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [studentEmail, companyEmail]);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px", color: "#64748b" }}>
        <div className="loading-spinner"></div>
        <p>Loading candidate profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px", color: "#dc2626" }}>
        {error}
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px", color: "#64748b" }}>
        No profile information available
      </div>
    );
  }

  const student = profile.student || {};
  const initials = student.name ? student.name.charAt(0).toUpperCase() : "?";

  return (
    <>
      <style>{`
        :root {
          --primary: #6366f1;
          --primary-dark: #4f46e5;
          --text-dark: #111827;
          --text-muted: #4b5563;
          --bg-light: #f9fafb;
          --border: #e5e7eb;
          --card-bg: white;
        }

        .mini-profile-page {
          min-height: 100vh;
          background: var(--bg-light);
          padding: 1.5rem;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .mini-container {
          max-width: 720px;
          margin: 0 auto;
        }

        .mini-back {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          background: white;
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-muted);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 1.5rem;
        }

        .mini-back:hover {
          background: #f3f4f6;
          color: var(--text-dark);
        }

        .mini-card {
          background: var(--card-bg);
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          border: 1px solid var(--border);
          overflow: hidden;
        }

        .mini-header {
          display: flex;
          padding: 1.8rem 2rem;
          border-bottom: 1px solid var(--border);
          gap: 1.5rem;
          align-items: center;
        }

        .mini-avatar {
          flex-shrink: 0;
        }

        .mini-avatar img,
        .mini-avatar-placeholder {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #f3f4f6;
        }

        .mini-avatar-placeholder {
          background: linear-gradient(135deg, var(--primary), #a78bfa);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.4rem;
          font-weight: bold;
        }

        .mini-info {
          flex: 1;
        }

        .mini-name {
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--text-dark);
          margin: 0 0 0.35rem;
        }

        .mini-headline {
          color: var(--text-muted);
          font-size: 0.98rem;
          line-height: 1.5;
          margin-bottom: 0.6rem;
        }

        .mini-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1.2rem 1.8rem;
          font-size: 0.94rem;
          color: var(--text-muted);
        }

        .mini-meta strong {
          color: var(--text-dark);
          font-weight: 600;
        }

        .mini-contact {
          margin-top: 0.8rem;
          font-size: 0.94rem;
          color: #2563eb;
        }

        .mini-body {
          padding: 1.6rem 2rem;
        }

        .mini-section {
          margin-bottom: 1.8rem;
        }

        .mini-section h3 {
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 0.8rem;
        }

        .mini-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
        }

        .mini-tag {
          background: #eff6ff;
          color: #1d4ed8;
          padding: 0.35rem 0.9rem;
          border-radius: 999px;
          font-size: 0.86rem;
          font-weight: 500;
        }

        .mini-list {
          list-style: none;
          padding: 0;
          font-size: 0.94rem;
          color: var(--text-muted);
        }

        .mini-list li {
          margin-bottom: 0.6rem;
          padding-left: 1.2rem;
          position: relative;
        }

        .mini-list li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: var(--primary);
        }

        .mini-cert-link {
          color: var(--primary);
          font-size: 0.88rem;
          margin-left: 0.6rem;
          text-decoration: none;
        }

        .mini-resume {
          text-align: center;
          margin-top: 2rem;
        }

        .mini-resume-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.8rem 1.8rem;
          background: var(--primary);
          color: white;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
        }

        .mini-resume-btn:hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
        }

        .loading-spinner {
          border: 4px solid #e5e7eb;
          border-top: 4px solid var(--primary);
          border-radius: 50%;
          width: 48px;
          height: 48px;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .mini-header {
            flex-direction: column;
            text-align: center;
          }
          .mini-avatar {
            margin-bottom: 1rem;
          }
          .mini-body {
            padding: 1.4rem;
          }
        }
      `}</style>

      <div className="mini-profile-page">
        <div className="mini-container">
          <button className="mini-back" onClick={handleGoBack}>
            ← Back to Applicants
          </button>

          <div className="mini-card">
            <div className="mini-header">
              <div className="mini-avatar">
                {student.profile_photo ? (
                  <img src={student.profile_photo} alt={student.name} />
                ) : (
                  <div className="mini-avatar-placeholder">{initials}</div>
                )}
              </div>

              <div className="mini-info">
                <h1 className="mini-name">{student.name || "Student Profile"}</h1>

                <div className="mini-headline">
                  {student.department || "—"} • {student.programme || "—"} {student.ug_pg || ""}
                  {student.year && ` • Year ${student.year}`}
                </div>

                <div className="mini-meta">
                  {student.email && <div><strong>Email:</strong> {student.email}</div>}
                  {student.phone && <div><strong>Phone:</strong> {student.phone}</div>}
                  {student.university_reg_no && (
                    <div><strong>Reg No:</strong> {student.university_reg_no}</div>
                  )}
                  {student.cgpa && (
                    <div>
                      <strong>CGPA:</strong>{" "}
                      <span style={{
                        color: Number(student.cgpa) >= 8 ? "#10b981" :
                              Number(student.cgpa) >= 7 ? "#f59e0b" : "#ef4444",
                        fontWeight: 600
                      }}>
                        {student.cgpa}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mini-body">
              {/* Skills */}
              {profile.skills?.length > 0 && (
                <div className="mini-section">
                  <h3>Skills</h3>
                  <div className="mini-tags">
                    {profile.skills.map((skill, i) => (
                      <span key={i} className="mini-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience preview */}
              {profile.internships?.length > 0 && (
                <div className="mini-section">
                  <h3>Experience</h3>
                  <ul className="mini-list">
                    {profile.internships.slice(0, 4).map((exp, i) => (
                      <li key={i}>
                        {exp.company_name}
                        {exp.duration && <span className="mini-duration"> • {exp.duration}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Certificates preview */}
              {profile.certificates?.length > 0 && (
                <div className="mini-section">
                  <h3>Certificates</h3>
                  <ul className="mini-list">
                    {profile.certificates.slice(0, 4).map((cert, i) => (
                      <li key={i}>
                        {cert.title}
                        {cert.file && (
                          <a
                            href={cert.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mini-cert-link"
                          >
                            view
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Resume button */}
              {profile.resume && (
                <div className="mini-resume">
                  <a
                    href={profile.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mini-resume-btn"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download Resume
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}