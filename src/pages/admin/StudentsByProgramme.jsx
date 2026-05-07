import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminPageLayout from "../../components/admin/AdminPageLayout";

export default function StudentsByProgramme() {
  const { programme } = useParams();   // ✅ get from URL
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!programme) return;

    axios
      .get(`http://localhost:8000/admin-panel/students/?programme=${programme}`, {
        withCredentials: true,
      })
      .then((res) => {
        setStudents(res.data.students || []);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [programme]);

  return (
    <AdminPageLayout title="Students">
      <div style={{ padding: "2rem" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginBottom: "2rem",
            padding: "0.6rem 1.5rem",
            borderRadius: "9999px",
            border: "none",
            background: "#6366f1",
            color: "white",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

        <h2>{programme} Students</h2>

        {loading ? (
          <p>Loading students...</p>
        ) : students.length === 0 ? (
          <p>No students found.</p>
        ) : (
          students.map((student) => (
            <div
              key={student.id}
              style={{
                padding: "1rem",
                marginBottom: "1rem",
                background: "white",
                borderRadius: "1rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <p><b>Name:</b> {student.name}</p>
              <p><b>Email:</b> {student.email}</p>
            </div>
          ))
        )}
      </div>
    </AdminPageLayout>
  );
}