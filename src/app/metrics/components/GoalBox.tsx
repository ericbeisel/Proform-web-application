"use client";

import { Edit2 } from "lucide-react";

interface GoalBoxProps {
  value: string;
  label: string;
  unit?: string;
  onEdit?: () => void;
}

export function GoalBox({ value, label, unit = "lbs", onEdit }: GoalBoxProps) {
  return (
    <div
      className="relative flex flex-col items-center rounded-2xl py-4 px-2 border"
      style={{
        width: "calc(50% - 5px)",
        backgroundColor: "#FEF3C7",
        borderColor: "#FDE68A",
      }}
    >
      {onEdit && (
        <button
          onClick={onEdit}
          className="absolute top-2 right-2 rounded-xl p-1"
          style={{ backgroundColor: "rgba(217,119,6,0.15)" }}
        >
          <Edit2 size={12} color="#D97706" />
        </button>
      )}
      <span className="text-3xl font-bold" style={{ color: "#D97706" }}>
        {value}
      </span>
      <span
        className="text-xs font-bold tracking-wide mt-1 text-center"
        style={{ color: "#92400E", letterSpacing: "0.5px" }}
      >
        {label}
      </span>
      <span className="text-xs mt-0.5" style={{ color: "#B45309" }}>
        {unit}
      </span>
    </div>
  );
}
