"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, DollarSign } from "lucide-react";

interface SetData {
  weight: string;
  reps: string;
  unableToPerform: boolean;
  submitted: boolean;
}

const SETS_COUNT = 3;
const DOLLAR_SET_INDEX = 2;

export default function DollarSetPage() {
  const router = useRouter();

  const [sets, setSets] = useState<SetData[]>(
    Array.from({ length: SETS_COUNT }, () => ({
      weight: "",
      reps: "",
      unableToPerform: false,
      submitted: false,
    })),
  );

  const updateSet = (idx: number, field: keyof SetData, value: string | boolean) => {
    setSets((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    );
  };

  const submitSet = (idx: number) => {
    updateSet(idx, "submitted", true);
  };

  return (
    <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row font-sans bg-gray-100 lg:overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-full lg:w-[220px] lg:h-full bg-gradient-to-b from-[#8b5cf6] to-[#6d28d9] shrink-0 flex flex-col">

        {/* Mobile: compact top bar */}
        <div className="flex lg:hidden items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[13px] font-black leading-tight truncate">
              Complete the <span className="text-green-400">$</span> Set
            </p>
            <p className="text-white/70 text-[10px] font-semibold uppercase truncate">
              BARBELL BOX SQUAT (5-CT. ECC.)
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
              Last
            </button>
            <button className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
              Best
            </button>
          </div>
        </div>

        {/* Mobile: suggested strip */}
        <div className="flex lg:hidden items-center gap-3 px-4 pb-3">
          <div className="bg-white/10 rounded-lg px-3 py-1.5 flex-1">
            <p className="text-yellow-300 text-[10px] font-black">Suggested: <span className="text-white font-normal">12,8,8 reps · 35kg</span></p>
          </div>
        </div>

        {/* Desktop: full sidebar */}
        <div className="hidden lg:flex flex-col flex-1 p-4 overflow-hidden">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition mb-5"
          >
            <ChevronLeft size={18} />
          </button>

          <h2 className="text-white text-[15px] font-black leading-snug mb-4">
            Complete the <span className="text-green-400">$</span> Set:
          </h2>

          <div className="w-full aspect-square bg-purple-400/40 rounded-2xl flex items-center justify-center mb-3 overflow-hidden">
            <div className="w-14 h-14 bg-purple-300/60 rounded-full flex items-center justify-center">
              <div className="w-7 h-7 bg-white/40 rounded-full" />
            </div>
          </div>

          <p className="text-white text-[11px] font-black uppercase leading-tight mb-3">
            BARBELL<br />BOX SQUAT (5-CT. ECC.)
          </p>

          <div className="flex gap-2 mb-5">
            <button className="flex-1 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[11px] font-bold py-1.5 rounded-lg transition">
              Last
            </button>
            <button className="flex-1 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[11px] font-bold py-1.5 rounded-lg transition">
              Best
            </button>
          </div>

          <div className="bg-white/10 rounded-xl p-3 mb-4">
            <p className="text-yellow-300 text-[11px] font-black mb-1.5">Suggested:</p>
            <p className="text-white text-[10px] leading-relaxed">
              Reps: 12,8,8<br />Weight: 35, 0%, 0%
            </p>
          </div>

          <p className="text-white/70 text-[10px] leading-relaxed mt-auto">
            Are you making your <span className="text-green-400 font-bold">$</span> set the same weight for this and the next round?
          </p>
        </div>
      </aside>

      {/* ── Main panel ── */}
      <main className="flex-1 flex flex-col lg:h-full lg:overflow-hidden p-4 lg:p-6 gap-4">

        {/* Header */}
        <div className="shrink-0">
          <h1 className="text-[20px] lg:text-[22px] font-black text-gray-900 mb-1">
            Input Your Sets
          </h1>
          <p className="text-[12px] text--500">
            Any sets marked with{" "}
            <span className="text-green-500 font-bold">$</span>{" "}
            must be completed to move onto the next round.
          </p>
        </div>

        {/* Sets — scrollable on desktop, natural flow on mobile */}
        <div className="flex-1 lg:overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {sets.map((set, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-[14px] font-black text-gray-800">Set {idx + 1}</p>
                  {idx === DOLLAR_SET_INDEX && (
                    <DollarSign size={16} className="text-green-500" strokeWidth={2.5} />
                  )}
                </div>

                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={set.unableToPerform}
                    onChange={(e) => updateSet(idx, "unableToPerform", e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                  <span className="text-[12px] text-gray-500">Unable to perform</span>
                </label>

                <div className="flex gap-3 mb-3">
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold text-gray-400 mb-1">Weight/kg</p>
                    <input
                      type="number"
                      placeholder="Weight"
                      value={set.weight}
                      disabled={set.unableToPerform || set.submitted}
                      onChange={(e) => updateSet(idx, "weight", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-50 disabled:text-gray-300"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold text-gray-400 mb-1">Reps/mg</p>
                    <input
                      type="number"
                      placeholder="Reps"
                      value={set.reps}
                      disabled={set.unableToPerform || set.submitted}
                      onChange={(e) => updateSet(idx, "reps", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-50 disabled:text-gray-300"
                    />
                  </div>
                </div>

                {set.submitted && (
                  <p className="text-[12px] text-red-500 mb-3 leading-relaxed">
                    new weight is squal to ( 95% of your max of InputBarballSquat , you should complete 21 ormone aps
                  </p>
                )}

                <button
                  onClick={() => submitSet(idx)}
                  disabled={set.submitted}
                  className={`w-full py-2.5 rounded-xl text-[13px] font-black uppercase tracking-widest transition ${
                    set.submitted
                      ? "bg-green-500 text-white cursor-default"
                      : "bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
                  }`}
                >
                  {set.submitted ? "Submitted ✓" : "Submit"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 pb-4 lg:pb-0">
          <button
            onClick={() => router.back()}
            className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-3.5 rounded-2xl text-[14px] transition shadow-md"
          >
            Return to workout
          </button>
        </div>
      </main>
    </div>
  );
}
