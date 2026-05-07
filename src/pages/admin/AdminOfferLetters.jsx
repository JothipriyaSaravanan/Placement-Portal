
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000";

export default function AdminOfferLetters() {
  const [offerLetters, setOfferLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOfferLetters();
  }, []);

  const fetchOfferLetters = async () => {
    try {
      const response = await axios.get(`${API_BASE}/companies/offer-letters/?is_admin=true`);
      setOfferLetters(response.data.offer_letters || []);
    } catch (err) {
      setError("Failed to load offer letters");
    } finally {
      setLoading(false);
    }
  };

  const filtered = offerLetters.filter(ol => 
    ol.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ol.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ol.job_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-offer-oversight">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap');

        .admin-offer-oversight {
          padding: 2rem;
          background: #f8fafc;
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .oversight-header {
          background: white;
          padding: 2.5rem;
          border-radius: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid #f1f5f9;
        }

        .header-title-area h2 {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 2rem;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.02rem;
        }

        .header-title-area p {
          color: #64748b;
          margin-top: 0.5rem;
          font-size: 0.95rem;
        }

        .search-container-premium {
          position: relative;
          width: 350px;
        }

        .search-input-premium {
          width: 100%;
          padding: 0.85rem 1.25rem 0.85rem 3rem;
          border-radius: 14px;
          border: 2px solid #f1f5f9;
          background: #f8fafc;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.3s;
          outline: none;
        }

        .search-input-premium:focus {
          border-color: #4f46e5;
          background: white;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        }

        .search-icon-fixed {
          position: absolute;
          left: 1.1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 1rem;
        }

        /* Table Aesthetics */
        .table-container-premium {
          background: white;
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.04);
          overflow: hidden;
          border: 1px solid #f1f5f9;
        }

        .premium-table {
          width: 100%;
          border-collapse: collapse;
        }

        .premium-table th {
          background: #f8fafc;
          padding: 1.25rem 1.5rem;
          text-align: left;
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05rem;
          color: #475569;
          border-bottom: 1px solid #f1f5f9;
        }

        .premium-table td {
          padding: 1.5rem;
          border-bottom: 1px solid #f8fafc;
          vertical-align: middle;
        }

        .premium-table tr:last-child td {
          border-bottom: none;
        }

        .student-cell {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .avatar-initial {
          width: 42px;
          height: 42px;
          background: #eef2ff;
          color: #4f46e5;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1rem;
        }

        .company-pill {
          background: #f1f5f9;
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.85rem;
          color: #334155;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: #4f46e5;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .btn-action-view {
          background: #0f172a;
          color: white;
          padding: 0.6rem 1rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.8rem;
          text-decoration: none !important;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .btn-action-view:hover {
          background: #4f46e5;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
          color: white;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          display: inline-block;
          margin-right: 0.5rem;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animated-row {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>

      <div className="page-wrapper">
        <div className="oversight-header">
          <div className="header-title-area">
            <h2>Offer Letter Records</h2>
            <p>Transparency and oversight of placement achievements</p>
          </div>
          <div className="search-container-premium">
            <i className="fas fa-search search-icon-fixed"></i>
            <input 
              type="text" 
              placeholder="Filter by name, company..." 
              className="search-input-premium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem' }}>
            <div className="spinner-border text-primary" role="status"></div>
            <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 600 }}>Syncing records...</p>
          </div>
        ) : (
          <div className="table-container-premium">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Employing Entity</th>
                  <th>Designation</th>
                  <th>Timestamp</th>
                  <th>Verification</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ol, idx) => (
                  <tr key={ol.id} className="animated-row" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <td>
                      <div className="student-cell">
                        <div className="avatar-initial">{ol.student_name.charAt(0)}</div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{ol.student_name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{ol.student_email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="company-pill">{ol.company_name}</span>
                    </td>
                    <td>
                      <div className="role-badge">
                        <i className="fas fa-user-tag" style={{ fontSize: '0.8rem', opacity: 0.6 }}></i>
                        {ol.job_title}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                      {ol.uploaded_at}
                    </td>
                    <td>
                      <a 
                        href={`${API_BASE}${ol.offer_letter_url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-action-view"
                      >
                        <i className="fas fa-file-signature"></i> Review
                      </a>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '5rem', textAlign: 'center' }}>
                       <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
                       <h3 style={{ fontWeight: 800, color: '#1e293b' }}>No archived letters</h3>
                       <p style={{ color: '#64748b' }}>Waiting for digital uploads to populate this space.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
