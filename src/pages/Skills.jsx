// src/pages/Skills.jsx
import React, { useEffect, useState } from "react";

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [skillName, setSkillName] = useState("");
  const [editingSkill, setEditingSkill] = useState(null);
  const [editName, setEditName] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination & Filtering States
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, az, za

  // Load student ID
  const loadProfile = async () => {
    const email = localStorage.getItem("studentEmail");
    if (!email) {
      setError("No email found. Please login again.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/api/students/profile/?email=${email}`);
      const data = await res.json();
      if (data.student?.id) {
        setStudentId(data.student.id);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError("Failed to load profile");
    }
  };

  // Load skills
  const loadSkills = async (sid) => {
    if (!sid) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8000/api/students/skill/list/?student=${sid}`);
      if (!res.ok) throw new Error("Failed to load skills");
      const data = await res.json();
      setSkills(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load skills:", err);
      setError("Could not load skills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (studentId) loadSkills(studentId);
  }, [studentId]);

  const addSkill = async () => {
    if (!skillName.trim()) {
      setError("Please enter a skill name");
      return;
    }

    if (!studentId) {
      setError("No student profile found. Please login again.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("student", studentId);
    formData.append("skill_name", skillName.trim());

    try {
      const res = await fetch("http://localhost:8000/api/students/skill/add/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to add skill");

      setSkillName("");
      loadSkills(studentId);
      setCurrentPage(1); // Go back to page 1 to see new skill
    } catch (err) {
      console.error("Add skill error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (skill) => {
    setEditingSkill(skill);
    setEditName(skill.skill_name);
  };

  const cancelEdit = () => {
    setEditingSkill(null);
    setEditName("");
    setError(null);
  };

  const saveEdit = async () => {
    if (!editName.trim()) {
      setError("Skill name cannot be empty");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("skill_name", editName.trim());

    try {
      const res = await fetch(`http://localhost:8000/api/students/skill/edit/${editingSkill.id}/`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to update skill");

      setEditingSkill(null);
      setEditName("");
      loadSkills(studentId);
    } catch (err) {
      console.error("Update skill error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const deleteSkill = async (skillId) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:8000/api/students/skill/delete/${skillId}/`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete skill");

      loadSkills(studentId);
    } catch (err) {
      console.error("Delete skill error:", err);
      setError("Could not delete skill");
    } finally {
      setLoading(false);
    }
  };

  // 1. Filter, 2. Sort, 3. Paginate
  let processedSkills = skills.filter((skill) =>
    skill.skill_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  processedSkills.sort((a, b) => {
    if (sortBy === "az") return a.skill_name.localeCompare(b.skill_name);
    if (sortBy === "za") return b.skill_name.localeCompare(a.skill_name);
    if (sortBy === "oldest") return a.id - b.id;
    return b.id - a.id; // newest (default)
  });

  const totalEntries = processedSkills.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentSkills = processedSkills.slice(indexOfFirstEntry, indexOfLastEntry);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        :root {
          --primary-pro: #0f766e;
          --accent-pro: #0d9488;
          --accent-hover: #0f766e;
          --bg-pro: #f8fafc;
          --card-pro: #ffffff;
          --text-pro: #1e293b;
          --text-muted-pro: #64748b;
          --border-pro: #e2e8f0;
          --danger-pro: #ef4444;
          --shadow-pro: 0 1px 3px 0 rgb(0 0 0 / 0.1);
        }

        .skills-container-pro {
          font-family: 'Inter', sans-serif;
          background-color: var(--bg-pro);
          min-height: 100vh;
          padding: 1.5rem;
          color: var(--text-pro);
          max-width: 1000px;
          margin: 0 auto;
        }

        .skills-banner-pro {
          background-color: var(--primary-pro);
          border-radius: 12px;
          padding: 1.5rem 2rem;
          margin-bottom: 2rem;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        .banner-content-pro h1 { font-size: 1.65rem; font-weight: 700; margin: 0; }
        .banner-content-pro p { margin-top: 0.35rem; font-size: 0.95rem; opacity: 0.9; margin-bottom: 0; }
        .banner-icon-pro { font-size: 2.5rem; opacity: 0.7; }

        .action-card-pro {
          background: var(--card-pro);
          border: 1px solid var(--border-pro);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .input-group-pro { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .input-pro {
          flex: 1; min-width: 200px; padding: 0.75rem 1rem;
          border: 1.5px solid var(--border-pro); border-radius: 8px; font-size: 0.95rem;
        }
        .input-pro:focus { outline: none; border-color: var(--accent-pro); box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1); }

        .btn-add-pro {
          padding: 0.75rem 1.5rem; background: var(--accent-pro); color: white;
          border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s;
        }
        .btn-add-pro:hover { background: var(--accent-hover); transform: translateY(-1px); }

        /* Filter Controls */
        .controls-row-pro {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap;
        }

        .left-controls, .right-controls { display: flex; align-items: center; gap: 0.75rem; }

        .select-pro {
          padding: 0.5rem 2rem 0.5rem 0.75rem; border: 1px solid var(--border-pro);
          border-radius: 8px; font-size: 0.85rem; color: var(--text-pro);
          background-color: white; cursor: pointer; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2364748b' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 0.75rem center;
        }

        .search-container-pro { position: relative; max-width: 300px; }
        .search-container-pro i { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted-pro); pointer-events: none; }
        .search-bar-pro { padding-left: 2.25rem; }

        /* Skills Grid */
        .skills-grid-pro {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 0.75rem; margin-bottom: 2rem;
        }

        .skill-tile-pro {
          background: white; border: 1px solid var(--border-pro); border-radius: 10px;
          padding: 0.85rem 1.25rem; display: flex; justify-content: space-between; align-items: center;
          transition: 0.2s;
        }
        .skill-tile-pro:hover { border-color: var(--accent-pro); box-shadow: var(--shadow-pro); }
        .skill-name-pro { font-size: 0.95rem; font-weight: 600; color: var(--text-pro); margin: 0; }

        .btn-icon-pro {
          width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
          border-radius: 6px; border: 1px solid var(--border-pro); color: var(--text-muted-pro);
          background: transparent; cursor: pointer; transition: 0.2s;
        }
        .btn-icon-pro:hover { color: var(--accent-pro); border-color: var(--accent-pro); }
        .btn-icon-delete:hover { color: var(--danger-pro); border-color: var(--danger-pro); }

        /* Pagination */
        .pagination-container-pro {
          display: flex; justify-content: space-between; align-items: center;
          padding-top: 1.5rem; border-top: 1px solid var(--border-pro); flex-wrap: wrap; gap: 1rem;
        }

        .pagination-info-pro { font-size: 0.85rem; color: var(--text-muted-pro); }
        .pagination-nav-pro { display: flex; gap: 0.4rem; }
        .page-btn-pro {
          min-width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
          border-radius: 6px; border: 1px solid var(--border-pro); background: white;
          font-size: 0.85rem; font-weight: 600; color: var(--text-pro); cursor: pointer; transition: 0.2s;
        }
        .page-btn-pro:hover:not(:disabled) { border-color: var(--accent-pro); color: var(--accent-pro); }
        .page-btn-pro.active { background: var(--accent-pro); color: white; border-color: var(--accent-pro); }
        .page-btn-pro:disabled { opacity: 0.4; cursor: not-allowed; }

        .animate-pro { animation: slideUp 0.3s ease-out forwards; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="skills-container-pro">
        <header className="skills-banner-pro animate-pro">
          <div className="banner-content-pro">
            <h1>My Skills</h1>
            <p>Manage and refine your professional technical portfolio.</p>
          </div>
          <div className="banner-icon-pro"><i className="bi bi-tools"></i></div>
        </header>

        <main>
          <section className="action-card-pro animate-pro" style={{ animationDelay: "0.05s" }}>
            {error && (
              <div className="alert alert-danger py-2 px-3 mb-3 d-flex align-items-center gap-2" style={{ fontSize: "0.85rem", borderRadius: "8px" }}>
                <i className="bi bi-exclamation-triangle-fill"></i> {error}
              </div>
            )}
            <div className="input-group-pro">
              <input
                className="input-pro"
                type="text"
                placeholder="Enter a professional skill (e.g. JavaScript, AWS, Marketing)"
                value={editingSkill ? editName : skillName}
                onChange={(e) => editingSkill ? setEditName(e.target.value) : setSkillName(e.target.value)}
                disabled={loading}
              />
              <button className="btn-add-pro" onClick={editingSkill ? saveEdit : addSkill} disabled={loading || !(editingSkill ? editName : skillName).trim()}>
                {loading ? <span className="spinner-border spinner-border-sm" role="status"></span> : (editingSkill ? "Update" : "Add Skill")}
              </button>
              {editingSkill && <button className="btn-icon-pro" style={{ width: "auto", padding: "0 1rem", border: "none" }} onClick={cancelEdit}>Cancel</button>}
            </div>
          </section>

          {/* Filtering & Entries Row */}
          <div className="controls-row-pro animate-pro" style={{ animationDelay: "0.1s" }}>
            <div className="left-controls">
              <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted-pro)" }}>Show</span>
              <select className="select-pro" value={entriesPerPage} onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                <option value={5}>5 entries</option>
                <option value={10}>10 entries</option>
                <option value={20}>20 entries</option>
                <option value={50}>50 entries</option>
              </select>
            </div>
            
            <div className="right-controls">
              <div className="search-container-pro">
                <i className="bi bi-search"></i>
                <input type="text" className="input-pro search-bar-pro py-1" placeholder="Search..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
              </div>
              <select className="select-pro" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="az">Alphabetical A-Z</option>
                <option value="za">Alphabetical Z-A</option>
              </select>
            </div>
          </div>

          <section className="animate-pro" style={{ animationDelay: "0.15s" }}>
            {loading && skills.length === 0 ? (
              <div className="text-center p-5 opacity-50"><div className="spinner-border spinner-border-sm me-2"></div>Loading items...</div>
            ) : processedSkills.length === 0 ? (
              <div className="text-center py-5 border rounded-3 bg-white opacity-75">
                <i className="bi bi-search d-block h1 mb-2 opacity-25"></i>
                <p className="mb-0">No matches found for "{searchQuery}"</p>
              </div>
            ) : (
              <>
                <div className="skills-grid-pro">
                  {currentSkills.map((skill) => (
                    <div key={skill.id} className="skill-tile-pro">
                      <div style={{ flex: 1 }}>
                        {editingSkill?.id === skill.id ? (
                          <input className="input-pro w-100 py-1" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus onKeyDown={(e) => e.key === "Enter" && saveEdit()} />
                        ) : <p className="skill-name-pro">{skill.skill_name}</p>}
                      </div>
                      <div className="d-flex gap-2 ms-3">
                        <button className="btn-icon-pro" onClick={() => startEdit(skill)} title="Edit">
                          <i className={editingSkill?.id === skill.id ? "bi bi-check-lg" : "bi bi-pencil"}></i>
                        </button>
                        <button className="btn-icon-pro btn-icon-delete" onClick={() => deleteSkill(skill.id)} title="Delete"><i className="bi bi-trash"></i></button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Status & Nav */}
                <div className="pagination-container-pro">
                  <div className="pagination-info-pro">
                    Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, totalEntries)} of {totalEntries} entries
                    {searchQuery && ` (filtered from ${skills.length} total)`}
                  </div>
                  <div className="pagination-nav-pro">
                    <button className="page-btn-pro" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} title="Previous">
                      <i className="bi bi-chevron-left"></i>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                      <button key={n} className={`page-btn-pro ${currentPage === n ? "active" : ""}`} onClick={() => paginate(n)}>{n}</button>
                    ))}
                    <button className="page-btn-pro" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} title="Next">
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </>
  );
};

export default Skills;