
// src/pages/admin/CoordinatorList.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminPageLayout from "../../components/admin/AdminPageLayout";

export default function CoordinatorList() {
  const navigate = useNavigate();
  const [coordinators, setCoordinators] = useState([]);
  const [filteredCoordinators, setFilteredCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deptSearch, setDeptSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedProgramme, setSelectedProgramme] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Edit State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Delete Confirmation State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCoord, setDeletingCoord] = useState(null);
  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDept, selectedProgramme, deptSearch, sortBy]);

  // Logic to get current items
  const indexOfLastItem = currentPage * (itemsPerPage === 'all' ? filteredCoordinators.length : itemsPerPage);
  const indexOfFirstItem = indexOfLastItem - (itemsPerPage === 'all' ? filteredCoordinators.length : itemsPerPage);
  const currentItems = filteredCoordinators.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(filteredCoordinators.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [formMessageType, setFormMessageType] = useState("");
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    department: "",
    programmes: [],
  });

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

  const fetchCoordinators = () => {
    setLoading(true);
    axios
      .get("http://localhost:8000/admin-panel/coordinators/", {
        withCredentials: true,
      })
      .then((res) => {
        const coordList = res.data.coordinators || [];
        setCoordinators(coordList);
        setFilteredCoordinators(coordList);
      })
      .catch((err) => {
        setError("Failed to load coordinators. Please try again.");
        console.error("Load coordinators error:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoordinators();
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = [...coordinators];

    // Search Query Filter (Name/Email/Username)
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          (c.name || "").toLowerCase().includes(term) ||
          (c.username || "").toLowerCase().includes(term) ||
          (c.email || "").toLowerCase().includes(term)
      );
    }

    // Department Dropdown Filter
    if (selectedDept !== "all") {
      filtered = filtered.filter((c) => c.department === selectedDept);
    }

    // Programme Filter (Checks if the selected programme is in the coordinator's programmes list)
    if (selectedProgramme !== "all") {
      filtered = filtered.filter((c) =>
        (c.programmes || []).includes(selectedProgramme)
      );
    }

    // Department Name Search Filter
    if (deptSearch.trim()) {
      const term = deptSearch.toLowerCase().trim();
      filtered = filtered.filter((c) =>
        (c.department || "").toLowerCase().includes(term)
      );
    }

    // Sorting Logic
    filtered.sort((a, b) => {
      if (sortBy === "name-asc") return (a.name || a.username || "").localeCompare(b.name || b.username || "");
      if (sortBy === "name-desc") return (b.name || b.username || "").localeCompare(a.name || a.username || "");
      if (sortBy === "id-newest") return b.id - a.id;
      if (sortBy === "id-oldest") return a.id - b.id;
      return 0;
    });

    setFilteredCoordinators(filtered);
  }, [searchQuery, selectedDept, selectedProgramme, deptSearch, sortBy, coordinators]);

  const handleDelete = (coord, e) => {
    e.stopPropagation(); // Prevent card click
    setDeletingCoord(coord);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingCoord) return;

    try {
      await axios.delete(`http://localhost:8000/admin-panel/coordinators/${deletingCoord.id}/`, {
        withCredentials: true,
      });
      setShowDeleteModal(false);
      setDeletingCoord(null);
      fetchCoordinators();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete.");
    }
  };

  const openEditModal = (coord, e) => {
    e.stopPropagation(); // Prevent card click
    setIsEditMode(true);
    setEditingId(coord.id);
    setForm({
      username: coord.username,
      password: "", // Optional during edit
      email: coord.email,
      department: coord.department,
      programmes: coord.programmes || [],
    });
    setFormMessage("");
    setShowModal(true);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedDept("all");
    setSelectedProgramme("all");
    setDeptSearch("");
    setSortBy("name-asc");
  };

  const clearSearch = () => setDeptSearch("");

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
    setFormLoading(true);
    setFormMessage("");

    try {
      if (isEditMode) {
        const res = await axios.put(
          `http://localhost:8000/admin-panel/coordinators/${editingId}/`,
          { ...form },
          { withCredentials: true }
        );
        setFormMessage(res.data.message || "Coordinator updated successfully!");
      } else {
        const res = await axios.post(
          "http://localhost:8000/admin-panel/coordinators/create/",
          {
            admin_email: localStorage.getItem("admin_email"),
            ...form,
          },
          { withCredentials: true }
        );
        setFormMessage(res.data.message || "Coordinator created successfully!");
      }

      setFormMessageType("success");

      // Reset form and refresh list after a short delay
      setTimeout(() => {
        setShowModal(false);
        setForm({
          username: "",
          password: "",
          email: "",
          department: "",
          programmes: [],
        });
        setFormMessage("");
        fetchCoordinators();
      }, 1500);

    } catch (err) {
      setFormMessage(err.response?.data?.error || "Something went wrong.");
      setFormMessageType("error");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <AdminPageLayout title="Coordinators" icon="fas fa-user-shield">
      <style>{`
        .admin-list-wrapper {
          min-height: 100vh;
          padding: 0;
          background: transparent;
          color: #1e293b;
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          margin-top: 0;
        }

        .page-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          color: #000000;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .page-title i {
          color: #d946ef;
        }

        .create-btn {
          padding: 0.6rem 1.2rem;
          font-size: 0.9rem;
          font-weight: 700;
          color: white;
          background: #d946ef;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .create-btn:hover {
          background: #075985;
          transform: translateY(-1px);
        }

        .search-wrapper {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-container {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-input {
          width: 100%;
          padding: 0.85rem 1rem 0.85rem 3rem;
          border-radius: 0.5rem;
          border: 2px solid #e2e8f0;
          font-size: 0.95rem;
          font-weight: 500;
          background: #ffffff;
          transition: all 0.2s ease;
          outline: none;
        }

        .search-container::before {
          content: "\f002";
          font-family: "Font Awesome 5 Free";
          font-weight: 900;
          position: absolute;
          left: 1.2rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .filter-toggle-btn {
          padding: 0.85rem 1.25rem;
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 0.5rem;
          color: #475569;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .filter-toggle-btn:hover {
          border-color: #d946ef;
          color: #d946ef;
        }

        .filter-toggle-btn.active {
          background: #fae8ff;
          border-color: #d946ef;
          color: #d946ef;
        }

        /* ─── Advanced Filter Panel ────────────────────────────────────────── */
        .advanced-filter-panel {
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .filter-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-item label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 0.05em;
        }

        .filter-item select, .filter-item input {
          padding: 0.75rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
          outline: none;
        }

        .filter-item select:focus, .filter-item input:focus {
          border-color: #0369a1;
        }

        .reset-filter-btn {
          margin-top: auto;
          padding: 0.75rem;
          background: #f1f5f9;
          border: none;
          border-radius: 0.5rem;
          color: #475569;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reset-filter-btn:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        .coordinators-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .coordinator-card {
          background: #ffffff;
          border-radius: 1.25rem;
          padding: 1.75rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          border: 1.5px solid #94a3b8;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .coordinator-card:hover {
          transform: translateY(-5px);
          border-color: #d946ef;
          box-shadow: 0 20px 25px -5px rgba(217, 70, 239, 0.1);
        }

        .card-icon {
          width: 45px;
          height: 45px;
          background: #fae8ff;
          border-radius: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
          color: #d946ef;
          font-size: 1.1rem;
        }

        .coordinator-card h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.3rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.75rem 0;
          text-transform: capitalize;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.6rem;
          font-size: 0.95rem;
          color: #475569;
          font-weight: 500;
        }

        .info-item i {
          width: 16px;
          color: #94a3b8;
        }

        .dept-tag {
          display: inline-block;
          margin-top: 0.75rem;
          padding: 0.4rem 0.8rem;
          background: #f0f9ff;
          color: #0369a1;
          border-radius: 2rem;
          font-size: 0.8rem;
          font-weight: 700;
          border: 1px solid #bae6fd;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          font-family: 'Outfit', sans-serif;
        }

        .card-actions {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          display: flex;
          gap: 0.5rem;
          z-index: 10;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.85rem;
        }

        .edit-action {
          background: #f1f5f9;
          color: #64748b;
        }

        .edit-action:hover {
          background: #f0f9ff;
          color: #0369a1;
        }

        .delete-action {
          background: #f1f5f9;
          color: #64748b;
        }

        .delete-action:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        /* ─── Delete Confirmation Modal ───────── */
        .confirm-modal {
          max-width: 400px;
          text-align: center;
          padding: 2.5rem 2rem;
        }

        .confirm-icon-wrapper {
          width: 70px;
          height: 70px;
          background: #fee2e2;
          color: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 2rem;
        }

        .confirm-modal h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.75rem;
        }

        .confirm-modal p {
          color: #475569;
          font-size: 1rem;
          margin-bottom: 2rem;
          line-height: 1.5;
        }

        .confirm-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-cancel {
          flex: 1;
          padding: 0.85rem;
          border-radius: 0.75rem;
          border: 2px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .btn-confirm-delete {
          flex: 1;
          padding: 0.85rem;
          border-radius: 0.75rem;
          border: none;
          background: #ef4444;
          color: #ffffff;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-confirm-delete:hover {
          background: #dc2626;
          transform: translateY(-1px);
        }

        .empty-state {
          text-align: center;
          padding: 4rem 1.5rem;
          color: #6b7280;
          font-size: 1.1rem;
          font-style: italic;
          background: #ffffff;
          border-radius: 1.2rem;
          border: 2px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .empty-state i {
          font-size: 3rem;
          color: #cbd5e1;
        }

        .empty-state p {
          margin: 0;
          font-style: normal;
          font-weight: 500;
          color: #475569;
        }

        .error-message {
          padding: 1.2rem;
          background: rgba(239,68,68,0.1);
          color: #991b1b;
          border-radius: 1rem;
          text-align: center;
          margin-bottom: 2rem;
          border: 1px solid rgba(239,68,68,0.2);
        }

        /* ─── Premium Modal Styles ────────────────────────────────────────── */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 1.5rem;
          animation: modalFadeIn 0.3s ease;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-container {
          background: white;
          width: 100%;
          max-width: 550px;
          border-radius: 1.5rem;
          padding: 2.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          position: relative;
          overflow-y: auto;
          max-height: 90vh;
          animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalSlideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-close {
          position: absolute;
          top: 1.5rem; right: 1.5rem;
          background: #f1f5f9;
          border: none;
          width: 32px; height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: #fee2e2;
          color: #ef4444;
          transform: rotate(90deg);
        }

        .modal-header {
          text-align: center;
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          align-items: center;
        }

        .modal-header h2 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          display: block;
        }

        .modal-header p {
          color: #64748b;
          font-size: 0.95rem;
          font-weight: 500;
          margin: 0;
          display: block;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }

        .form-group-custom {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group-custom label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #000000;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-group-custom input,
        .form-group-custom select {
          padding: 0.85rem 1.1rem;
          border: 2px solid #cbd5e1;
          border-radius: 1rem;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s;
          background: #ffffff;
          color: #000000;
          font-weight: 500;
        }

        .form-group-custom input:focus,
        .form-group-custom select:focus {
          border-color: #000000;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
        }

        .prog-grid {
          background: #ffffff;
          border: 2px solid #cbd5e1;
          border-radius: 1rem;
          padding: 1.25rem;
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }

        .prog-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          user-select: none;
        }

        .prog-item input {
          width: 18px;
          height: 18px;
          accent-color: #d946ef;
        }

        .prog-item span {
          font-size: 0.95rem;
          font-weight: 600;
          color: #000000;
        }

        .modal-submit {
          width: 100%;
          margin-top: 1rem;
          padding: 1rem;
          background: #d946ef;
          color: white;
          border: none;
          border-radius: 1rem;
          font-size: 1.05rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-submit:hover:not(:disabled) {
          background: #c026d3;
          transform: translateY(-1px);
        }

        .modal-submit:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
          box-shadow: none;
        }

        .form-msg {
          padding: 0.85rem;
          border-radius: 0.75rem;
          text-align: center;
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .form-msg.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .form-msg.error { background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; }

        @media (max-width: 768px) {
          .admin-list-wrapper {
            padding: 1.5rem 1rem 4rem;
          }
          .header-row {
            flex-direction: column;
            align-items: stretch;
          }
          .create-btn {
            width: fit-content;
            margin: 0 auto;
          }
          .coordinators-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ─── Pagination Styles ───────────────── */
        .top-pagination-bar {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 1.5rem;
          padding: 0 0.5rem;
        }

        .pagination-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 3rem;
          padding: 1.5rem;
          background: #ffffff;
          border-radius: 1rem;
          border: 1.5px solid #94a3b8;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .show-entries {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600;
          color: #1e293b;
        }

        .show-entries select {
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          border: 1.5px solid #cbd5e1;
          outline: none;
          cursor: pointer;
          background: white;
          font-weight: 600;
        }

        .pagination-controls {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .page-btn {
          min-width: 40px;
          height: 40px;
          padding: 0 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          border: 1.5px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .page-btn:hover:not(:disabled) {
          border-color: #d946ef;
          color: #d946ef;
        }

        .page-btn.active {
          background: #d946ef;
          border-color: #d946ef;
          color: #ffffff;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #f1f5f9;
        }

        @media (max-width: 500px) {
          .pagination-container {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }
          .pagination-controls {
            justify-content: center;
          }
        }
      `}</style>

      <div className="admin-list-wrapper">
        <div className="header-row">
          <h1 className="page-title">
            <i className="fas fa-user-shield"></i>
            Department Coordinators
          </h1>

          <button
            className="create-btn"
            onClick={() => {
              setIsEditMode(false);
              setForm({
                username: "",
                password: "",
                email: "",
                department: "",
                programmes: [],
              });
              setShowModal(true);
            }}
          >
            <i className="fas fa-plus"></i>
            New Coordinator
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="search-wrapper">
          <div className="search-container">
            <input
              type="text"
              placeholder="Quick search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <button
            className={`filter-toggle-btn ${isFilterVisible ? 'active' : ''}`}
            onClick={() => setIsFilterVisible(!isFilterVisible)}
          >
            <i className="fas fa-filter"></i>
            Advanced Filters
          </button>
        </div>

        {isFilterVisible && (
          <div className="advanced-filter-panel">
            <div className="filter-item">
              <label>Department Name</label>
              <input
                type="text"
                placeholder="Search department..."
                value={deptSearch}
                onChange={(e) => setDeptSearch(e.target.value)}
              />
            </div>

            <div className="filter-item">
              <label>Specific Programme</label>
              <select
                value={selectedProgramme}
                onChange={(e) => setSelectedProgramme(e.target.value)}
              >
                <option value="all">All Programmes</option>
                {/* Flatten all programmes from all departments for filtering */}
                {Object.values(departmentProgrammeMap).flat().map(prog => (
                  <option key={prog.value} value={prog.value}>{prog.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label>Sort Results By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="id-newest">Newest First</option>
                <option value="id-oldest">Oldest First</option>
              </select>
            </div>

            <button className="reset-filter-btn" onClick={resetFilters}>
              <i className="fas fa-undo me-2"></i>
              Reset
            </button>
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            <div className="spinner-border mb-3" style={{ color: '#d946ef' }} role="status"></div>
            <p>Gathering coordinator profiles...</p>
          </div>
        ) : filteredCoordinators.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-search mb-3" style={{ fontSize: '3rem', color: '#f5d0fe' }}></i>
            <p>
              {searchQuery.trim() || deptSearch.trim() || selectedDept !== 'all' || selectedProgramme !== 'all'
                ? "No coordinators match your advanced search criteria."
                : "No coordinators have been registered yet."}
            </p>
          </div>
        ) : (
          <>
            <div className="top-pagination-bar">
              <div className="show-entries">
                <span>Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    const val = e.target.value;
                    setItemsPerPage(val === 'all' ? 'all' : parseInt(val));
                  }}
                >
                  <option value={3}>3 Entries</option>
                  <option value={6}>6 Entries</option>
                  <option value={10}>10 Entries</option>
                  <option value={20}>20 Entries</option>
                  <option value="all">Show All</option>
                </select>
                <span>of {filteredCoordinators.length} items</span>
              </div>
            </div>

            <div className="coordinators-grid">
              {currentItems.map((coord) => (
                <div
                  className="coordinator-card"
                  key={coord.id}
                  onClick={() => navigate(`/admin/coordinator/${coord.id}`)}
                >
                  <div className="card-actions">
                    <button
                      className="action-btn edit-action"
                      onClick={(e) => openEditModal(coord, e)}
                      title="Edit Coordinator"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="action-btn delete-action"
                      onClick={(e) => handleDelete(coord, e)}
                      title="Delete Coordinator"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>

                  <div className="card-icon">
                    <i className="fas fa-user-tie"></i>
                  </div>
                  <h3>{coord.name || coord.username || "Unnamed Coordinator"}</h3>

                  <div className="info-item">
                    <i className="fas fa-envelope"></i>
                    <span>{coord.email}</span>
                  </div>

                  <div className="info-item">
                    <i className="fas fa-id-badge"></i>
                    <span>ID: #{coord.id}</span>
                  </div>

                  <div className="dept-tag">
                    {coord.department || "General"}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination UI - Only buttons here */}
            {itemsPerPage !== 'all' && totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination-controls">
                  <button
                    className="page-btn"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>

                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx + 1}
                      className={`page-btn ${currentPage === idx + 1 ? 'active' : ''}`}
                      onClick={() => paginate(idx + 1)}
                    >
                      {idx + 1}
                    </button>
                  ))}

                  <button
                    className="page-btn"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Premium Create Coordinator Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <i className="fas fa-times"></i>
            </button>

            <div className="modal-header">
              <h2>{isEditMode ? "Edit Coordinator" : "New Coordinator"}</h2>
              <p>{isEditMode ? "Update the account details" : "Fill in the details to register a new department head"}</p>
            </div>

            {formMessage && (
              <div className={`form-msg ${formMessageType}`}>
                {formMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-group-custom">
                <label>Username</label>
                <input
                  name="username"
                  placeholder="Enter unique username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  disabled={isEditMode}
                />
              </div>

              <div className="form-group-custom">
                <label>Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="coordinator@university.edu"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group-custom">
                <label>Access Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Set a secure password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group-custom">
                <label>Department</label>
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
                <div className="form-group-custom">
                  <label>Managed Programmes</label>
                  <div className="prog-grid">
                    {departmentProgrammeMap[form.department]?.map((prog) => (
                      <label key={prog.value} className="prog-item">
                        <input
                          type="checkbox"
                          value={prog.value}
                          checked={form.programmes.includes(prog.value)}
                          onChange={handleProgrammeChange}
                        />
                        <span>{prog.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="modal-submit"
                disabled={formLoading}
              >
                {formLoading ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>{isEditMode ? "Updating..." : "Creating..."}</>
                ) : (isEditMode ? "Update Coordinator" : "Register Coordinator")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-container confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon-wrapper">
              <i className="fas fa-exclamation-triangle"></i>
            </div>

            <h3>Are you sure?</h3>
            <p>
              You are about to delete <strong>{deletingCoord?.name || deletingCoord?.username}</strong>.
              This action cannot be undone.
            </p>

            <div className="confirm-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-confirm-delete"
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
}