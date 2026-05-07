
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000";

export default function OfferLetters() {
  const [offerLetters, setOfferLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const studentEmail = localStorage.getItem("studentEmail");

  useEffect(() => {
    if (!studentEmail) {
      setError("Please login to view your offer letters");
      setLoading(false);
      return;
    }

    const fetchOfferLetters = async () => {
      try {
        const response = await axios.get(`${API_BASE}/companies/offer-letters/?student_email=${encodeURIComponent(studentEmail)}`);
        setOfferLetters(response.data.offer_letters || []);
      } catch (err) {
        setError(err.response?.data?.error || "Could not load offer letters");
      } finally {
        setLoading(false);
      }
    };

    fetchOfferLetters();
  }, [studentEmail]);

  const formatFileUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_BASE}${url}`;
  };

  return (
    <div className="offer-letter-modern-container">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        .offer-letter-modern-container {
          min-height: 100vh;
          background-color: #FFFFFF;
          font-family: 'Inter', system-ui, sans-serif;
          color: #111827;
          padding-bottom: 4rem;
          -webkit-font-smoothing: antialiased;
        }

        .hero-banner {
          background-color: #ECFDF5;
          padding: 3rem 2rem;
          border-radius: 0;
          margin-bottom: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
          border: 1px solid #B1DFBB;
          border-top: none;
        }

        .hero-content {
          max-width: 600px;
        }

        .hero-content h1 {
          font-family: 'Outfit', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #065F46;
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }

        .hero-content p {
          font-size: 15px;
          color: #064E3B;
          opacity: 0.8;
          line-height: 1.6;
        }

        .hero-illustration {
          font-size: 80px;
          filter: drop-shadow(0 10px 15px rgba(5, 150, 105, 0.1));
          user-select: none;
        }

        .main-wrapper {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          padding: 1.5rem;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
          text-align: left;
          color: #FFFFFF;
          border: none;
          position: relative;
          overflow: hidden;
          min-height: 140px;
        }

        .stat-card::before {
          content: "";
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          bottom: -30px;
          right: -20px;
          z-index: 0;
        }

        .stat-card.bg-purple { background-color: #9333EA; }
        .stat-card.bg-purple::before { background-color: #FACC15; opacity: 0.8; }
        
        .stat-card.bg-blue { background-color: #2563EB; }
        .stat-card.bg-blue::before { background-color: #2DD4BF; opacity: 0.8; }
        
        .stat-card.bg-cyan { background-color: #0EA5E9; }
        .stat-card.bg-cyan::before { background-color: #FACC15; opacity: 0.8; }

        .stat-icon-wrap {
          width: auto;
          height: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          z-index: 1;
        }

        .stat-icon-wrap i {
          font-size: 24px;
        }

        .stat-info {
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-info .label {
          font-size: 13px;
          font-weight: 500;
          opacity: 0.9;
        }

        .stat-info .value {
          font-family: 'Outfit', sans-serif;
          font-size: 32px;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }

        .offers-title {
          font-family: 'Outfit', sans-serif;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #111827;
        }

        .offers-list {
          display: grid;
          gap: 1rem;
        }

        .offer-row {
          background: #FFFFFF;
          border: 1.5px solid #D1FAE5;
          border-radius: 0;
          padding: 20px;
          display: flex;
          align-items: center;
          transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .offer-row:hover {
          border-color: #10B981;
          transform: none;
          background-color: #F0FDF4;
        }

        .company-badge {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #059669;
          font-size: 24px;
          flex-shrink: 0;
          margin-right: 20px;
        }

        .role-details {
          flex: 1;
          padding-right: 20px;
        }

        .role-details h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 2px;
        }

        .role-details p {
          font-size: 13px;
          color: #6B7280;
          font-weight: 500;
          margin: 0;
        }

        .date-container {
          width: 200px;
          text-align: center;
          color: #6B7280;
          font-size: 13px;
          font-weight: 500;
          border-left: 1px solid #F1F5F9;
          border-right: 1px solid #F1F5F9;
          padding: 8px 0;
        }

        .action-cell {
          width: 260px;
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: flex-end;
          padding-left: 20px;
        }

        .status-pill {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1px solid transparent;
        }

        .status-pill.accepted { background-color: #DCFCE7; color: #15803D; }
        .status-pill.pending { background-color: #FEF9C3; color: #A16207; }
        .status-pill.viewed { background-color: #F3F4F6; color: #4B5563; }

        .btn-download {
          background-color: #059669;
          color: #FFFFFF;
          height: 40px;
          padding: 0 18px;
          border-radius: 0;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
          transition: all 150ms ease;
          border: none;
          cursor: pointer;
        }

        .btn-download:hover {
          background-color: #047857;
        }

        .btn-download:active {
          transform: translateY(0);
        }

        /* Loading */
        .loader-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 6rem 2rem;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #E5E7EB;
          border-top-color: #059669;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Empty State */
        .empty-dashboard {
          background: #FFFFFF;
          border: 2px solid #D1D5DB;
          border-radius: 0;
          padding: 5rem 2rem;
          text-align: center;
        }
        
        .empty-dashboard:hover {
          border-color: #059669;
        }

        .empty-dashboard h2 {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }

        .empty-dashboard p {
          font-size: 14px;
          color: #6B7280;
        }

        @media (max-width: 850px) {
          .offer-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }
          .date-container {
            padding: 0;
            text-align: left;
          }
          .action-cell {
            width: 100%;
            justify-content: space-between;
          }
          .hero-illustration {
            display: none;
          }
        }
      `}</style>

      <section className="hero-banner">
        <div className="hero-content">
          <h1>Your Success Portal 🎉</h1>
          <p>This is where your professional journey begins. Access your official offer letters, track your achievements, and prepare for your big debut in the industry.</p>
        </div>
        <div className="hero-illustration">🎓</div>
      </section>

      <div className="main-wrapper">
        <div className="stats-row">
          <div className="stat-card bg-purple">
            <div className="stat-icon-wrap">
              <i className="fas fa-medal"></i>
            </div>
            <div className="stat-info">
              <span className="label">Total Offers</span>
              <span className="value">{offerLetters.length}</span>
            </div>
          </div>
          <div className="stat-card bg-blue">
            <div className="stat-icon-wrap">
              <i className="fas fa-check-double"></i>
            </div>
            <div className="stat-info">
              <span className="label">Status</span>
              <span className="value">Selected</span>
            </div>
          </div>
          <div className="stat-card bg-cyan">
            <div className="stat-icon-wrap">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-info">
              <span className="label">Last Updated</span>
              <span className="value">Today</span>
            </div>
          </div>
        </div>

        <h2 className="offers-title">
          <i className="fas fa-award" style={{ color: '#059669' }}></i>
          Recent Offer Letters
        </h2>

        {loading ? (
          <div className="loader-wrap">
            <div className="spinner"></div>
            <p style={{ fontWeight: 500, color: '#6B7280' }}>Preparing your achievements...</p>
          </div>
        ) : error ? (
          <div className="empty-dashboard" style={{ borderColor: '#FEE2E2', backgroundColor: '#FFF5F5' }}>
            <span style={{ fontSize: '40px', marginBottom: '16px', display: 'block' }}>⚠️</span>
            <h2>Connection Error</h2>
            <p>{error}</p>
          </div>
        ) : offerLetters.length === 0 ? (
          <div className="empty-dashboard">
            <span style={{ fontSize: '48px', marginBottom: '20px', display: 'block' }}>🚀</span>
            <h2>Your first offer is on its way!</h2>
            <p>Keep honing your skills and applying. Your next big success story will appear right here.</p>
          </div>
        ) : (
          <div className="offers-list">
            {offerLetters.map((ol) => (
              <div key={ol.id} className="offer-row">
                <div className="company-badge">
                  {ol.company_name ? ol.company_name.charAt(0).toUpperCase() : "?"}
                </div>
                
                <div className="role-details">
                  <h3>{ol.company_name}</h3>
                  <p>{ol.job_title}</p>
                </div>

                <div className="date-container">
                  <span className="label" style={{ display: 'block', textTransform: 'uppercase', fontSize: '10px', color: '#9CA3AF', marginBottom: '4px' }}>Date Issued</span>
                  {new Date(ol.uploaded_at).toLocaleDateString("en-US", { 
                    month: "long", 
                    day: "numeric", 
                    year: "numeric" 
                  })}
                </div>

                <div className="action-cell">
                  <span className={`status-pill ${ol.status ? ol.status.toLowerCase() : "accepted"}`}>
                    {ol.status || "Selected"}
                  </span>
                  <a 
                    href={formatFileUrl(ol.offer_letter_url)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-download"
                  >
                    <i className="fas fa-cloud-download-alt"></i>
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
