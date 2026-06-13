"use client";

import { useState, useEffect } from "react";
import { X, ChevronUp, ChevronDown, Dumbbell, Activity, Zap, TrendingUp } from "lucide-react";
import type { LiftKey } from "./types";

const LIFT_ICON_BG: Record<LiftKey, string> = {
  benchPress: "#F3E8FF",
  backSquat: "#E0F7FA",
  powerClean: "#FEF3C7",
  deadlift: "#FEE2E2",
};

const LIFT_ICON_COLOR: Record<LiftKey, string> = {
  benchPress: "#7B5EA7",
  backSquat: "#06BCC1",
  powerClean: "#F59E0B",
  deadlift: "#EF4444",
};

function LiftIcon({ liftKey }: { liftKey: LiftKey }) {
  const color = LIFT_ICON_COLOR[liftKey];
  if (liftKey === "benchPress") return <Dumbbell size={36} color={color} />;
  if (liftKey === "backSquat") return <Activity size={36} color={color} />;
  if (liftKey === "powerClean") return <Zap size={36} color={color} />;
  return <TrendingUp size={36} color={color} />;
}

interface AdjusterModalProps {
  visible: boolean;
  adjusterType: "RMP" | "GOAL";
  liftKey: LiftKey;
  liftLabel: string;
  defaultValue: number;
  unit: string;
  isSaving: boolean;
  error: string;
  onClose: () => void;
  onUpdate: (val: number) => void;
}

export function AdjusterModal({
  visible,
  adjusterType,
  liftKey,
  liftLabel,
  defaultValue,
  unit,
  isSaving,
  error,
  onClose,
  onUpdate,
}: AdjusterModalProps) {
  const [inputVal, setInputVal] = useState("");

  useEffect(() => {
    if (visible) setInputVal("");
  }, [visible]);

  if (!visible) return null;

  const current = parseFloat(inputVal) || defaultValue || 0;
  const increment = () => setInputVal(String(current + 1));
  const decrement = () => setInputVal(String(Math.max(0, current - 1)));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center rounded-3xl py-8 px-6 shadow-2xl"
        style={{ width: "85%", maxWidth: 400, backgroundColor: "#FFFFFF" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-5 right-5 z-10">
          <X size={20} color="#1a1a1a" />
        </button>

        <span className="text-base font-medium" style={{ color: "#666666" }}>
          {adjusterType === "GOAL" ? "Adjust your Goal" : "Adjust your"}
        </span>
        <span
          className="text-2xl font-bold mt-0.5 mb-5 uppercase"
          style={{ color: "#1a1a1a" }}
        >
          {liftLabel}
        </span>

        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
          style={{ backgroundColor: LIFT_ICON_BG[liftKey] }}
        >
          <LiftIcon liftKey={liftKey} />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <input
            type="number"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={String(defaultValue)}
            className="text-center font-bold text-gray-900 bg-transparent outline-none border-b-2 border-gray-200 py-1 px-2"
            style={{ fontSize: 44, minWidth: 90, width: 120 }}
          />
          <div className="flex flex-col gap-0.5">
            <button onClick={increment} className="p-0.5">
              <ChevronUp size={22} color="#1a1a1a" />
            </button>
            <button onClick={decrement} className="p-0.5">
              <ChevronDown size={22} color="#1a1a1a" />
            </button>
          </div>
        </div>

        <span className="text-xs mb-4" style={{ color: "#888888" }}>
          in {unit?.toLowerCase() === "kg" ? "Kilograms (kg)" : "Pounds (lbs)"}
        </span>

        {error && (
          <span className="text-xs text-red-500 mb-2 text-center">{error}</span>
        )}

        <button
          onClick={() => onUpdate(current)}
          disabled={isSaving}
          className="flex items-center justify-center w-11/12 py-3.5 rounded-xl text-white text-base font-bold transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{
            backgroundColor: "#000000",
            borderRight: "3px solid #7B5EA7",
            borderBottom: "3px solid #7B5EA7",
          }}
        >
          {isSaving ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving…
            </>
          ) : (
            "Update"
          )}
        </button>
      </div>
    </div>
  );
}
