


// src/pages/admin/CreateCompany.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminPageLayout from "../../components/admin/AdminPageLayout";

const API_BASE = "http://localhost:8000";

export default function CreateCompany() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post(
        `${API_BASE}/admin-panel/companies/create/`,
        formData, // No need for JSON.stringify — axios does it automatically with application/json
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      navigate("/admin/companies");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPageLayout title="Create Company">
      <style>{`
        .admin-company-wrapper {
          min-height: 100vh;
          padding: 2rem 2rem 4rem;
          background: #f9fafb;
          color: #111827;
          position: relative;
        }

        /* Back button - top-left */
        .back-btn {
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
          padding: 0.75rem 1.8rem;
          font-size: 1rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 9999px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
          z-index: 10;
        }

        .back-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(99, 102, 241, 0.3);
        }

        .content-container {
          max-width: 600px;
          margin: 0 auto;
          padding-top: 5rem;
        }

        .form-card {
          background: white;
          border-radius: 1.5rem;
          padding: 2.8rem 2.4rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
          border: 1px solid rgba(229,231,235,0.7);
          position: relative;
          overflow: hidden;
        }

        .form-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 6px;
          height: 100%;
          background: linear-gradient(180deg, #ec4899, #f97316, #a78bfa);
        }

        .form-title {
          font-size: 1.95rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 2.2rem;
          background: linear-gradient(90deg, #ec4899, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .form-group {
          margin-bottom: 1.8rem;
        }

        .form-group input {
          width: 100%;
          padding: 1.1rem 1.5rem;
          font-size: 1.05rem;
          border: 1.5px solid #d1d5db;
          border-radius: 1rem;
          background: #f9fafb;
          transition: all 0.25s ease;
          color: #1f2937;
        }

        .form-group input:focus {
          outline: none;
          border-color: #ec4899;
          box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.12);
          background: white;
        }

        .form-group input::placeholder {
          color: #9ca3af;
        }

        .error-message {
          color: #dc2626;
          font-size: 0.95rem;
          margin-bottom: 1.5rem;
          text-align: center;
          background: rgba(220, 38, 38, 0.08);
          padding: 0.8rem;
          border-radius: 0.8rem;
        }

        .actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
        }

        .actions button {
          padding: 1rem 2rem;
          font-size: 1.05rem;
          font-weight: 600;
          border-radius: 9999px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-btn {
          background: #6b7280;
          color: white;
        }

        .cancel-btn:hover {
          background: #4b5563;
        }

        .submit-btn {
          background: linear-gradient(135deg, #ec4899, #f97316);
          color: white;
          box-shadow: 0 6px 18px rgba(236, 72, 153, 0.25);
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(236, 72, 153, 0.35);
        }

        .submit-btn:disabled {
          background: #d1d5db;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        @media (max-width: 768px) {
          .admin-company-wrapper {
            padding: 1.5rem 1rem 3rem;
          }
          .back-btn {
            position: static;
            margin: 0 auto 1.8rem;
            display: block;
            width: fit-content;
          }
          .content-container {
            padding-top: 1rem;
          }
          .form-card {
            padding: 2.2rem 1.8rem;
          }
        }
      `}</style>

      <div className="admin-company-wrapper">
        {/* Top-left back button */}
        <button
          className="back-btn"
          onClick={() => navigate("/admin/companies")}
        >
          ← Back to Companies
        </button>

        <div className="content-container">
          <div className="form-card">
            <h2 className="form-title">Create New Company</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  name="name"
                  placeholder="Company Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  name="email"
                  type="email"
                  placeholder="Company Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  name="password"
                  type="password"
                  placeholder="Temporary Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {error && <p className="error-message">{error}</p>}

              <div className="actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => navigate("/admin/companies")}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
}