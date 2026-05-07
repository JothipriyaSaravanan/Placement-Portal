




// src/pages/admin/CreateCoordinator.jsx

import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminPageLayout from "../../components/admin/AdminPageLayout";

export default function CreateCoordinator() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    department: "",
    programmes: [],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Department → Programme Mapping
  const departmentProgrammeMap = {
    Tamil: [
      { value: "BA_Tamil", label: "B.A. Tamil" },
      { value: "MA_Tamil", label: "M.A. Tamil" },
    ],
    English: [
      { value: "BA_English", label: "B.A. English" },
      { value: "MA_English", label: "M.A. English" },
    ],
    History: [
      { value: "BA_History", label: "B.A. History" },
      { value: "MA_History", label: "M.A. History" },
    ],
    Textile: [
      { value: "BSc_Textile", label: "B.Sc. Textile Science" },
      { value: "MSc_Textile", label: "M.Sc. Textile Science" },
    ],
    Food_Science: [
      { value: "BSc_Food_Science", label: "B.Sc. Food Science & Nutrition" },
      { value: "MSc_Food_Science", label: "M.Sc. Food Science & Nutrition" },
    ],
      Computer_Science: [
    { value: "MCA", label: "M.C.A. (Master of Computer Applications)" },
    { value: "MSc_CS", label: "M.Sc. Computer Science" },
    { value: "MSc_DS", label: "M.Sc. Data Science" },
  ],
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDepartmentChange = (e) => {
    setForm({
      ...form,
      department: e.target.value,
      programmes: [],
    });
  };

  const handleProgrammeChange = (e) => {
    const value = e.target.value;

    if (form.programmes.includes(value)) {
      setForm({
        ...form,
        programmes: form.programmes.filter((p) => p !== value),
      });
    } else {
      setForm({
        ...form,
        programmes: [...form.programmes, value],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        "http://localhost:8000/admin-panel/coordinators/create/",
        {
          admin_email: localStorage.getItem("admin_email"),
          ...form,
        }
      );

      setMessage(res.data.message || "Coordinator created successfully!");
      setMessageType("success");

      setForm({
        username: "",
        password: "",
        email: "",
        department: "",
        programmes: [],
      });
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
          err.message ||
          "Something went wrong. Please try again."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPageLayout title="Create Department Coordinator">
      <style>{`
        .admin-create-wrapper {
          min-height: 100vh;
          padding: 2rem 2rem 3rem;
          background: #f8fafc;
          color: #111827;
        }

        .top-bar {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 1.5rem;
        }

        .back-btn {
          padding: 0.75rem 1.6rem;
          font-size: 1rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 9999px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
        }

        .back-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
        }

        .message-container {
          max-width: 620px;
          margin: 0 auto 2rem;
          text-align: center;
        }

        .admin-message {
          padding: 1rem 1.6rem;
          border-radius: 1rem;
          font-weight: 500;
          font-size: 1.05rem;
        }

        .admin-message.success {
          background: rgba(16, 185, 129, 0.12);
          color: #065f46;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .admin-message.error {
          background: rgba(239, 68, 68, 0.12);
          color: #991b1b;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .form-card-wrapper {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
        }

        .form-card {
          width: 100%;
          max-width: 580px;
          background: white;
          border-radius: 1.5rem;
          padding: 2.8rem 2.4rem;
          box-shadow: 
            0 12px 36px rgba(0,0,0,0.08),
            0 4px 16px rgba(0,0,0,0.05);
          border: 1px solid rgba(229,231,235,0.8);
        }

        .form-card h2 {
          font-size: 1.95rem;
          font-weight: 700;
          color: #1e293b;
          text-align: center;
          margin-bottom: 2.2rem;
        }

        .form-group {
          margin-bottom: 1.8rem;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 1.1rem 1.5rem;
          font-size: 1.05rem;
          border: 1.5px solid #d1d5db;
          border-radius: 1rem;
          background: #f9fafb;
          transition: all 0.25s ease;
          color: #1f2937;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #ec4899;
          box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.12);
          background: white;
        }

        .submit-btn {
          width: 100%;
          padding: 1.15rem;
          font-size: 1.12rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #ec4899, #f97316);
          border: none;
          border-radius: 3rem;
          cursor: pointer;
          transition: all 0.32s ease;
          box-shadow: 0 8px 24px rgba(236,72,153,0.32);
          margin-top: 1.5rem;
        }

        .submit-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 36px rgba(236,72,153,0.45);
        }

        .submit-btn:disabled {
          background: #d1d5db;
          transform: none;
          box-shadow: none;
          cursor: not-allowed;
        }
      `}</style>

      <div className="admin-create-wrapper">
        <div className="top-bar">
          <button
            className="back-btn"
            onClick={() => navigate("/admin/coordinators")}
          >
            ← Back to Coordinators List
          </button>
        </div>

        <div className="message-container">
          {message && (
            <div className={`admin-message ${messageType}`}>
              {message}
            </div>
          )}
        </div>

        <div className="form-card-wrapper">
          <div className="form-card">
            <h2>New Coordinator</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  name="username"
                  placeholder="Username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <select
                  name="department"
                  value={form.department}
                  onChange={handleDepartmentChange}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Tamil">Tamil</option>
                  <option value="English">English</option>
                  <option value="History">History</option>
                  <option value="Textile">Textile Science</option>
                  <option value="Food_Science">Food Science & Nutrition</option>
                  <option value="Computer_Science">Computer Science</option>
                </select>
              </div>

              {form.department && (
                <div className="form-group">
                  <div
                    style={{
                      border: "1.5px solid #d1d5db",
                      borderRadius: "1rem",
                      padding: "1rem 1.2rem",
                      background: "#f9fafb",
                    }}
                  >
                    {departmentProgrammeMap[form.department]?.map((prog) => (
                      <label
                        key={prog.value}
                        style={{
                          display: "block",
                          marginBottom: "0.6rem",
                          cursor: "pointer",
                          fontSize: "1rem",
                          color: "#1f2937",
                        }}
                      >
                        <input
                          type="checkbox"
                          value={prog.value}
                          checked={form.programmes.includes(prog.value)}
                          onChange={handleProgrammeChange}
                          style={{ marginRight: "0.6rem" }}
                        />
                        {prog.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Coordinator"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
}