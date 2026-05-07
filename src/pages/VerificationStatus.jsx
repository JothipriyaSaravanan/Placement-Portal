// src/pages/VerificationStatus.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerificationStatus() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || ""; // Email passed from verification page

  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("Checking verification status...");

  useEffect(() => {
    if (!email) {
      setMessage("No email provided. Please submit verification request first.");
      setStatus("error");
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/students/check-verification-status/?email=${encodeURIComponent(email)}`
        );
        const data = await res.json();

        if (data.status === "approved") {
          setStatus("success");
          setMessage(data.message);
        } else if (data.status === "pending") {
          setStatus("pending");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message || "Something went wrong");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Network error - please try again later");
      }
    };

    checkStatus();

    // Auto-refresh every 30 seconds (while pending)
    const interval = setInterval(() => {
      if (status === "pending") checkStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [email, status]);

  const goToRegister = () => {
    navigate("/register", { state: { email } });
  };

  return (
    <div style={{ maxWidth: "600px", margin: "3rem auto", padding: "2rem", textAlign: "center" }}>
      <h2>Verification Status</h2>

      {status === "checking" && <p>Checking your verification status...</p>}

      {status === "pending" && (
        <>
          <div style={{ color: "#856404", background: "#fff3cd", padding: "1.5rem", borderRadius: "8px", margin: "1.5rem 0" }}>
            <h4 style={{ marginBottom: "0.8rem" }}>Verification Pending</h4>
            <p>{message}</p>
            <p style={{ fontSize: "0.9rem", marginTop: "1rem" }}>
              We will notify you once approved. You can check back later or refresh.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.8rem 2rem",
              background: "#ffc107",
              color: "#212529",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              marginTop: "1rem",
            }}
          >
            Check Again
          </button>
        </>
      )}

      {status === "success" && (
        <>
          <div style={{ color: "#155724", background: "#d4edda", padding: "1.5rem", borderRadius: "8px", margin: "1.5rem 0" }}>
            <h4 style={{ marginBottom: "0.8rem" }}>Verification Approved!</h4>
            <p>{message}</p>
          </div>
          <button
            onClick={goToRegister}
            style={{
              padding: "0.8rem 2.5rem",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "1.1rem",
              marginTop: "1.5rem",
            }}
          >
            Create Account Now
          </button>
        </>
      )}

      {status === "error" && (
        <div style={{ color: "#721c24", background: "#f8d7da", padding: "1.5rem", borderRadius: "8px" }}>
          <p>{message}</p>
        </div>
      )}

      <p style={{ marginTop: "2rem" }}>
        <a href="/" style={{ color: "#007bff", textDecoration: "none" }}>
          ← Back to Home
        </a>
      </p>
    </div>
  );
}