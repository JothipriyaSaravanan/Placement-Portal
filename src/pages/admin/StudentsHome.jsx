// src/pages/admin/StudentsHome.jsx
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminPageLayout from "../../components/admin/AdminPageLayout";

export default function StudentsHome() {
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter & Pagination states
  const [deptSearch, setDeptSearch] = useState("");
  const [coordSearch, setCoordSearch] = useState("");
  const [sortBy, setSortBy] = useState("dept-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8000/admin-panel/coordinators/", {
        withCredentials: true,
      })
      .then((res) => {
        const coordList = res.data.coordinators || [];
        setCoordinators(coordList);
      })
      .catch((err) => {
        setError("Failed to load department coordinators");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter Logic
  const filtered = useMemo(() => {
    let result = [...coordinators];

    // Search by Department
    if (deptSearch.trim()) {
      const term = deptSearch.toLowerCase().trim();
      result = result.filter((c) => (c.department || "").toLowerCase().includes(term));
    }

    // Search by Coordinator
    if (coordSearch.trim()) {
      const term = coordSearch.toLowerCase().trim();
      result = result.filter((c) => 
        (c.name || "").toLowerCase().includes(term) || 
        (c.username || "").toLowerCase().includes(term) ||
        (c.email || "").toLowerCase().includes(term)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "dept-asc") return (a.department || "").localeCompare(b.department || "");
      if (sortBy === "dept-desc") return (b.department || "").localeCompare(a.department || "");
      if (sortBy === "name-asc") return (a.name || a.username || "").localeCompare(b.name || b.username || "");
      return 0;
    });

    return result;
  }, [deptSearch, coordSearch, sortBy, coordinators]);

  // Pagination Logic
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(filtered.length / itemsPerPage);
  const currentItems = itemsPerPage === 'all' 
    ? filtered 
    : filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [deptSearch, coordSearch, sortBy, itemsPerPage]);

  return (
    <AdminPageLayout title="Departmental Registry" icon="fas fa-id-card-alt">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@600;700;800&display=swap');

        :root {
          --primary-indigo: #4f46e5;
          --primary-hover: #4338ca;
          --text-main: #000000;
          --text-muted: #475569;
          --border-color: #94a3b8;
          --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }

        .students-home-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          font-family: 'Inter', sans-serif;
          color: var(--text-main);
          padding-bottom: 4rem;
        }

        /* Action Row */
        .action-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
          gap: 1.5rem;
          background: white;
          padding: 1.25rem 1.5rem;
          border-radius: 1rem;
          box-shadow: var(--shadow-sm);
          border: none;
        }

        .back-nav-p {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.7rem 1.2rem;
          background: #f8fafc;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          color: var(--text-main);
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-nav-p:hover {
          background: #f1f5f9;
          border-color: var(--text-muted);
          transform: translateX(-3px);
        }

        .search-premium-box {
          flex: 1;
          max-width: 450px;
          position: relative;
        }

        .search-premium-box input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          font-size: 0.95rem;
          outline: none;
          font-weight: 500;
          background: #f8fafc;
          transition: all 0.2s;
        }

        .search-premium-box input:focus {
          border-color: var(--primary-indigo);
          background: white;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        }

        .search-premium-box i {
          position: absolute;
          left: 1.1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--primary-indigo);
          font-size: 1rem;
        }

        .filter-select-premium {
          padding: 0.75rem 1rem;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          font-size: 0.9rem;
          font-weight: 700;
          color: #000000;
          background: #f8fafc;
          outline: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-select-premium:focus {
          border-color: var(--primary-indigo);
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        }

        .select-icon-wrapper {
          position: relative;
          min-width: 150px;
        }

        .select-icon-wrapper i {
          position: absolute;
          left: 1.1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--primary-indigo);
          pointer-events: none;
          z-index: 10;
        }

        .select-icon-wrapper select {
          padding-left: 3rem;
          width: 100%;
        }

        .top-pagination-section {
          background: #ffffff;
          padding: 1rem 1.5rem;
          border-radius: 1rem;
          border: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        /* Grid System */
        .dept-grid-p {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.75rem;
          margin-bottom: 3rem;
        }

        .dept-card-premium {
          background: #ffffff;
          border-radius: 1.25rem;
          padding: 2rem;
          border: 1.5px solid #94a3b8;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          position: relative;
          box-shadow: var(--shadow-sm);
        }

        .dept-card-premium:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg);
          border-color: var(--primary-indigo);
        }

        .dept-card-premium h3 {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0;
          font-family: 'Outfit', sans-serif;
          line-height: 1.1;
          text-transform: capitalize;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .dept-card-premium h3::before {
          content: '';
          display: block;
          width: 4px;
          height: 24px;
          background: var(--primary-indigo);
          border-radius: 2px;
        }

        .dept-meta {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.925rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .meta-item i {
          width: 20px;
          color: var(--primary-indigo);
          font-size: 1.1rem;
          opacity: 0.7;
        }

        .meta-item b {
          color: var(--text-main);
          font-weight: 700;
        }

        .card-sep {
          margin-top: auto;
          padding-top: 1.25rem;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .action-hint {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--primary-indigo);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .action-hint i {
          transition: transform 0.2s;
        }

        .dept-card-premium:hover .action-hint i {
          transform: translateX(4px);
        }

        /* Empty / Loading */
        .status-box {
          text-align: center;
          padding: 6rem 2rem;
          background: white;
          border: 1px dashed var(--border-color);
          border-radius: 1.5rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .status-box i {
          font-size: 3rem;
          margin-bottom: 1rem;
          display: block;
          color: var(--border-color);
        }

        /* Pagination Tools */
        .bottom-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 1.25rem 2rem;
          border-radius: 1.25rem;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
        }

        .entries-select {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .entries-select select {
          padding: 0.4rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid var(--border-color);
          outline: none;
          font-weight: 700;
          background: #f8fafc;
        }

        .pagination-nav {
          display: flex;
          gap: 0.4rem;
        }

        .btn-page {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.6rem;
          border: 1px solid var(--border-color);
          background: white;
          color: var(--text-main);
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-page.active {
          background: var(--primary-indigo);
          color: white;
          border-color: var(--primary-indigo);
        }

        .btn-page:hover:not(.active):not(.disabled) {
          border-color: var(--primary-indigo);
          color: var(--primary-indigo);
          background: #f5f3ff;
        }

        .btn-page.disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .action-container { flex-direction: column; align-items: stretch; }
          .search-premium-box { max-width: 100%; }
        }
      `}</style>

      <div className="students-home-wrapper">
        <div className="action-container">
          <div className="search-premium-box">
            <i className="fas fa-building"></i>
            <input 
              type="text" 
              placeholder="Search departments..." 
              value={deptSearch}
              onChange={(e) => setDeptSearch(e.target.value)}
            />
          </div>

          <div className="search-premium-box">
            <i className="fas fa-user-tie"></i>
            <input 
              type="text" 
              placeholder="Search coordinator..." 
              value={coordSearch}
              onChange={(e) => setCoordSearch(e.target.value)}
            />
          </div>

          <div className="select-icon-wrapper">
            <i className="fas fa-sort-amount-down"></i>
            <select 
              className="filter-select-premium"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="dept-asc">Dept (A-Z)</option>
              <option value="dept-desc">Dept (Z-A)</option>
              <option value="name-asc">Coordinator (A-Z)</option>
            </select>
          </div>

          <button className="back-nav-p" onClick={() => {
            setDeptSearch("");
            setCoordSearch("");
            setSortBy("dept-asc");
          }}>
            <i className="fas fa-sync-alt"></i>
            Reset
          </button>
        </div>

        {error && <div className="admin-message error">{error}</div>}

        {loading ? (
          <div className="status-box">
            <div className="spinner" style={{width: '30px', height: '30px', borderTopColor: 'var(--primary-indigo)', margin: '0 auto 1rem'}}></div>
            FETCHING DEPARTMENTS...
          </div>
        ) : (
          <>
            <div className="top-pagination-section">
              <div className="entries-select">
                <span>Show</span>
                <select 
                  className="filter-select"
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: '1.5px solid #94a3b8',
                    fontWeight: 700,
                    outline: 'none',
                    background: '#f8fafc'
                  }}
                  value={itemsPerPage} 
                  onChange={(e) => setItemsPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                >
                  <option value={6}>6 Entries</option>
                  <option value={12}>12 Entries</option>
                  <option value={24}>24 Entries</option>
                  <option value="all">Show All</option>
                </select>
                <span style={{fontWeight: 700}}>of {filtered.length} records</span>
              </div>

              <div className="pagination-nav">
                <button 
                  className={`btn-page ${currentPage === 1 ? 'disabled' : ''}`}
                  onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i + 1} 
                    className={`btn-page ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  className={`btn-page ${currentPage === totalPages ? 'disabled' : ''}`}
                  onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="status-box">
                <i className="fas fa-search"></i>
                <p>No departments or coordinators match your search criteria.</p>
                <button className="back-nav-p" style={{margin: '1rem auto'}} onClick={() => {
                  setDeptSearch("");
                  setCoordSearch("");
                  setSortBy("dept-asc");
                }}>Clear All Filters</button>
              </div>
            ) : (
              <div className="dept-grid-p">
                {currentItems.map((c) => (
                  <div
                    key={c.id}
                    className="dept-card-premium"
                    onClick={() => navigate("/admin/programmes", { state: { coordinator: c } })}
                  >
                    <h3>{c.department.replace(/_/g, ' ')}</h3>
                    
                    <div className="dept-meta">
                      <div className="meta-item">
                        <i className="fas fa-user-tie"></i>
                        <span><b>Coordinator:</b> {c.name || c.username}</span>
                      </div>
                      <div className="meta-item">
                        <i className="fas fa-at"></i>
                        <span>{c.email}</span>
                      </div>
                    </div>

                    <div className="card-sep">
                      <div className="action-hint">
                        View Programmes <i className="fas fa-arrow-right"></i>
                      </div>
                      <i className="fas fa-id-badge" style={{opacity: 0.2, fontSize: '1.2rem'}}></i>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AdminPageLayout>
  );
}
