import { useLocation, useNavigate } from "react-router-dom";
import AdminPageLayout from "../../components/admin/AdminPageLayout";
import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from 'xlsx';

export default function ProgrammeList() {
  const location = useLocation();
  const navigate = useNavigate();

  const [coordinator, setCoordinator] = useState(location.state?.coordinator || null);
  const [allCoordinators, setAllCoordinators] = useState([]);
  const [loading, setLoading] = useState(!location.state?.coordinator);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [levelFilter, setLevelFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (!coordinator) {
      axios.get("http://localhost:8000/admin-panel/coordinators/", { withCredentials: true })
        .then(res => {
          setAllCoordinators(res.data.coordinators || res.data || []);
        })
        .catch(err => console.error("Error fetching coordinators:", err))
        .finally(() => setLoading(false));
    }
  }, [coordinator]);

  const programmes = coordinator 
    ? (coordinator.programmes || [])
    : [...new Set(allCoordinators.flatMap(c => c.programmes || []))];

  const filteredProgrammes = programmes
    .filter((prog) => {
      const matchesSearch = prog.toLowerCase().includes(search.toLowerCase());
      const isPG = prog.startsWith('MA') || prog.startsWith('MSc') || prog.startsWith('MCA') || prog.startsWith('MBA');
      const matchesLevel = levelFilter === "all" ? true : (levelFilter === "PG" ? isPG : !isPG);
      return matchesSearch && matchesLevel;
    })
    .sort((a, b) => {
      if (sortBy === "name-asc") return a.localeCompare(b);
      if (sortBy === "name-desc") return b.localeCompare(a);
      return 0;
    });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = itemsPerPage === 'all' 
    ? filteredProgrammes 
    : filteredProgrammes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(filteredProgrammes.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset to first page on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, levelFilter, sortBy, itemsPerPage]);

  const handleExport = () => {
    if (filteredProgrammes.length === 0) {
      alert("No data to export!");
      return;
    }

    const exportData = filteredProgrammes.map(programme => {
      const parentCoord = !coordinator && allCoordinators.find(c => c.programmes?.includes(programme));
      const dept = coordinator?.department || parentCoord?.department || "General";
      const isPG = programme.startsWith('MA') || programme.startsWith('MSc') || programme.startsWith('MCA') || programme.startsWith('MBA');
      const level = isPG ? "PG" : "UG";
      return {
        "Programme": (programme || "").replace(/_/g, ' '),
        "Department": dept || "N/A",
        "Level": level
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Programmes");
    XLSX.writeFile(workbook, `Programmes_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return <AdminPageLayout title="Loading Programmes..."><div className="loading-state">Fetching data...</div></AdminPageLayout>;
  }

  return (
    <AdminPageLayout 
      title={coordinator ? `${coordinator.department || "Department"} Programmes` : "All Academic Programmes"} 
      icon="fas fa-graduation-cap"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;700;800&display=swap');

        .programmes-container {
          padding: 1rem 0 4rem;
          animation: fadeIn 0.5s ease-out;
          max-width: 1200px;
          margin: 0 auto;
          font-family: 'Inter', sans-serif;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ─── Compact Stats Bar ────────────────────────────────────────── */
        .stats-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .stat-card-mini {
          padding: 1.25rem 1.5rem;
          border-radius: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-height: 90px;
          transition: all 0.3s ease;
          border: none;
          position: relative;
          overflow: hidden;
          color: #ffffff;
        }

        .stat-card-mini:hover {
          transform: translateY(-5px);
        }

        .stat-card-mini.card-1 { 
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        }
        .stat-card-mini.card-2 { 
          background: linear-gradient(135deg, #10b981 0%, #047857 100%);
        }
        .stat-card-mini.card-3 { 
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .stat-icon-floating {
          position: absolute;
          bottom: -10px;
          right: -5px;
          font-size: 3.5rem;
          opacity: 0.15;
          transform: rotate(-10deg);
          color: #ffffff;
          transition: all 0.5s ease;
        }

        .stat-card-mini:hover .stat-icon-floating {
          transform: rotate(0deg) scale(1.05);
          opacity: 0.25;
        }

        .stat-content h4 {
          margin: 0;
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 800;
          opacity: 1;
          color: #ffffff;
        }

        .stat-content p {
          margin: 0.25rem 0 0;
          font-family: 'Outfit', sans-serif;
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          opacity: 1;
          color: #ffffff;
        }

        .stat-footer-text {
          margin-top: 0.25rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          opacity: 0.95;
          z-index: 1;
          letter-spacing: 0.05em;
          color: #ffffff;
        }

        .action-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .back-link-p {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          color: #0369a1;
          font-weight: 600;
          text-decoration: none;
          background: transparent;
          padding: 0.65rem 1.1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid #e2e8f0;
          font-size: 0.85rem;
          text-transform: uppercase;
        }

        .back-link-p:hover {
          border-color: #0369a1;
          background: #f0f9ff;
        }

        .search-row {
          display: flex;
          gap: 0.75rem;
          flex: 1;
          min-width: 300px;
          align-items: center;
        }

        .search-box-premium {
          flex: 1;
          position: relative;
        }

        .search-box-premium input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.95rem;
          outline: none;
          font-weight: 500;
          background: #f1f5f9;
          color: #000000;
          transition: all 0.2s;
        }

        .search-box-premium input:focus {
          border-color: #0369a1;
          background: transparent;
        }

        .search-box-premium i {
          position: absolute;
          left: 1.2rem;
          top: 50%;
          transform: translateY(-50%);
          color: #0369a1;
          font-size: 1rem;
        }

        .filter-btn-toggle {
          padding: 0.75rem 1.25rem;
          background: transparent;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          color: #000000;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .filter-btn-toggle:hover, .filter-btn-toggle.active {
          border-color: #0369a1;
          color: #0369a1;
          background: #f0f9ff;
        }

        .export-btn {
          padding: 0.75rem 1.5rem;
          background: #0369a1;
          color: #ffffff;
          border: none;
          border-radius: 0.5rem;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.8rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          transition: all 0.2s;
        }

        .export-btn:hover {
          background: #075985;
          transform: scale(1.02);
        }

        /* ─── Pagination Toolbar ────────────────────────────────────────── */
        .pagination-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1rem 1.5rem;
          background: transparent;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
        }

        .show-entries {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.85rem;
          color: #000000;
          font-weight: 600;
        }

        .show-entries select {
          padding: 0.45rem 0.75rem;
          border-radius: 0.4rem;
          border: 1px solid #e2e8f0;
          outline: none;
          font-weight: 700;
          color: #000000;
          cursor: pointer;
          background: transparent;
        }

        .pagination-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pagination-btn {
          width: 38px;
          height: 38px;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          background: transparent;
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pagination-btn:hover {
          background: #f0f9ff;
          color: #0369a1;
          transform: translateY(-1px);
        }

        .pagination-btn.active {
          background: #0369a1;
          color: #ffffff;
          border-color: #0369a1;
        }

        .pagination-btn.disabled {
          opacity: 0.4;
          cursor: not-allowed;
          pointer-events: none;
        }

        /* ─── Advanced Filters ────────────────────────────────────────── */
        .advanced-filters-panel {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 2.5rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #000000;
          letter-spacing: 0.05em;
        }

        .filter-group select {
          padding: 0.6rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          outline: none;
          font-weight: 600;
          background: transparent;
          font-size: 0.85rem;
          color: #000000;
        }

        /* ─── Table Design ────────────────────────────────────────── */
        .prog-table-header {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 120px;
          padding: 1.25rem 2rem;
          background: #0369a1;
          color: #ffffff;
          border-radius: 0;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          margin-bottom: 0px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .prog-list-premium {
          display: flex;
          flex-direction: column;
          border: none;
          border-radius: 0;
          overflow: hidden;
          background: transparent;
        }

        .prog-row-premium {
          background: transparent;
          padding: 1.25rem 2rem;
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 120px;
          align-items: center;
          transition: all 0.2s ease;
          position: relative;
          border-bottom: 1px solid #e2e8f0;
        }

        .prog-row-premium:last-child {
          border-bottom: none;
        }

        .prog-row-premium:nth-child(even) {
          background: #f1f5f9;
        }

        .prog-row-premium:hover {
          background: #e0f2fe !important;
          transform: scale(1.002);
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
        }

        .prog-info h3 {
          font-size: 1.05rem;
          font-weight: 700;
          color: #000000;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .prog-info h3 i {
          color: #0369a1;
          font-size: 0.9rem;
        }

        .level-tag {
          display: inline-flex;
          padding: 0.3rem 0.75rem;
          background: #f0f9ff;
          color: #0369a1;
          border-radius: 0.4rem;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          border: 1px solid #bae6fd;
        }

        .dept-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #000000;
          font-weight: 600;
        }

        .explore-btn {
          background: #0369a1;
          color: #ffffff;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.4rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
        }

        .explore-btn:hover {
          background: #075985;
          transform: scale(1.05);
        }

        .loading-state {
          text-align: center;
          padding: 5rem;
          color: #0369a1;
          font-weight: 700;
          font-size: 1.5rem;
        }

        @media (max-width: 900px) {
          .prog-table-header { grid-template-columns: 1.5fr 1fr 80px; }
          .prog-row-premium { grid-template-columns: 1.5fr 1fr 80px; }
          .dept-info { display: none; }
        }
      `}</style>

      <div className="programmes-container">
        {/* Statistics Bar restored */}
        <div className="stats-bar">
          <div className="stat-card-mini card-1">
            <div className="stat-icon-floating"><i className="fas fa-briefcase"></i></div>
            <div className="stat-content">
              <h4>Academic Programmes</h4>
              <p>{programmes.length}</p>
            </div>
            <div className="stat-footer-text">
              Active Curriculum
            </div>
          </div>
          
          <div className="stat-card-mini card-2">
            <div className="stat-icon-floating"><i className="fas fa-folder-open"></i></div>
            <div className="stat-content">
              <h4>Departments</h4>
              <p>{coordinator ? 1 : [...new Set(allCoordinators.map(c => c.department))].length}</p>
            </div>
            <div className="stat-footer-text">
              Faculty Overview
            </div>
          </div>

          <div className="stat-card-mini card-3">
            <div className="stat-icon-floating"><i className="fas fa-user-graduate"></i></div>
            <div className="stat-content">
              <h4>Education Level</h4>
              <p>UG / PG</p>
            </div>
            <div className="stat-footer-text">
              Student Track
            </div>
          </div>
        </div>

        <div className="action-row">
          <div className="search-row">
            {coordinator && (
              <button className="back-link-p" onClick={() => navigate("/admin/coordinators")}>
                <i className="fas fa-arrow-left"></i>
                Back
              </button>
            )}
            <div className="search-box-premium">
              <i className="fas fa-search"></i>
              <input 
                type="text" 
                placeholder="Search programmes..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              className={`filter-btn-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <i className="fas fa-filter"></i>
              Filters
            </button>
          </div>

          <button className="export-btn" onClick={handleExport}>
            <i className="fas fa-file-export"></i>
            Export
          </button>
        </div>

        {showFilters && (
          <div className="advanced-filters-panel">
            <div className="filter-group">
              <label>Academic Level</label>
              <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
                <option value="all">All Levels</option>
                <option value="UG">Undergraduate (UG)</option>
                <option value="PG">Postgraduate (PG)</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Sort Order</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
            </div>
          </div>
        )}

        {/* Pagination Toolbar */}
        <div className="pagination-toolbar">
          <div className="show-entries">
            <span>Show</span>
            <select 
              value={itemsPerPage} 
              onChange={(e) => {
                const val = e.target.value;
                setItemsPerPage(val === 'all' ? 'all' : parseInt(val));
              }}
            >
              <option value={5}>5 Entries</option>
              <option value={10}>10 Entries</option>
              <option value={20}>20 Entries</option>
              <option value={50}>50 Entries</option>
              <option value="all">Show All</option>
            </select>
            <span>of {filteredProgrammes.length} records</span>
          </div>

          <div className="pagination-wrap">
            <button 
              className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={() => paginate(currentPage - 1)}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i + 1}
                className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => paginate(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button 
              className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
              onClick={() => paginate(currentPage + 1)}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        {filteredProgrammes.length === 0 ? (
          <div className="empty-p">
            <i className="fas fa-search" style={{fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem'}}></i>
            <p>No programmes match your current filters.</p>
          </div>
        ) : (
          <div className="prog-list-view">
            <div className="prog-table-header">
              <span>Programme</span>
              <span>Department</span>
              <span>Level</span>
              <span style={{textAlign: 'right'}}>Action</span>
            </div>
            
            <div className="prog-list-premium">
              {currentItems.map((programme, index) => {
                const parentCoord = !coordinator && allCoordinators.find(c => c.programmes?.includes(programme));
                const currentId = coordinator?.id || parentCoord?.id;
                
                const isPG = programme.startsWith('MA') || programme.startsWith('MSc') || programme.startsWith('MCA') || programme.startsWith('MBA');

                const handleExplore = (e) => {
                  e.stopPropagation();
                  if (!currentId) return;
                  navigate(`/admin/students/coordinator/${currentId}`, {
                    state: { coordinator: coordinator || parentCoord, programme },
                  });
                };

                return (
                  <div 
                    key={index} 
                    className="prog-row-premium"
                    onClick={handleExplore}
                  >
                    <div className="prog-info">
                      <h3>
                        <i className="fas fa-graduation-cap"></i>
                        {programme.replace(/_/g, ' ')}
                      </h3>
                    </div>
                    
                    <div className="dept-info">
                      <i className="fas fa-building" style={{color: '#0369a1'}}></i>
                      {coordinator?.department || parentCoord?.department || "General"}
                    </div>

                    <div className="level-cell">
                      <span className="level-tag">{isPG ? "PG" : "UG"}</span>
                    </div>

                    <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                      <button className="explore-btn" onClick={handleExplore}>
                        Explore
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
}