// src/components/Topbar.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const Topbar = () => {
  const [studentName, setStudentName] = useState("Student");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentDepartment, setStudentDepartment] = useState("");
  const [studentPhoto, setStudentPhoto] = useState("");
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("studentEmail");
    if (!email) return;
    setStudentEmail(email);

    axios
      .get(`http://localhost:8000/api/students/profile/?email=${email}`)
      .then((res) => {
        const student = res.data?.student || {};
        const profilePhoto = res.data?.profile_image || student.profile_image || "";

        if (res.data.student && res.data.student.email) {
          setStudentEmail(res.data.student.email);
        }
        if (student.name) {
          setStudentName(student.name);
        } else if (student.username) {
          setStudentName(student.username);
        }

        setStudentDepartment(student.department || "Department");

        if (profilePhoto) {
          const normalizedPhoto = profilePhoto.startsWith("/")
            ? `http://localhost:8000${profilePhoto}`
            : profilePhoto;
          setStudentPhoto(normalizedPhoto);
        }
      })
      .catch((err) => console.log("Failed to load student name:", err));
  }, []);

  const avatarInitial = (studentName || "S").trim().charAt(0).toUpperCase();

  return (
    <>
      <style>{`
        .topbar-area {
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 1000;
          color: #111827;
          gap: 1rem;
        }

        .welcome {
          font-size: 1.1rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .welcome span {
          font-weight: 700;
          color: #0f172a;
        }

        .directory-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f172a;
          margin-right: auto;
          padding: 0 1rem;
          border-right: 2px solid #e5e7eb;
        }

        .student-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.45rem 0.7rem;
          border: 1px solid #dbe2ea;
          border-radius: 10px;
          background: #f8fafc;
          min-width: 250px;
          max-width: 440px;
        }

        .student-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f172a;
          color: #ffffff;
          font-size: 0.95rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .student-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .student-text {
          display: flex;
          flex-direction: column;
          min-width: 0;
          line-height: 1.25;
        }

        .student-email {
          font-size: 0.86rem;
          font-weight: 600;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .student-dept {
          font-size: 0.76rem;
          font-weight: 500;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 992px) {
<<<<<<< HEAD
          .topbar-area {
            padding-right: 3.2rem;
          }

          .welcome {
            max-width: 48%;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        @media (max-width: 768px) {
          .topbar-area {
            padding: 0.8rem 1.5rem;
          }
          .welcome {
            font-size: 1rem;
          }

          .student-meta {
            min-width: 210px;
            max-width: 290px;
          }

          .student-avatar {
            width: 34px;
            height: 34px;
            font-size: 0.85rem;
          }

          .student-email {
            font-size: 0.8rem;
          }
        }

        @media (max-width: 576px) {
          .topbar-area {
            gap: 0.75rem;
            padding: 0.75rem 1rem;
          }

          .student-meta {
            min-width: 0;
            max-width: 195px;
            padding: 0.4rem 0.5rem;
            gap: 0.55rem;
          }

          .student-avatar {
            width: 30px;
            height: 30px;
            font-size: 0.8rem;
          }

          .student-dept {
            font-size: 0.72rem;
          }
=======
          .topbar-area { padding-right: 3.2rem; }
          .welcome { max-width: 48%; overflow: hidden; text-overflow: ellipsis; }
        }

        @media (max-width: 768px) {
          .topbar-area { padding: 0.8rem 1.5rem; }
          .welcome { font-size: 1rem; }
          .student-meta { min-width: 210px; max-width: 290px; }
          .student-avatar { width: 34px; height: 34px; font-size: 0.85rem; }
          .student-email { font-size: 0.8rem; }
        }

        @media (max-width: 576px) {
          .topbar-area { gap: 0.75rem; padding: 0.75rem 1rem; }
          .student-meta { min-width: 0; max-width: 195px; padding: 0.4rem 0.5rem; gap: 0.55rem; }
          .student-avatar { width: 30px; height: 30px; font-size: 0.8rem; }
          .student-dept { font-size: 0.72rem; }
>>>>>>> 7003d1870f2464a396633cd4630aabe70cb67dd6
        }
      `}</style>

      <div className="topbar-area">
        <div className="directory-title">
          📁 Directory of the Placement
        </div>

        <div className="welcome">
          Welcome, <span>{studentName}</span>!
        </div>

        <div className="student-meta">
          <div className="student-avatar">
            {studentPhoto && !photoError ? (
              <img
                src={studentPhoto}
                alt={studentName}
                onError={() => setPhotoError(true)}
              />
            ) : (
              <span>{avatarInitial}</span>
            )}
          </div>

          <div className="student-text">
            <div className="student-email" title={studentEmail || "Email unavailable"}>
              {studentEmail || "Unavailable"}
            </div>
            <div className="student-dept" title={studentDepartment || "Department unavailable"}>
              {studentDepartment || "Department unavailable"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Topbar;