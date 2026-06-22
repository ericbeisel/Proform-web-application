"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Dumbbell, ChevronDown } from "lucide-react";

const SET_OPTIONS = ["Set 1", "Set 2", "Set 3", "Set 4", "Set 5"];
const UNIT_OPTIONS = ["lbs", "kg", "% 1RM", "RPE"];

export default function ExerciseDetailsPage() {
  const router = useRouter();

  const [repMin, setRepMin] = useState("8");
  const [repMax, setRepMax] = useState("12");
  const [weight, setWeight] = useState("155");
  const [percentage, setPercentage] = useState("45");
  const [selectedSet, setSelectedSet] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("lbs");
  const [selectedUnit2, setSelectedUnit2] = useState("lbs");

  return (
    <div
      className="min-h-screen bg-gray-100"
      style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
    >
      {/* Purple header */}
      <div className="bg-gradient-to-b from-purple-700 to-purple-600 px-4 pt-4 pb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-purple-500/50 flex items-center justify-center text-white hover:bg-purple-500/80 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="flex-1 text-center text-white font-bold text-lg pr-9">
            Exercise Details
          </h1>
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
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Dumbbell size={24} className="text-white" />
          </div>

          {/* Name + suggested */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-tight">BARBELL</p>
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              BENCH PRESS (3-REP CLUSTERS)
            </p>
            <p className="text-sm font-bold text-purple-600 mt-0.5">Suggested:</p>
          </div>

          {/* Upload Photo button */}
          <button className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-xl flex-shrink-0 transition-colors shadow-sm">
            <Camera size={14} />
            Upload Photo
          </button>
        </div>

        {/* Input card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">

          {/* Row 1: set dropdown | rep min | - | rep max | unit dropdown */}
          <div className="flex items-center gap-2">
            {/* Set dropdown */}
            <div className="relative flex-1">
              <select
                value={selectedSet}
                onChange={(e) => setSelectedSet(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-purple-400 pr-7"
              >
                <option value="">—</option>
                {SET_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Rep min */}
            <input
              type="number"
              value={repMin}
              onChange={(e) => setRepMin(e.target.value)}
              className="w-12 text-center border border-gray-200 rounded-xl px-2 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-400"
            />

            <span className="text-gray-400 font-semibold text-sm">-</span>

            {/* Rep max */}
            <input
              type="number"
              value={repMax}
              onChange={(e) => setRepMax(e.target.value)}
              className="w-12 text-center border border-gray-200 rounded-xl px-2 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-400"
            />

            {/* Unit dropdown */}
            <div className="relative flex-1">
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full appearance-none border border-purple-400 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-purple-500 pr-7"
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Row 2: weight | percentage | unit dropdown | RV label */}
          <div className="flex items-center gap-2">
            {/* Weight input */}
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-16 text-center border-2 border-purple-500 rounded-xl px-2 py-2.5 text-sm font-bold text-gray-800 focus:outline-none focus:border-purple-600"
            />

            {/* Percentage input */}
            <input
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="w-12 text-center border border-gray-200 rounded-xl px-2 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-400"
            />

            {/* Second unit dropdown */}
            <div className="relative flex-1">
              <select
                value={selectedUnit2}
                onChange={(e) => setSelectedUnit2(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-purple-400 pr-7"
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* RV label */}
            <div className="text-right flex-shrink-0">
              <p className="text-[11px] font-bold text-gray-700">RV: 8</p>
              <p className="text-[10px] text-gray-500 leading-tight">Set Based on<br />Percentage</p>
            </div>
          </div>

          {/* AI suggestion text */}
          <p className="text-[11px] text-red-500 font-medium leading-snug">
            *AI suggests This is {percentage}% of your BENCH PRESS at {repMin}-{repMax} rep.
          </p>

          {/* Save button */}
          <div className="flex justify-end mt-1">
            <button
              onClick={() => router.push("/set-details")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm px-10 py-3 rounded-full shadow-sm transition-colors"
            >
              Save
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
