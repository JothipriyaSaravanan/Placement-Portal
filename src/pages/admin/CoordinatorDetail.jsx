



// src/pages/admin/CoordinatorDetail.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AdminPageLayout from "../../components/admin/AdminPageLayout";

export default function CoordinatorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [coordinator, setCoordinator] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:8000/admin-panel/coordinators/${id}/`)
      .then((res) => {
        setCoordinator(res.data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <AdminPageLayout title="Loading...">Loading...</AdminPageLayout>;
  }

  if (!coordinator) {
    return (
      <AdminPageLayout title="Not Found">
        <div className="empty-state">Coordinator not found.</div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout title="Coordinator Details" icon="fas fa-id-card">
      <style>{`
        .detail-container {
          padding: 0 0 4rem;
          animation: fadeIn 0.5s ease-out;
          max-width: 1100px;
          margin: 0 auto;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #ffffff;
          font-weight: 500;
          text-decoration: none;
          margin-bottom: 2rem;
          transition: all 0.2s;
          cursor: pointer;
          background: #d946ef;
          padding: 0.6rem 1.25rem;
          border-radius: 0.75rem;
          border: none;
          font-size: 0.9rem;
          box-shadow: 0 4px 12px rgba(217, 70, 239, 0.2);
        }

        .back-link:hover {
          background: #c026d3;
          transform: translateX(-4px);
          box-shadow: 0 6px 16px rgba(192, 38, 211, 0.3);
        }

        .profile-grid-premium {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 2rem;
        }

        .profile-side-card {
          background: #ffffff;
          border-radius: 1.5rem;
          border: 1.5px solid #000000;
          overflow: hidden;
          height: fit-content;
        }

        .profile-cover {
          background: linear-gradient(135deg, #d946ef 0%, #a21caf 100%);
          height: 100px;
          position: relative;
        }

        .profile-avatar-box {
          width: 90px;
          height: 90px;
          background: #ffffff;
          border-radius: 1.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: -45px auto 0;
          position: relative;
          z-index: 2;
          border: 4px solid #ffffff;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          color: #d946ef;
          font-size: 2.2rem;
        }

        .profile-title-section {
          padding: 1.5rem 2rem 2.5rem;
          text-align: center;
        }

        .profile-title-section h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #000000;
          margin-bottom: 0.25rem;
        }

        .username-span {
          color: #000000;
          font-weight: 500;
          font-size: 0.9rem;
          display: block;
          margin-bottom: 1.5rem;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.25rem;
          border-radius: 2rem;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-pill.active {
          background: #ecfdf5;
          color: #065f46;
          border: 1.5px solid #059669;
        }

        .status-pill.inactive {
          background: #fef2f2;
          color: #991b1b;
          border: 1.5px solid #dc2626;
        }

        .info-stack {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .card-premium-modern {
          background: #ffffff;
          border-radius: 1.5rem;
          border: 1.5px solid #000000;
          padding: 2rem;
        }

        .card-header-modern {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.2rem;
          font-weight: 700;
          color: #000000;
          margin-bottom: 2rem;
          padding-bottom: 1.25rem;
          border-bottom: 1.5px solid #eeeeee;
        }

        .card-header-modern i {
          color: #d946ef;
        }

        .details-grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .spec-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .spec-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #000000;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .spec-value {
          font-size: 1.05rem;
          font-weight: 500;
          color: #000000;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .dept-chip {
          background: #fdf4ff;
          color: #d946ef;
          padding: 0.4rem 1rem;
          border-radius: 0.75rem;
          border: 1.5px solid #d946ef;
          font-weight: 600;
        }

        .badge-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          margin-top: 0.5rem;
        }

        .prog-chip {
          background: #ffffff;
          color: #1a1a1a;
          padding: 0.4rem 0.85rem;
          border-radius: 0.6rem;
          font-size: 0.85rem;
          font-weight: 600;
          border: 1.5px solid #000000;
        }

        .prog-chip:hover {
          border-color: #d946ef;
          color: #d946ef;
          background: #fdf4ff;
        }

        @media (max-width: 950px) {
          .profile-grid-premium {
            grid-template-columns: 1fr;
          }
        }


        .prog-chip {
  background: #faf5ff;           /* almost white with violet hint */
  color: #c026d3;                /* close to your theme color */
  padding: 0.45rem 1rem;
  border-radius: 9999px;         /* more pill-like */
  font-size: 0.85rem;
  font-weight: 600;
  border: 2px solid #d946ef;
  box-shadow: 0 1px 3px rgba(217, 70, 239, 0.15);
}


      `}</style>

      <div className="detail-container">
        <div className="back-link" onClick={() => navigate("/admin/coordinators")}>
          <i className="fas fa-chevron-left"></i>
          Back to List
        </div>

        <div className="profile-grid-premium">
          {/* Summary Card */}
          <div className="profile-side-card">
            <div className="profile-cover"></div>
            <div className="profile-avatar-box">
              <i className="fas fa-user-circle"></i>
            </div>
            <div className="profile-title-section">
              <h2>{coordinator.name || "Coordinator"}</h2>
              <span className="username-span">@{coordinator.username}</span>
              
              <div className={`status-pill ${coordinator.is_active ? 'active' : 'inactive'}`}>
                <i className={`fas ${coordinator.is_active ? 'fa-check-double' : 'fa-ban'}`}></i>
                {coordinator.is_active ? 'Verified Active' : 'Account Disabled'}
              </div>
            </div>
          </div>

          {/* Detailed Content */}
          <div className="info-stack">
            {/* Master Details Card */}
            <div className="card-premium-modern">
              {/* Account Section */}
              <div className="card-header-modern">
                <i className="fas fa-id-badge"></i>
                Coordinator Profile & Academic Assignment
              </div>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '2.5rem'}}>
                {/* Account details */}
                <div className="details-grid-layout">
                  <div className="spec-item">
                    <span className="spec-label">Contact Email</span>
                    <span className="spec-value">
                      <i className="fas fa-envelope-open-text" style={{color: '#d946ef'}}></i>
                      {coordinator.email}
                    </span>
                  </div>

                  <div className="spec-item">
                    <span className="spec-label">Database ID</span>
                    <span className="spec-value">
                      <i className="fas fa-hashtag" style={{color: '#000000'}}></i>
                      {coordinator.id}
                    </span>
                  </div>

                  <div className="spec-item">
                    <span className="spec-label">Account Status</span>
                    <span className="spec-value" style={{color: coordinator.is_active ? '#065f46' : '#991b1b'}}>
                      <i className={`fas ${coordinator.is_active ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                      {coordinator.is_active ? 'Active' : 'Restricted'}
                    </span>
                  </div>
                </div>

                {/* Academic details */}
                <div style={{paddingTop: '2rem', borderTop: '1.5px dashed #eeeeee'}}>
                  <div className="details-grid-layout">
                    <div className="spec-item">
                      <span className="spec-label">Department</span>
                      <span className="spec-value">
                        <span className="dept-chip">{coordinator.department || "N/A"}</span>
                      </span>
                    </div>

                    <div className="spec-item" style={{gridColumn: 'span 2'}}>
  <span className="spec-label">Assigned Programmes</span>
  <div className="badge-list">
    {coordinator.programmes?.length > 0 ? (
      coordinator.programmes.map((prog, idx) => (
        <span key={idx} className="prog-chip">
          <i className="fas fa-tag me-2" style={{fontSize: '0.7rem', opacity: 0.6}}></i>
          {prog.trim()}
        </span>
      ))
    ) : (
      <span style={{color: '#666', fontStyle: 'italic'}}>
        No specific programmes assigned.
      </span>
    )}
  </div>
</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
}