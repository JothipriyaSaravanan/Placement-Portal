


// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Helper to get CSRF token from cookies (Django standard)
const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [studentName, setStudentName] = useState("Student");
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState({});
  const [imageError, setImageError] = useState(false);


  // Remove Photo Confirmation Modal States (Same style as Company Logo)
  const [showRemovePhotoModal, setShowRemovePhotoModal] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);

  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name?.trim()) return "?";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    let initials = parts.map((p) => p[0]).join("");
    if (initials.length < 2 && name.length > 1) {
      initials = name.slice(0, 2);
    }
    return initials.toUpperCase() || "?";
  };

  const loadProfile = async () => {
    const email = localStorage.getItem("studentEmail");
    if (!email) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const profileRes = await fetch(
        `http://localhost:8000/api/students/profile/?email=${email}`
      );
      if (!profileRes.ok) throw new Error("Failed to fetch profile");
      let profileData = await profileRes.json();

      let socialData = {
        github: "",
        linkedin: "",
        portfolio: "",
        twitter: "",
      };

      try {
        const socialRes = await fetch(
          `http://localhost:8000/api/students/get-social-links/?email=${email}`
        );
        if (socialRes.ok) {
          socialData = await socialRes.json();
        }
      } catch (socialErr) {
        console.warn("Could not load social links (using empty defaults):", socialErr);
      }

      const fullProfile = {
        ...profileData,
        social_links: socialData,
      };

      setProfile(fullProfile);

      if (fullProfile.student?.name && fullProfile.student.name.trim()) {
        setStudentName(fullProfile.student.name.trim());
      } else if (fullProfile.student?.username && fullProfile.student.username.trim()) {
        setStudentName(fullProfile.student.username.trim());
      } else {
        setStudentName("Student");
      }

      setImageError(false);
    } catch (err) {
      console.error("Profile load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const formatFileUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `http://localhost:8000${url}`;
  };

  if (loading) return <p className="loading-text">Loading profile...</p>;
  if (!profile || !profile.student) return <p className="error-text">Profile not found</p>;

  const student = profile.student;
  const displayName = studentName;
  const initials = getInitials(displayName);

  let photoUrl = formatFileUrl(profile.profile_image);

  const hasPhoto = !!(photoUrl && typeof photoUrl === 'string' && photoUrl.trim() !== '' && !imageError);

  // Open Remove Confirmation Modal
  const removeProfilePhoto = () => {
    if (!hasPhoto) return;
    setShowRemovePhotoModal(true);
  };

  // Confirm and Delete Photo
  const confirmRemoveProfilePhoto = async () => {
    setRemovingPhoto(true);
    const email = localStorage.getItem("studentEmail");
    if (!email) {
      alert("No student email found.");
      setRemovingPhoto(false);
      setShowRemovePhotoModal(false);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8000/api/students/profile/delete-photo/?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
          headers: {
            "X-CSRFToken": getCookie("csrftoken")
          },
          credentials: "include"
        }
      );

      if (!res.ok) {
        throw new Error("Remove failed");
      }

      await loadProfile();
      setShowRemovePhotoModal(false);
    } catch (err) {
      alert("Error removing photo: " + (err.message || "Unknown error"));
    } finally {
      setRemovingPhoto(false);
    }
  };

  // ──────────────────────────────────────────
  // Modal Handlers
  // ──────────────────────────────────────────
  const openModal = (type, data = {}) => {
    setModalType(type);
    setModalData(data);
  };

  const closeModal = () => {
    setModalType(null);
    setModalData({});
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModalData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setModalData((prev) => ({ ...prev, file: e.target.files?.[0] || null }));
  };

  // ──────────────────────────────────────────
  // Submit Handlers
  // ──────────────────────────────────────────
  const submitModal = async () => {
    setLoading(true);

    let url = "";
    let method = "POST";
    let body;
    let successMessage = "";

    switch (modalType) {
      case "addEdu":
      case "editEdu":
        if (!modalData.degree || !modalData.institution) {
          alert("Degree and Institution are required");
          setLoading(false);
          return;
        }
        body = new FormData();
        body.append("degree", modalData.degree);
        body.append("institution", modalData.institution);
        body.append("year_of_passing", modalData.year_of_passing);
        body.append("cgpa", modalData.cgpa);
        body.append("student", student.id);
        url =
          modalType === "editEdu"
            ? `http://localhost:8000/api/students/education/edit/${modalData.id}/`
            : "http://localhost:8000/api/students/education/add/";
        successMessage = modalType === "editEdu" ? "Education updated!" : "Education added!";
        break;

      case "addCert":
      case "editCert":
        if (!modalData.title || (!modalData.file && modalType === "addCert")) {
          alert("Title and file are required for new certificate");
          setLoading(false);
          return;
        }
        body = new FormData();
        body.append("title", modalData.title);
        body.append("issued_by", modalData.issued_by || "");
        body.append("year_obtained", modalData.year_obtained || "");
        if (modalData.file) body.append("certificate_file", modalData.file);
        body.append("student", student.id);
        url =
          modalType === "editCert"
            ? `http://localhost:8000/api/students/certificate/edit/${modalData.id}/`
            : "http://localhost:8000/api/students/certificate/add/";
        successMessage = modalType === "editCert" ? "Certificate updated!" : "Certificate added!";
        break;

      case "editAbout":
        body = new FormData();
        body.append("about", modalData.about?.trim() || "");
        url = `http://localhost:8000/api/students/profile/edit/${student.id}/`;
        successMessage = "About section updated!";
        break;

      case "replaceResume":
        if (!modalData.file) {
          alert("Please select a resume file");
          setLoading(false);
          return;
        }
        body = new FormData();
        body.append("resume_file", modalData.file);
        url = `http://localhost:8000/api/students/resume/edit/${student.id}/`;
        successMessage = "Resume replaced!";
        break;

      case "editSocial":
        url = "http://localhost:8000/api/students/save-social-links/";
        method = "POST";
        body = JSON.stringify({
          email: student.email,
          github: modalData.github?.trim() || "",
          linkedin: modalData.linkedin?.trim() || "",
          portfolio: modalData.portfolio?.trim() || "",
          twitter: modalData.twitter?.trim() || "",
        });
        successMessage = "Social links saved successfully!";
        break;

      default:
        setLoading(false);
        return;
    }

    try {
      const headers = {
        "X-CSRFToken": getCookie("csrftoken"),
      };

      if (modalType === "editSocial") {
        headers["Content-Type"] = "application/json";
      }

      const res = await fetch(url, {
        method,
        headers,
        body: modalType === "editSocial" ? body : body,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Save failed");
      }

      await loadProfile();
      closeModal();
    } catch (err) {
      alert("Error: " + (err.message || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  // ──────────────────────────────────────────
  // Delete Handlers
  // ──────────────────────────────────────────
  const deleteEducation = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/students/education/delete/${id}/`, {
        method: "DELETE",
        headers: { "X-CSRFToken": getCookie("csrftoken") },
      });
      if (!res.ok) throw new Error("Delete failed");
      loadProfile();
    } catch (err) {
      alert("Error deleting education");
    }
  };

  const deleteCertificate = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/students/certificate/delete/${id}/`, {
        method: "DELETE",
        headers: { "X-CSRFToken": getCookie("csrftoken") },
      });
      if (!res.ok) throw new Error("Delete failed");
      loadProfile();
    } catch (err) {
      alert("Error deleting certificate");
    }
  };

  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
      />

      <style>{`
         :root {
          --primary: #2563eb;
          --primary-hover: #1d4ed8;
          --edu-color: #059669; /* Emerald */
          --cert-color: #7c3aed; /* Violet */
          --amber-color: #d97706; /* Amber */
          --slate-50: #f8fafc;
          --slate-100: #f1f5f9;
          --slate-200: #e2e8f0;
          --slate-300: #cbd5e1;
          --slate-400: #94a3b8;
          --slate-500: #64748b;
          --slate-600: #475569;
          --slate-700: #334155;
          --slate-800: #1e293b;
          --slate-900: #0f172a;
          --white: #ffffff;
        }

        .profile-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.25rem 1.5rem;
          background: var(--slate-50);
          min-height: 100vh;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: var(--slate-900);
        }

        /* Professional Ocean Blue Header (No Gradients) */
        .header-banner {
          background-color: #075985; /* Deep Ocean Blue */
          border-radius: 20px;
          padding: 1.5rem 2.5rem;
          margin-bottom: 2.5rem;
          display: flex;
          align-items: center;
          gap: 2.5rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 30px -10px rgba(7, 89, 133, 0.3);
          color: white;
        }

        /* Modernized Professional Pattern (Subtle Micro-Plus) */
        .header-banner::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Cpath d='M9 0h2v20H9V0zm-9 9h20v2H0V9z'/%3E%3C/g%3E%3C/svg%3E");
          z-index: 1;
        }

        .avatar-section, .profile-main-info, .header-actions {
          position: relative;
          z-index: 2;
        }

        .avatar-circle {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          border: 6px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          background: rgba(255, 255, 255, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .avatar-circle img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-initials {
          font-size: 3.8rem;
          font-weight: 800;
          color: var(--slate-700);
          text-transform: uppercase;
        }

        .avatar-edit-overlay {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: white;
          color: var(--primary);
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 5;
        }

        .avatar-edit-overlay:hover {
          transform: scale(1.1) rotate(5deg);
        }

        .student-name {
          font-size: 2rem; /* Reduced size */
          font-weight: 700;
          color: white;
          margin: 0 0 0.5rem;
          letter-spacing: -0.015em;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .student-sub-info {
          display: flex;
          gap: 1.5rem;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem; /* Reduced size */
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .sub-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .sub-item i { color: var(--slate-400); } 

        .header-actions {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
          min-width: 200px;
          margin-left: auto; /* Push to right */
        }

        /* Header Specific Button Colors */
        .btn-header-resume { background: var(--edu-color); color: white; border: none; }
        .btn-header-resume:hover { background: #047857; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3); }
        
        .btn-header-view { background: var(--amber-color); color: white; border: none; }
        .btn-header-view:hover { background: #b45309; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3); }

        .btn-header-photo { background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(4px); }
        .btn-header-photo:hover { background: rgba(219, 68, 68, 0.2); border-color: #ef4444; color: #ef4444; }

        /* Main Grid */
        .profile-grid-main {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2.5rem;
        }

        .section-card {
          background: var(--white);
          border: 1px solid var(--slate-200);
          border-radius: 16px;
          padding: 2.25rem;
          margin-bottom: 2.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 0.875rem;
          border-bottom: 1.5px solid var(--slate-100);
        }

        .section-title-modern {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--slate-900);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.875rem;
        }

        /* Section Specific Themes (Colorful Borders) */
        .section-personal { border: 1.5px solid rgba(37, 99, 235, 0.2); }
        .section-personal .section-title-modern i { color: var(--primary); }
        
        .section-about { border: 1.5px solid rgba(217, 119, 6, 0.2); }
        .section-about .section-title-modern i { color: var(--amber-color); }

        .section-edu { border: 1.5px solid rgba(5, 150, 105, 0.2); }
        .section-edu .section-title-modern i { color: var(--edu-color); }

        .section-cert { border: 1.5px solid rgba(124, 58, 237, 0.2); }
        .section-cert .section-title-modern i { color: var(--cert-color); }

        .section-social { border: 1.5px solid rgba(55, 48, 163, 0.2); }
        .section-social .section-title-modern i { color: #3730a3; }

        .btn-modern-ghost:hover {
          background: var(--slate-100);
          color: var(--slate-900);
        }

        .icon-pencil-colored { color: var(--primary); font-size: 1.2rem; }
        .icon-pencil-amber { color: var(--amber-color); font-size: 1.2rem; }
        .icon-pencil-edu { color: var(--edu-color); font-size: 1.2rem; }
        .icon-pencil-cert { color: var(--cert-color); font-size: 1.2rem; }

        /* Field Display */
        .fields-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem 2rem;
        }

        .field-item label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--slate-500);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .field-item div {
          font-size: 1.05rem;
          font-weight: 500;
          color: var(--slate-900);
          padding: 0.9rem 1.1rem;
          background: var(--slate-50);
          border-radius: 10px;
          border: 1px solid var(--slate-200);
        }

        /* List Items */
        .list-entry {
          padding: 1.5rem;
          background: var(--slate-50);
          border: 1px solid var(--slate-200);
          border-radius: 14px;
          margin-bottom: 1.25rem;
          transition: all 0.25s;
        }

        .section-edu .list-entry:hover { border-color: var(--edu-color); box-shadow: 0 4px 12px rgba(5, 150, 105, 0.1); }
        .section-cert .list-entry:hover { border-color: var(--cert-color); box-shadow: 0 4px 12px rgba(124, 58, 237, 0.1); }

        .item-main-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--slate-900);
        }

        .badge-pill {
          display: inline-flex;
          align-items: center;
          padding: 0.4rem 0.9rem;
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 600;
          background: white;
          border: 1px solid var(--slate-200);
          color: var(--slate-700);
          gap: 0.5rem;
        }

        .section-edu .badge-pill-context { color: var(--edu-color); background: rgba(5, 150, 105, 0.05); border-color: rgba(5, 150, 105, 0.2); }
        .section-cert .badge-pill-context { color: var(--cert-color); background: rgba(124, 58, 237, 0.05); border-color: rgba(124, 58, 237, 0.2); }

        /* Buttons */
        .btn-modern {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          padding: 0.8rem 1.6rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-modern-primary { background: var(--primary); color: white; }
        .btn-modern-primary:hover { background: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

        .btn-edu { background: var(--edu-color); color: white; }
        .btn-edu:hover { background: #047857; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2); }

        .btn-cert { background: var(--cert-color); color: white; }
        .btn-cert:hover { background: #6d28d9; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2); }

        .btn-modern-outline { background: white; color: var(--slate-700); border: 1px solid var(--slate-200); }
        .btn-modern-outline:hover { background: var(--slate-100); border-color: var(--slate-300); }

        .btn-modern-white { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(4px); }
        .btn-modern-white:hover { background: rgba(255,255,255,0.18); border-color: rgba(255,255,255,0.4); }

        .social-pill {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border: 1px solid var(--slate-200);
          border-radius: 12px;
          color: var(--slate-700);
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s;
          background: var(--white);
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .social-pill:hover { 
          border-color: var(--primary); 
          color: var(--primary); 
          transform: translateX(5px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .social-stack {
          display: flex;
          flex-direction: column;
          gap: 1rem; /* Slightly larger gap */
        }

        /* Ghost Buttons (Borderless, colored icons) */
        .btn-modern-ghost {
          background: transparent;
          border: none !important;
          color: var(--slate-500);
          padding: 0.6rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-modern-ghost:hover {
          background: var(--slate-100);
          color: var(--slate-900);
        }

        .btn-modern-ghost-danger {
          background: transparent;
          border: none !important;
          color: #ef4444;
          padding: 0.6rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-modern-ghost-danger:hover {
          background: #fef2f2;
          transform: scale(1.1);
        }

        /* Modal Modernization */
        .modal-content {
          border: none;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .modal-header {
          background: var(--slate-50);
          border-bottom: 1px solid var(--slate-100);
          padding: 1.5rem 1.75rem;
        }

        .modal-title {
          font-weight: 700;
          color: var(--slate-900);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.2rem;
        }

        .modal-body {
          padding: 2rem 1.75rem;
        }

        .modal-footer {
          background: var(--slate-50);
          border-top: 1px solid var(--slate-100);
          padding: 1.25rem 1.75rem;
        }

        .modal-form-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--slate-500);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.6rem;
          display: block;
        }

        .form-control {
          border-radius: 10px;
          border: 1.5px solid var(--slate-200);
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          transition: all 0.2s;
          background: white;
        }

        .form-control:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
          background: white;
        }

        textarea.form-control {
          min-height: 120px;
          line-height: 1.6;
        }

        /* Mobile Adjustments */
        @media (max-width: 1024px) { .profile-grid-main { grid-template-columns: 1fr; } }
        @media (max-width: 768px) {
          .profile-container { padding: 1.5rem 1rem; }
          .header-banner { flex-direction: column; text-align: center; gap: 2rem; padding: 2.5rem 1.5rem; }
          .student-sub-info { justify-content: center; }
          .fields-container { grid-template-columns: 1fr; }
          .student-name { font-size: 1.75rem; }
          .header-actions { width: 100%; align-items: center; }
          .header-photo-wrapper { justify-content: center; }
        }

        @media (max-width: 640px) {
          .btn-label-responsive { display: none; }
          .btn-edu, .btn-cert {
            padding: 0.6rem;
            min-width: 42px;
            height: 42px;
            border-radius: 50%; /* Circular for mobile + icon */
            gap: 0;
            display: inline-flex;
            justify-content: center;
          }
        }
      `}</style>
      <div className="profile-container">
        {/* Header Section (Inspiration: Image 2) */}
        <div className="header-banner">
          <div className="avatar-section">
            <div className="avatar-circle">
              {hasPhoto ? (
                <img src={photoUrl} alt={displayName} onError={() => setImageError(true)} />
              ) : (
                <div className="avatar-initials">{initials}</div>
              )}
              {loading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  <div className="spinner-border text-primary" />
                </div>
              )}
            </div>
            <div className="avatar-edit-overlay" onClick={() => document.getElementById('student-photo-input').click()}>
              <i className="bi bi-camera-fill"></i>
            </div>
            <input
              id="student-photo-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={async e => {
                const file = e.target.files?.[0];
                if (file) {
                  const email = localStorage.getItem("studentEmail");
                  if (!email) return alert("No email found");
                  const formData = new FormData();
                  formData.append("profile_image", file);
                  formData.append("email", email);
                  try {
                    const res = await fetch(`http://localhost:8000/api/students/profile/edit/${student.id}/`, {
                      method: "POST",
                      headers: { "X-CSRFToken": getCookie("csrftoken") },
                      body: formData,
                      credentials: "include"
                    });
                    if (!res.ok) throw new Error("Upload failed");
                    await loadProfile();
                    setImageError(false);
                  } catch (err) { alert(err.message); }
                }
              }}
            />
          </div>

          <div className="profile-main-info">
            <h1 className="student-name">{displayName}</h1>
            <div className="student-sub-info">
              <div className="sub-item">
                <i className="bi bi-envelope"></i>
                {student.email}
              </div>
              <div className="sub-item">
                <i className="bi bi-person-badge"></i>
                {student.university_reg_no}
              </div>
              <div className="sub-item">
                <i className="bi bi-building"></i>
                {student.department}
              </div>
            </div>
            <div className="header-photo-wrapper" style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-modern btn-header-photo" onClick={removeProfilePhoto} disabled={!hasPhoto}>
                <i className="bi bi-trash"></i> Remove Photo
              </button>
            </div>
          </div>

          <div className="header-actions">
            <button className="btn-modern btn-header-resume" onClick={() => openModal("replaceResume")}>
              <i className="bi bi-file-earmark-text"></i> Replace Resume
            </button>
            {profile.resume && (
              <button className="btn-modern btn-header-view" onClick={() => window.open(formatFileUrl(profile.resume), '_blank')}>
                <i className="bi bi-eye"></i> View Resume
              </button>
            )}
          </div>
        </div>

        {/* Main Content Grid (Inspiration: Image 3) */}
        <div className="profile-grid-main">
          <div className="left-col">
            {/* Personal Information */}
            <div className="section-card section-personal">
              <div className="section-header">
                <h3 className="section-title-modern">
                  <i className="bi bi-person-lines-fill"></i> Personal Information
                </h3>
              </div>
              <div className="fields-container">
                <div className="field-item">
                  <label>Full Name</label>
                  <div>{displayName}</div>
                </div>
                <div className="field-item">
                  <label>University Reg No</label>
                  <div>{student.university_reg_no || "—"}</div>
                </div>
                <div className="field-item">
                  <label>Phone Number</label>
                  <div>{student.phone || "Not provided"}</div>
                </div>
                <div className="field-item">
                  <label>Department</label>
                  <div>{student.department || "—"}</div>
                </div>
                <div className="field-item">
                  <label>Current Degree</label>
                  <div style={{ color: '#000000', fontWeight: 500 }}>{student.programme || "—"}</div>
                </div>
                <div className="field-item">
                  <label>Passed Out Year</label>
                  <div>{student.passed_out_year || "—"}</div>
                </div>
              </div>
            </div>

            {/* About Me */}
            <div className="section-card section-about">
              <div className="section-header">
                <h3 className="section-title-modern">
                  <i className="bi bi-chat-left-text-fill"></i> About Me
                </h3>
                <button className="btn-modern-ghost" onClick={() => openModal("editAbout", { about: profile.about || "" })}>
                  <i className="bi bi-pencil-square icon-pencil-amber"></i>
                </button>
              </div>
              <p style={{ color: "var(--slate-600)", lineHeight: 1.8, margin: 0, fontSize: '1rem' }}>
                {profile.about || "No about information added yet."}
              </p>
            </div>

            {/* Education */}
            <div className="section-card section-edu">
              <div className="section-header">
                <h3 className="section-title-modern">
                  <i className="bi bi-mortarboard-fill"></i> Education
                </h3>
                <button className="btn-modern btn-edu" onClick={() => openModal("addEdu")}>
                  <i className="bi bi-plus-lg"></i> <span className="btn-label-responsive">Add</span>
                </button>
              </div>
              {profile.education?.length > 0 ? (
                profile.education.map((edu) => (
                  <div key={edu.id} className="list-entry">
                    <div className="item-row-header">
                      <div>
                        <div className="item-main-title">{edu.degree}</div>
                        <div className="item-sub-title">{edu.institution}</div>
                      </div>
                      <div className="badge-pill badge-pill-context">
                        <i className="bi bi-calendar3"></i> {edu.year_of_passing}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
                      <span className="badge-pill" style={{ background: 'white', fontWeight: 700 }}>
                        Grade: <span style={{ color: 'var(--edu-color)', marginLeft: '4px' }}>{edu.cgpa || "—"}</span>
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-modern-ghost" onClick={() => openModal("editEdu", edu)}>
                          <i className="bi bi-pencil icon-pencil-edu"></i>
                        </button>
                        <button className="btn-modern-ghost-danger" onClick={() => deleteEducation(edu.id)} title="Delete Education">
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted italic">No education entries added yet.</p>
              )}
            </div>

            {/* Certificates */}
            <div className="section-card section-cert">
              <div className="section-header">
                <h3 className="section-title-modern">
                  <i className="bi bi-award-fill"></i> Certificates
                </h3>
                <button className="btn-modern btn-cert" onClick={() => openModal("addCert")}>
                  <i className="bi bi-plus-lg"></i> <span className="btn-label-responsive">Add</span>
                </button>
              </div>
              {profile.certificates?.length > 0 ? (
                profile.certificates.map((cert) => (
                  <div key={cert.id} className="list-entry">
                    <div className="item-row-header">
                      <div>
                        <div className="item-main-title">{cert.title}</div>
                        <div className="item-sub-title">Issued by: {cert.issued_by}</div>
                      </div>
                      <div className="badge-pill badge-pill-context">
                        {cert.year_obtained}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
                      {cert.certificate_file ? (
                        <a href={formatFileUrl(cert.certificate_file)} target="_blank" rel="noreferrer" className="btn-modern btn-modern-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                          <i className="bi bi-file-earmark-image"></i> View
                        </a>
                      ) : <div />}
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-modern-ghost" onClick={() => openModal("editCert", cert)}>
                          <i className="bi bi-pencil icon-pencil-cert"></i>
                        </button>
                        <button className="btn-modern-ghost-danger" onClick={() => deleteCertificate(cert.id)} title="Delete Certificate">
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted italic">No certificates added yet.</p>
              )}
            </div>
          </div>

          <div className="right-col">
            {/* Social Links */}
            <div className="section-card section-social">
              <div className="section-header">
                <h3 className="section-title-modern">
                  <i className="bi bi-share-fill"></i> Social Links
                </h3>
                <button className="btn-modern-ghost" onClick={() => openModal("editSocial", profile.social_links || {})}>
                  <i className="bi bi-pencil icon-pencil-colored"></i>
                </button>
              </div>
              <div className="social-stack">
                {profile.social_links?.github && (
                  <a href={profile.social_links.github} target="_blank" rel="noreferrer" className="social-pill github">
                    <i className="bi bi-github"></i> GitHub
                  </a>
                )}
                {profile.social_links?.linkedin && (
                  <a href={profile.social_links.linkedin} target="_blank" rel="noreferrer" className="social-pill linkedin">
                    <i className="bi bi-linkedin"></i> LinkedIn
                  </a>
                )}
                {profile.social_links?.portfolio && (
                  <a href={profile.social_links.portfolio} target="_blank" rel="noreferrer" className="social-pill">
                    <i className="bi bi-globe"></i> Portfolio
                  </a>
                )}
                {profile.social_links?.twitter && (
                  <a href={profile.social_links.twitter} target="_blank" rel="noreferrer" className="social-pill">
                    <i className="bi bi-twitter-x"></i> Twitter / X
                  </a>
                )}
                {!Object.values(profile.social_links || {}).some(v => v) && (
                  <p className="text-muted italic small text-center">No social links added.</p>
                )}
              </div>
            </div>

            {/* Resume Summary */}
            <div className="section-card">
              <div className="section-header">
                <h3 className="section-title-modern">
                  <i className="bi bi-file-earmark-pdf-fill"></i> Resume
                </h3>
              </div>
              {profile.resume ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '1rem' }}>
                    <i className="bi bi-file-earmark-pdf"></i>
                  </div>
                  <p style={{ fontWeight: 600, color: 'var(--slate-700)' }}>Resume Attached</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
                    <a href={formatFileUrl(profile.resume)} download className="btn-modern btn-modern-primary" style={{ padding: '0.5rem' }}>
                      Download
                    </a>
                    <button className="btn-modern btn-modern-outline" style={{ padding: '0.5rem' }} onClick={() => openModal("replaceResume")}>
                      Update
                    </button>
                  </div>
                </div>
              ) : (
                <button className="btn-modern btn-modern-primary w-100" onClick={() => openModal("replaceResume")}>
                  Upload Resume
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* ... inside your return ... after the main content ... */}

      {/* Remove Profile Photo Confirmation Modal */}
      {showRemovePhotoModal && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '420px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #1e293b, #334155)',
              color: 'white',
              padding: '1.4rem 1.8rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h5 style={{ margin: 0, fontWeight: 700 }}>
                <i className="bi bi-trash me-2"></i> Remove Profile Photo
              </h5>
              <button
                onClick={() => setShowRemovePhotoModal(false)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.8rem', cursor: 'pointer', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '2.5rem 1.8rem', textAlign: 'center' }}>
              <i className="bi bi-exclamation-circle" style={{ color: '#ef4444', fontSize: '3.5rem', marginBottom: '1.25rem', display: 'block' }}></i>
              <div style={{ fontWeight: 600, fontSize: '1.15rem', color: '#1e293b', marginBottom: '0.6rem' }}>
                Are you sure you want to remove your profile photo?
              </div>
              <div style={{ color: '#64748b', fontSize: '0.98rem' }}>
                This action cannot be undone.
              </div>
            </div>

            <div style={{
              padding: '1.25rem 1.8rem',
              background: '#fafbfc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '0.875rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowRemovePhotoModal(false)}
                disabled={removingPhoto}
                className="btn-modern btn-modern-outline"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveProfilePhoto}
                disabled={removingPhoto}
                className="btn-modern btn-modern-primary"
                style={{ background: '#ef4444', border: 'none', padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
              >
                {removingPhoto ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <i className="bi bi-trash"></i>
                )}
                {removingPhoto ? 'Removing...' : 'Remove Photo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Modal */}
      {modalType && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.55)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-pencil-square me-2"></i>
                  {modalType.includes("add") ? "Add " : "Edit "}
                  {modalType.includes("Edu") ? "Education" :
                    modalType.includes("Cert") ? "Certificate" :
                      modalType.includes("About") ? "About" :
                        modalType.includes("Social") ? "Social Links" : "Resume"}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>

              <div className="modal-body">
                {["addEdu", "editEdu"].includes(modalType) && (
                  <>
                    <div className="mb-3">
                      <label className="modal-form-label">Degree *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="degree"
                        value={modalData.degree || ""}
                        onChange={handleModalChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="modal-form-label">Institution *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="institution"
                        value={modalData.institution || ""}
                        onChange={handleModalChange}
                      />
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="modal-form-label">Year of Passing</label>
                        <input
                          type="text"
                          className="form-control"
                          name="year_of_passing"
                          value={modalData.year_of_passing || ""}
                          onChange={handleModalChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="modal-form-label">CGPA</label>
                        <input
                          type="text"
                          className="form-control"
                          name="cgpa"
                          value={modalData.cgpa || ""}
                          onChange={handleModalChange}
                        />
                      </div>
                    </div>
                  </>
                )}

                {["addCert", "editCert"].includes(modalType) && (
                  <>
                    <div className="mb-3">
                      <label className="modal-form-label">Certificate Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={modalData.title || ""}
                        onChange={handleModalChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="modal-form-label">Issued By *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="issued_by"
                        value={modalData.issued_by || ""}
                        onChange={handleModalChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="modal-form-label">Year Obtained *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="year_obtained"
                        value={modalData.year_obtained || ""}
                        onChange={handleModalChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="modal-form-label">
                        {modalType === "addCert" ? "Upload Certificate *" : "Replace Certificate (optional)"}
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                      />
                    </div>
                  </>
                )}

                {modalType === "editAbout" && (
                  <div className="mb-3">
                    <label className="modal-form-label">About Yourself</label>
                    <textarea
                      className="form-control"
                      rows="6"
                      name="about"
                      value={modalData.about || ""}
                      onChange={handleModalChange}
                      placeholder="Tell something about yourself..."
                    />
                  </div>
                )}

                {modalType === "replaceResume" && (
                  <div className="mb-3">
                    <label className="modal-form-label">Upload New Resume *</label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </div>
                )}

                {modalType === "editSocial" && (
                  <>
                    <div className="mb-3">
                      <label className="modal-form-label">GitHub URL</label>
                      <input
                        type="url"
                        className="form-control"
                        name="github"
                        value={modalData.github || ""}
                        onChange={handleModalChange}
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="modal-form-label">LinkedIn URL</label>
                      <input
                        type="url"
                        className="form-control"
                        name="linkedin"
                        value={modalData.linkedin || ""}
                        onChange={handleModalChange}
                        placeholder="https://linkedin.com/in/yourname"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="modal-form-label">Portfolio URL</label>
                      <input
                        type="url"
                        className="form-control"
                        name="portfolio"
                        value={modalData.portfolio || ""}
                        onChange={handleModalChange}
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="modal-form-label">Twitter / X URL</label>
                      <input
                        type="url"
                        className="form-control"
                        name="twitter"
                        value={modalData.twitter || ""}
                        onChange={handleModalChange}
                        placeholder="https://x.com/yourhandle"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-modern btn-modern-outline"
                  onClick={closeModal}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-modern btn-modern-primary"
                  onClick={submitModal}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;









