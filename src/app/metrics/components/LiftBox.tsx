"use client";

import { ArrowUp, ArrowDown, Edit2 } from "lucide-react";
import { calculateDaysAgo } from "./helpers";

interface LiftBoxProps {
  value: string;
  label: string;
  color: string;
  oldValue?: string;
  updatedAt?: string;
  showDaysAgo?: boolean;
  onEdit?: () => void;
  unit?: string;
  showEdit?: boolean;
}

export function LiftBox({
  value,
  label,
  color,
  oldValue,
  updatedAt,
  showDaysAgo,
  onEdit,
  unit = "lbs",
  showEdit,
}: LiftBoxProps) {
  const current = parseFloat(value) || 0;
  const old = parseFloat(oldValue || "") || 0;

  let TrendIcon: typeof ArrowUp | null = null;
  let trendColor = "";
  if (showDaysAgo && old !== 0 && current !== old) {
    TrendIcon = current > old ? ArrowUp : ArrowDown;
    trendColor = current > old ? "#22C55E" : "#EF4444";
  }

  const daysAgoText = showDaysAgo && updatedAt ? calculateDaysAgo(updatedAt) : "";

  return (
    <div
      className="relative flex flex-col items-center rounded-2xl py-4 px-2"
      style={{ backgroundColor: color, width: "calc(50% - 5px)" }}
    >
      {showEdit && onEdit && (
        <button
          onClick={onEdit}
          className="absolute top-2 right-2 rounded-xl p-1 z-10"
          style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
        >
          <Edit2 size={12} color="#FFFFFF" />
        </button>
      )}
      <div className="flex items-center gap-1">
        <span className="text-3xl font-bold text-white">{value}</span>
        {TrendIcon && (
          <div
            className="rounded-full p-0.5 ml-0.5"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <TrendIcon size={12} color={trendColor} strokeWidth={3.5} />
          </div>
        )}
      </div>
      <span
        className="text-xs font-bold tracking-wide mt-1 text-center"
        style={{ color: "rgba(255,255,255,0.85)", letterSpacing: "0.6px" }}
      >
        {label}
      </span>
      <span className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
        {unit}
      </span>
      {showDaysAgo && daysAgoText && (
        <span
          className="text-xs mt-1 text-center"
          style={{ color: "rgba(255,255,255,0.85)", fontSize: 10 }}
        >
          {daysAgoText}
        </span>
      )}
    </div>
  );
}
