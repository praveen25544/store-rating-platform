import React from "react";
import { LogOut, ShieldCheck, Store, UserRound } from "lucide-react";

const roleIcon = {
  ADMIN: ShieldCheck,
  OWNER: Store,
  USER: UserRound
};

export default function Layout({ user, title, children, onLogout }) {
  const Icon = roleIcon[user.role] || UserRound;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Store Rating Platform</p>
          <h1>{title}</h1>
        </div>
        <div className="session">
          <span className="role-badge">
            <Icon size={16} />
            {user.role}
          </span>
          <div className="session-user">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <button className="icon-button" onClick={onLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
