// src/components/admin/AdminTopBar.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminTopBar() {
  const [adminName, setAdminName] = useState("Admin");
  const navigate = useNavigate();

  // Optional: fetch real admin name (uncomment & adjust if you have this endpoint)
  /*
  useEffect(() => {
    const email = localStorage.getItem("adminEmail");
    if (!email) return;

    axios
      .get(`http://localhost:8000/api/admin/profile/?email=${email}`)
      .then((res) => {
        if (res.data?.admin?.name) setAdminName(res.data.admin.name);
        else if (res.data?.name) setAdminName(res.data.name);
      })
      .catch((err) => console.log("Admin name fetch failed:", err));
  }, []);
  */

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin-login"); // or "/admin" depending on your flow
  };

  return (
    <>
      <style>{`
        .admin-topbar {
          background: #ffffff;
          padding: 1rem 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 1000;
          color: #1e293b;
        }

        .admin-welcome {
          font-family: 'Outfit', sans-serif;
          font-size: 1.25rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .admin-welcome i {
          font-size: 1.4rem;
          color: #7c3aed;
        }
        .directory-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1e293b;
          margin-right: auto;
          padding-right: 1.5rem;
          border-right: 2px solid #e2e8f0;
        }
        .admin-welcome span {
          color: #7c3aed;
          font-weight: 700;
        }

        .portal-brand {
          margin-left: 1.5rem;
          padding-left: 1.5rem;
          border-left: 2px solid #e2e8f0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #000000; /* Pure Black */
          letter-spacing: -0.01rem;
          text-transform: capitalize;
        }

        @media (max-width: 768px) {
          .portal-brand {
            display: none;
          }
        }

        .admin-logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #64748b;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-left: 2rem;
        }

        .admin-logout-btn:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .admin-logout-btn i {
          font-size: 1rem;
        }

        @media (max-width: 992px) {
          .admin-topbar {
            padding: 0.75rem 1.5rem;
          }
          .admin-welcome {
            font-size: 1.1rem;
          }
        }

        @media (max-width: 576px) {
          .admin-topbar {
            padding: 0.75rem 1rem;
          }
        }
      `}</style>

      <header className="admin-topbar">
        <div className="directory-title">
          📁 Directory of the Placement
        </div>

        <div className="admin-welcome">
          Welcome, <span>{adminName}</span>
          <div className="portal-brand">
            Periyar University Placement Portal
          </div>
        </div>

        <button className="admin-logout-btn" onClick={handleLogout}>
          Logout
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </header>
    </>
  );
}