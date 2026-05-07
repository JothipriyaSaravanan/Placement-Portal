
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  Legend,
} from "recharts";

const API = "http://localhost:8000/admin-panel";

export default function Dashboard() {
  const COLORS = ["#4f46e5", "#10b981", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6"];
  const [activeTab, setActiveTab] = useState("General");

  // General tab data
  const [data, setData] = useState({
    totalStudents: 0,
    totalCompanies: 0,
    totalJobs: 0,
    totalJobsApproved: 0,
    totalJobsPending: 0,
    totalSelected: 0,
  });
  const [yearDeptStats, setYearDeptStats] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // Students tab data
  const [studentsPerDept, setStudentsPerDept] = useState([]);
  const [ugPgDistribution, setUgPgDistribution] = useState([]);
  const [studentsPerBatch, setStudentsPerBatch] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(null);

  // Companies tab data
  const [jobsPerCompany, setJobsPerCompany] = useState([]);
  const [jobTypesDistribution, setJobTypesDistribution] = useState([]);
  const [monthlyJobsTrend, setMonthlyJobsTrend] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState(null);

  // Jobs tab data (same structure)
  const [jobsByType, setJobsByType] = useState([]);
  const [jobsByLocation, setJobsByLocation] = useState([]);
  const [monthlyJobsPostedTrend, setMonthlyJobsPostedTrend] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState(null);

  // Reports tab data
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState(null);
  const [placementSummary, setPlacementSummary] = useState({
    total_students: 0,
    total_placed: 0,
    placement_percentage: 0,
    top_department: "N/A",
    top_dept_count: 0,
  });
  const [placementByDepartment, setPlacementByDepartment] = useState([]);
  const [placementTrend, setPlacementTrend] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [salaryDistribution, setSalaryDistribution] = useState([]);
  const [exportStatus, setExportStatus] = useState({
    overall: "",
    department: "",
    batch: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (activeTab === "Students") {
      fetchStudentsData();
    }
    if (activeTab === "Companies") {
      fetchCompaniesData();
    }
  }, [activeTab]);

  const fetchDashboard = async () => {
    try {
      const responses = await Promise.all([
        axios.get(`${API}/total-students/`),
        axios.get(`${API}/total-companies/`),
        axios.get(`${API}/total-jobs/`),
        axios.get(`${API}/approved-jobs-count/`),
        axios.get(`${API}/pending-jobs-count/`),
        axios.get(`${API}/total-selected/`),
        axios.get(`${API}/stats/year-department-analysis/`),
      ]);

      setData({
        totalStudents: responses[0]?.data?.total_students || responses[0]?.data?.count || 0,
        totalCompanies: responses[1]?.data?.total_companies || responses[1]?.data?.count || 0,
        totalJobs: responses[2]?.data?.total_jobs || responses[2]?.data?.count || 0,
        totalJobsApproved: responses[3]?.data?.approved_jobs || responses[3]?.data?.approved || 0,
        totalJobsPending: responses[4]?.data?.pending_jobs || responses[4]?.data?.pending || 0,
        totalSelected: responses[5]?.data?.total_selected || responses[5]?.data?.selected || 0,
      });

      const yearData = responses[6]?.data || [];
      const mapped = yearData.map((item) => ({
        year: item.year ?? item.batch ?? "Unknown",
        department: item.department || item.dept || item.department_name || item.name || "Unknown",
        placed_students: Number(item.placed_students || item.placed || item.selected || item.total_selected || 0),
      }));

      setYearDeptStats(mapped);

      const uniqueDepts = [...new Set(mapped.map((item) => item.department))].filter(Boolean);
      if (uniqueDepts.length > 0 && !selectedDepartment) {
        setSelectedDepartment(uniqueDepts[0]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setLoading(false);
    }
  };

  const fetchStudentsData = async () => {
    setStudentsLoading(true);
    setStudentsError(null);
    try {
      const responses = await Promise.allSettled([
        axios.get(`${API}/students-per-department/`),
        axios.get(`${API}/students-ug-pg-distribution/`),
        axios.get(`${API}/students-per-batch/`),
      ]);

      const deptData = responses[0].status === "fulfilled" ? responses[0].value.data : [];
      const ugPgData = responses[1].status === "fulfilled" ? responses[1].value.data : [];
      const batchData = responses[2].status === "fulfilled" ? responses[2].value.data : [];

      setStudentsPerDept(deptData || []);
      setUgPgDistribution(ugPgData || []);
      setStudentsPerBatch(batchData || []);
    } catch (err) {
      console.error("Students fetch error:", err);
      setStudentsError("Failed to load student statistics.");
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchCompaniesData = async () => {
    setCompaniesLoading(true);
    setCompaniesError(null);
    try {
      const [companyRes, typesRes, trendRes] = await Promise.all([
        axios.get(`${API}/jobs-per-company/`),
        axios.get(`${API}/job-types-distribution/`),
        axios.get(`${API}/monthly-jobs-trend/`),
      ]);

      setJobsPerCompany(companyRes.data || []);
      setJobTypesDistribution(typesRes.data || []);
      setMonthlyJobsTrend(trendRes.data || []);
    } catch (err) {
      console.error("Companies fetch error:", err);
      setCompaniesError("Failed to load company statistics.");
    } finally {
      setCompaniesLoading(false);
    }
  };

  const fetchJobsData = async () => {
    setJobsLoading(true);
    setJobsError(null);
    try {
      const [trendRes] = await Promise.all([
        axios.get(`${API}/monthly-jobs-posted-trend/`),
      ]);

      // Set empty for APIs that don't exist
      setJobsByType([]);
      setJobsByLocation([]);
      setMonthlyJobsPostedTrend(trendRes.data || []);
    } catch (err) {
      console.error("Jobs fetch error:", err);
      setJobsError("Failed to load job statistics.");
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchReportsData = async () => {
    setReportsLoading(true);
    setReportsError(null);

    try {
      const res = await axios.get(`${API}/reports/consolidated/`);
      const { summary, placementByDepartment, placementTrend, topStudents, topCompanies, salaryDistribution } = res.data;

      if (summary) {
        setPlacementSummary({
          total_students: Number(summary.total_students || data.totalStudents || 0),
          total_placed: Number(summary.total_placed || data.totalSelected || 0),
          placement_percentage: Number(summary.placement_percentage || 0),
          top_department: summary.top_department || "N/A",
          top_dept_count: Number(summary.top_dept_count || 0),
        });
      }

      setPlacementByDepartment(Array.isArray(placementByDepartment) ? placementByDepartment : []);
      setPlacementTrend(Array.isArray(placementTrend) ? placementTrend : []);
      setTopStudents(Array.isArray(topStudents) ? topStudents : []);
      setTopCompanies(Array.isArray(topCompanies) ? topCompanies : []);
      setSalaryDistribution(Array.isArray(salaryDistribution) ? salaryDistribution : []);

    } catch (err) {
      console.error("Reports fetch error:", err);
      // Fail-safe summary
      setPlacementSummary({
        total_students: data.totalStudents,
        total_placed: data.totalSelected,
        placement_percentage: data.totalStudents ? Number(((data.totalSelected/data.totalStudents)*100).toFixed(1)) : 0,
        top_department: "General",
        top_dept_count: data.totalSelected
      });
    } finally {
      setReportsLoading(false);
    }
  };

  // General Chart Data (unchanged)
  const jobChartData = [
    { name: "Total", value: data.totalJobs },
    { name: "Approved", value: data.totalJobsApproved },
    { name: "Pending", value: data.totalJobsPending },
  ];

  const placementChartData = [
    { name: "Selected", value: data.totalSelected },
    { name: "Not Selected", value: Math.max(0, data.totalStudents - data.totalSelected) },
  ];



  const handleExport = async (type) => {
  try {
    setExportStatus((prev) => ({ ...prev, [type]: "Downloading..." }));

    const response = await axios.get(`${API}/reports/export/${type}/`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    link.setAttribute("download", `${type}_report`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    setExportStatus((prev) => ({ ...prev, [type]: "Downloaded ✅" }));
  } catch (err) {
    console.error("Export error:", err);
    setExportStatus((prev) => ({ ...prev, [type]: "Failed ❌" }));
  }
};

  const departments = [...new Set(yearDeptStats.map((item) => item.department))].filter(Boolean);
  const filteredYearData = yearDeptStats
    .filter((item) => item.department === selectedDepartment)
    .sort((a, b) => Number(a.year) - Number(b.year));

  const activeJobChartData = jobChartData;
  const activePlacementChartData = placementChartData;
  const activeYearData = filteredYearData;

  const deptBarData = placementByDepartment.map((item) => ({
    department: item.department || item.dept || item.department_name || item.name || "Unknown",
    placed: Number(item.placed || item.placed_students || item.count || 0),
    percentage: Number(item.percentage || item.placement_percentage || 0),
  }));

  const trendData = placementTrend.map((item) => ({
    month: String(item.month || item.label || item.period || item.year || "Unknown"),
    placed: Number(item.placed || item.placed_students || item.count || 0),
  }));

  const pieData = salaryDistribution.map((item) => ({
    job_type: item.range || item.salary_range || item.band || item.name || "Unknown",
    count: Number(item.count || item.students || item.total || 0),
  }));

  const activeDeptBarData = deptBarData;
  const activePieData = pieData;
  const activeTrendData = trendData;
  const activeTopStudents = topStudents.map((item) => ({
    name: item.name || item.student_name || "Unknown Student",
    department: item.department || item.dept || "N/A",
    company: item.company || item.company_name || "N/A",
    cgpa: item.cgpa ?? "N/A",
    package: item.package || "N/A"
  }));

  const topCompaniesData = topCompanies.map((item) => ({
    company: item.company || item.company_name || item.name || "Unknown",
    count: Number(item.count || item.hires || item.selected || 0),
  }));

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" style={{ width: "2.5rem", height: "2.5rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-4 text-muted fs-5 fw-medium">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        body { background-color: #f1f5f9; font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; color: #1e293b; }
        .page-wrapper { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
        .header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end; }
        .page-title { font-family: 'Outfit', sans-serif; font-size: 1.75rem; font-weight: 800; color: #0f172a; margin-bottom: 0.25rem; }
        .page-subtitle { color: #64748b; font-size: 0.9rem; font-weight: 500; }

        .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 1.5rem; margin-bottom: 3rem; padding: 10px 5px; }

        .modern-card { position: relative; border-radius: 1.5rem; padding: 1.75rem; color: white; overflow: hidden; min-height: 180px; display: flex; flex-direction: column; justify-content: space-between; border: none; box-shadow: none !important; transition: transform 0.3s ease; }
        .modern-card:hover { transform: translateY(-8px); }
        .modern-card::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 60px; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='rgba(255,255,255,0.15)' fill-opacity='1' d='M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,112C672,107,768,149,864,165.3C960,181,1056,171,1152,144C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E"); background-size: cover; opacity: 0.6; pointer-events: none; }

        .card-blue { background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); }
        .card-gold { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
        .card-cyan { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); }
        .card-green { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
        .card-rose { background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); }
        .card-indigo { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); }

        .card-top { display: flex; justify-content: space-between; align-items: flex-start; z-index: 1; }
        .card-title { font-size: 0.95rem; font-weight: 600; opacity: 0.9; }
        .card-value { font-family: 'Sora', sans-serif; font-size: 2.5rem; font-weight: 800; margin-top: 0.5rem; z-index: 1; }

        .card-filters { display: flex; flex-direction: column; gap: 0.35rem; }
        .filter-pill { background: rgba(255,255,255,0.2); border: none; padding: 0.3rem 0.8rem; border-radius: 2rem; color: white; font-size: 0.7rem; font-weight: 600; transition: all 0.2s; cursor: pointer; }
        .filter-pill:hover { background: rgba(255,255,255,0.35); }
        .filter-pill.active { background: white; color: #1e293b; }

        .chart-card { background: white; border-radius: 1.5rem; padding: 2rem; box-shadow: none !important; border: 2px solid #f1f5f9; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); opacity: 0; transform: translateY(15px); animation: chartFadeIn 0.8s ease-out forwards; }
        .chart-card:hover { border-color: #e2e8f0; background: #fafafa; }

        @keyframes chartFadeIn { to { opacity: 1; transform: translateY(0) scale(1); } }

        .analytics-title { font-family: 'Outfit', sans-serif; font-size: 1.35rem; font-weight: 800; color: #0f172a; margin: 0 0 1.5rem 0; }

        .category-tabs { display: flex; gap: 2.5rem; margin-bottom: 3rem; overflow-x: auto; padding: 1rem 0; scrollbar-width: none; justify-content: flex-start; }
        .category-tabs::-webkit-scrollbar { display: none; }

        .category-tab { display: flex; flex-direction: column; align-items: center; gap: 0.85rem; cursor: pointer; min-width: 100px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .tab-icon-box { width: 64px; height: 64px; border-radius: 18px; background: #ffffff; border: 2px solid #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; color: #64748b; transition: all 0.3s ease; box-shadow: none !important; }
        .category-tab:hover .tab-icon-box { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; transform: translateY(-4px); }
        .category-tab.active .tab-icon-box { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-color: transparent; color: white; box-shadow: none !important; transform: scale(1.05); }
        .tab-label { font-size: 0.85rem; font-weight: 700; color: #64748b; text-align: center; letter-spacing: 0.3px; transition: color 0.3s ease; }
        .category-tab.active .tab-label { color: #2563eb; }

        .recharts-responsive-container { overflow: hidden !important; max-width: 100%; }
        .row { margin-right: 0; margin-left: 0; }
        .col-lg-8, .col-lg-4, .col-lg-6, .col-12 { padding-left: 0; padding-right: 0; }
        @media (min-width: 992px) { .col-lg-8 { padding-right: 1.5rem; } }
      `}</style>

      <div className="page-wrapper">
        <div className="header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Premium overview of placement activities and student statistics.</p>
          </div>
          <a href="#" className="view-details" onClick={(e) => { e.preventDefault(); fetchDashboard(); }}>
            <i className="fas fa-sync-alt me-2"></i>Refresh Data
          </a>
        </div>

        {/* Stat Cards (unchanged) */}
        <div className="stat-grid">
          <div className="modern-card card-blue">
            <div className="card-top">
              <div className="card-title">Total Students</div>
              <div className="card-filters">
              </div>
            </div>
            <div className="card-value">{data.totalStudents.toLocaleString()}</div>
          </div>

          <div className="modern-card card-gold">
            <div className="card-top">
              <div className="card-title">Total Companies</div>
              <div className="card-filters">
              </div>
            </div>
            <div className="card-value">{data.totalCompanies.toLocaleString()}</div>
          </div>

          <div className="modern-card card-cyan">
            <div className="card-top">
              <div className="card-title">Total Jobs Posted</div>
              <div className="card-filters">
              </div>
            </div>
            <div className="card-value">{data.totalJobs.toLocaleString()}</div>
          </div>

          <div className="modern-card card-green">
            <div className="card-top">
              <div className="card-title">Placed Students</div>
              <div className="card-filters">
              </div>
            </div>
            <div className="card-value">{data.totalSelected.toLocaleString()}</div>
          </div>

          <div className="modern-card card-indigo">
            <div className="card-top">
              <div className="card-title">Approved Jobs</div>
              <div className="card-filters">
              </div>
            </div>
            <div className="card-value">{data.totalJobsApproved.toLocaleString()}</div>
          </div>

          <div className="modern-card card-rose">
            <div className="card-top">
              <div className="card-title">Pending Jobs</div>
              <div className="card-filters">
               
              </div>
            </div>
            <div className="card-value">{data.totalJobsPending.toLocaleString()}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="category-tabs">
          {["General", "Students", "Companies"].map((tab) => (
            <div
              key={tab}
              className={`category-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              <div className="tab-icon-box">
                <i
                  className={
                    tab === "General" ? "fas fa-chart-line" :
                    tab === "Students" ? "fas fa-user-graduate" :
                    tab === "Companies" ? "fas fa-building" :
                    "fas fa-file-invoice"
                  }
                />
              </div>
              <span className="tab-label">{tab}</span>
            </div>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "General" && (
            <div className="row g-4">
              {/* Your existing General tab – unchanged */}
              <div className="col-lg-8">
                <div className="chart-card">
                  <div style={{ marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      Job Posting Activity
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={340}>
                    <BarChart data={activeJobChartData} margin={{ top: 12, right: 12, left: -24, bottom: 40 }}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                          <stop offset="100%" stopColor="#1e40af" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="barGradientGreen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                          <stop offset="100%" stopColor="#065f46" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="barGradientOrange" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                          <stop offset="100%" stopColor="#92400e" stopOpacity={1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="#e2e8f0" opacity={0.7} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} dy={12} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip cursor={{ fill: 'rgba(59,130,246,0.08)', radius: 10 }} contentStyle={{ background: '#ffffff', border: '2px solid #f1f5f9', borderRadius: '14px', boxShadow: 'none', padding: '12px 16px' }} />
                      <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={54} animationDuration={1400}>
                        {activeJobChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? 'url(#barGradient)' : index === 1 ? 'url(#barGradientGreen)' : 'url(#barGradientOrange)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="chart-card">
                  <h3 className="analytics-title">Placement Ratio</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={activePlacementChartData} cx="50%" cy="50%" innerRadius={75} outerRadius={110} dataKey="value" paddingAngle={8} stroke="none">
                        <Cell fill="#4f46e5" />
                        <Cell fill="#e2e8f0" />
                      </Pie>
                      <Tooltip contentStyle={{ background: '#ffffff', border: '2px solid #f1f5f9', borderRadius: '14px', boxShadow: 'none', padding: '12px 16px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="col-12">
                <div className="chart-card">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="analytics-title">Year-wise Placement Trend</h3>
                    <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="dept-select" disabled={departments.length === 0}>
                      {departments.length === 0 ? <option>No departments</option> : departments.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                  </div>
                  <ResponsiveContainer width="100%" height={400}>
                    {activeYearData.length === 0 ? (
                      <div className="text-center py-5 text-muted fs-5">
                        {selectedDepartment ? `No data for ${selectedDepartment}` : "Select a department"}
                      </div>
                    ) : (
                      <AreaChart data={activeYearData} margin={{ top: 25, right: 35, left: -20, bottom: 45 }}>
                        <defs>
                          <linearGradient id="colorPlaced" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="4%" stopColor="#3b82f6" stopOpacity={0.38} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.03} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="#e2e8f0" opacity={0.7} />
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} dy={15} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }} contentStyle={{ background: '#ffffff', border: '2px solid #f1f5f9', borderRadius: '14px', boxShadow: 'none', padding: '12px 16px' }} />
                        <Area type="monotone" dataKey="placed_students" stroke="#3b82f6" strokeWidth={3.5} fillOpacity={0.35} fill="url(#colorPlaced)" dot={{ r: 6, fill: "#fff", stroke: "#3b82f6", strokeWidth: 3 }} activeDot={{ r: 9, stroke: "#fff", strokeWidth: 4, fill: "#3b82f6" }} animationDuration={1600} />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Students" && (
            <div className="row g-4">
              {studentsLoading ? (
                <div className="col-12 text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading students data...</span>
                  </div>
                </div>
              ) : studentsError ? (
                <div className="col-12 text-center py-5 text-danger">{studentsError}</div>
              ) : (
                <>
                  <div className="col-lg-6">
                    <div className="chart-card">
                      <h3 className="analytics-title mb-4">Students per Department</h3>
                      {studentsPerDept.length === 0 ? (
                        <p className="text-muted text-center py-4">No data available</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={360}>
                          <BarChart data={studentsPerDept} margin={{ top: 20, right: 30, left: -10, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                            <XAxis dataKey="department" angle={-35} textAnchor="end" height={70} tick={{ fontSize: 12, fill: "#475569" }} />
                            <YAxis tick={{ fontSize: 12, fill: "#475569" }} />
                            <Tooltip cursor={{ fill: "rgba(79,70,229,0.08)" }} contentStyle={{ background: "#ffffff", border: "2px solid #f1f5f9", borderRadius: "12px", boxShadow: "none", padding: "12px 16px" }} />
                            <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={42} fill="#4f46e5" animationDuration={1400} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="chart-card">
                      <h3 className="analytics-title mb-4">UG vs PG Distribution</h3>
                      {ugPgDistribution.length === 0 ? (
                        <p className="text-muted text-center py-4">No data available</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={360}>
                          <PieChart>
                            <Pie
                              data={ugPgDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={75}
                              outerRadius={115}
                              paddingAngle={5}
                              dataKey="count"
                              nameKey="ug_pg"
                              label={({ name, percent }) => `${name || "Unknown"} • ${(percent * 100).toFixed(0)}%`}
                              labelStyle={{ fontSize: "13px", fill: "#1e293b", fontWeight: 600 }}
                            >
                              <Cell fill="#4f46e5" />
                              <Cell fill="#10b981" />
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} students`, null]} contentStyle={{ background: "#ffffff", border: "2px solid #f1f5f9", borderRadius: "12px", boxShadow: "none", padding: "12px 16px" }} />
                            <Legend verticalAlign="bottom" height={40} iconType="circle" iconSize={12} wrapperStyle={{ fontSize: "13px", color: "#475569" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="chart-card">
                      <h3 className="analytics-title mb-4">Students Enrollment by Batch / Year</h3>
                      {studentsPerBatch.length === 0 ? (
                        <p className="text-muted text-center py-4">No data available</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={380}>
                          <LineChart data={studentsPerBatch} margin={{ top: 20, right: 40, left: -10, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="4 6" stroke="#e2e8f0" opacity={0.7} />
                            <XAxis dataKey="passed_out_year" axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 13 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: "#ffffff", border: "2px solid #f1f5f9", borderRadius: "12px", boxShadow: "none", padding: "12px 16px" }} />
                            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3.5} dot={{ r: 5, strokeWidth: 2, fill: "#fff", stroke: "#3b82f6" }} activeDot={{ r: 8, stroke: "#fff", strokeWidth: 3, fill: "#3b82f6" }} animationDuration={1800} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "Companies" && (
            <div className="row g-4">
              {companiesLoading ? (
                <div className="col-12 text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading companies data...</span>
                  </div>
                </div>
              ) : companiesError ? (
                <div className="col-12 text-center py-5 text-danger">{companiesError}</div>
              ) : (
                <>
                  <div className="col-lg-6">
                    <div className="chart-card">
                      <h3 className="analytics-title mb-4">Jobs Posted per Company</h3>
                      {jobsPerCompany.length === 0 ? (
                        <p className="text-muted text-center py-4">No data available</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={360}>
                          <BarChart data={jobsPerCompany} margin={{ top: 20, right: 30, left: -10, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                            <XAxis dataKey="company" angle={-35} textAnchor="end" height={70} tick={{ fontSize: 12, fill: "#475569" }} />
                            <YAxis tick={{ fontSize: 12, fill: "#475569" }} />
                            <Tooltip cursor={{ fill: "rgba(245,158,11,0.08)" }} contentStyle={{ background: "#ffffff", border: "2px solid #f1f5f9", borderRadius: "12px", boxShadow: "none", padding: "12px 16px" }} />
                            <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={42} fill="#f59e0b" animationDuration={1400} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="chart-card">
                      <h3 className="analytics-title mb-4">Job Types Distribution</h3>
                      {jobTypesDistribution.length === 0 ? (
                        <p className="text-muted text-center py-4">No data available</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={360}>
                          <PieChart>
                            <Pie
                              data={jobTypesDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={75}
                              outerRadius={115}
                              paddingAngle={5}
                              dataKey="count"
                              nameKey="job_type"
                              label={({ name, percent }) => `${name || "Unknown"} • ${(percent * 100).toFixed(0)}%`}
                              labelStyle={{ fontSize: "13px", fill: "#1e293b", fontWeight: 600 }}
                            >
                              <Cell fill="#f59e0b" />
                              <Cell fill="#10b981" />
                              <Cell fill="#3b82f6" />
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} jobs`, null]} contentStyle={{ background: "#ffffff", border: "2px solid #f1f5f9", borderRadius: "12px", boxShadow: "none", padding: "12px 16px" }} />
                            <Legend verticalAlign="bottom" height={40} iconType="circle" iconSize={12} wrapperStyle={{ fontSize: "13px", color: "#475569" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="chart-card">
                      <h3 className="analytics-title mb-4">Jobs Posted Trend (Monthly)</h3>
                      {monthlyJobsTrend.length === 0 ? (
                        <p className="text-muted text-center py-4">No data available</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={380}>
                          <LineChart data={monthlyJobsTrend} margin={{ top: 20, right: 40, left: -10, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="4 6" stroke="#e2e8f0" opacity={0.7} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 13 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: "#ffffff", border: "2px solid #f1f5f9", borderRadius: "12px", boxShadow: "none", padding: "12px 16px" }} />
                            <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={3.5} dot={{ r: 5, strokeWidth: 2, fill: "#fff", stroke: "#f59e0b" }} activeDot={{ r: 8, stroke: "#fff", strokeWidth: 3, fill: "#f59e0b" }} animationDuration={1800} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}