// src/pages/coordinator/ManageStudent.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8000";

export default function ManageStudent() {
  const navigate = useNavigate();
  const [rollNo, setRollNo] = useState("");
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [mode, setMode] = useState(""); // "edit" or "delete"

  const fetchStudent = async () => {
    if (!rollNo.trim()) {
      setMessage("Please enter a University Roll No.");
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("Fetching student...");
    setIsSuccess(false);

    try {
      const res = await axios.get(`${API_BASE}/api/students/${rollNo.trim()}/`, {
        withCredentials: true,
      });
      setStudent(res.data);
      setMessage(`Student found: ${res.data.name}`);
      setIsSuccess(true);
    } catch (err) {
      setStudent(null);
      setMessage(
        "Student not found: " +
          (err.response?.data?.error || err.message || "Unknown error")
      );
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const saveEdit = async () => {
    if (!student) return;

    setLoading(true);
    setMessage("Saving changes...");
    setIsSuccess(false);

    try {
      const res = await axios.put(
        `${API_BASE}/api/students/${student.university_reg_no}/`,
        student,
        { withCredentials: true }
      );
      setMessage("Student updated successfully!");
      setIsSuccess(true);
    } catch (err) {
      setMessage(
        "Update failed: " +
          (err.response?.data?.error || err.message || "Unknown error")
      );
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async () => {
    if (!student) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${student.name}?`
    );
    if (!confirmDelete) return;

    setLoading(true);
    setMessage("Deleting student...");
    setIsSuccess(false);

    try {
      await axios.delete(`${API_BASE}/api/students/${student.university_reg_no}/`, {
        withCredentials: true,
      });
      setMessage("Student deleted successfully!");
      setIsSuccess(true);
      setStudent(null);
      setRollNo("");
    } catch (err) {
      setMessage(
        "Deletion failed: " +
          (err.response?.data?.error || err.message || "Unknown error")
      );
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-wrapper">
        <div className="glass-card">
          <h2 className="upload-title">Manage Student</h2>
          <p className="upload-subtitle">
            Enter University Roll No to {mode === "edit" ? "edit" : "delete"} a student
          </p>

          {message && (
            <div
              className={`message-box ${isSuccess ? "message-success" : "message-error"}`}
            >
              {message}
            </div>
          )}

          <div className="action-buttons">
            <input
              type="text"
              placeholder="University Roll No"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              className="form-control"
            />
            <button
              className="btn-primary-gradient"
              onClick={() => {
                setMode("edit");
                fetchStudent();
              }}
              disabled={loading}
            >
              Fetch for Edit
            </button>
            <button
              className="btn-success-gradient"
              onClick={() => {
                setMode("delete");
                fetchStudent();
              }}
              disabled={loading}
            >
              Fetch for Delete
            </button>
          </div>

          {student && mode === "edit" && (
            <div className="mt-4">
              <h5>Edit Student Info</h5>
              <input
                type="text"
                placeholder="Name"
                value={student.name}
                onChange={(e) => setStudent({ ...student, name: e.target.value })}
                className="form-control mb-2"
              />
              <input
                type="email"
                placeholder="Email"
                value={student.email}
                onChange={(e) => setStudent({ ...student, email: e.target.value })}
                className="form-control mb-2"
              />
              <input
                type="text"
                placeholder="Department"
                value={student.department}
                onChange={(e) =>
                  setStudent({ ...student, department: e.target.value })
                }
                className="form-control mb-2"
              />
              <button
                className="btn-primary-gradient mt-2"
                onClick={saveEdit}
                disabled={loading}
              >
                Save Changes
              </button>
            </div>
          )}

          {student && mode === "delete" && (
            <div className="mt-4">
              <h5>Delete Student</h5>
              <p>
                Name: <strong>{student.name}</strong> <br />
                Department: <strong>{student.department}</strong>
              </p>
              <button
                className="btn-success-gradient mt-2"
                onClick={deleteStudent}
                disabled={loading}
              >
                Confirm Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}