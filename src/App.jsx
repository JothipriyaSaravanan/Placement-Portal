// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

/* ───────── Student / Public Auth Pages ───────── */
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyToken from "./pages/VerifyToken";
import ResetPassword from "./pages/ResetPassword";
import RequestVerification from "./pages/RequestVerification";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Resume from "./pages/Resume";
import Skills from "./pages/Skills";
import Internship from "./pages/Internship";
import Projects from "./pages/Projects";
import EligibleCompanies from "./pages/EligibleCompanies";
import ApplicationStatus from "./pages/ApplicationStatus";
import ApplyJob from "./pages/ApplyJob";
import StudentAnnouncements from "./pages/StudentAnnouncements";
import AdminFeed from "./pages/AdminFeed";
import OfferLetters from "./pages/OfferLetters";

/* ───────── Admin ───────── */
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCompanies from "./pages/admin/AdminCompanies";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminJobApplicants from "./pages/admin/AdminJobApplicants";
import AdminRegister from "./pages/admin/AdminRegister";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminForgotPassword from "./pages/admin/AdminForgotPassword";
import AdminVerifyOtp from "./pages/admin/AdminVerifyOtp";
import AdminResetPassword from "./pages/admin/AdminResetPassword";
import CreateCoordinator from "./pages/admin/CreateCoordinator";
import Announcements from "./pages/admin/Announcements";

import CoordinatorList from "./pages/admin/CoordinatorList";
import CoordinatorDetail from "./pages/admin/CoordinatorDetail";
import StudentsHome from "./pages/admin/StudentsHome";
import ProgrammeList from "./pages/admin/ProgrammeList";

import StudentsByCoordinator from "./pages/admin/StudentsByCoordinator";
import AdminReports from "./pages/admin/AdminReports";
import DepartmentReport from "./pages/admin/DepartmentReport";
import AdminCompanyJobs from "./pages/admin/AdminCompanyJobs";
import AdminOfferLetters from "./pages/admin/AdminOfferLetters";

/* ───────── Company ───────── */
import CompanyLogin from "./pages/company/CompanyLogin";
import CompanyForgotPassword from "./pages/company/CompanyForgotPassword";
import CompanyVerifyOtp from "./pages/company/CompanyVerifyOTP";
import CompanyResetPassword from "./pages/company/CompanyResetPassword";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyRegister from "./pages/company/CompanyRegister";
import CompanyEmailCheck from "./pages/company/CompanyEmailCheck";
import CompanyVerificationRequest from "./pages/company/CompanyVerificationRequest";
import CompanyVerificationPending from "./pages/company/CompanyVerificationPending";
import CompanyRegistrationRejected from "./pages/company/CompanyRegistrationRejected";
import CompanyProfile from "./pages/company/CompanyProfile";
import CompanyJobPost from "./pages/company/CompanyJobPost";
import CompanyApplicants from "./pages/company/CompanyApplicants";
import StudentProfileForCompany from "./pages/company/StudentProfileForCompany";
import CompanyReport from "./pages/company/CompanyReport";

/* ───────── Coordinator ───────── */
import CoordinatorLogin from "./pages/coordinator/CoordinatorLogin";
import CoordinatorRegister from "./pages/coordinator/CoordinatorRegister";
import CoordinatorForgotPassword from "./pages/coordinator/CoordinatorForgotPassword";
import CoordinatorResetPassword from "./pages/coordinator/CoordinatorResetPassword";
import CoordinatorDashboard from "./pages/coordinator/CoordinatorDashboard";
import StudentsList from "./pages/coordinator/StudentsList";
import UploadExcel from "./pages/coordinator/UploadExcel";
import AddStudentManually from "./pages/coordinator/AddStudentManually";
import CoordinatorLayout from "./pages/coordinator/CoordinatorLayout";
import CoordinatorJobs from "./pages/coordinator/CoordinatorJobs";
import CoordinatorAppliedStudents from "./pages/coordinator/CoordinatorAppliedStudents";
import SelectedStudentsReport from "./pages/coordinator/SelectedStudentsReport";
import CoordinatorAnnouncements from "./pages/coordinator/CoordinatorAnnouncements";
import AdminAnnouncementsForCoordinator from "./pages/coordinator/AdminAnnouncementsForCoordinator";

/* ───────── Protected Route Wrappers ───────── */
const AdminProtected = ({ children }) => {
  const isAdmin = localStorage.getItem("userRole") === "admin";
  return isAdmin ? children : <Navigate to="/admin" replace />;
};

const CompanyProtected = ({ children }) => {
  const companyId = localStorage.getItem("companyId");
  return companyId ? children : <Navigate to="/company-login" replace />;
};

const CoordinatorProtected = ({ children }) => {
  const coordinatorId = localStorage.getItem("coordinatorId");
  return coordinatorId ? children : <Navigate to="/coordinator/login" replace />;
};

function App() {
  return (
    <Routes>

      {/* ─── Public / Student Auth Routes ─── */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-token" element={<VerifyToken />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/request-verification" element={<RequestVerification />} />

      {/* ─── Student Dashboard + Nested Pages ─── */}
      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<Profile />} />
        <Route path="profile" element={<Profile />} />
        <Route path="resume" element={<Resume />} />
        <Route path="skills" element={<Skills />} />
        <Route path="internship" element={<Internship />} />
        <Route path="projects" element={<Projects />} />
        <Route path="companies" element={<EligibleCompanies />} />
        <Route path="status" element={<ApplicationStatus />} />
        <Route path="apply/:jobId" element={<ApplyJob />} />
        {/* If you have company profile viewable by students */}
        <Route path="company-profile" element={<CompanyProfile />} /> 
        <Route path="announcements" element={<StudentAnnouncements />} />
        <Route path="admin-feed" element={<AdminFeed />} />
        <Route path="offer-letters" element={<OfferLetters />} />
      </Route>

      {/* ─── Admin Routes ─── */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/register" element={<AdminRegister />} />
      <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
      <Route path="/admin/verify-otp" element={<AdminVerifyOtp />} />
      <Route path="/admin/reset-password" element={<AdminResetPassword />} />

      <Route element={<AdminProtected><AdminLayout /></AdminProtected>}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/companies" element={<AdminCompanies />} />
        <Route path="/admin/companies/:status" element={<AdminCompanies />} />
        <Route path="/admin/jobs" element={<AdminJobs />} />\
        <Route
  path="/admin/job-applicants"
  element={<AdminJobApplicants />}
/>
        <Route path="/admin/jobs/:status" element={<AdminJobs />} />
        <Route path="/admin/coordinators" element={<CoordinatorList />} />
        <Route path="/admin/create-coordinator" element={<CreateCoordinator />} />
        <Route path="/admin/coordinator/:id" element={<CoordinatorDetail />} />
        <Route path="/admin/programmes" element={<ProgrammeList />} />
        <Route path="/admin/students" element={<StudentsHome />} />
        <Route
    path="/admin/students/coordinator/:coordinatorId"
    element={<StudentsByCoordinator />}
  />
       <Route
  path="/admin/companies/:companyEmail/jobs"
  element={<AdminCompanyJobs />}
/>

        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/reports/:department/:batch" element={<DepartmentReport />} />
        <Route path="/admin/announcements" element={<Announcements />} />
        <Route path="/admin/offer-letters" element={<AdminOfferLetters />} />

        {/* Add more admin sub-routes here when needed */}
        
      </Route>

      {/* ─── Company Routes ─── */}
      <Route path="/company-login" element={<CompanyLogin />} />
      <Route path="/company-forgot-password" element={<CompanyForgotPassword />} />
      <Route path="/company-verify-otp" element={<CompanyVerifyOtp />} />
      <Route path="/company-reset-password" element={<CompanyResetPassword />} />
      <Route path="/company-verification-pending" element={<CompanyVerificationPending />} />
      <Route path="/company-registration-rejected" element={<CompanyRegistrationRejected />} />
      <Route path="/company/student-profile/:email" element={<StudentProfileForCompany />} />

      <Route path="/company/dashboard" element={<CompanyProtected><CompanyDashboard /></CompanyProtected>}>
        <Route index element={<CompanyProfile />} />
        <Route path="profile" element={<CompanyProfile />} />
        <Route path="post-job" element={<CompanyJobPost />} />
        <Route path="applicants" element={<CompanyApplicants />} />
        <Route path="report" element={<CompanyReport />} />
      </Route>
      

      {/* ─── Coordinator Routes ─── */}
      <Route path="/coordinator/register" element={<CoordinatorRegister />} />
      <Route path="/coordinator/login" element={<CoordinatorLogin />} />
       <Route path="/coordinator/forgot-password" element={<CoordinatorForgotPassword />} />
        <Route path="/coordinator/reset-password" element={<CoordinatorResetPassword />} />
      <Route element={<CoordinatorProtected><CoordinatorLayout /></CoordinatorProtected>}>
        <Route path="/coordinator/dashboard" element={<CoordinatorDashboard />} />
        <Route path="/coordinator/students" element={<StudentsList />} />
        <Route path="/coordinator/upload" element={<UploadExcel />} />
        <Route path="/coordinator/students/add" element={<AddStudentManually />} />
         <Route path="/coordinator/jobs" element={<CoordinatorJobs />} />
         <Route path="/coordinator/applied-students" element={<CoordinatorAppliedStudents />} />
      <Route path="/coordinator/reports/selected-students" element={<CoordinatorJobs />} />
       <Route path="/coordinator/selected-students-report"element={<SelectedStudentsReport />}/>
       <Route path="/coordinator/announcements" element={<CoordinatorAnnouncements />}/>
       <Route
  path="/coordinator/admin-announcements"
  element={<AdminAnnouncementsForCoordinator />}
/>
        {/* Add more coordinator sub-routes here when you create them */}
      </Route>

      {/* ─── Optional: redirect /coordinator → dashboard when logged in ─── */}
      <Route
        path="/coordinator"
        element={
          <CoordinatorProtected>
            <Navigate to="/coordinator/dashboard" replace />
          </CoordinatorProtected>
        }
      />
      
        


      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;