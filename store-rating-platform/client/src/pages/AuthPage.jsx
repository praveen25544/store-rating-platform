import React, { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { api } from "../lib/api";

const initialSignup = {
  name: "",
  email: "",
  address: "",
  password: ""
};

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [login, setLogin] = useState({ email: "", password: "" });
  const [signup, setSignup] = useState(initialSignup);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api("/auth/login", { method: "POST", body: login });
      onAuth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitSignup(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api("/auth/signup", { method: "POST", body: signup });
      onAuth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-copy">
          <p className="eyebrow">Store Rating Platform</p>
          <h1>Sign in to manage stores and ratings</h1>
          <p>
            One account system for administrators, customers, and store owners.
          </p>
        </div>

        <div className="auth-box">
          <div className="segmented">
            <button
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
              type="button"
            >
              <LogIn size={16} />
              Login
            </button>
            <button
              className={mode === "signup" ? "active" : ""}
              onClick={() => setMode("signup")}
              type="button"
            >
              <UserPlus size={16} />
              Signup
            </button>
          </div>

          {mode === "login" ? (
            <form onSubmit={submitLogin} className="form-grid">
              <label>
                Email
                <input
                  type="email"
                  value={login.email}
                  onChange={(event) => setLogin({ ...login, email: event.target.value })}
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={login.password}
                  onChange={(event) => setLogin({ ...login, password: event.target.value })}
                  required
                />
              </label>
              <button disabled={loading} type="submit">
                <LogIn size={16} />
                Login
              </button>
            </form>
          ) : (
            <form onSubmit={submitSignup} className="form-grid">
              <label>
                Name
                <input
                  value={signup.name}
                  onChange={(event) => setSignup({ ...signup, name: event.target.value })}
                  minLength={20}
                  maxLength={60}
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={signup.email}
                  onChange={(event) => setSignup({ ...signup, email: event.target.value })}
                  required
                />
              </label>
              <label>
                Address
                <textarea
                  value={signup.address}
                  onChange={(event) => setSignup({ ...signup, address: event.target.value })}
                  maxLength={400}
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={signup.password}
                  onChange={(event) => setSignup({ ...signup, password: event.target.value })}
                  minLength={8}
                  maxLength={16}
                  required
                />
              </label>
              <button disabled={loading} type="submit">
                <UserPlus size={16} />
                Create account
              </button>
            </form>
          )}

          {error && <p className="error-banner">{error}</p>}
        </div>
      </section>
    </main>
  );
}
