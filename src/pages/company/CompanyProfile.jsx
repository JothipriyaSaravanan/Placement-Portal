



// CompanyProfile.jsx
import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:8000";

const getCsrfToken = () => {
  const name = "csrftoken";
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name + "=")) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
};

export default function CompanyProfile() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const companyEmail = localStorage.getItem("companyEmail");

  // Auto-hide save message
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(""), 2200);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  // Fetch profile
  useEffect(() => {
    if (!companyEmail) {
      setError("Company email not found. Please log in again.");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/companies/profile/${encodeURIComponent(companyEmail)}/`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `Failed to load profile (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        setCompany(data);
        setFormData(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [companyEmail]);

  const getInitials = (name) => {
    if (!name?.trim()) return "?";
    return name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  };

  const formatFileUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_BASE}${url}`;
  };


  // Remove Logo Modal State
  const [showRemoveLogoModal, setShowRemoveLogoModal] = useState(false);
  const [removingLogo, setRemovingLogo] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Remove Logo Handler
  const handleRemoveLogo = () => {
    setShowRemoveLogoModal(true);
  };

  const confirmRemoveLogo = async () => {
    setRemovingLogo(true);
    const csrfToken = getCsrfToken();
    try {
      const res = await fetch(
        `${API_BASE}/companies/profile/remove-logo/${encodeURIComponent(companyEmail)}/`,
        {
          method: "DELETE",
          headers: {
            ...(csrfToken && { "X-CSRFToken": csrfToken }),
          },
          credentials: "same-origin",
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to remove logo");
      setCompany((prev) => ({ ...prev, logo: null }));
      setFormData((prev) => ({ ...prev, logo: null }));
      setShowRemoveLogoModal(false);
      setSaveMessage("Logo removed successfully!");
    } catch (err) {
      setSaveMessage(`Error: ${err.message}`);
      setShowRemoveLogoModal(false);
    } finally {
      setRemovingLogo(false);
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setSaveMessage("");
    const csrfToken = getCsrfToken();

    try {
      let body;
      let headers;
      if (formData.logo && formData.logo instanceof File) {
        body = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (key === "logo" && value instanceof File) {
            body.append("logo", value);
          } else {
            body.append(key, value);
          }
        });
        headers = { ...(csrfToken && { "X-CSRFToken": csrfToken }) };
      } else {
        body = JSON.stringify(formData);
        headers = {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        };
      }

      const res = await fetch(
        `${API_BASE}/companies/profile/update/${encodeURIComponent(companyEmail)}/`,
        {
          method: "POST",
          headers,
          credentials: "same-origin",
          body,
        }
      );

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || `Update failed (${res.status})`);
      }

      setCompany(result.company || formData);
      setShowEditModal(false);
      setSaveMessage("Profile updated successfully!");
    } catch (err) {
      setSaveMessage(`Error: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const openEditModal = () => {
    setFormData({ ...company });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSaveMessage("");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status" style={{ width: "2rem", height: "2rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger shadow-sm border-0 text-center" role="alert" style={{ borderRadius: '12px' }}>
          {error}
        </div>
      </div>
    );
  }

  if (!company) return null;

  const initials = getInitials(company.name);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        :root {
          --brand-primary: #1e3a8a; /* Deep Navy Blue */
          --brand-accent: #3b82f6; /* Professional Blue */
          --text-deep: #0f172a;
          --text-muted: #64748b;
          --bg-surface: #ffffff;
          --bg-soft: #f8fafc;
          --border-light: #f1f5f9;
          --border-main: #e2e8f0;
          --font-main: 'Outfit', -apple-system, blinkmacsystemfont, sans-serif;
        }

        .profile-wrapper {
          min-height: 100vh;
          background: var(--bg-surface);
          font-family: var(--font-main);
          color: var(--text-deep);
          padding-top: 2rem;
          padding-bottom: 4rem;
        }

        .container-premium {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        /* Hero Header */
        .profile-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 2.5rem 0;
          border-bottom: 1px solid var(--border-light);
          margin-bottom: 3rem;
        }

        .hero-info {
          display: flex;
          align-items: center;
          gap: 2.5rem;
        }

        .hero-logo-container {
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--brand-primary);
        }

        .hero-logo-container img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .hero-text h1 {
          font-size: 1.75rem;
          font-weight: 600; /* Reduced from 700 */
          margin-bottom: 0.5rem;
          color: var(--text-deep);
          letter-spacing: -0.02em;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--brand-accent);
          background: #eff6ff;
          padding: 4px 12px;
          border-radius: 100px;
        }

        .btn-premium-edit {
          padding: 0.6rem 1.25rem;
          border-radius: 10px;
          background: var(--brand-primary);
          color: white;
          border: none;
          font-weight: 500; /* Reduced from 600 */
          font-size: 0.9rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-premium-edit:hover {
          background: #1e40af;
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(30, 58, 138, 0.15);
        }

        /* Stats & Details */
        .specs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-bottom: 4rem;
        }

        .spec-item {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .spec-label {
          font-size: 0.75rem;
          font-weight: 500; /* Reduced from 600 */
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .spec-value {
          font-size: 1rem;
          font-weight: 500;
          color: var(--text-deep);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .spec-icon {
          color: var(--brand-accent);
          font-size: 1.1rem;
        }

        /* Content Blocks */
        .info-section {
          margin-bottom: 4rem;
        }

        .section-header {
          font-size: 0.8rem;
          font-weight: 600; /* Reduced from 700 */
          text-transform: uppercase;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 0.75rem;
          margin-bottom: 1.5rem;
          letter-spacing: 0.1em;
        }

        .about-content {
          font-size: 1.05rem;
          line-height: 1.8;
          color: #334155;
          max-width: 800px;
          white-space: pre-wrap;
        }

        /* Presence Links */
        .presence-links {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .link-pill {
          padding: 0.6rem 1.25rem;
          border-radius: 12px;
          border: 1px solid var(--border-main);
          color: var(--text-deep);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s ease;
          background: var(--bg-surface);
        }

        .link-pill:hover {
          border-color: var(--brand-primary);
          background: var(--bg-soft);
          color: var(--brand-primary);
          transform: translateY(-2px);
        }

        /* Modal Overrides */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .modal-glass {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
        }

        .premium-modal {
          background: #ffffff !important;
          border-radius: 24px;
          border: 1px solid var(--border-main);
          box-shadow: 0 40px 60px -15px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          color: var(--text-deep);
        }

        .modal-header-refined {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--border-light);
          background: #ffffff;
        }

        .modal-body-refined {
          padding: 2.5rem 2rem;
          background: #ffffff;
          overflow-y: auto;
          max-height: calc(90vh - 140px); /* Ensure body scrolls if content is large */
        }

        .modal-footer-refined {
          padding: 1.25rem 2rem;
          background: var(--bg-soft);
          border-top: 1px solid var(--border-light);
        }

        .form-group-refined {
          margin-bottom: 1.5rem;
        }

        .label-refined {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--text-deep);
        }

        .input-refined {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: 1px solid #d1d5db; /* Stronger border for visibility */
          font-size: 0.95rem;
          transition: all 0.2s ease;
          background: #ffffff; /* Explicit white background */
          color: #1e293b;
        }

        .input-refined:focus {
          border-color: var(--brand-accent);
          outline: none;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
          background: #ffffff;
        }

        /* Toast */
        .toast-premium {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: var(--text-deep);
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          font-weight: 500;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
          z-index: 9999;
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 768px) {
          .specs-grid { grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
          .profile-hero { flex-direction: column; text-align: center; gap: 1.5rem; }
          .hero-info { flex-direction: column; gap: 1rem; }
          .hero-logo-container { width: 100px; height: 100px; }
        }

        @media (max-width: 480px) {
          .specs-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
      />

      <div className="profile-wrapper">
        <div className="container-premium">
          
          {/* HERO SECTION - REPLACES THE HEADER CARD */}
          <header className="profile-hero">
            <div className="hero-info">
              <div className="hero-logo-container">
                {company.logo ? (
                  <img
                    src={formatFileUrl(company.logo)}
                    alt="Company Logo"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="hero-text">
                <h1>{company.name || "Company Name"}</h1>
                <div className="hero-badge">
                  <i className="bi bi-patch-check-fill"></i>
                  {company.industry || "Industry not specified"}
                </div>
              </div>
            </div>
            <div className="hero-actions">
              <button className="btn-premium-edit" onClick={openEditModal}>
                <i className="bi bi-pencil-square"></i>
                Update Profile
              </button>
            </div>
          </header>

          {/* SPECS GRID - REPLACES THE SEPARATE DETAIL CARDS */}
          <section className="specs-grid">
            <div className="spec-item">
              <span className="spec-label">Office Email</span>
              <div className="spec-value">
                <i className="bi bi-envelope spec-icon"></i>
                {company.email}
              </div>
            </div>
            <div className="spec-item">
              <span className="spec-label">Direct Contact</span>
              <div className="spec-value">
                <i className="bi bi-telephone spec-icon"></i>
                {company.contact || "N/A"}
              </div>
            </div>
            <div className="spec-item">
              <span className="spec-label">Headquarters</span>
              <div className="spec-value">
                <i className="bi bi-geo-alt spec-icon"></i>
                {company.location || "N/A"}
              </div>
            </div>
            <div className="spec-item">
              <span className="spec-label">Organization</span>
              <div className="spec-value">
                <i className="bi bi-building spec-icon"></i>
                {company.company_type || "N/A"}
              </div>
            </div>
            <div className="spec-item">
              <span className="spec-label">Team Size</span>
              <div className="spec-value">
                <i className="bi bi-people spec-icon"></i>
                {company.employee_count || "N/A"}
              </div>
            </div>
            <div className="spec-item">
              <span className="spec-label">Est. Year</span>
              <div className="spec-value">
                <i className="bi bi-calendar-event spec-icon"></i>
                {company.founded_year || "N/A"}
              </div>
            </div>
          </section>

          {/* DESCRIPTION SECTION */}
          <section className="info-section">
            <h2 className="section-header">Company Overview</h2>
            <p className="about-content">
              {company.description || "Establish your company identity by adding a professional description."}
            </p>
          </section>

          {/* PRESENCE SECTION */}
          <section className="info-section">
            <h2 className="section-header">Digital Presence</h2>
            <div className="presence-links">
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="link-pill">
                  <i className="bi bi-globe text-primary"></i>
                  Official Website
                </a>
              )}
              {company.linkedin && (
                <a href={company.linkedin} target="_blank" rel="noopener noreferrer" className="link-pill">
                  <i className="bi bi-linkedin" style={{ color: '#0077b5'}}></i>
                  LinkedIn Profile
                </a>
              )}
              {company.twitter && (
                <a href={company.twitter} target="_blank" rel="noopener noreferrer" className="link-pill">
                  <i className="bi bi-twitter-x"></i>
                  Twitter / X
                </a>
              )}
              {company.facebook && (
                <a href={company.facebook} target="_blank" rel="noopener noreferrer" className="link-pill">
                  <i className="bi bi-facebook" style={{ color: '#1877f2'}}></i>
                  Facebook
                </a>
              )}
              {company.instagram && (
                <a href={company.instagram} target="_blank" rel="noopener noreferrer" className="link-pill">
                  <i className="bi bi-instagram" style={{ color: '#e4405f'}}></i>
                  Instagram
                </a>
              )}
              {!company.website && !company.linkedin && !company.twitter && !company.facebook && !company.instagram && (
                <span className="text-muted" style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>No digital links configured.</span>
              )}
            </div>
          </section>

          {/* Success/Error Message */}
          {saveMessage && (
            <div className="toast-premium">
              <i className={`bi bi-${saveMessage.includes("Error") ? "exclamation-triangle" : "check-circle-fill"} ${saveMessage.includes("Error") ? "text-danger" : "text-success"}`}></i>
              {saveMessage}
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Modal ──────────────────────────────────────────────── */}
      {showEditModal && (
        <div className="modal-overlay modal-glass" onClick={closeEditModal}>
          <div className="modal-content premium-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-refined">
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="m-0" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Update Profile Details</h2>
                <button className="btn-close" onClick={closeEditModal} style={{ opacity: 0.5 }}></button>
              </div>
            </div>

            <div className="modal-body-refined">
              <div className="row g-4">
                <div className="col-12">
                   <div className="d-flex align-items-center gap-4 p-3" style={{ background: 'var(--bg-soft)', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                      <div style={{ width: 80, height: 80, borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-main)', background: 'white' }}>
                          <img
                            src={formData.logo instanceof File ? URL.createObjectURL(formData.logo) : formatFileUrl(formData.logo) || "/placeholder-logo.png"}
                            alt="Logo Preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                      </div>
                      <div className="flex-grow-1">
                          <label className="label-refined">Enterprise Logo</label>
                          <input type="file" className="input-refined" name="logo" accept="image/*" onChange={handleInputChange} style={{ padding: '0.5rem' }} />
                          {formData.logo && (
                            <button type="button" className="btn btn-link text-danger btn-sm p-0 m-0 mt-2 text-decoration-none" onClick={handleRemoveLogo}>
                               <i className="bi bi-trash3 me-1"></i> Remove Logo
                            </button>
                          )}
                      </div>
                   </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-group-refined">
                    <label className="label-refined">Company Name</label>
                    <input type="text" className="input-refined" name="name" value={formData.name || ""} onChange={handleInputChange} placeholder="e.g. Acme Corp" />
                  </div>
                </div>
                <div className="col-md-6">
                   <div className="form-group-refined">
                    <label className="label-refined">Primary Industry</label>
                    <input type="text" className="input-refined" name="industry" value={formData.industry || ""} onChange={handleInputChange} placeholder="e.g. Technology" />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="form-group-refined">
                    <label className="label-refined">Corporate Website</label>
                    <input type="url" className="input-refined" name="website" value={formData.website || ""} onChange={handleInputChange} placeholder="https://www.example.com" />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group-refined">
                    <label className="label-refined">Contact Number</label>
                    <input type="text" className="input-refined" name="contact" value={formData.contact || ""} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group-refined">
                    <label className="label-refined">Global Headquarters</label>
                    <input type="text" className="input-refined" name="location" value={formData.location || ""} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group-refined">
                    <label className="label-refined">State/Province</label>
                    <input type="text" className="input-refined" name="state" value={formData.state || ""} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group-refined">
                    <label className="label-refined">Country</label>
                    <input type="text" className="input-refined" name="country" value={formData.country || ""} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group-refined">
                    <label className="label-refined">Year Founded</label>
                    <input type="number" className="input-refined" name="founded_year" value={formData.founded_year || ""} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group-refined">
                    <label className="label-refined">Entity Type</label>
                    <input type="text" className="input-refined" name="company_type" value={formData.company_type || ""} onChange={handleInputChange} placeholder="e.g. Private Limited" />
                  </div>
                </div>
                <div className="col-md-6">
                   <div className="form-group-refined">
                    <label className="label-refined">Headcount Range</label>
                    <input type="text" className="input-refined" name="employee_count" value={formData.employee_count || ""} onChange={handleInputChange} placeholder="e.g. 500-1000" />
                  </div>
                </div>
                <div className="col-12">
                  <div className="form-group-refined">
                    <label className="label-refined">LinkedIn Profile</label>
                    <input type="url" className="input-refined" name="linkedin" value={formData.linkedin || ""} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="col-12">
                  <div className="form-group-refined">
                    <label className="label-refined">Professional Summary</label>
                    <textarea className="input-refined" rows="4" name="description" value={formData.description || ""} onChange={handleInputChange}></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer-refined">
              <div className="d-flex justify-content-end gap-3">
                <button type="button" className="btn btn-link text-muted text-decoration-none fw-semibold" onClick={closeEditModal}>Discard</button>
                <button type="button" className="btn-premium-edit" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} onClick={handleSave} disabled={saveLoading}>
                  {saveLoading ? "Syncing..." : "Publish Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Logo Confirmation Modal */}
      {showRemoveLogoModal && (
        <div className="modal-overlay modal-glass" style={{ zIndex: 10000 }}>
          <div className="modal-content premium-modal" style={{ maxWidth: 400 }}>
            <div className="modal-body-refined text-center p-5">
              <div className="mx-auto mb-4 d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px', background: '#fef2f2', borderRadius: '50%' }}>
                 <i className="bi bi-trash3 text-danger" style={{ fontSize: '1.5rem'}}></i>
              </div>
              <h3 className="mb-2" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Remove Asset?</h3>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>This will permanently delete the current logo from your profile visibility.</p>
              <div className="d-flex flex-column gap-2 mt-4">
                <button className="btn btn-danger py-2 fw-semibold" onClick={confirmRemoveLogo} disabled={removingLogo} style={{ borderRadius: '10px' }}>
                  {removingLogo ? "Deleting..." : "Confirm Removal"}
                </button>
                <button className="btn btn-link text-muted text-decoration-none" onClick={() => setShowRemoveLogoModal(false)}>Keep it</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}