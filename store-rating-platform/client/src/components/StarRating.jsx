import React from "react";

export default function StarRating({ value = 0, onChange, readonly = false }) {
  return (
    <div className="stars" aria-label={`Rating ${value || 0}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={star <= value ? "star active" : "star"}
          disabled={readonly}
          onClick={() => onChange?.(star)}
          title={`${star} star`}
        >
          {"★"}
        </button>
      ))}
    </div>
  );
}
