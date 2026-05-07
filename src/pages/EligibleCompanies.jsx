
// src/pages/EligibleCompanies.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/companies';

export default function EligibleCompanies() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false); // false = Active only, true = All jobs

  // Pagination & Entries states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(6);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    jobType: '',
    location: '',
  });

  const navigate = useNavigate();
  const studentEmail = localStorage.getItem('studentEmail');

  useEffect(() => {
    if (!studentEmail) {
      navigate('/login');
      return;
    }
    fetchJobs();
  }, [navigate, studentEmail, showAll]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { email: studentEmail, status: showAll ? 'all' : 'active' };
      const res = await axios.get(`${API_BASE}/jobs/active/`, {
        params,
        withCredentials: true,
      });
      const receivedJobs = res.data.jobs || res.data || [];
      setJobs(receivedJobs);
      setCurrentPage(1); // Reset to page 1 on new data
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError('Failed to load jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (jobId) => {
    navigate(`/dashboard/apply/${jobId}`);
  };

  const handleViewCompanyWebsite = async (companyEmail) => {
    if (!companyEmail) {
      alert('Company website information not available.');
      return;
    }
    try {
      const res = await axios.get(`${API_BASE.replace('/companies', '')}/companies/website/`, {
        params: { email: companyEmail },
        withCredentials: true,
      });
      if (res.data.success && res.data.website) {
        let url = res.data.website.trim();
        if (!url.match(/^https?:\/\//i)) url = `https://${url}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        alert(res.data.error || 'Company website not available.');
      }
    } catch (err) {
      console.error('Failed to fetch company website:', err);
      alert('Could not load company website at the moment.');
    }
  };

  // Memoized filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = `${job.title || ''} ${job.company || ''} ${job.description || ''} ${(job.skills || []).join(' ')}`
        .toLowerCase()
        .includes(query);
      
      const matchesType = !filters.jobType || (job.job_type || '').toLowerCase() === filters.jobType.toLowerCase();
      const matchesLocation = !filters.location || (job.job_location || '').toLowerCase().includes(filters.location.toLowerCase());

      return matchesSearch && matchesType && matchesLocation;
    });
  }, [jobs, searchQuery, filters]);

  // Pagination Logic
  const totalEntries = filteredJobs.length;
  const totalPages = Math.ceil(totalEntries / (entriesPerPage === 'All' ? totalEntries : entriesPerPage));
  const currentEntries = useMemo(() => {
    if (entriesPerPage === 'All') return filteredJobs;
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredJobs.slice(startIndex, startIndex + Number(entriesPerPage));
  }, [filteredJobs, currentPage, entriesPerPage]);

  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-white">
        <div className="spinner-border text-dark" style={{ width: '2rem', height: '2rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="eligible-companies-container">
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />

      <style>{`
        .eligible-companies-container {
          background-color: #ffffff; /* pure white background */
          min-height: 100vh;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b;
          padding: 1rem 2.5rem; /* Reduced top padding */
        }

        .page-header {
          margin-bottom: 3.5rem; /* Pronounced margin for a premium spacious feel */
        }

        .enhanced-banner {
          background: linear-gradient(135deg, #b45309, #9a3412);
          border-radius: 0; /* Removed rounded corners as requested */
          padding: 1.5rem 2rem; 
          position: relative;
          overflow: hidden;
          color: white;
          box-shadow: 0 8px 24px rgba(154, 52, 18, 0.15);
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-height: 110px; 
        }

        .banner-content {
          position: relative;
          z-index: 2;
          max-width: 65%;
        }

        .banner-title {
          font-size: 1.65rem; 
          font-weight: 700; /* Less overbolded, more professional */
          margin-bottom: 0.35rem;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }

        .banner-subtitle {
          font-size: 0.92rem; /* Reduced font size */
          opacity: 0.9;
          margin: 0;
          font-weight: 400;
        }

        .banner-visual {
          position: absolute;
          right: -10px;
          top: 0;
          bottom: 0;
          width: 30%;
          opacity: 0.15;
          pointer-events: none;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .company-svg-pattern {
          width: 120px;
          height: 120px;
          fill: white;
        }

        /* Control Bar Styles */
        .controls-bar {
          background: white;
          padding: 0.85rem 1.25rem;
          border-radius: 0; /* Sharp corners */
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 2.5rem; 
          margin-bottom: 2rem; 
        }
        

        .controls-left {
          display: flex;
          align-items: center;
          gap: 2.5rem; /* Significant gap to ensure it is clearly visible */
          flex-grow: 1;
        }

        .search-wrapper {
          position: relative;
          flex-basis: 350px; /* Base width */
          flex-grow: 0; /* Stop it from eating up all space and hiding gaps */
        }

        .search-wrapper i {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 1.1rem;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border-radius: 0; /* Sharp corners */
          border: 1px solid #cbd5e1;
          font-size: 0.95rem;
          transition: all 0.2s;
          background: #f8fafc;
        }

        .search-input:focus {
          outline: none;
          background: white;
          border-color: #9a3412;
          box-shadow: 0 0 0 3px rgba(154, 52, 18, 0.1);
        }

        .advanced-filter-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.65rem 1.25rem;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 0; /* Sharp corners */
          color: #475569;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .advanced-filter-btn:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .advanced-filter-btn.active {
          background: rgba(154, 52, 18, 0.08);
          color: #9a3412;
          border-color: rgba(154, 52, 18, 0.2);
        }

        /* Advanced Filters Panel */
        .advanced-filters-panel {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0; /* Sharp corners */
          padding: 1.25rem;
          margin-bottom: 2.5rem; /* Balanced with banner spacing */
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.25rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
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
          font-size: 0.85rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .filter-control {
          padding: 0.6rem 0.75rem;
          border-radius: 0; /* Sharp corners */
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          font-size: 0.9rem;
          color: #1e293b;
          width: 100%;
          cursor: pointer;
        }

        .filter-control:focus {
          outline: none;
          border-color: #9a3412;
          box-shadow: 0 0 0 3px rgba(154, 52, 18, 0.1);
        }

        .controls-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .entries-select {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #64748b;
          font-weight: 500;
        }

        .entries-select select {
          padding: 0.5rem 2rem 0.5rem 0.75rem;
          border-radius: 0; /* Sharp corners */
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          cursor: pointer;
        }

        /* Filter Tabs */
        .filter-tabs {
          display: flex;
          background: #f1f5f9;
          padding: 0.25rem;
          border-radius: 0; /* Sharp corners */
        }

        .tab-btn {
          padding: 0.5rem 1.25rem;
          border-radius: 0; /* Sharp corners */
          font-size: 0.875rem;
          font-weight: 600;
          border: none;
          background: transparent;
          color: #64748b;
          transition: all 0.2s;
        }

        .tab-btn.active {
          background: #9a3412; /* Active tab matches sidebar orange */
          color: white;
          box-shadow: 0 4px 12px rgba(154, 52, 18, 0.3);
        }

        /* Job Grid Styles */
        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 1.75rem;
          margin-bottom: 2.5rem;
        }

        .job-card {
          background: white;
          border-radius: 0; /* Sharp corners */
          border: 1px solid #e2e8f0;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .job-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: #9a3412; /* Matched orange */
          opacity: 0;
          transition: opacity 0.3s;
        }

        .job-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.1);
          border-color: #cbd5e1;
        }

        .job-card:hover::before {
          opacity: 1;
        }

        .job-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          background: rgba(154, 52, 18, 0.1);
          color: #9a3412; /* Matched orange */
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          margin-bottom: 1rem;
        }

        .job-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }

        .company-name {
          font-size: 1.05rem;
          font-weight: 600;
          color: #1e1b4b;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .job-info-list {
          list-style: none;
          padding: 0;
          margin: 0 0 1.5rem 0;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .job-info-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #64748b;
          background: #f8fafc;
          padding: 0.4rem 0.75rem;
          border-radius: 6px;
          border: 1px solid #f1f5f9;
        }

        .job-info-item i {
          color: #9a3412; /* Matched orange */
        }

        .job-description {
          font-size: 0.95rem;
          line-height: 1.6;
          color: #475569;
          margin-bottom: 1.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex-grow: 1;
        }

        .skills-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.75rem;
        }

        .skill-tag {
          font-size: 0.75rem;
          font-weight: 600;
          background: #f1f5f9;
          color: #475569;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
        }

        .card-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: auto;
        }

        .btn-action {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s;
          cursor: pointer;
        }

        .btn-outline {
          background: white;
          color: #9a3412;
          border: 1.5px solid #9a3412;
        }

        .btn-outline:hover:not(:disabled) {
          background: rgba(154, 52, 18, 0.05);
          box-shadow: 0 2px 4px rgba(154, 52, 18, 0.1);
        }

        .btn-outline:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          border-color: #cbd5e1;
          color: #94a3b8;
        }

        .btn-primary {
          background: #9a3412;
          color: white;
          border: 1.5px solid #9a3412;
        }

        .btn-primary:hover {
          background: #7c2d12;
          border-color: #7c2d12;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(154, 52, 18, 0.3);
        }

        /* Pagination Styles */
        .pagination-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 0;
          border-top: 1px solid #e2e8f0;
        }

        .pagination-info {
          font-size: 0.9rem;
          color: #64748b;
        }

        .pagination-info span {
          font-weight: 600;
          color: #0f172a;
        }

        .pagination-nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .page-link {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #475569;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s;
          cursor: pointer;
        }

        .page-link:hover:not(.active):not(:disabled) {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .page-link.active {
          background: #1e1b4b;
          color: white;
          border-color: #1e1b4b;
        }

        .page-link:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .empty-state {
          text-align: center;
          padding: 5rem 2rem;
          background: white;
          border-radius: 12px;
          border: 1px dashed #cbd5e1;
        }

        .empty-state i {
          font-size: 3.5rem;
          color: #cbd5e1;
          margin-bottom: 1.5rem;
          display: block;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.75rem;
        }

        .empty-state p {
          color: #64748b;
          max-width: 400px;
          margin: 0 auto;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .jobs-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          }
          .eligible-companies-container {
            padding: 1rem 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .eligible-companies-container {
            padding: 1rem;
          }

          .page-header {
            margin-bottom: 2.5rem;
          }

          .enhanced-banner {
            padding: 1.5rem;
            min-height: auto;
            flex-direction: column;
            text-align: left;
            gap: 1.5rem;
          }

          .banner-content {
            max-width: 100%;
          }

          .banner-title {
            font-size: 1.45rem;
            margin-bottom: 0.5rem;
          }

          .banner-subtitle {
            font-size: 0.85rem;
          }

          .banner-visual {
            width: 100%;
            opacity: 0.1 !important;
            height: 60px;
          }

          .controls-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
            padding: 0.75rem;
          }

          .controls-left {
            flex-direction: column;
            gap: 1rem;
            width: 100%;
          }

          .search-wrapper {
            flex-basis: 100%;
            max-width: none;
          }

          .advanced-filter-btn {
            width: 100%;
            justify-content: center;
          }

          .controls-right {
            flex-direction: column;
            gap: 1rem;
            width: 100%;
          }

          .entries-select {
            width: 100%;
            justify-content: space-between;
          }

          .advanced-filters-panel {
            grid-template-columns: 1fr;
            padding: 1rem;
            margin-bottom: 1.5rem;
          }

          .filter-tabs {
            width: 100%;
          }

          .tab-btn {
            flex: 1;
            padding: 0.5rem;
            font-size: 0.8rem;
          }

          .jobs-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
            margin-bottom: 2rem;
          }

          .job-card {
            padding: 1.25rem;
          }

          .job-title {
            font-size: 1.15rem;
            margin-bottom: 0.35rem;
          }

          .company-name {
            font-size: 0.95rem;
            margin-bottom: 1rem;
          }

          .job-info-list {
            gap: 0.5rem;
            margin-bottom: 1rem;
          }

          .job-info-item {
            font-size: 0.8rem;
            padding: 0.3rem 0.6rem;
          }

          .job-description {
            font-size: 0.9rem;
            margin-bottom: 1rem;
            -webkit-line-clamp: 2;
          }

          .skills-container {
            margin-bottom: 1.25rem;
            gap: 0.35rem;
          }

          .skill-tag {
            font-size: 0.7rem;
            padding: 0.2rem 0.5rem;
          }

          .card-actions {
            grid-template-columns: 1fr;
            gap: 0.75rem;
            margin-top: auto;
          }

          .btn-action {
            padding: 0.65rem 0.75rem;
            font-size: 0.85rem;
          }

          .pagination-container {
            flex-direction: column;
            gap: 1.25rem;
            text-align: center;
            padding: 1rem 0;
          }

          .pagination-nav {
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
            gap: 0.35rem;
          }

          .page-link {
            width: 32px;
            height: 32px;
            font-size: 0.8rem;
          }

          .empty-state {
            padding: 3rem 1.5rem;
          }

          .empty-state i {
            font-size: 2.5rem;
            margin-bottom: 1rem;
          }

          .empty-state h3 {
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
          }

          .empty-state p {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .eligible-companies-container {
            padding: 0.75rem;
          }

          .page-header {
            margin-bottom: 1.75rem;
          }

          .enhanced-banner {
            padding: 1rem;
            min-height: auto;
          }

          .banner-title {
            font-size: 1.25rem;
            margin-bottom: 0.35rem;
          }

          .banner-subtitle {
            font-size: 0.8rem;
            opacity: 0.85;
          }

          .controls-bar {
            padding: 0.5rem;
            gap: 0.75rem;
          }

          .search-wrapper i {
            left: 0.75rem;
            font-size: 1rem;
          }

          .search-input {
            padding: 0.65rem 0.75rem 0.65rem 2.25rem;
            font-size: 0.9rem;
          }

          .advanced-filter-btn {
            padding: 0.55rem 1rem;
            font-size: 0.8rem;
          }

          .filter-tabs {
            width: 100%;
          }

          .tab-btn {
            padding: 0.4rem 0.75rem;
            font-size: 0.75rem;
          }

          .advanced-filters-panel {
            grid-template-columns: 1fr;
            padding: 0.75rem;
            margin-bottom: 1rem;
            gap: 0.75rem;
          }

          .filter-group label {
            font-size: 0.75rem;
          }

          .filter-control {
            padding: 0.5rem 0.6rem;
            font-size: 0.85rem;
          }

          .jobs-grid {
            gap: 1rem;
            margin-bottom: 1.5rem;
          }

          .job-card {
            padding: 1rem;
          }

          .job-badge {
            padding: 0.2rem 0.6rem;
            font-size: 0.7rem;
            margin-bottom: 0.75rem;
          }

          .job-title {
            font-size: 1.05rem;
            margin-bottom: 0.3rem;
            font-weight: 700;
            line-height: 1.3;
          }

          .company-name {
            font-size: 0.9rem;
            margin-bottom: 0.75rem;
          }

          .job-info-list {
            gap: 0.35rem;
            margin-bottom: 0.75rem;
          }

          .job-info-item {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
          }

          .job-description {
            font-size: 0.85rem;
            line-height: 1.5;
            margin-bottom: 0.75rem;
            -webkit-line-clamp: 2;
          }

          .skills-container {
            margin-bottom: 0.75rem;
            gap: 0.25rem;
          }

          .skill-tag {
            font-size: 0.65rem;
            padding: 0.15rem 0.4rem;
          }

          .card-actions {
            gap: 0.5rem;
          }

          .btn-action {
            padding: 0.55rem 0.6rem;
            font-size: 0.8rem;
            border-radius: 6px;
          }

          .btn-action i {
            font-size: 0.9rem;
          }

          .pagination-container {
            padding: 0.75rem 0;
            gap: 1rem;
          }

          .pagination-info {
            font-size: 0.8rem;
          }

          .pagination-nav {
            gap: 0.25rem;
          }

          .page-link {
            width: 30px;
            height: 30px;
            font-size: 0.75rem;
          }

          .entries-select {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.35rem;
            font-size: 0.8rem;
          }

          .entries-select select {
            width: 100%;
            padding: 0.5rem;
            font-size: 0.85rem;
          }

          .empty-state {
            padding: 2rem 1rem;
          }

          .empty-state i {
            font-size: 2rem;
            margin-bottom: 0.75rem;
          }

          .empty-state h3 {
            font-size: 1.1rem;
            margin-bottom: 0.35rem;
          }

          .empty-state p {
            font-size: 0.85rem;
            line-height: 1.5;
          }
        }
      `}</style>

      <header className="page-header">
        <div className="enhanced-banner">
          <div className="banner-content">
            <h1 className="banner-title">{showAll ? "All Career Opportunities" : "Available Positions"}</h1>
            <p className="banner-subtitle">
              Explorer and discover roles that match your academic profile and professional skills.
            </p>
          </div>
          
          <div className="banner-visual" style={{ opacity: 0.2 }}>
            <svg viewBox="0 0 100 100" className="company-svg-pattern">
              {/* Modern Business/Growth SVG */}
              <rect x="10" y="40" width="25" height="45" rx="2" fill="white" opacity="0.4" />
              <rect x="40" y="20" width="30" height="65" rx="2" fill="white" opacity="0.6" />
              <rect x="75" y="50" width="15" height="35" rx="2" fill="white" opacity="0.3" />
              <path d="M45 35 L55 35 M45 45 L55 45 M45 55 L55 55 M45 65 L55 65" stroke="white" strokeWidth="2" opacity="0.5" />
              <circle cx="82" cy="30" r="8" fill="white" opacity="0.4" />
              <path d="M5 90 L95 90" stroke="white" strokeWidth="2" opacity="0.5" />
            </svg>
          </div>
        </div>

        <div className="controls-bar">
          <div className="controls-left">
            <div className="search-wrapper">
              <i className="bi bi-search"></i>
              <input
                type="text"
                className="search-input"
                placeholder="Search by title, company, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button 
              className={`advanced-filter-btn ${showAdvanced ? 'active' : ''}`}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <i className={`bi bi-filter${showAdvanced ? '-left' : ''}`}></i>
              {showAdvanced ? 'Hide Filters' : 'Advanced Filters'}
            </button>

            <div className="filter-tabs">
              <button
                className={`tab-btn ${!showAll ? "active" : ""}`}
                onClick={() => setShowAll(false)}
              >
                Active
              </button>
              <button
                className={`tab-btn ${showAll ? "active" : ""}`}
                onClick={() => setShowAll(true)}
              >
                Historical
              </button>
            </div>
          </div>

          <div className="controls-right">
            <div className="entries-select">
              <span>Show</span>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(e.target.value === 'All' ? 'All' : Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={6}>6 items</option>
                <option value={12}>12 items</option>
                <option value={24}>24 items</option>
                <option value="All">All</option>
              </select>
            </div>
          </div>
        </div>

        {showAdvanced && (
          <div className="advanced-filters-panel">
            <div className="filter-group">
              <label>Job Type</label>
              <select 
                className="filter-control"
                value={filters.jobType}
                onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Location Preference</label>
              <select 
                className="filter-control"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              >
                <option value="">Any Location</option>
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="filter-group" style={{ justifyContent: 'flex-end', flexDirection: 'row', gap: '0.75rem' }}>
              <button 
                className="btn-action btn-outline" 
                style={{ padding: '0.5rem 1rem', height: 'fit-content', marginTop: 'auto' }}
                onClick={() => setFilters({ jobType: '', location: '' })}
              >
                <i className="bi bi-arrow-counterclockwise"></i>
                Reset
              </button>
            </div>
          </div>
        )}
      </header>

      {currentEntries.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-search"></i>
          <h3>No positions found</h3>
          <p>We couldn't find any opportunities matching your current filters. Try adjusting your search or switching tabs.</p>
        </div>
      ) : (
        <>
          <div className="jobs-grid">
            {currentEntries.map((job) => (
              <article className="job-card" key={job.id}>
                <div className="job-badge">{job.job_type || "Full-Time"}</div>

                <h3 className="job-title">{job.title || 'Untitled Position'}</h3>
                <div className="company-name">
                  <i className="bi bi-building"></i>
                  {job.company || 'Company not specified'}
                </div>

                <ul className="job-info-list">
                  <li className="job-info-item">
                    <i className="bi bi-geo-alt"></i>
                    {job.job_location || 'Remote'}
                  </li>
                  {job.salary_range && (
                    <li className="job-info-item">
                      <i className="bi bi-currency-dollar"></i>
                      {job.salary_range}
                    </li>
                  )}
                  {job.last_date_to_apply && (
                    <li className="job-info-item">
                      <i className="bi bi-calendar-event"></i>
                      Ends: {new Date(job.last_date_to_apply).toLocaleDateString()}
                    </li>
                  )}
                </ul>

                <p className="job-description">
                  {job.description || 'No detailed description provided for this position.'}
                </p>

                {job.skills && job.skills.length > 0 && (
                  <div className="skills-container">
                    {job.skills.slice(0, 4).map((skill, idx) => (
                      <span key={idx} className="skill-tag">{skill}</span>
                    ))}
                    {job.skills.length > 4 && (
                      <span className="skill-tag">+{job.skills.length - 4} more</span>
                    )}
                  </div>
                )}

                <div className="card-actions">
                  <button
                    className="btn-action btn-outline"
                    onClick={() => handleViewCompanyWebsite(job.company_email)}
                    disabled={!job.company_email}
                  >
                    Details
                  </button>
                  <button
                    className="btn-action btn-primary"
                    onClick={() => handleApplyClick(job.id)}
                  >
                    Apply Now
                  </button>
                </div>
              </article>
            ))}
          </div>

          {entriesPerPage !== 'All' && totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing <span>{Math.min((currentPage - 1) * entriesPerPage + 1, totalEntries)}</span> to <span>{Math.min(currentPage * entriesPerPage, totalEntries)}</span> of <span>{totalEntries}</span> entries
              </div>

              <nav className="pagination-nav">
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>

                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx + 1}
                    className={`page-link ${currentPage === idx + 1 ? 'active' : ''}`}
                    onClick={() => handlePageChange(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                )).slice(
                  Math.max(0, currentPage - 3),
                  Math.min(totalPages, currentPage + 2)
                )}

                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};
