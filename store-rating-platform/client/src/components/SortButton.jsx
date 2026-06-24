import React from "react";
import { ArrowDownUp } from "lucide-react";

export default function SortButton({ label, field, sort, onSort }) {
  const active = sort.sortBy === field;
  const nextOrder = active && sort.sortOrder === "asc" ? "desc" : "asc";

  return (
    <button
      type="button"
      className={active ? "sort-button active" : "sort-button"}
      onClick={() => onSort({ sortBy: field, sortOrder: nextOrder })}
      title={`Sort by ${label}`}
    >
      {label}
      <ArrowDownUp size={14} />
      {active ? sort.sortOrder : ""}
    </button>
  );
}
