"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface BulkEditModalProps {
  visible: boolean;
  editType: "CMP" | "RMP";
  cmpValues: { bench: number; squat: number; power: number; deadlift: number };
  rmpValues: { bench: number; squat: number; power: number; deadlift: number };
  unit: string;
  isSaving: boolean;
  error: string;
  onClose: () => void;
  onSave: (fields: { bench: string; squat: string; clean: string; deadlift: string }) => void;
}

export function BulkEditModal({
  visible,
  editType,
  cmpValues,
  rmpValues,
  unit,
  isSaving,
  error,
  onClose,
  onSave,
}: BulkEditModalProps) {
  const [bench, setBench] = useState("");
  const [squat, setSquat] = useState("");
  const [clean, setClean] = useState("");
  const [deadlift, setDeadlift] = useState("");

  useEffect(() => {
    if (visible) {
      setBench("");
      setSquat("");
      setClean("");
      setDeadlift("");
    }
  }, [visible]);

  if (!visible) return null;

  const src = editType === "CMP" ? cmpValues : rmpValues;
  const placeholders = {
    bench: String(src.bench || (editType === "CMP" ? 303 : 340)),
    squat: String(src.squat || (editType === "CMP" ? 357 : 450)),
    clean: String(src.power || (editType === "CMP" ? 117 : 280)),
    deadlift: String(src.deadlift || (editType === "CMP" ? 173 : 515)),
  };

  const fields = [
    { label: `BENCH PRESS (${unit})`, val: bench, set: setBench, ph: placeholders.bench },
    { label: `BACK SQUAT (${unit})`, val: squat, set: setSquat, ph: placeholders.squat },
    { label: `POWER CLEAN (${unit})`, val: clean, set: setClean, ph: placeholders.clean },
    { label: `DEADLIFT (${unit})`, val: deadlift, set: setDeadlift, ph: placeholders.deadlift },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(15,23,42,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl pt-5 px-5 pb-10 overflow-y-auto"
        style={{ backgroundColor: "white", maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex justify-between items-center mb-5 pb-2.5 border-b"
          style={{ borderColor: "#F1F5F9" }}
        >
          <h3 className="text-lg font-bold" style={{ color: "#0F172A" }}>
            {editType === "CMP"
              ? "Edit Comprehensive Max (CMP)"
              : "Edit Current Relative Max (RMP)"}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#F8FAFC" }}
          >
            <X size={18} color="#64748B" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {fields.map((f) => (
            <div key={f.label} className="flex flex-col gap-1.5">
              <label
                className="text-xs font-bold tracking-wide"
                style={{ color: "#64748B", letterSpacing: "0.5px" }}
              >
                {f.label}
              </label>
              <input
                type="number"
                value={f.val}
                onChange={(e) => f.set(e.target.value)}
                placeholder={f.ph}
                className="border rounded-xl py-3 px-4 text-base outline-none transition-colors focus:border-purple-400"
                style={{ borderColor: "#E2E8F0", color: "#0F172A", backgroundColor: "#F8FAFC" }}
              />
            </div>
          ))}

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}

          <button
            onClick={() => onSave({ bench, squat, clean, deadlift })}
            disabled={isSaving}
            className="w-full flex items-center justify-center py-3.5 rounded-xl text-white text-sm font-bold mt-2.5 transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#6202AC" }}
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
