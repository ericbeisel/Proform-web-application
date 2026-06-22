"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Dumbbell, ChevronDown, Pencil, Plus, Zap } from "lucide-react";

const UNIT_OPTIONS = ["lbs", "kg", "% 1RM", "RPE"];
const SET_OPTIONS = ["Set 1", "Set 2", "Set 3", "Set 4", "Set 5"];

export default function SetDetailsPage() {
  const router = useRouter();

  const [repMin] = useState("8");
  const [repMax] = useState("12");
  const [weight] = useState("155");
  const [percentage] = useState("45");
  const [selectedSet, setSelectedSet] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("lbs");
  const [selectedUnit2, setSelectedUnit2] = useState("lbs");

  // Set 1 fields
  const [weightR, setWeightR] = useState("");
  const [reps, setReps] = useState("");
  const [mets, setMets] = useState("");
  const [metsUnit, setMetsUnit] = useState("");
  const [miles, setMiles] = useState("");
  const [rpms, setRpms] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [calories, setCalories] = useState("");
  const [watt, setWatt] = useState("");
  const [addPowerset, setAddPowerset] = useState(false);
  const [notes, setNotes] = useState("");

  return (
    <div
      className="min-h-screen bg-gray-100"
      style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
    >
      {/* Purple header */}
      <div className="bg-gradient-to-b from-purple-700 to-purple-600 px-4 pt-4 pb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-purple-500/50 flex items-center justify-center text-white hover:bg-purple-500/80 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>

          <h1 className="text-white font-bold text-lg">Set Details</h1>

          <button
            className="w-9 h-9 rounded-full bg-purple-500/50 flex items-center justify-center text-white hover:bg-purple-500/80 transition-colors"
            aria-label="Edit"
          >
            <Pencil size={15} />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-1 pb-10 flex flex-col gap-4">

        {/* Last / Best card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex overflow-hidden">
          <div className="flex-1 px-5 py-4 text-center border-r border-gray-100">
            <p className="font-bold text-gray-900 text-sm mb-1">Last:</p>
            <p className="text-gray-400 text-xs">No records yet</p>
          </div>
          <div className="flex-1 px-5 py-4 text-center">
            <p className="font-bold text-gray-900 text-sm mb-1">Best:</p>
            <p className="text-gray-400 text-xs">No records yet</p>
          </div>
        </div>

        {/* Exercise info row */}
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Dumbbell size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-tight">BARBELL</p>
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              BENCH PRESS (3-REP CLUSTERS)
            </p>
            <p className="text-sm font-bold text-purple-600 mt-0.5">Suggested:</p>
          </div>
          <button className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-xl flex-shrink-0 transition-colors shadow-sm">
            <Camera size={14} />
            Upload Photo
          </button>
        </div>

        {/* Suggested inputs card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 opacity-50 pointer-events-none select-none">
          {/* Row 1 */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <select
                value={selectedSet}
                onChange={(e) => setSelectedSet(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-500 bg-white focus:outline-none focus:border-purple-400 pr-7"
              >
                <option value="">—</option>
                {SET_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <input
              readOnly
              value={repMin}
              className="w-10 text-center border border-gray-200 rounded-xl px-1 py-2.5 text-sm font-semibold text-gray-800 bg-white focus:outline-none"
            />
            <span className="text-gray-400 font-semibold text-sm">-</span>
            <input
              readOnly
              value={repMax}
              className="w-10 text-center border border-gray-200 rounded-xl px-1 py-2.5 text-sm font-semibold text-gray-800 bg-white focus:outline-none"
            />

            <div className="relative flex-1">
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-500 bg-white focus:outline-none focus:border-purple-400 pr-7"
              >
                <option value="">—</option>
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={weight}
              className="w-14 text-center border-2 border-purple-500 rounded-xl px-1 py-2.5 text-sm font-bold text-gray-800 focus:outline-none"
            />
            <input
              readOnly
              value={percentage}
              className="w-10 text-center border border-gray-200 rounded-xl px-1 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none"
            />
            <div className="relative flex-1">
              <select
                value={selectedUnit2}
                onChange={(e) => setSelectedUnit2(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-500 bg-white focus:outline-none focus:border-purple-400 pr-7"
              >
                <option value="">—</option>
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[11px] font-bold text-gray-700">RV: 8</p>
              <p className="text-[10px] text-gray-500 leading-tight">Set Based on<br />Percentage</p>
            </div>
          </div>

          {/* AI suggestion lines */}
          <p className="text-[11px] text-red-500 font-medium leading-snug">
            *AI suggests This is {percentage}% of your BENCH PRESS at {repMin}-{repMax} rep.
          </p>
          <p className="text-[11px] text-red-500 font-medium leading-snug -mt-2">
            *AI suggests 183 lbs at 8 or more reps.
          </p>
        </div>

        {/* Set 1 card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
          {/* Set header */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[11px] font-bold">1</span>
            </div>
            <span className="font-bold text-gray-900 text-sm">Set 1</span>
          </div>

          {/* Weight / Reps row */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Weight/R..."
              value={weightR}
              onChange={(e) => setWeightR(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-purple-400"
            />
            <input
              type="text"
              placeholder="Add REPS"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-purple-500 placeholder-purple-400 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* METs row */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="METs"
              value={mets}
              onChange={(e) => setMets(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-purple-400"
            />
            <div className="relative flex-1">
              <select
                value={metsUnit}
                onChange={(e) => setMetsUnit(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-500 bg-white focus:outline-none focus:border-purple-400 pr-7"
              >
                <option value="">—</option>
                <option value="min">min</option>
                <option value="hr">hr</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Miles / RPMs / HR row */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Miles"
              value={miles}
              onChange={(e) => setMiles(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-purple-400"
            />
            <input
              type="text"
              placeholder="RPM's"
              value={rpms}
              onChange={(e) => setRpms(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-purple-400"
            />
            <input
              type="text"
              placeholder="HR (Heart R...)"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Calories / Watt row */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Calories"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-purple-400"
            />
            <input
              type="text"
              placeholder="Watt"
              value={watt}
              onChange={(e) => setWatt(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* AI suggestion */}
          <p className="text-[11px] text-red-500 font-medium leading-snug">
            *AI suggests This is 45% of your BENCH PRESS at 8-12 rep.
          </p>

          {/* Add powerset checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={addPowerset}
              onChange={(e) => setAddPowerset(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 accent-purple-600"
            />
            <span className="text-sm text-gray-700 font-medium">Add powerset</span>
          </label>

          {/* Notes */}
          <textarea
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-purple-400 resize-none"
          />
        </div>

        {/* Bottom action buttons */}
        <button className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm py-4 rounded-2xl shadow-sm transition-colors">
          <Zap size={16} className="fill-white" />
          Save Exercise
        </button>

        <button className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm py-4 rounded-2xl shadow-sm transition-colors">
          <Plus size={16} />
          Save and Add workout
        </button>

        <button className="w-full flex items-center justify-center gap-2 bg-purple-900 hover:bg-purple-950 text-white font-bold text-sm py-4 rounded-2xl shadow-sm transition-colors">
          <Zap size={16} className="fill-white" />
          Save and Add Custom Exercise Standard
        </button>

      </div>
    </div>
  );
}
