






// src/pages/coordinator/UploadExcel.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = "http://localhost:8000";

export default function UploadExcel() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [coordinatorName] = useState(localStorage.getItem("coordinatorUsername") || "Coordinator");
  const [department] = useState(localStorage.getItem("department") || "Department");

  const [mode, setMode] = useState(""); // "edit" or "delete"
  const [rollNo, setRollNo] = useState("");
  const [student, setStudent] = useState(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    university_reg_no: '',
    name: '',
    ug_pg: 'PG',
    department: department,
    programme: '',
    email: '',
    phone: '',
    passed_out_year: '',
  });

  // Handle Add Student Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/students/add/`,
        addFormData,
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      setMessage(res.data.message || "Student added to registry successfully!");
      setIsSuccess(true);
      setIsAddModalOpen(false);
      // Reset form
      setAddFormData({
        university_reg_no: '',
        name: '',
        ug_pg: 'PG',
        department: department,
        programme: '',
        email: '',
        phone: '',
        passed_out_year: '',
      });
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to add student to registry.");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single student by Roll No
  const fetchStudent = async () => {
    if (!rollNo.trim()) return setMessage("Enter University Roll No");
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/students/${rollNo}/`, { withCredentials: true });
      setStudent(res.data);
      setMessage(`Student record found: ${res.data.name}`);
      setIsSuccess(true);
    } catch (err) {
      setStudent(null);
      setMessage("Student not found in the registry");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Save edited student
  const saveEdit = async () => {
    if (!student) return;
    setLoading(true);
    try {
      await axios.put(`${API_BASE}/api/students/${student.university_reg_no}/`, student, { withCredentials: true });
      setMessage("Student record updated successfully!");
      setIsSuccess(true);
      setStudent(null);
      setMode("");
      setRollNo("");
    } catch (err) {
      setMessage("Failed to update student record");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Delete student
  const deleteStudent = async () => {
    if (!student) return;
    if (!window.confirm(`Are you sure you want to delete ${student.name}'s record permanently?`)) return;
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/api/students/${student.university_reg_no}/`, { withCredentials: true });
      setMessage("Student record deleted successfully!");
      setIsSuccess(true);
      setStudent(null);
      setRollNo("");
    } catch (err) {
      setMessage("Failed to delete student record");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Upload Excel
  const uploadExcel = async () => {
    if (!file) {
      setMessage("Please select a valid Excel file first.");
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("Processing data into the registry...");
    setIsSuccess(false);

    const formData = new FormData();
    formData.append("excel", file);

    try {
      const res = await axios.post(
        `${API_BASE}/api/students/process-excel/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      setMessage(res.data.message || "Students registry updated successfully!");
      setIsSuccess(true);
      setFile(null);
    } catch (err) {
      setMessage("Registry update failed: " + (err.response?.data?.error || err.message || "Unknown error"));
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

      <style>{`
        .upload-page-container {
          padding: 0.5rem 1.5rem 2rem;
          max-width: 100%;
          margin: 0;
          font-family: 'Inter', sans-serif;
          overflow: visible !important; /* Never scroll locally, let parent handle it */
          box-sizing: border-box;
        }

        .registry-header {
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 1.5rem;
          width: 100%;
        }

        .header-title-group h1 {
          font-family: 'Outfit', sans-serif;
          color: #002147;
          font-weight: 800;
          font-size: 1.5rem;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .header-title-group p {
          color: #111827; /* Rich Black */
          font-weight: 600;
          margin: 0.5rem 0 0 0;
          font-size: 1.1rem;
        }

        .department-badge {
          background: #f1f5f9;
          color: #002147;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          font-weight: 700;
          border: 1px solid #e2e8f0;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .registry-grid {
          display: grid;
          grid-template-columns: 1fr 1fr; /* Changed to 1:1 for better symmetry or 3:2 */
          grid-template-columns: 1.6fr 1fr;
          gap: 1.5rem;
          width: 100%;
          box-sizing: border-box;
        }

        .registry-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          height: 100%;
          box-sizing: border-box;
        }

        /* Subtle differentiation */
        .registry-section-import .registry-card {
          background: #f0fdf4; /* Faint green/emerald tint */
          border-left: 4px solid #059669; /* Solid Emerald border */
        }
        .registry-section-import .card-label {
          color: #065f46; /* Deep Emerald for heading */
        }
        .registry-section-import .card-label i {
          color: #059669; /* Emerald for icon */
        }
        .registry-section-import .upload-zone:hover {
          border-color: #059669;
          background: #f0fdf4;
        }

        .registry-section-lookup .registry-card {
          background: #eff6ff; /* Faint blue tint for lookup */
          border-left: 4px solid #2563eb; /* Professional Blue border */
        }
        .registry-section-lookup .card-label {
          color: #1e3a8a; /* Deep Blue for heading */
        }
        .registry-section-lookup .card-label i {
          color: #2563eb; /* Blue for icon */
        }

        .card-label {
          font-family: 'Outfit', sans-serif;
          color: #002147;
          font-weight: 700;
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .upload-zone {
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          padding: 3.5rem 2rem;
          text-align: center;
          position: relative;
          transition: all 0.3s;
          background: #f8fafc;
        }

        .upload-zone:hover {
          border-color: #002147;
          background: #f1f5f9;
        }

        .upload-icon {
          font-size: 3rem;
          color: #94a3b8;
          margin-bottom: 1rem;
        }

        .upload-input-overlay {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        .file-status {
          margin-top: 1.5rem;
          padding: 1rem;
          background: #f1f5f9;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .btn-registry-primary {
          background: #059669; /* Emerald Green */
          color: white;
          border: none;
          padding: 0.8rem 1.8rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        .btn-registry-primary:hover {
          background: #047857; /* Darker Emerald on hover */
          transform: translateY(-1px);
        }

        .btn-registry-secondary {
          background: #ffffff;
          color: #002147;
          border: 1px solid #e2e8f0;
          padding: 0.8rem 1.8rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
        }

        .btn-registry-secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .btn-registry-success {
          background: #059669;
          color: white;
          border: none;
          padding: 0.8rem 1.8rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        /* Lookup Specific Buttons */
        .btn-lookup-edit {
          background: #2563eb;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.1);
        }
        .btn-lookup-edit:hover { 
          background: #1d4ed8; 
          transform: translateY(-1px);
          box-shadow: 0 6px 12px -2px rgba(37, 99, 235, 0.2);
        }

        .btn-lookup-delete {
          background: #dc2626; /* Full Red */
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.1);
        }
        .btn-lookup-delete:hover { 
          background: #b91c1c; /* Darker Red on hover */
          transform: translateY(-1px);
          box-shadow: 0 6px 12px -2px rgba(220, 38, 38, 0.2);
        }

        .btn-registry-success:hover {
          background: #047857;
        }

        .btn-registry-danger {
          background: #dc2626;
          color: white;
          border: none;
          padding: 0.8rem 1.8rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .btn-registry-danger:hover {
          background: #b91c1c;
        }

        .registry-input {
          border: 1px solid #e2e8f0;
          padding: 0.8rem 1rem;
          border-radius: 8px;
          font-size: 1rem;
          color: #1e293b;
          width: 100%;
          outline: none;
          transition: border-color 0.2s;
        }

        .registry-input:focus {
          border-color: #002147;
        }

        .registry-input::placeholder {
          color: #4b5563; /* Darker placeholder for visibility */
          opacity: 0.8;
        }

        .message-banner {
          padding: 1rem 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .banner-success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
        .banner-error { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }

        .search-action-group {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .edit-fields-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .field-label {
          font-size: 0.8rem;
          font-weight: 800;
          color: #000000; /* Pure Black labels */
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .instruction-box {
          margin-top: 2rem;
          background: #ffffff;
          border: 1.5px solid #059669; /* Full thin border instead of thick left */
          border-radius: 12px;
          padding: 1.5rem;
          color: #111827; /* Deep Black for readability */
          font-size: 0.9rem;
          line-height: 1.6;
          display: flex;
          gap: 1.2rem;
        }

        .instruction-box strong {
          color: #065f46;
          display: block;
          font-size: 1rem;
          margin-bottom: 0.75rem;
          font-family: 'Outfit', sans-serif;
        }

        .token-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.75rem;
          padding: 0;
          list-style: none;
        }

        .column-token {
          background: #f1f5f9;
          color: #1e3a8a;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          border: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        @media (max-width: 992px) {
          .registry-grid { grid-template-columns: 1fr; }
          .upload-page-container { padding: 1.5rem; }
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 33, 71, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.3s ease;
        }

        .modal-container {
          background: #ffffff;
          width: 90%;
          max-width: 650px;
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          animation: slideUp 0.3s ease;
          border: 1px solid #e2e8f0;
        }

        .modal-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
        }

        .modal-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          color: #002147;
          margin: 0;
        }

        .modal-close {
          background: transparent;
          border: none;
          color: #4a5568;
          font-size: 1.5rem;
          cursor: pointer;
          transition: color 0.2s;
        }

        .modal-close:hover { color: #dc2626; }

        .modal-body {
          padding: 2rem;
          max-height: 80vh;
          overflow-y: auto;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <div className="upload-page-container">
        {/* Header */}
        <header className="registry-header">
          <div className="header-title-group">
            <h1>Student Registry Management</h1>
          </div>
          <div className="department-badge">
            <i className="fas fa-university"></i>
            {department} Department
          </div>
        </header>

        {/* Status Message */}
        {message && (
          <div className={`message-banner ${isSuccess ? 'banner-success' : 'banner-error'}`}>
            <i className={`fas ${isSuccess ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            {message}
          </div>
        )}

        <div className="registry-grid">
          {/* Left Column: Bulk Upload */}
          <section className="registry-section registry-section-import">
            <div className="registry-card">
              <h2 className="card-label">
                <i className="fas fa-file-csv"></i>
                Bulk Import Students
              </h2>
              <p className="text-muted mb-4">Select an Excel file (.xlsx) containing the latest student records to update the institutional registry.</p>

              <div className="upload-zone">
                <i className="fas fa-cloud-upload-alt upload-icon"></i>
                <h3 className="h5 font-weight-bold">Choose File to Upload</h3>
                <p className="small text-muted">or drag and drop here</p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="upload-input-overlay"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>

              {file && (
                <div className="file-status">
                  <div>
                    <i className="fas fa-file-excel text-success me-2"></i>
                    <span className="font-weight-600">{file.name}</span>
                    <span className="small text-muted ms-2">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button className="btn btn-sm btn-link text-danger" onClick={() => setFile(null)}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}

              <div className="mt-4 d-flex gap-3">
                <button
                  className="btn-registry-primary"
                  onClick={uploadExcel}
                  disabled={loading || !file}
                >
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm"></span> Processing...</>
                  ) : (
                    <><i className="fas fa-sync-alt"></i> Import & Synchronize</>
                  )}
                </button>
                <button
                  className="btn-registry-secondary"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <i className="fas fa-user-plus"></i> Add Individual
                </button>
              </div>

              <div className="instruction-box">
                <i className="fas fa-info-circle fa-2x" style={{ color: '#059669' }}></i>
                <div className="flex-grow-1">
                  <strong>Institutional Registry Template Requirements:</strong>
                  <p className="mb-2">Your Excel workbook must contain exactly these column headers in the first row:</p>
                  <div className="token-group">
                    <span className="column-token">UniversityRegNo</span>
                    <span className="column-token">Name</span>
                    <span className="column-token">UG/PG</span>
                    <span className="column-token">Department</span>
                    <span className="column-token">Programme</span>
                    <span className="column-token">Email</span>
                    <span className="column-token">Phone</span>
                    <span className="column-token">PassedOutYear</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Record Lookup & Management */}
          <section className="registry-section registry-section-lookup">
            <div className="registry-card">
              <h2 className="card-label">
                <i className="fas fa-search"></i>
                Record Lookup
              </h2>
              <p className="text-muted mb-3">Retrieve or modify specific student records using their University Registration Number.</p>

              <div className="field-group">
                <label className="field-label">Registration Number</label>
                <input
                  type="text"
                  className="registry-input"
                  placeholder="e.g. 20240001"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                />
              </div>

              <div className="search-action-group">
                <button className="btn-lookup-edit flex-grow-1" onClick={() => { setMode("edit"); fetchStudent(); }}>
                  <i className="fas fa-user-edit"></i> Edit Record
                </button>
                <button className="btn-lookup-delete flex-grow-1" onClick={() => { setMode("delete"); fetchStudent(); }}>
                  <i className="fas fa-trash-alt"></i> Delete Record
                </button>
              </div>

              {/* Edit Interface */}
              {student && mode === "edit" && (
                <div className="edit-fields-grid">
                  <div className="field-group">
                    <label className="field-label">Full Name</label>
                    <input type="text" className="registry-input" value={student.name} onChange={(e) => setStudent({ ...student, name: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Institutional Email</label>
                    <input type="email" className="registry-input" value={student.email} onChange={(e) => setStudent({ ...student, email: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Programme</label>
                    <input type="text" className="registry-input" value={student.programme || ""} onChange={(e) => setStudent({ ...student, programme: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Batch Year</label>
                    <input type="number" className="registry-input" value={student.passed_out_year || ""} onChange={(e) => setStudent({ ...student, passed_out_year: e.target.value })} />
                  </div>
                  <div className="col-span-2 mt-2">
                    <button className="btn-registry-success w-100" onClick={saveEdit}>
                      Commit Changes to Registry
                    </button>
                  </div>
                </div>
              )}

              {/* Delete Interface */}
              {student && mode === "delete" && (
                <div className="mt-4 p-3 border border-danger rounded bg-light">
                  <p className="mb-3">You are about to delete <strong>{student.name}'s</strong> record. This action cannot be undone.</p>
                  <button className="btn-registry-danger w-100" onClick={deleteStudent}>
                    Confirm Permanent Deletion
                  </button>
                </div>
              )}
            </div>

          </section>
        </div>

        {/* Add Individual Modal */}
        {isAddModalOpen && (
          <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <header className="modal-header">
                <h3 className="modal-title">Add New Student Record</h3>
                <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </header>
              <div className="modal-body">
                <form onSubmit={handleAddSubmit}>
                  <div className="form-grid-2">
                    <div className="field-group mb-3">
                      <label className="field-label">University Registration No *</label>
                      <input 
                        type="text" 
                        className="registry-input" 
                        required 
                        placeholder="e.g. 2024CSE001"
                        value={addFormData.university_reg_no}
                        onChange={(e) => setAddFormData({...addFormData, university_reg_no: e.target.value})}
                      />
                    </div>
                    <div className="field-group mb-3">
                      <label className="field-label">Full Name *</label>
                      <input 
                        type="text" 
                        className="registry-input" 
                        required 
                        placeholder="e.g. John Doe"
                        value={addFormData.name}
                        onChange={(e) => setAddFormData({...addFormData, name: e.target.value})}
                      />
                    </div>
                    <div className="field-group mb-3">
                      <label className="field-label">Program Type *</label>
                      <select 
                        className="registry-input" 
                        required
                        value={addFormData.ug_pg}
                        onChange={(e) => setAddFormData({...addFormData, ug_pg: e.target.value})}
                      >
                        <option value="UG">Undergraduate (UG)</option>
                        <option value="PG">Postgraduate (PG)</option>
                      </select>
                    </div>
                    <div className="field-group mb-3">
                      <label className="field-label">Department *</label>
                      <input 
                        type="text" 
                        className="registry-input bg-light" 
                        value={addFormData.department} 
                        readOnly 
                      />
                    </div>
                  </div>

                  <div className="field-group mb-3">
                    <label className="field-label">Programme / Course *</label>
                    <input 
                      type="text" 
                      className="registry-input" 
                      required 
                      placeholder="e.g. B.Tech Computer Science"
                      value={addFormData.programme}
                      onChange={(e) => setAddFormData({...addFormData, programme: e.target.value})}
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="field-group mb-3">
                      <label className="field-label">Institutional Email *</label>
                      <input 
                        type="email" 
                        className="registry-input" 
                        required 
                        placeholder="student@university.edu"
                        value={addFormData.email}
                        onChange={(e) => setAddFormData({...addFormData, email: e.target.value})}
                      />
                    </div>
                    <div className="field-group mb-3">
                      <label className="field-label">Phone Number *</label>
                      <input 
                        type="tel" 
                        className="registry-input" 
                        required 
                        placeholder="e.g. +91 9876543210"
                        value={addFormData.phone}
                        onChange={(e) => setAddFormData({...addFormData, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="field-group mb-4">
                    <label className="field-label">Graduation Year *</label>
                    <select 
                      className="registry-input" 
                      required
                      value={addFormData.passed_out_year}
                      onChange={(e) => setAddFormData({...addFormData, passed_out_year: e.target.value})}
                    >
                      <option value="" disabled>Select Year</option>
                      {[2024, 2025, 2026, 2027, 2028].map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-2 text-end">
                    <button type="button" className="btn-registry-secondary me-3" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-registry-primary" disabled={loading}>
                      {loading ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span> Adding...</>
                      ) : (
                        <><i className="fas fa-plus-circle me-2"></i> Add Student to Registry</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

