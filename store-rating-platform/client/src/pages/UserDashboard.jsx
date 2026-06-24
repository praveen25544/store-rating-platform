import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Layout from "../components/Layout.jsx";
import PasswordPanel from "../components/PasswordPanel.jsx";
import SortButton from "../components/SortButton.jsx";
import StarRating from "../components/StarRating.jsx";
import { api, toQuery } from "../lib/api";

export default function UserDashboard({ auth, onLogout }) {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: "", address: "" });
  const [sort, setSort] = useState({ sortBy: "name", sortOrder: "asc" });
  const [error, setError] = useState("");

  async function loadStores() {
    const data = await api(`/stores${toQuery({ ...filters, ...sort })}`, { token: auth.token });
    setStores(data.stores);
  }

  useEffect(() => {
    loadStores().catch((err) => setError(err.message));
  }, [filters, sort]);

  async function rateStore(storeId, value) {
    setError("");

    try {
      await api(`/stores/${storeId}/rating`, {
        method: "PUT",
        token: auth.token,
        body: { value }
      });
      await loadStores();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout user={auth.user} title="Store Ratings" onLogout={onLogout}>
      <PasswordPanel token={auth.token} />
      {error && <p className="error-banner">{error}</p>}

      <section className="panel">
        <div className="toolbar">
          <label>
            Store name
            <input
              value={filters.name}
              onChange={(event) => setFilters({ ...filters, name: event.target.value })}
            />
          </label>
          <label>
            Address
            <input
              value={filters.address}
              onChange={(event) => setFilters({ ...filters, address: event.target.value })}
            />
          </label>
          <Search size={18} />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th><SortButton label="Store Name" field="name" sort={sort} onSort={setSort} /></th>
                <th><SortButton label="Address" field="address" sort={sort} onSort={setSort} /></th>
                <th><SortButton label="Overall" field="rating" sort={sort} onSort={setSort} /></th>
                <th>Your rating</th>
                <th>Submit or modify</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id}>
                  <td>{store.name}</td>
                  <td>{store.address}</td>
                  <td>
                    <StarRating value={Math.round(store.overallRating)} readonly />
                    <span>{store.overallRating.toFixed(1)}</span>
                  </td>
                  <td>{store.userRating ? `${store.userRating}/5` : "Not rated"}</td>
                  <td>
                    <StarRating
                      value={store.userRating || 0}
                      onChange={(value) => rateStore(store.id, value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}
