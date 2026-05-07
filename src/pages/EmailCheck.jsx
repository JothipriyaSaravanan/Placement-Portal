import { useState } from "react";
import { useNavigate } from "react-router-dom";

function EmailCheck() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const checkEmail = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/check-student/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (data.action === "LOGIN") navigate("/login", { state: { email } });
    else if (data.action === "WAIT_FOR_APPROVAL") navigate("/pending");
    else navigate("/request-access", { state: { email } });
  };

  return (
    <div>
      <h2>Enter your email</h2>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button onClick={checkEmail}>Continue</button>
    </div>
  );
}

export default EmailCheck;
