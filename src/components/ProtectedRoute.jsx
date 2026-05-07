// import { Navigate } from "react-router-dom";

// const ProtectedRoute = ({ children }) => {
//   const studentId = localStorage.getItem("studentId");
//   const isVerified = localStorage.getItem("isVerified") === "true";

//   if (!studentId) {
//     return <Navigate to="/login" replace />;
//   }

//   if (!isVerified) {
//     alert("Your account is not verified by admin yet");
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;
// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

/* Student Protected Route */
export const StudentProtectedRoute = ({ children }) => {
  const studentId = localStorage.getItem("studentId");
  const isVerified = localStorage.getItem("isVerified") === "true";

  if (!studentId) {
    return <Navigate to="/login" replace />;
  }

  if (!isVerified) {
    alert("Your account is not verified by admin yet");
    return <Navigate to="/login" replace />;
  }

  return children;
};

/* Company Protected Route */
export const CompanyProtectedRoute = ({ children }) => {
  const companyId = localStorage.getItem("companyId"); // or however you track login
  return companyId ? children : <Navigate to="/company-login" replace />;
};
