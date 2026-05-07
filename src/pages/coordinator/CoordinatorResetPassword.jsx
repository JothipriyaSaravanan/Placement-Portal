import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function CoordinatorResetPassword() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/coordinator/password-reset/verify-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("Password reset successfully!");
        setTimeout(() => navigate("/coordinator/login"), 1200);
      } else {
        setMessage(data.error || "Failed to reset password.");
      }
    } catch (err) {
      setMessage("Server error. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <h2>Reset Password</h2>
      {message && <div>{message}</div>}
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={handleResetPassword} disabled={isLoading}>
        {isLoading ? "Resetting..." : "Reset Password"}
      </button>
    </div>
  );
}
