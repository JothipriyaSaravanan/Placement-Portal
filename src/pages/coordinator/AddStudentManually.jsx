









// src/pages/coordinator/AddStudentManually.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CoordinatorPageLayout from '../../components/coordinator/CoordinatorPageLayout';

const API_BASE = "http://localhost:8000";

export default function AddStudentManually() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    university_reg_no: '',
    name: '',
    ug_pg: 'PG',
    department: '',           // will be set from localStorage
    programme: '',
    email: '',
    phone: '',
    passed_out_year: '',     // new field for graduation year
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Load coordinator name & department from localStorage (same logic as dashboard)
  useEffect(() => {
    const username = localStorage.getItem('coordinatorUsername');
    const dept = localStorage.getItem('department');

    if (!username) {
      navigate('/coordinator/login');
      return;
    }

    if (dept) {
      setFormData(prev => ({
        ...prev,
        department: dept
      }));
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Extra safety: prevent submit if department is missing
    if (!formData.department) {
      setMessage("Department is required. Please log in again.");
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("Adding student...");
    setIsSuccess(false);

    try {
      const res = await axios.post(
        `${API_BASE}/api/students/add/`,
        formData,
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      setMessage(res.data.message || "Student added successfully!");
      setIsSuccess(true);

      // Reset form — keep department
      setFormData({
        university_reg_no: '',
        name: '',
        ug_pg: 'PG',
        department: formData.department,   // ← preserved
        programme: '',
        email: '',
        phone: '',
        passed_out_year: '',  // ← use graduation year, not batch string
      });

    } catch (err) {
      setMessage(
        err.response?.data?.error ||
        "Failed to add student. Please check the details."
      );
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CoordinatorPageLayout title="Add Student Manually">
      <>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />

        <style>{`
          body {
            background: linear-gradient(135deg, #6b46c1 0%, #9f7aea 100%);
            min-height: 100vh;
            font-family: 'Segoe UI', system-ui, sans-serif;
            color: #2d3748;
            margin: 0;
            overflow-x: hidden;
          }
          .add-page {
            position: relative;
            min-height: 100vh;
            padding: 2rem 1.5rem;
            z-index: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
          }
          .add-page::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 20% 80%, rgba(255,255,255,0.12) 0%, transparent 60%);
            animation: gentlePulse 20s ease-in-out infinite;
            pointer-events: none;
            z-index: 0;
          }
          @keyframes gentlePulse {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }
          .floating-dots {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 0;
          }
          .dot {
            position: absolute;
            background: rgba(255, 255, 255, 0.75);
            border-radius: 50%;
            box-shadow: 0 0 12px rgba(255,255,255,0.4);
            animation: floatDot 12s infinite ease-in-out;
          }
          @keyframes floatDot {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
            50%      { transform: translateY(-40px) scale(1.2); opacity: 1; }
          }
          .form-wrapper {
            position: relative;
            z-index: 2;
            max-width: 720px;
            width: 100%;
            margin: 2.5rem auto 0;
            background: rgba(255,255,255,0.95);
            border-radius: 1.8rem;
            padding: 2.8rem 2.5rem;
            box-shadow: 0 20px 70px rgba(0,0,0,0.25);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255,255,255,0.4);
            display: flex;
            flex-direction: column;
            align-items: stretch;
          }
          .form-title {
            font-size: 1.9rem;
            font-weight: 700;
            color: #2d3748;
            text-align: center;
            margin-bottom: 0.6rem;
          }
          .form-subtitle {
            color: #4a5568;
            text-align: center;
            margin-bottom: 2.2rem;
            font-size: 1.05rem;
          }
          .message-box {
            padding: 1.2rem 1.6rem;
            border-radius: 1rem;
            margin-bottom: 2rem;
            font-weight: 500;
            text-align: center;
            border: 1px solid;
          }
          .message-success { background: #e9d8fd; color: #6b21a8; border-color: #c084fc; }
          .message-error   { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
          .form-label {
            font-weight: 600;
            color: #4a5568;
            margin-bottom: 0.45rem;
            display: block;
          }
          .form-control, .form-select {
            border-radius: 0.8rem;
            padding: 0.75rem 1.1rem;
            border: 1px solid #d1d5db;
            transition: all 0.25s ease;
            font-size: 1rem;
          }
          .form-control[readonly],
          .form-control:disabled {
            background-color: #f8f9fa;
            opacity: 1;
            cursor: not-allowed;
          }
          .form-control:focus, .form-select:focus {
            border-color: #c084fc;
            box-shadow: 0 0 0 0.25rem rgba(192, 132, 252, 0.25);
          }
          .submit-btn {
            padding: 1rem 2.5rem;
            background: linear-gradient(135deg, #7c3aed, #c084fc);
            color: white;
            border: none;
            border-radius: 1.2rem;
            font-weight: 600;
            font-size: 1.1rem;
            box-shadow: 0 8px 25px rgba(124,58,237,0.4);
            transition: all 0.35s ease;
            width: 100%;
            margin-top: 1.5rem;
          }
          .submit-btn:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 16px 40px rgba(124,58,237,0.55);
          }
          .submit-btn:disabled {
            opacity: 0.65;
            cursor: not-allowed;
          }
          .info-text {
            margin-top: 2rem;
            text-align: center;
            color: #6b7280;
            font-size: 0.95rem;
          }
          .row.g-3 {
            display: flex;
            flex-wrap: wrap;
            gap: 1.2rem 1.2rem;
          }
          .col-md-6, .col-12 {
            flex: 1 1 220px;
            min-width: 0;
            max-width: 100%;
            display: flex;
            flex-direction: column;
          }
          @media (max-width: 900px) {
            .form-wrapper {
              padding: 2rem 1.2rem;
              border-radius: 1.2rem;
            }
            .form-title { font-size: 1.5rem; }
            .row.g-3 { gap: 1rem 0.7rem; }
          }
          @media (max-width: 600px) {
            .add-page {
              padding: 1rem 0.2rem;
            }
            .form-wrapper {
              padding: 1.1rem 0.3rem;
              border-radius: 0.7rem;
              margin: 1.2rem auto 0;
            }
            .form-title { font-size: 1.15rem; }
            .form-subtitle { font-size: 0.98rem; }
            .row.g-3 {
              flex-direction: column;
              gap: 0.7rem 0;
            }
            .col-md-6, .col-12 {
              flex: 1 1 100%;
              min-width: 0;
            }
            .submit-btn {
              font-size: 1rem;
              padding: 0.8rem 1.2rem;
            }
          }
        `}</style>

        <div className="floating-dots">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="dot"
              style={{
                width: `${Math.random() * 5 + 3}px`,
                height: `${Math.random() * 5 + 3}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        <div className="add-page">
          <div className="form-wrapper">
            <h2 className="form-title">
              <i className="fas fa-user-plus me-2" style={{ color: "#7c3aed" }}></i>
              Add New Student
            </h2>
            <p className="form-subtitle">Enter student details manually</p>

            {message && (
              <div className={`message-box ${isSuccess ? 'message-success' : 'message-error'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">University Reg No *</label>
                  <input
                    type="text"
                    name="university_reg_no"
                    value={formData.university_reg_no}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g. 1CS12025"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g. Jothipriya S"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Program Type *</label>
                  <select
                    name="ug_pg"
                    value={formData.ug_pg}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="PG">Post Graduate (PG)</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Department *</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    className="form-control"
                    readOnly
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Programme / Course *</label>
                  <input
                    type="text"
                    name="programme"
                    value={formData.programme}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g. Master of Computer Applications, B.Tech CSE"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="student@example.com"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="9876543210"
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
  <label className="form-label">Graduation Year *</label>
  <select
    name="passed_out_year"
    value={formData.passed_out_year}
    
    onChange={(e) =>
      setFormData(prev => ({
        ...prev,
        passed_out_year: e.target.value   // ✅ store as string
      }))
    }
    className="form-select"
    required
  >
    <option value="" disabled>Select Year</option>
    <option value="2026">2026</option>
    <option value="2025">2025</option>
    <option value="2024">2024</option>
    {/* Add more graduation years as needed */}
  </select>
</div>



              <button
                type="submit"
                disabled={loading || !formData.department}
                className="submit-btn"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Adding Student...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus me-2"></i>
                    Add Student
                  </>
                )}
              </button>
            </form>

            <div className="info-text">
              <p>
                <i className="fas fa-info-circle me-2"></i>
                Department is automatically set from your login
              </p>
            </div>
          </div>
        </div>
      </>
    </CoordinatorPageLayout>
  );
}