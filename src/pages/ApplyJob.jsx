
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export default function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const studentEmail = localStorage.getItem('studentEmail');

  useEffect(() => {
    if (!studentEmail) {
      navigate('/login');
      return;
    }

    checkIfApplied();
    fetchJobDetails();
  }, [jobId, navigate, studentEmail]);

  const checkIfApplied = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/students/applications/my/?email=${studentEmail}`
      );
      const applied = res.data.applications.some(
        (app) => app.job_id === Number(jobId)
      );
      setAlreadyApplied(applied);
    } catch (err) {
      console.error('Failed to check application status:', err);
    }
  };

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_BASE}/companies/jobs/active/`);
      const found = res.data.jobs?.find((j) => j.id === Number(jobId));

      if (!found) {
        setError('This job is no longer available or does not exist.');
      } else {
        setJob(found);
      }
    } catch (err) {
      console.error('Job fetch error:', err);
      setError('Failed to load job details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (alreadyApplied) {
      alert('You have already applied to this job!');
      return;
    }

    setSubmitting(true);

    try {
      await axios.post(`${API_BASE}/api/students/jobs/apply/`, {
        email: studentEmail,
        job_id: jobId,
        cover_letter: coverLetter.trim(),
      });

      alert('Application submitted successfully!');
      navigate('/dashboard/status');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to submit application.';
      alert(msg);
      console.error('Application error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="apply-loading-screen">
        <div className="apply-spinner"></div>
        <style>{`
          .apply-loading-screen {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 80vh;
          }
          .apply-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #6d28d9;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="apply-error-container">
        <div className="apply-error-card">
          <i className="fas fa-exclamation-circle text-danger"></i>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="btn-back-error">
            Go Back to Jobs
          </button>
        </div>
        <style>{`
          .apply-error-container {
            display: flex;
            justify-content: center;
            padding: 4rem 1rem;
          }
          .apply-error-card {
            background: white;
            padding: 2.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 450px;
            border: 1px solid #fee2e2;
          }
          .apply-error-card i {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          .apply-error-card h2 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 0.5rem;
          }
          .apply-error-card p {
            color: #6b7280;
            margin-bottom: 1.5rem;
          }
          .btn-back-error {
            background: #6d28d9;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="job-apply-page">
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />

      <style>{`
        .job-apply-page {
          background-color: #f9fafb;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          color: #111827;
          padding: 2rem 1.5rem;
        }

        .apply-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Breadcrumb */
        .apply-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
          font-size: 0.9rem;
          color: #6b7280;
        }

        .apply-breadcrumb a {
          color: #6d28d9;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .apply-breadcrumb a:hover {
          color: #4c1d95;
          text-decoration: underline;
        }

        /* Header Section */
        .apply-hero {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 2.5rem;
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .hero-left h1 {
          font-family: 'Outfit', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .hero-left .job-company {
          font-size: 1.1rem;
          color: #6d28d9;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.35rem 0.85rem;
          background: #f5f3ff;
          color: #6d28d9;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          border: 1px solid #ddd6fe;
        }

        /* Main Content Grid */
        .apply-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 2rem;
          align-items: start;
        }

        .apply-content-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 2.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          color: #111827;
        }

        .section-header i {
          color: #6d28d9;
          font-size: 1.25rem;
        }

        .section-header h2 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }

        /* Quick Info Bar */
        .job-quick-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
          background: #f9fafb;
          border: 1px solid #f3f4f6;
          border-radius: 10px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-item .label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .info-item .value {
          font-size: 0.95rem;
          font-weight: 600;
          color: #111827;
        }

        .info-item i {
          color: #6d28d9;
          margin-right: 0.4rem;
          font-size: 0.85rem;
        }

        /* Description */
        .job-description-text {
          line-height: 1.6;
          color: #374151;
          font-size: 1rem;
        }

        .description-paragraph {
          margin-bottom: 1.25rem;
        }

        /* Sidebar Form */
        .apply-sidebar {
          position: sticky;
          top: 2rem;
        }

        .sidebar-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.75rem;
        }

        .form-textarea {
          width: 100%;
          min-height: 200px;
          padding: 1rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.95rem;
          color: #111827;
          resize: vertical;
          background: #ffffff;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-textarea:focus {
          outline: none;
          border-color: #6d28d9;
          box-shadow: 0 0 0 3px rgba(109, 40, 217, 0.1);
        }

        .btn-submit {
          width: 100%;
          padding: 0.85rem;
          background: #6d28d9;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .btn-submit:hover:not(:disabled) {
          background: #5b21b6;
        }

        .btn-submit:active:not(:disabled) {
          transform: scale(0.98);
        }

        .btn-submit:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        /* Already Applied State */
        .status-applied {
          text-align: center;
          padding: 1rem 0;
        }

        .status-applied i {
          font-size: 2.5rem;
          color: #059669;
          margin-bottom: 1rem;
        }

        .status-applied h3 {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .status-applied p {
          font-size: 0.9rem;
          color: #6b7280;
          margin-bottom: 1.5rem;
          line-height: 1.4;
        }

        @media (max-width: 992px) {
          .apply-grid {
            grid-template-columns: 1fr;
          }
          .apply-sidebar {
            position: static;
          }
        }

        @media (max-width: 640px) {
          .apply-hero {
            flex-direction: column;
            gap: 1.5rem;
            padding: 1.5rem;
          }
          .hero-left h1 {
            font-size: 1.5rem;
          }
          .apply-content-card {
            padding: 1.5rem;
          }
        }
      `}</style>

      <div className="apply-container">
        {/* Breadcrumb Navigation */}
        <nav className="apply-breadcrumb">
          <Link to="/dashboard">Dashboard</Link>
          <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
          <Link to="/dashboard/companies">Jobs</Link>
          <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
          <span>Apply Job</span>
        </nav>

        {/* Hero Section */}
        <header className="apply-hero">
          <div className="hero-left">
            <h1>{job.title}</h1>
            <div className="job-company">
              <i className="fas fa-building"></i>
              {job.company}
            </div>
          </div>
          <div className="hero-badge">
            {job.job_type || 'Opportunity'}
          </div>
        </header>

        <div className="apply-grid">
          {/* Main Details Section */}
          <main className="apply-content-card">
            {/* Quick Info Grid */}
            <div className="job-quick-info">
              <div className="info-item">
                <span className="label">Location</span>
                <span className="value">
                  <i className="fas fa-map-marker-alt"></i>
                  {job.job_location || 'Not specified'}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Salary</span>
                <span className="value">
                  <i className="fas fa-wallet"></i>
                  {job.salary_range || 'Not disclosed'}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Deadline</span>
                <span className="value" style={{ color: '#dc2626' }}>
                  <i className="fas fa-calendar-alt"></i>
                  {job.last_date_to_apply || 'TBA'}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Experience</span>
                <span className="value">
                  <i className="fas fa-briefcase"></i>
                  Fresher / Any
                </span>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="section-header">
              <i className="fas fa-align-left"></i>
              <h2>Detailed Job Description</h2>
            </div>
            
            <div className="job-description-text">
              {job.description?.split('\n').map((line, i) => (
                <p key={i} className="description-paragraph">
                  {line}
                </p>
              )) || <p>No detailed description provided by the company.</p>}
            </div>
            
            <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid #f3f4f6' }}>
              <div className="section-header">
                <i className="fas fa-shield-alt"></i>
                <h2>Key Requirements</h2>
              </div>
              <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                Candidates should possess a strong background in the relevant field and demonstrate a proactive approach to learning. 
                Please ensure you meet the eligibility criteria before applying.
              </p>
            </div>
          </main>

          {/* Sidebar Application Section */}
          <aside className="apply-sidebar">
            <div className="sidebar-card">
              {alreadyApplied ? (
                <div className="status-applied">
                  <i className="fas fa-check-circle"></i>
                  <h3>Application Submitted</h3>
                  <p>
                    You have successfully applied for this position.
                    Our recruitment team will review your profile shortly.
                  </p>
                  <button 
                    className="btn-submit"
                    onClick={() => navigate('/dashboard/status')}
                  >
                    View Status
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="section-header" style={{ marginBottom: '1.25rem' }}>
                    <i className="fas fa-paper-plane"></i>
                    <h2>Quick Apply</h2>
                  </div>
                  
                  <div className="form-group">
                    <label>Cover Letter (Recommended)</label>
                    <textarea 
                      className="form-textarea"
                      placeholder="Write a brief note about why you are interested in this position..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                    ></textarea>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                      Tip: Personalized cover letters have a 40% higher chance of being shortlisted.
                    </p>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <i className="fas fa-circle-notch fa-spin"></i>
                        Applying...
                      </>
                    ) : (
                      <>
                        Submit Application
                        <i className="fas fa-arrow-right"></i>
                      </>
                    )}
                  </button>
                  
                  <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#6b7280', marginTop: '1.25rem' }}>
                    By clicking submit, you agree to share your profile details with the recruiting company.
                  </p>
                </form>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
