


// src/pages/admin/Announcements.jsx
import { useRef, useState, useEffect, useMemo } from "react";
import axios from "axios";

// Custom SVG Icons for a premium hand-crafted look
const IconSearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);
const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);
const IconStar = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={props.fill || "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);
const IconCopy = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);
const IconBell = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
);

export default function Announcements() {
  const formRef = useRef(null);
  const titleInputRef = useRef(null);
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [important, setImportant] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  
  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetToDelete, setTargetToDelete] = useState(null);
  
  // Extra Features State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // 'all' or 'important'
  const [copiedId, setCopiedId] = useState(null);


const API = "http://localhost:8000/admin-panel/filters/";


const [departments, setDepartments] = useState([]);
const [programmes, setProgrammes] = useState([]);
const [batches, setBatches] = useState([]);
const [targetType, setTargetType] = useState("student");
const [selectedDept, setSelectedDept] = useState("");
const [selectedProg, setSelectedProg] = useState("");
const [selectedBatch, setSelectedBatch] = useState("");


useEffect(() => {
  axios.get(API)
    .then(res => setDepartments(res.data.data))
    .catch(err => console.error(err));
}, []);

const handleDeptChange = (dept) => {
  setSelectedDept(dept);
  setSelectedProg("");
  setSelectedBatch("");

  axios.get(`${API}?department=${dept}`)
    .then(res => setProgrammes(res.data.data))
    .catch(err => console.error(err));
};

const handleProgChange = (prog) => {
  setSelectedProg(prog);
  setSelectedBatch("");

  axios.get(`${API}?department=${selectedDept}&programme=${prog}`)
    .then(res => setBatches(res.data.data))
    .catch(err => console.error(err));
};

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/admin-panel/announcements/");
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError("Failed to load announcements");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError("Title and message are required");
      return;
    }
    
    if (!selectedDept) {
      setError("Please select a department");
      return;
    }
    
    if (!selectedProg) {
      setError("Please select a programme");
      return;
    }
    
    if (!selectedBatch) {
      setError("Please select a batch/year");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editId) {
        await axios.put(`http://127.0.0.1:8000/admin-panel/announcements/${editId}/`, {
          title,
          message,
          important,
          department: selectedDept,
programme: selectedProg,
batch: selectedBatch,
target_type: targetType
        });
        setEditId(null);
      } else {
        await axios.post("http://127.0.0.1:8000/admin-panel/announcements/create/", {
            title,
            message,
            important,
           department: selectedDept,
programme: selectedProg,
batch: selectedBatch,
target_type: targetType
        });
      }

      setTitle("");
      setMessage("");
      setImportant(false);
      setSelectedDept("");
      setSelectedProg("");
      setSelectedBatch("");
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to save announcement");
    } finally {
      setLoading(false);
    }
  };

 const handleEdit = (ann) => {
  setTitle(ann.title);
  setMessage(ann.message);
  setImportant(ann.important);

  // ✅ Fixed: Use correct state setters
  setSelectedDept(ann.department || "");
  setSelectedProg(ann.programme || "");
  setSelectedBatch(ann.batch || "");

  setEditId(ann.id);

  formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  setTimeout(() => {
    titleInputRef.current?.focus();
    titleInputRef.current?.select();
  }, 250);
};

  const openDeleteModal = (ann) => {
    setTargetToDelete(ann);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setTargetToDelete(null);
    setShowDeleteModal(false);
  };

  const confirmDelete = async () => {
    if (!targetToDelete) return;

    setLoading(true);
    try {
      await axios.delete(`http://127.0.0.1:8000/admin-panel/announcements/${targetToDelete.id}/delete/`);
      fetchAnnouncements();
      closeDeleteModal();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to delete announcement");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (ann) => {
    const text = `${ann.title}\n\n${ann.message}`;
    navigator.clipboard.writeText(text);
    setCopiedId(ann.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Memoized Search/Filter Logic
  const processedAnnouncements = useMemo(() => {
    return announcements
      .filter(ann => {
        const matchesSearch = ann.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             ann.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterMode === "all" || (filterMode === "important" && ann.important);
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => (b.important ? 1 : 0) - (a.important ? 1 : 0)); 
  }, [announcements, searchTerm, filterMode]);

  // Pagination Logic
  const totalPages = Math.ceil(processedAnnouncements.length / entriesPerPage);
  const paginatedAnnouncements = processedAnnouncements.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  useEffect(() => {
    setCurrentPage(1); // Reset page on search/filter
  }, [searchTerm, filterMode, entriesPerPage]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');

        /* Color Tokens From User Request - Neutralized Shadows */
        :root {
          --deep-brown: #4A171E;
          --mustard-tan: #E2B144;
          --soft-orange: #F4A950;
          --daffodil-yellow: #FFDE4D;
          --tangerine: #FF8A3D;
          --mint-green: #ADEBB3;
          --vibrant-coral: #FF7F50;
          --dark-mint: #0D3311;
          --navy-blue: #000080;
          --pure-white: #FFFFFF;
          --action-red: #E63946;
          --neutral-shadow: #e5e7eb; /* NEW: Neutral shadow color */
          --warm-bg: #f9fafb; /* Lighter, less yellow background */
        }

        .premium-announcements-root {
          font-family: 'Inter', sans-serif;
          background-color: var(--warm-bg);
          min-height: 100vh;
          padding: 0; /* Remove padding to handle header banner */
          color: var(--deep-brown);
        }

        .layout-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2.5rem 4rem;
        }

        /* --- New Professional Header Style --- */
        .professional-header-banner {
          background: var(--pure-white);
          border-bottom: 3px solid #e2e8f0;
          padding: 2rem 0;
          margin-bottom: 2.5rem;
          position: relative;
        }

        .header-content-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-title-block h1 {
          font-family: 'Outfit', sans-serif;
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--deep-brown);
          margin: 0.4rem 0 0;
          letter-spacing: -0.04em;
          line-height: 1;
        }

        .header-subtitle {
          color: #7c2d12;
          font-size: 0.95rem;
          margin-top: 0.5rem;
          font-weight: 500;
          opacity: 0.8;
        }

        .header-badge {
          background: var(--navy-blue);
          color: var(--pure-white);
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          padding: 0.35rem 0.8rem;
          border-radius: 2px;
          font-weight: 800;
          box-shadow: 4px 4px 0 var(--neutral-shadow);
        }

        /* Stats in Header for professional look */
        .header-stats {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          text-align: right;
        }

        .stat-value {
          display: block;
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--deep-brown);
          font-family: 'Outfit', sans-serif;
        }

        .stat-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.05em;
        }

        /* --- Main Layout --- */
        .main-grid {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 3rem;
          align-items: start;
        }

        /* --- Form Card (No Glow) --- */
        .form-panel {
          position: sticky;
          top: 2rem;
          background: var(--pure-white);
          border: 2px solid var(--deep-brown);
          border-radius: 0;
          padding: 2rem;
          box-shadow: 10px 10px 0 var(--neutral-shadow);
        }

        .panel-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--deep-brown);
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 4px solid var(--neutral-shadow);
          padding-bottom: 0.6rem;
        }

        .modern-input-group {
          margin-bottom: 1.5rem;
        }

        .modern-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--deep-brown);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .modern-input, .modern-textarea {
          width: 100%;
          padding: 0.85rem 1rem;
          background: #fff;
          border: 2px solid #e2e8f0;
          border-radius: 0;
          font-size: 0.95rem;
          color: var(--deep-brown);
          transition: all 0.2s ease;
        }

        .modern-input:focus, .modern-textarea:focus {
          outline: none;
          border-color: var(--deep-brown);
          background: var(--pure-white);
        }

        .modern-textarea {
          min-height: 154px;
          resize: none;
        }

        .custom-checkbox {
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          margin: 1.5rem 0 2rem;
          padding: 0.85rem;
          background: var(--pure-white);
          border: 2px dashed #e2e8f0;
          transition: all 0.2s;
        }

        .custom-checkbox:hover {
          border-style: solid;
          background: #f8fafc;
        }

        .custom-checkbox input {
          width: 18px;
          height: 18px;
          accent-color: var(--deep-brown);
        }

        .primary-btn {
          width: 100%;
          background: var(--deep-brown);
          color: var(--pure-white);
          padding: 1rem;
          border-radius: 0;
          font-size: 0.95rem;
          font-weight: 800;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .primary-btn:hover {
          background: var(--tangerine);
          color: var(--deep-brown);
          transform: translateY(-2px);
        }

        .primary-btn:active {
          transform: translateY(0);
        }

        /* --- List Controls & Pagination --- */
        .list-controls {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .feed-controls {
          display: flex;
          gap: 1rem;
          background: var(--pure-white);
          padding: 0.75rem 1rem;
          border: 2px solid var(--deep-brown);
          box-shadow: 6px 6px 0 var(--neutral-shadow);
          align-items: center;
        }

        .search-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 1rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: var(--navy-blue);
        }

        .search-wrapper input {
          background: none;
          border: none;
          width: 100%;
          outline: none;
          font-size: 0.95rem;
          color: var(--deep-brown);
        }

        .filter-pills {
          display: flex;
          gap: 0.5rem;
        }

        .pill {
          padding: 0.65rem 1.25rem;
          border-radius: 0;
          font-size: 0.750rem;
          font-weight: 800;
          border: 2px solid var(--deep-brown);
          cursor: pointer;
          transition: all 0.2s;
          background: var(--pure-white);
          color: var(--deep-brown);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .pill.active {
          background: var(--deep-brown);
          color: var(--pure-white);
          box-shadow: 4px 4px 0 var(--neutral-shadow);
          transform: translate(-2px, -2px);
        }

        .pagination-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--pure-white);
          padding: 0.75rem 1.25rem;
          border: 2px solid var(--deep-brown);
          box-shadow: 6px 6px 0 var(--neutral-shadow);
        }

        .entries-selector {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-weight: 700;
          color: var(--deep-brown);
          font-size: 0.8rem;
        }

        .selector-box {
          padding: 0.35rem 0.5rem;
          border: 1.5px solid var(--deep-brown);
          font-weight: 800;
          color: var(--deep-brown);
          outline: none;
          font-size: 0.8rem;
        }

        .pagination-btns {
          display: flex;
          gap: 0.4rem;
        }

        .page-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid var(--deep-brown);
          background: white;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s;
          font-size: 0.8rem;
        }

        .page-btn:hover:not(:disabled) {
          background: #f1f5f9;
        }

        .page-btn.active {
          background: var(--deep-brown);
          color: white;
        }

        .page-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        /* --- Announcement Cards (Institutional) --- */
        .announcement-feed {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .premium-card {
          background: var(--pure-white);
          border: 2px solid #e2e8f0;
          padding: 2rem;
          position: relative;
        }

        .premium-card.is-important {
          background: var(--pure-white); /* Removed Yellow */
          border: 2px solid var(--vibrant-coral);
          box-shadow: 10px 10px 0 rgba(255, 127, 80, 0.08); 
        }

        .premium-card.is-important::after {
          content: 'OFFICIAL NOTICE';
          position: absolute;
          top: 0;
          right: 1.5rem;
          background: var(--vibrant-coral);
          color: white;
          font-size: 0.55rem;
          font-weight: 900;
          padding: 0.3rem 0.8rem;
          letter-spacing: 0.2em;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.25rem;
        }

        .card-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--deep-brown);
          margin: 0;
          line-height: 1.2;
          max-width: 80%;
          letter-spacing: -0.02em;
        }

        .card-body {
          color: var(--deep-brown);
          line-height: 1.7;
          font-size: 0.95rem;
          white-space: pre-wrap;
          margin-bottom: 2rem;
          font-weight: 400;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          border-top: 2px solid #f1f5f9;
        }

        .card-meta {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          color: var(--deep-brown);
          font-size: 0.75rem;
          font-weight: 700;
          opacity: 0.7;
        }

        .card-actions {
          display: flex;
          gap: 0.6rem;
        }

        .icon-btn {
          width: 38px;
          height: 38px;
          border-radius: 0;
          border: 2px solid var(--deep-brown);
          background: var(--pure-white);
          color: var(--deep-brown);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .icon-btn:hover {
          background: var(--deep-brown);
          color: var(--pure-white);
          transform: translate(-3px, -3px);
          box-shadow: 4px 4px 0 var(--neutral-shadow);
        }

        /* --- Modal Backdrop --- */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(74, 23, 30, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .confirm-modal {
          background: white;
          padding: 3rem;
          border: 4px solid var(--deep-brown);
          max-width: 500px;
          width: 90%;
          position: relative;
          box-shadow: 20px 20px 0 var(--neutral-shadow);
        }

        .modal-warning {
          font-family: 'Outfit', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: var(--deep-brown);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .modal-desc {
          font-size: 1.1rem;
          color: #4A171E;
          line-height: 1.6;
          margin-bottom: 2.5rem;
        }

        .modal-actions {
          display: flex;
          gap: 1.5rem;
        }

        .modal-btn {
          flex: 1;
          padding: 1rem;
          font-weight: 800;
          text-transform: uppercase;
          cursor: pointer;
          border: 2px solid var(--deep-brown);
          transition: 0.2s;
        }

        .modal-btn.cancel { background: white; color: var(--deep-brown); }
        .modal-btn.delete { background: var(--action-red); color: white; border-color: var(--action-red); }
        .modal-btn.cancel:hover { background: #f8fafc; }
        .modal-btn.delete:hover { background: var(--deep-brown); color: white; border-color: var(--deep-brown); }

        /* --- Empty State --- */
        .modern-empty {
          text-align: center;
          padding: 8rem 2rem;
          background: var(--pure-white);
          border-radius: 12px;
          border: 2px dashed var(--neutral-shadow);
          color: var(--deep-brown);
        }

        .modern-empty h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 1.5rem 0 0.5rem;
        }

        /* --- Responsive --- */
        @media (max-width: 1100px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Modern Select Dropdowns – Sharp & Institutional Style */
.modern-select {
  width: 100%;
  padding: 0.85rem 1rem;
  padding-right: 2.2rem; /* space for custom arrow */
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--deep-brown);
  background-color: var(--pure-white);
  border: 2px solid var(--deep-brown);
  border-radius: 0;
  appearance: none; /* remove default arrow */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M2 4L6 8L10 4' stroke='%234A171E' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 4px 4px 0 var(--neutral-shadow);
}

.modern-select:hover {
  border-color: var(--tangerine);
  background-color: #fffaf5;
  box-shadow: 6px 6px 0 var(--neutral-shadow);
  transform: translate(-2px, -2px);
}

.modern-select:focus {
  outline: none;
  border-color: var(--deep-brown);
  box-shadow: 0 0 0 3px rgba(74, 23, 30, 0.15);
  background-color: var(--pure-white);
}

.modern-select:disabled {
  background-color: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
  border-color: #cbd5e1;
  box-shadow: none;
}

/* Optional: Placeholder style when no value selected */
.modern-select option[value=""] {
  color: #94a3b8;
  font-style: italic;
}
      `}</style>

      <div className="premium-announcements-root">
        
        {/* DELETE MODAL */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="confirm-modal">
              <div className="modal-warning">
                <IconTrash /> CONFIRM PURGE
              </div>
              <p className="modal-desc">
                Permanently delete archive <b>"{targetToDelete?.title}"</b>? This operation cannot be reversed.
              </p>
              <div className="modal-actions">
                <button className="modal-btn cancel" onClick={closeDeleteModal}>Abort</button>
                <button className="modal-btn delete" onClick={confirmDelete}>Confirm Purge</button>
              </div>
            </div>
          </div>
        )}

        {/* TOP BANNER HEADER */}
        <header className="professional-header-banner">
          <div className="header-content-inner">
            <div className="header-title-block">
              <span className="header-badge">Placement Office • Official</span>
              <h1>Notice Board</h1>
              <p className="header-subtitle">Electronic management system for academic and placement notifications.</p>
            </div>
            
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-value">{announcements.length}</span>
                <span className="stat-label">Total Notices</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{announcements.filter(a => a.important).length}</span>
                <span className="stat-label">Active Priority</span>
              </div>
            </div>
          </div>
        </header>

        <div className="layout-container">
          <main className="main-grid">
            
            {/* LEFT: Management Form (Sharp) */}
            <aside className="form-panel" ref={formRef}>
              <h2 className="panel-title">
                {editId ? "Edit Document" : <><IconPlus /> Create Entry</>}
              </h2>

              {error && (
                <div style={{
                  padding: '1.25rem', 
                  background: '#fef2f2', 
                  color: '#991b1b', 
                  fontSize: '0.85rem', 
                  marginBottom: '2rem',
                  border: '2px solid var(--action-red)',
                  fontWeight: '700'
                }}>
                  SYSTEM ERROR: {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="modern-input-group">
                  <label className="modern-label">Subject Header</label>
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="modern-input"
                    placeholder="ENTER TITLE..."
                    required
                  />
                </div>

                <div className="modern-input-group">
                  <label className="modern-label">Notice Narrative</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="modern-textarea"
                    placeholder="DESCRIBE THE ANNOUNCEMENT IN DETAIL..."
                    required
                  />
                </div>


              <div className="modern-input-group">
  <label className="modern-label">Target Audience</label>
  <select
    value={targetType}
    onChange={(e) => setTargetType(e.target.value)}
    className="modern-select"
  >
    <option value="student">Students</option>
    <option value="coordinator">Coordinators</option>
    
  </select>
</div>

<div className="modern-input-group">
  <label className="modern-label">Select Department</label>
  <select
    value={selectedDept}
    onChange={(e) => handleDeptChange(e.target.value)}
    className="modern-select"
    disabled={departments.length === 0}
  >
    <option value="">Select Department</option>
    {departments.map((d, i) => (
      <option key={i} value={d}>{d}</option>
    ))}
  </select>
</div>

<div className="modern-input-group">
  <label className="modern-label">Select Programme</label>
  <select
    value={selectedProg}
    onChange={(e) => handleProgChange(e.target.value)}
    className="modern-select"
    disabled={!selectedDept || programmes.length === 0}
  >
    <option value="">Select Programme</option>
    {programmes.map((p, i) => (
      <option key={i} value={p}>{p}</option>
    ))}
  </select>
</div>

<div className="modern-input-group">
  <label className="modern-label">Select Batch</label>
  <select
    value={selectedBatch}
    onChange={(e) => setSelectedBatch(e.target.value)}
    className="modern-select"
    disabled={!selectedProg || batches.length === 0}
  >
    <option value="">Select Batch</option>
    {batches.map((b, i) => (
      <option key={i} value={b}>{b}</option>
    ))}
  </select>
</div>

                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={important}
                    onChange={(e) => setImportant(e.target.checked)}
                  />
                  <div>
                    <span style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', color: 'var(--deep-brown)' }}>MARK AS PRIORITY</span>
                    <span style={{ fontSize: '0.7rem', color: '#7c2d12', fontWeight: '500' }}>Flag this entry for official highlight status.</span>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="primary-btn"
                >
                  {loading ? (
                    "UPLOADING..."
                  ) : (
                    <>
                      {editId ? "COMMIT CHANGES" : "PUBLISH TO BOARD"}
                    </>
                  )}
                </button>

                {editId && (
                  <button 
                    type="button"
                    style={{
                      marginTop: '1rem',
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid var(--deep-brown)',
                      background: 'none',
                      fontWeight: '800',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                    onClick={() => {
                      setEditId(null);
                      setTitle("");
                      setMessage("");
                      setImportant(false);
                      setSelectedDept("");
                      setSelectedProg("");
                      setSelectedBatch("");
                    }}
                  >
                    CANCEL OPERATION
                  </button>
                )}

                {!editId && (
                  <button 
                    type="button"
                    style={{
                      marginTop: '1rem',
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e2e8f0',
                      background: 'none',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      color: '#64748b'
                    }}
                    onClick={() => {
                      setTitle("");
                      setMessage("");
                      setImportant(false);
                      setSelectedDept("");
                      setSelectedProg("");
                      setSelectedBatch("");
                    }}
                  >
                    CLEAR FORM
                  </button>
                )}
              </form>
            </aside>

            {/* RIGHT: Announcement Feed */}
            <section className="feed-content">
              
              <div className="list-controls">
                <div className="feed-controls">
                  <div className="search-wrapper">
                    <IconSearch />
                    <input 
                      type="text" 
                      placeholder="SEARCH RECORDS..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="filter-pills">
                    <button 
                      className={`pill ${filterMode === 'all' ? 'active' : ''}`}
                      onClick={() => setFilterMode('all')}
                    >
                      ALL
                    </button>
                    <button 
                      className={`pill ${filterMode === 'important' ? 'active' : ''}`}
                      onClick={() => setFilterMode('important')}
                    >
                      PRIORITY
                    </button>
                  </div>
                </div>

                <div className="pagination-bar">
                  <div className="entries-selector">
                    <span>Show</span>
                    <select 
                      className="selector-box"
                      value={entriesPerPage}
                      onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span>records</span>
                  </div>

                  <div className="pagination-btns">
                    <button 
                      className="page-btn" 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      &laquo;
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button 
                        key={i} 
                        className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button 
                      className="page-btn" 
                      disabled={currentPage === totalPages || totalPages === 0}
                      onClick={() => setCurrentPage(p => p + 1)}
                    >
                      &raquo;
                    </button>
                  </div>
                </div>
              </div>

              {paginatedAnnouncements.length === 0 ? (
                <div className="modern-empty">
                  <IconBell />
                  <h3>RECORD NOT FOUND</h3>
                  <p>{searchTerm ? "The specified search parameters yielded no results." : "The database is currently clear of active notices."}</p>
                </div>
              ) : (
                <div className="announcement-feed">
                  {paginatedAnnouncements.map((ann) => (
                    <article 
                      key={ann.id} 
                      className={`premium-card ${ann.important ? 'is-important' : ''}`}
                    >
                      <header className="card-header">
                        <h3 className="card-title">{ann.title}</h3>
                        <div className="card-actions">
                          <button 
                            className={`icon-btn copy ${copiedId === ann.id ? 'success' : ''}`}
                            onClick={() => handleCopy(ann)}
                            title="Copy Archive"
                          >
                            <IconCopy />
                          </button>
                          <button 
                            className="icon-btn edit"
                            onClick={() => handleEdit(ann)}
                            title="Edit Record"
                          >
                            <IconEdit />
                          </button>
                          <button 
                            className="icon-btn delete"
                            onClick={() => openDeleteModal(ann)}
                            title="Purge Entry"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </header>

                      <div className="card-body">
                        {ann.message}
                      </div>

                      <footer className="card-footer">
                        <div className="card-meta">
                          <div className="meta-item">
                            <span>AUTHOR:</span>
                            <span style={{ color: 'var(--navy-blue)' }}>{ann.created_by || "OFFICIAL ADMIN"}</span>
                          </div>
                          <div className="meta-item">
                             <span>DATE:</span>
                             <span>{ann.created_at}</span>
                          </div>
                          <div className="meta-item">
                            <span>DEPT:</span>
                            <span style={{ color: '#7c2d12', fontWeight: 600 }}>{ann.department || "N/A"}</span>
                          </div>
                          <div className="meta-item">
                            <span>PROG:</span>
                            <span style={{ color: '#7c2d12', fontWeight: 600 }}>{ann.programme || "N/A"}</span>
                          </div>
                          <div className="meta-item">
                            <span>BATCH:</span>
                            <span style={{ color: '#7c2d12', fontWeight: 600 }}>{ann.batch || "N/A"}</span>
                          </div>
                        </div>
                        {ann.important && <IconStar fill="var(--vibrant-coral)" />}
                      </footer>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
