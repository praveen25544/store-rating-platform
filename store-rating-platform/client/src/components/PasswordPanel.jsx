import React, { useState } from "react";
import { Save } from "lucide-react";
import { api } from "../lib/api";

export default function PasswordPanel({ token }) {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api("/auth/password", {
        method: "PATCH",
        token,
        body: { password }
      });
      setPassword("");
      setMessage("Password updated.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="toolbar" onSubmit={submit}>
      <label>
        New password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          maxLength={16}
          required
        />
      </label>
      <button type="submit">
        <Save size={16} />
        Update
      </button>
      {message && <span className="success-text">{message}</span>}
      {error && <span className="error-text">{error}</span>}
    </form>
  );
}
