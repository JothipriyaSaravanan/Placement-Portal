// src/pages/coordinator/CoordinatorDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";

export default function CoordinatorDashboard() {
  const [coordinatorName, setCoordinatorName] = useState("");
  const [department, setDepartment] = useState("");
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeJobs: 0,
    completeJobs: 0,
    placedStudents: 0,
    approvedJobs: 0,
    pendingJobs: 0
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [yearData, setYearData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const navigate = useNavigate();
  const API_BASE = "http://127.0.0.1:8000/coordinator";

  useEffect(() => {
    const username = localStorage.getItem("coordinatorUsername");
    const dept = localStorage.getItem("department");

    if (!username) {
      navigate("/coordinator/login");
      return;
    }

    setCoordinatorName(username);
    setDepartment(dept || "Department");

    fetchDashboardData();

    // Realtime feel: refresh every 2 minutes
    const interval = setInterval(fetchDashboardData, 120000);
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setFetchError(null);

      const dept = localStorage.getItem("department") || "MA_Tamil";

      const [statsRes, pieRes, yearRes, activityRes] = await Promise.all([
        axios.get(`${API_BASE}/dashboard-stats/`, { params: { department: dept }, withCredentials: true }),
        axios.get(`${API_BASE}/department-placement-stats/`, { params: { department: dept }, withCredentials: true }),
        axios.get(`${API_BASE}/year-wise-placement-trend/`, { params: { department: dept }, withCredentials: true }),
        axios.get(`${API_BASE}/recent-activity/`, { params: { department: dept }, withCredentials: true }),
      ]);

      const statsData = statsRes.data;
      const pieData = pieRes.data;

      setStats({
        totalStudents: statsData.total_students || 0,
        activeJobs: statsData.active_jobs || 0,
        completeJobs: statsData.complete_jobs || 0,
        placedStudents: statsData.placed_students || pieData.placed_students || 0,
        approvedJobs: statsData.approved_jobs || 0,
        pendingJobs: statsData.pending_jobs || 0
      });

      setYearData(yearRes.data || []);
      setRecentStudents(activityRes.data.activity || []);

    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setFetchError(error.response?.data?.error || error.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const pieChartData = [
    { name: "Placed", value: stats.placedStudents, color: "#22d3ee" },
    { name: "In Process", value: stats.approvedJobs, color: "#3b82f6" },
    { name: "Pending", value: stats.pendingJobs, color: "#2dd4bf" },
    { 
      name: "Unplaced", 
      value: Math.max(0, stats.totalStudents - stats.placedStudents - stats.approvedJobs - stats.pendingJobs), 
      color: "#a5b4fc" 
    },
  ];

  if (loading) {
    return (
      <div className="page-wrapper h-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: "3.5rem", height: "3.5rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted fs-5 fw-medium">Preparing Your Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        body { background-color: #f7f9fc; }
        .page-wrapper {
          padding: 2rem;
          max-width: 1550px;
          margin: 0 auto;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* ─── Hero & Stats Banner ─────────────────────────────────── */
        .top-banner-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          grid-auto-rows: 1fr;
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .hero-banner {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          border-radius: 1.25rem;
          padding: 1.25rem 1.5rem;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 12px 24px -10px rgba(124, 58, 237, 0.2);
          min-height: 170px;
        }

        .hero-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.35rem;
          font-weight: 800;
          margin-bottom: 1rem;
          line-height: 1.1;
          max-width: 65%;
          z-index: 2;
        }

        .hero-btn {
          background: white;
          color: #7c3aed;
          padding: 0.55rem 1.2rem;
          border-radius: 10px;
          border: none;
          font-weight: 800;
          font-size: 0.75rem;
          width: fit-content;
          transition: all 0.3s;
          z-index: 2;
        }

        .hero-image-overlay {
          position: absolute;
          right: -5px;
          bottom: -5px;
          width: 130px;
          height: 130px;
          opacity: 0.8;
          z-index: 1;
        }

        .stat-square {
          border-radius: 1.25rem;
          padding: 1.25rem;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(0,0,0,0.04);
          position: relative;
          overflow: hidden;
          min-height: 170px;
        }

        .stat-square-pink { background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); }
        .stat-square-teal { background: linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%); }
        .stat-square-orange { background: linear-gradient(135deg, #fb923c 0%, #f97316 100%); }

        .stat-square .icon-box {
          width: 36px;
          height: 36px;
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
        }

        .stat-square .label { font-size: 0.8rem; font-weight: 700; opacity: 0.9; margin-bottom: 0.15rem; }
        .stat-square .value { font-family: 'Sora', sans-serif; font-size: 1.65rem; font-weight: 800; margin-bottom: 0.2rem; line-height: 1; }
        .stat-square .trend { font-size: 0.65rem; font-weight: 700; display: flex; align-items: center; gap: 4px; }

        /* ─── Analytics Grids ─────────────────────────────────────── */
        .analytics-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .chart-container-card {
          background: white;
          border-radius: 2.5rem;
          padding: 2.5rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .card-title { font-family: 'Outfit', sans-serif; font-size: 1.4rem; font-weight: 700; color: #1e293b; margin: 0; }
        
        .date-dropdown {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
        }

        .donut-wrapper {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .donut-center-text {
          position: absolute;
          text-align: center;
        }

        /* ─── Table Section ────────────────────────────────────────── */
        .report-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .table-card { background: white; border-radius: 2.5rem; padding: 2.5rem; }
        
        .modern-table { width: 100%; border-collapse: separate; border-spacing: 0 0.75rem; }
        .modern-table th { padding: 0 1rem; font-size: 0.85rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; border: none; }
        .modern-table td { padding: 1.25rem 1rem; vertical-align: middle; background: transparent; border-bottom: 1px solid #f1f5f9; }

        .user-cell { display: flex; align-items: center; gap: 1rem; }
        .avatar { width: 44px; height: 44px; border-radius: 12px; object-fit: cover; }
        .user-name { font-weight: 700; color: #1e293b; font-size: 1rem; }

        .status-placed, .status-selected { background: #dcfce7; color: #15803d; }
        .status-pending, .status-applied { background: #e0f2fe; color: #075985; }
        .status-shortlisted { background: #fef9c3; color: #854d0e; }
        .status-rejected { background: #fee2e2; color: #991b1b; }

        @media (max-width: 1400px) {
          .top-banner-grid { grid-template-columns: 2fr 1fr 1fr; }
          .stat-square:last-child { display: none; }
        }

        @media (max-width: 1200px) {
          .analytics-grid, .report-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .top-banner-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page-wrapper">
        <div className="top-banner-grid">
          <div className="hero-banner">
            <h1 className="hero-title">Accelerate Your Department's Placement Success.</h1>
            <button className="hero-btn" onClick={() => navigate("/coordinator/students")}>Explore Student List</button>
            <img 
              className="hero-image-overlay" 
              src="https://static.vecteezy.com/system/resources/previews/022/484/513/original/golden-trophy-3d-render-icon-illustration-png.png" 
              alt="Placement Success Trophy" 
              onError={(e) => {
                e.target.src = "https://cdn-icons-png.flaticon.com/512/3112/3112946.png"; // Trophy flat fallback
              }}
            />
          </div>

          <div className="stat-square stat-square-pink">
            <div className="icon-box"><i className="fas fa-users"></i></div>
            <div className="label">Total Students</div>
            <div className="value">{stats.totalStudents}</div>
            <div className="trend"><i className="fas fa-arrow-up"></i> +8.2% Since last year</div>
          </div>

          <div className="stat-square stat-square-teal">
            <div className="icon-box"><i className="fas fa-briefcase"></i></div>
            <div className="label">Active Jobs</div>
            <div className="value">{stats.activeJobs}</div>
            <div className="trend"><i className="fas fa-check-circle"></i> On pace</div>
          </div>

          <div className="stat-square stat-square-orange">
            <div className="icon-box"><i className="fas fa-award"></i></div>
            <div className="label">Placed Today</div>
            <div className="value">{stats.placedStudents}</div>
            <div className="trend"><i className="fas fa-chart-line"></i> +2.2% This month</div>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="chart-container-card">
            <div className="card-header">
              <h3 className="card-title">Placement Distribution</h3>
              <select className="date-dropdown"><option>Total Students</option></select>
            </div>
            <div className="donut-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={105}
                    dataKey="value"
                    paddingAngle={8}
                    stroke="none"
                  >
                    {pieChartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center-text">
                <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>Total</div>
                <div style={{ color: '#1e293b', fontSize: '1.4rem', fontWeight: 800 }}>{stats.totalStudents}</div>
              </div>
            </div>
          </div>

          <div className="chart-container-card">
            <div className="card-header">
              <h3 className="card-title">Placement Trend</h3>
              <select className="date-dropdown"><option>Monthly</option></select>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={yearData.length > 0 ? yearData : [
                { year: 'Jan', placed_students: 45 }, { year: 'Feb', placed_students: 52 },
                { year: 'Mar', placed_students: 38 }, { year: 'Apr', placed_students: 85 },
                { year: 'May', placed_students: 48 }, { year: 'Jun', placed_students: 62 },
                { year: 'Jul', placed_students: 55 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="placed_students" radius={[6, 6, 0, 0]} barSize={35}>
                  {(yearData.length > 0 ? yearData : []).map((entry, index) => (
                    <Cell key={index} fill={index === 3 ? '#6d28d9' : '#e2e8f0'} />
                  ))}
                  {yearData.length === 0 && [0,1,2,3,4,5,6].map(i => <Cell key={i} fill={i === 3 ? '#6d28d9' : '#e2e8f0'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="report-grid">
          <div className="table-card">
            <div className="card-header">
              <h3 className="card-title">Recent Student Activity</h3>
            </div>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Batch</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.length > 0 ? (
                  recentStudents.map((s, i) => (
                    <tr key={i}>
                      <td>
                        <div className="user-cell">
                          <img className="avatar" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random`} alt="" />
                          <span className="user-name">{s.name}</span>
                        </div>
                      </td>
                      <td><span style={{ fontWeight: 600, color: '#64748b' }}>{s.batch || "N/A"}</span></td>
                      <td><span style={{ fontWeight: 600, color: '#1e293b' }}>{s.dept || "N/A"}</span></td>
                      <td>
                        <span className={`status-tag status-${s.status?.toLowerCase() || 'pending'}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      <div className="text-muted">
                        <i className="fas fa-history fa-2x mb-3 opacity-20"></i>
                        <p className="mb-0">No recent activity recorded for your department.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}