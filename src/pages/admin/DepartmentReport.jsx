// src/pages/admin/DepartmentReport.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AdminPageLayout from "../../components/admin/AdminPageLayout";

const API_BASE = "http://localhost:8000";

export default function DepartmentReport() {
  const { department } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const displayDepartment = department
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  useEffect(() => {
    axios
      .get(`${API_BASE}/admin-panel/reports/${department}/`)
      .then((res) => {
        setStudents(res.data.students || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading department report:", err);
        setError("Failed to load student data for this department");
        setLoading(false);
      });
  }, [department]);

  if (loading) {
    return (
      <AdminPageLayout title={`${displayDepartment} Report`}>
        <div className="department-report-wrapper">
          <h3 className="loading-text">Loading students...</h3>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout title={`${displayDepartment} - Selected Students`}>
      <style>{`
        .department-report-wrapper {
          min-height: 100vh;
          padding: 2rem 2rem 3rem;
          background: #f8fafc;
          color: #111827;
          position: relative;
        }

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
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
          z-index: 10;
        }

        .back-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
        }

        .header-container {
          text-align: center;
          margin: 5rem 0 2.5rem;
        }

        .header-container h2 {
          font-size: 2.25rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: #6b7280;
          font-size: 1.18rem;
          font-weight: 500;
        }

        .content-container {
          max-width: 1280px;
          margin: 0 auto;
        }

        .table-card {
          background: white;
          border-radius: 1.5rem;
          overflow: hidden;
          box-shadow: 
            0 12px 36px rgba(0,0,0,0.08),
            0 4px 16px rgba(0,0,0,0.05);
          border: 1px solid rgba(229,231,235,0.8);
        }

        .table-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 1.02rem;
        }

        th, td {
          padding: 1.2rem 1.5rem;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }

        th {
          background: linear-gradient(135deg, #ec4899, #f97316);
          color: white;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.45px;
          font-size: 0.96rem;
        }

        tr:hover {
          background: #fdf2f8;          /* very light pink tint - matches #ec4899 family */
          transition: background 0.18s ease;
        }

        tr:last-child td {
          border-bottom: none;
        }

        .loading-text,
        .no-data-text {
          text-align: center;
          font-size: 1.4rem;
          color: #6b7280;
          font-weight: 500;
          padding: 4rem 1rem;
        }

        .no-data-card {
          background: white;
          border-radius: 1.5rem;
          padding: 3.5rem 2rem;
          text-align: center;
          box-shadow: 0 12px 36px rgba(0,0,0,0.08);
          border: 1px solid rgba(229,231,235,0.8);
        }

        .error-message {
          max-width: 620px;
          margin: 2.5rem auto;
          padding: 1.2rem 1.8rem;
          background: rgba(239, 68, 68, 0.12);
          color: #991b1b;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 1rem;
          font-weight: 500;
          text-align: center;
          font-size: 1.05rem;
        }

        @media (max-width: 768px) {
          .department-report-wrapper {
            padding: 1.5rem 1rem 3rem;
          }

          .back-btn {
            position: static;
            margin: 0 auto 1.5rem;
            display: block;
            width: fit-content;
          }

          .header-container {
            margin: 3rem 0 2rem;
          }

          .header-container h2 {
            font-size: 1.95rem;
          }

          th, td {
            padding: 1rem 1.1rem;
            font-size: 0.98rem;
          }
        }
      `}</style>

      <div className="department-report-wrapper">
        <button
          className="back-btn"
          onClick={() => navigate("/admin/reports")}
        >
          ← Back to Department Reports
        </button>

        <div className="header-container">
          <h2>{displayDepartment}</h2>
          <div className="subtitle">Selected Students Report</div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="content-container">
          {students.length === 0 ? (
            <div className="no-data-card">
              <p className="no-data-text">
                No selected students found in this department yet.
              </p>
            </div>
          ) : (
            <div className="table-card">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Reg No</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>CGPA</th>
                      <th>Company</th>
                      <th>Job Title</th>
                      <th>Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={index}>
                        <td>{student.university_reg_no || "—"}</td>
                        <td>{student.name || "—"}</td>
                        <td>{student.email || "—"}</td>
                        <td>{student.phone || "—"}</td>
                        <td>{student.cgpa || "—"}</td>
                        <td>{student.company || "—"}</td>
                        <td>{student.job_title || "—"}</td>
                        <td>
                          {student.salary
                            ? `₹${Number(student.salary).toLocaleString("en-IN")}`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminPageLayout>
  );
}