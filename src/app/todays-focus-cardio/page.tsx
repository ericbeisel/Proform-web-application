"use client";

import { useState } from "react";
import {
  Plus,
  Calendar,
  X,
  ChevronDown,
  List,
  Flame,
  Pencil,
} from "lucide-react";

export default function SubmitCardio() {
  const [openGoal, setOpenGoal] = useState(false);
  const [openCompleted, setOpenCompleted] = useState(true);

  return (
    <div className="min-h-screen bg-[#f0f4f8] w-full">
      {/* Full Width Container */}
      <div className="w-full bg-white min-h-screen">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#f0f0f5]">
          <div className="flex items-center gap-4">
            <button className="bg-[#7c3aed] text-white p-3 rounded-2xl shadow-md">
              <Plus size={22} />
            </button>
            <button className="text-[#7c3aed]">
              <Calendar size={26} />
            </button>
          </div>
          <button className="text-gray-400 hover:text-gray-600 p-2">
            <X size={28} />
          </button>
        </div>

        {/* TITLE */}
        <div className="text-center py-7 border-b border-[#f0f0f5]">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Flame className="text-orange-500" size={32} />
            <h1 className="font-bold text-3xl text-[#1a1a2e]">Submit Cardio</h1>
          </div>
          <p className="text-gray-500">Submit Cardio:</p>
        </div>

        {/* STATS BAR */}
        <div className="px-6 py-7 flex items-center justify-between border-b border-[#f0f0f5]">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center">
                193
              </div>
              <button className="bg-[#7c3aed] text-white p-4 rounded-2xl">
                <List size={22} />
              </button>
            </div>

            <div>
              <p className="text-[#7c3aed] font-medium">Left this week:</p>
              <p className="text-[#5d00b4] font-bold text-4xl tracking-tighter">5200</p>
            </div>
          </div>

          <button className="text-sm font-medium text-gray-500 hover:text-[#7c3aed]">
            Reset Goal
          </button>
        </div>

        {/* UPLOAD PHOTO */}
        <div className="px-6 pt-8 pb-6">
          <p className="text-gray-500 text-sm mb-3">Start with a photo or proof:</p>
          <button className="w-full bg-[#00aeef] hover:bg-[#0099d4] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 text-base transition-all active:scale-[0.985]">
            Upload Photo <Plus size={22} />
          </button>
        </div>

        {/* TYPE OF SESSION */}
        <div className="px-6 pb-8">
          <p className="text-gray-500 text-sm mb-4">Type of Session:</p>
          <div className="flex gap-3 bg-[#f4f4f8] p-2 rounded-3xl">
            <button className="flex-1 py-4 rounded-2xl bg-white text-gray-600 font-medium shadow-sm">
              Quick Log
            </button>
            <button className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#9333ea] text-white font-semibold shadow">
              Start a Session
            </button>
          </div>
        </div>

        {/* SET WORKOUT GOAL */}
        <div className="mx-6 mb-8 bg-[#f8fafd] rounded-3xl p-7 border border-[#f0f0f5]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border">
                <Pencil size={22} className="text-gray-500" />
              </div>
              <div>
                <p className="font-semibold text-[#1a1a2e] text-lg">1. Set Workout Goal:</p>
                <p className="text-sm text-gray-500">Optional - Track against the target</p>
              </div>
            </div>
            <button 
              onClick={() => setOpenGoal(!openGoal)}
              className="text-gray-400 mt-1"
            >
              <ChevronDown 
                size={28} 
                className={`transition-transform duration-300 ${openGoal ? "rotate-180" : ""}`} 
              />
            </button>
          </div>

          {openGoal && (
            <div className="flex gap-4 mt-10">
              <div className="flex-1 bg-white rounded-2xl p-6 text-center border border-pink-100">
                <p className="text-4xl font-bold text-pink-500">0</p>
                <p className="text-sm text-gray-500 mt-2">Calories</p>
              </div>
              <div className="flex-1 bg-white rounded-2xl p-6 text-center border border-pink-100">
                <p className="text-4xl font-bold text-pink-500">0</p>
                <p className="text-sm text-gray-500 mt-2">Minutes</p>
              </div>
              <button className="bg-gradient-to-r from-[#7c3aed] to-[#9333ea] text-white px-9 py-3 rounded-2xl font-semibold self-center">
                Start Workout
              </button>
            </div>
          )}
        </div>

        {/* COMPLETED CARDIO */}
        <div className="mx-6 mb-10 bg-white rounded-3xl p-7 border border-[#f0f0f5]">
          <div className="flex justify-between items-center mb-6">
            <p className="text-[#00aeef] font-semibold text-lg">Completed Cardio:</p>
            <button 
              onClick={() => setOpenCompleted(!openCompleted)}
            >
              <ChevronDown 
                size={28} 
                className={`transition-transform duration-300 ${openCompleted ? "rotate-180" : ""}`} 
              />
            </button>
          </div>

          <p className="text-gray-500 mb-6 text-sm">
            Log and submit what you completed during your cardio workout.
          </p>

          {openCompleted && (
            <div className="bg-[#fafcff] border border-[#f0f0f5] rounded-2xl p-6">
              <div className="space-y-6">
                <select className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-base text-gray-700 focus:outline-none focus:border-[#7c3aed]">
                  <option>Choose One</option>
                  <option>Running</option>
                  <option>Cycling</option>
                  <option>Rowing</option>
                  <option>HIIT Cardio</option>
                </select>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-5 text-center border border-gray-100">
                    <p className="text-[#00aeef] font-bold text-4xl">0</p>
                    <p className="text-sm text-gray-500 mt-2">Calories*</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center border border-gray-100">
                    <p className="text-[#00aeef] font-bold text-4xl">0</p>
                    <p className="text-sm text-gray-500 mt-2">Minutes</p>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-[#7c3aed] to-[#9333ea] text-white py-4 rounded-2xl font-semibold text-base shadow">
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FINAL CTA - Full Width */}
        <div className="px-6 pb-12">
          <button className="w-full bg-gradient-to-r from-[#5d00b4] to-[#7c3aed] text-white py-5 rounded-2xl font-bold text-xl shadow-lg active:scale-[0.98] transition-all">
            Complete Cardio Session
          </button>
        </div>

      </div>
    </div>
  );
}