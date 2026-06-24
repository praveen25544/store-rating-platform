import React, { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCcw, Search, UserRoundCheck } from "lucide-react";
import Layout from "../components/Layout.jsx";
import SortButton from "../components/SortButton.jsx";
import StarRating from "../components/StarRating.jsx";
import { api, toQuery } from "../lib/api";

const emptyUserForm = {
  name: "",
  email: "",
  address: "",
  password: "",
  role: "USER"
};

const emptyStoreForm = {
  name: "",
  email: "",
  address: "",
  ownerId: ""
};

export default function AdminDashboard({ auth, onLogout }) {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [userFilters, setUserFilters] = useState({ name: "", email: "", address: "", role: "" });
  const [storeFilters, setStoreFilters] = useState({ name: "", email: "", address: "" });
  const [userSort, setUserSort] = useState({ sortBy: "name", sortOrder: "asc" });
  const [storeSort, setStoreSort] = useState({ sortBy: "name", sortOrder: "asc" });
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [storeForm, setStoreForm] = useState(emptyStoreForm);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const ownerOptions = useMemo(() => users.filter((user) => user.role === "OWNER"), [users]);

  async function loadStats() {
    const data = await api("/admin/dashboard", { token: auth.token });
    setStats(data);
  }

  async function loadUsers() {
    const data = await api(`/admin/users${toQuery({ ...userFilters, ...userSort })}`, {
      token: auth.token
    });
    setUsers(data.users);
  }

  async function loadStores() {
    const data = await api(`/admin/stores${toQuery({ ...storeFilters, ...storeSort })}`, {
      token: auth.token
    });
    setStores(data.stores);
  }

  async function refreshAll() {
    setError("");
    try {
      await Promise.all([loadStats(), loadUsers(), loadStores()]);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    loadUsers().catch((err) => setError(err.message));
  }, [userFilters, userSort]);

  useEffect(() => {
    loadStores().catch((err) => setError(err.message));
  }, [storeFilters, storeSort]);

  async function createUser(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api("/admin/users", {
        method: "POST",
        token: auth.token,
        body: userForm
      });
      setUserForm(emptyUserForm);
      setMessage("User added.");
      await refreshAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function createStore(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api("/admin/stores", {
        method: "POST",
        token: auth.token,
        body: storeForm
      });
      setStoreForm(emptyStoreForm);
      setMessage("Store added.");
      await refreshAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function viewUser(id) {
    setError("");
    try {
      const data = await api(`/admin/users/${id}`, { token: auth.token });
      setSelectedUser(data.user);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout user={auth.user} title="Administrator Dashboard" onLogout={onLogout}>
      <nav className="tabs">
        {["overview", "stores", "users", "add user", "add store"].map((item) => (
          <button
            type="button"
            key={item}
            className={tab === item ? "active" : ""}
            onClick={() => setTab(item)}
          >
            {item.replace(/\b\w/g, (char) => char.toUpperCase())}
          </button>
        ))}
        <button type="button" onClick={refreshAll} title="Refresh">
          <RefreshCcw size={16} />
        </button>
      </nav>

      {error && <p className="error-banner">{error}</p>}
      {message && <p className="success-banner">{message}</p>}

      {tab === "overview" && (
        <section className="stats-grid">
          <article className="stat-card">
            <span>Total users</span>
            <strong>{stats.totalUsers}</strong>
          </article>
          <article className="stat-card">
            <span>Total stores</span>
            <strong>{stats.totalStores}</strong>
          </article>
          <article className="stat-card">
            <span>Total ratings</span>
            <strong>{stats.totalRatings}</strong>
          </article>
        </section>
      )}

      {tab === "stores" && (
        <section className="panel">
          <div className="toolbar">
            {["name", "email", "address"].map((field) => (
              <label key={field}>
                {field}
                <input
                  value={storeFilters[field]}
                  onChange={(event) =>
                    setStoreFilters({ ...storeFilters, [field]: event.target.value })
                  }
                />
              </label>
            ))}
            <Search size={18} />
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th><SortButton label="Name" field="name" sort={storeSort} onSort={setStoreSort} /></th>
                  <th><SortButton label="Email" field="email" sort={storeSort} onSort={setStoreSort} /></th>
                  <th><SortButton label="Address" field="address" sort={storeSort} onSort={setStoreSort} /></th>
                  <th><SortButton label="Rating" field="rating" sort={storeSort} onSort={setStoreSort} /></th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id}>
                    <td>{store.name}</td>
                    <td>{store.email}</td>
                    <td>{store.address}</td>
                    <td>
                      <StarRating value={Math.round(store.rating)} readonly />
                      <span>{store.rating.toFixed(1)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "users" && (
        <section className="panel split-panel">
          <div>
            <div className="toolbar">
              {["name", "email", "address"].map((field) => (
                <label key={field}>
                  {field}
                  <input
                    value={userFilters[field]}
                    onChange={(event) =>
                      setUserFilters({ ...userFilters, [field]: event.target.value })
                    }
                  />
                </label>
              ))}
              <label>
                role
                <select
                  value={userFilters.role}
                  onChange={(event) => setUserFilters({ ...userFilters, role: event.target.value })}
                >
                  <option value="">All</option>
                  <option value="ADMIN">Admin</option>
                  <option value="USER">Normal user</option>
                  <option value="OWNER">Store owner</option>
                </select>
              </label>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th><SortButton label="Name" field="name" sort={userSort} onSort={setUserSort} /></th>
                    <th><SortButton label="Email" field="email" sort={userSort} onSort={setUserSort} /></th>
                    <th><SortButton label="Address" field="address" sort={userSort} onSort={setUserSort} /></th>
                    <th><SortButton label="Role" field="role" sort={userSort} onSort={setUserSort} /></th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.address}</td>
                      <td>{user.role}</td>
                      <td>
                        <button className="small-button" onClick={() => viewUser(user.id)} type="button">
                          <UserRoundCheck size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedUser && (
            <aside className="detail-box">
              <h2>{selectedUser.name}</h2>
              <p>{selectedUser.email}</p>
              <p>{selectedUser.address}</p>
              <p>Role: {selectedUser.role}</p>
              {selectedUser.role === "OWNER" && (
                <p>Store rating: {selectedUser.storeRating?.toFixed(1) || "0.0"}</p>
              )}
            </aside>
          )}
        </section>
      )}

      {tab === "add user" && (
        <section className="panel">
          <form className="form-grid wide" onSubmit={createUser}>
            <label>
              Name
              <input value={userForm.name} minLength={20} maxLength={60} required onChange={(event) => setUserForm({ ...userForm, name: event.target.value })} />
            </label>
            <label>
              Email
              <input type="email" value={userForm.email} required onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} />
            </label>
            <label>
              Address
              <textarea value={userForm.address} maxLength={400} required onChange={(event) => setUserForm({ ...userForm, address: event.target.value })} />
            </label>
            <label>
              Password
              <input type="password" value={userForm.password} minLength={8} maxLength={16} required onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} />
            </label>
            <label>
              Role
              <select value={userForm.role} onChange={(event) => setUserForm({ ...userForm, role: event.target.value })}>
                <option value="USER">Normal user</option>
                <option value="OWNER">Store owner</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            <button type="submit">
              <Plus size={16} />
              Add user
            </button>
          </form>
        </section>
      )}

      {tab === "add store" && (
        <section className="panel">
          <form className="form-grid wide" onSubmit={createStore}>
            <label>
              Store name
              <input value={storeForm.name} minLength={20} maxLength={60} required onChange={(event) => setStoreForm({ ...storeForm, name: event.target.value })} />
            </label>
            <label>
              Store email
              <input type="email" value={storeForm.email} required onChange={(event) => setStoreForm({ ...storeForm, email: event.target.value })} />
            </label>
            <label>
              Address
              <textarea value={storeForm.address} maxLength={400} required onChange={(event) => setStoreForm({ ...storeForm, address: event.target.value })} />
            </label>
            <label>
              Store owner
              <select value={storeForm.ownerId} onChange={(event) => setStoreForm({ ...storeForm, ownerId: event.target.value })}>
                <option value="">No owner assigned</option>
                {ownerOptions.map((owner) => (
                  <option key={owner.id} value={owner.id}>{owner.name}</option>
                ))}
              </select>
            </label>
            <button type="submit">
              <Plus size={16} />
              Add store
            </button>
          </form>
        </section>
      )}
    </Layout>
  );
}
