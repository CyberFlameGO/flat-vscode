import React from "react";

export function Spinner({ children }) {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-4">
        <svg className="spinner" viewBox="0 0 50 50">
          <circle
            className="path"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="5"
          ></circle>
        </svg>
      </div>
      <span>{children}</span>
    </div>
  );
}
