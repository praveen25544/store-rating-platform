import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout.jsx";
import PasswordPanel from "../components/PasswordPanel.jsx";
import SortButton from "../components/SortButton.jsx";
import StarRating from "../components/StarRating.jsx";
import { api } from "../lib/api";

export default function OwnerDashboard({ auth, onLogout }) {
  const [dashboard, setDashboard] = useState({
    store: null,
    averageRating: 0,
    ratings: []
  });
  const [sort, setSort] = useState({ sortBy: "updatedAt", sortOrder: "desc" });
  const [error, setError] = useState("");

  useEffect(() => {
    api("/owner/dashboard", { token: auth.token })
      .then(setDashboard)
      .catch((err) => setError(err.message));
  }, []);

  const ratings = useMemo(() => {
    const list = [...dashboard.ratings];
    const key = sort.sortBy;

    list.sort((a, b) => {
      const direction = sort.sortOrder === "asc" ? 1 : -1;
      const left = key === "rating" ? a.value : key === "updatedAt" ? new Date(a.updatedAt).getTime() : a.user[key].toLowerCase();
      const right = key === "rating" ? b.value : key === "updatedAt" ? new Date(b.updatedAt).getTime() : b.user[key].toLowerCase();

      if (left < right) return -1 * direction;
      if (left > right) return 1 * direction;
      return 0;
    });

    return list;
  }, [dashboard.ratings, sort]);

  return (
    <Layout user={auth.user} title="Store Owner Dashboard" onLogout={onLogout}>
      <PasswordPanel token={auth.token} />
      {error && <p className="error-banner">{error}</p>}

      <section className="stats-grid">
        <article className="stat-card">
          <span>Average rating</span>
          <strong>{dashboard.averageRating.toFixed(1)}</strong>
          <StarRating value={Math.round(dashboard.averageRating)} readonly />
        </article>
        <article className="stat-card">
          <span>Total submissions</span>
          <strong>{dashboard.ratings.length}</strong>
        </article>
        <article className="stat-card">
          <span>Store</span>
          <strong>{dashboard.store?.name || "Not assigned"}</strong>
        </article>
      </section>

      <section className="panel">
        <h2>Rating submissions</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th><SortButton label="User" field="name" sort={sort} onSort={setSort} /></th>
                <th><SortButton label="Email" field="email" sort={sort} onSort={setSort} /></th>
                <th><SortButton label="Address" field="address" sort={sort} onSort={setSort} /></th>
                <th><SortButton label="Rating" field="rating" sort={sort} onSort={setSort} /></th>
                <th><SortButton label="Updated" field="updatedAt" sort={sort} onSort={setSort} /></th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((rating) => (
                <tr key={rating.id}>
                  <td>{rating.user.name}</td>
                  <td>{rating.user.email}</td>
                  <td>{rating.user.address}</td>
                  <td>
                    <StarRating value={rating.value} readonly />
                    <span>{rating.value}/5</span>
                  </td>
                  <td>{new Date(rating.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}
