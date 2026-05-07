"use client";

import { useState } from "react";
import {
  Flame,
  Plus,
  Calendar,
  List,
  Trash2,
  Pencil,
  Camera,
  X,
} from "lucide-react";

interface Session {
  id: number;
  name: string;
  calories: number;
  minutes: number;
}

export default function SubmitCardio() {
  const [showPopup, setShowPopup] = useState(false);

  const [sessions, setSessions] = useState<Session[]>([
    { id: 1, name: "BOXING BAG. HEAVY", calories: 290, minutes: 23 },
    { id: 2, name: "BOXING BAG. HEAVY", calories: 290, minutes: 23 },
  ]);

  // Add Session
  const addSession = () => {
    setSessions((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "BOXING BAG. HEAVY",
        calories: 0,
        minutes: 0,
      },
    ]);
  };

  // Delete Session
  const deleteSession = (id: number) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  // Update Session
  const updateSession = (
    id: number,
    field: keyof Session,
    value: any
  ) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      )
    );
  };

  const totalCalories = sessions.reduce((a, b) => a + b.calories, 0);
  const totalMinutes = sessions.reduce((a, b) => a + b.minutes, 0);

  return (
    <div className="min-h-screen bg-[#f4f4f8] text-[#1a1a2e] pb-12">
      {/* HEADER */}
      <div className="bg-white px-4 sm:px-6 py-4 flex items-center justify-between border-b sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button className="text-2xl">←</button>
          <div className="w-9 h-9 bg-red-500 rounded-full flex items-center justify-center">
            <Flame size={18} className="text-white" />
          </div>
          <h1 className="font-bold text-lg">Submit Cardio</h1>
        </div>

        <div className="flex gap-3">
          <button className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
            <List size={18} />
          </button>
          <button
            onClick={addSession}
            className="w-9 h-9 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white rounded-full flex items-center justify-center"
          >
            <Plus size={18} />
          </button>
          <button className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
            <Calendar size={18} />
          </button>
        </div>
      </div>

      {/* GOAL */}
      <div className="px-4 sm:px-6 py-6">
        <div className="border border-[#a78bfa] rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center bg-[#ede9fe] gap-4">
          <div>
            <p className="text-xs text-[#7c3aed]">Left this week:</p>
            <p className="text-3xl font-bold text-[#7c3aed]">3600</p>
          </div>
          <button className="bg-white px-5 py-2 text-xs rounded-xl font-medium whitespace-nowrap">
            Reset Goal
          </button>
        </div>
      </div>

      {/* TOGGLE */}
      <div className="flex justify-center mb-8 px-4">
        <div className="w-full max-w-[420px] flex items-center gap-3">
          <p className="text-xs text-gray-500 whitespace-nowrap">
            Type of Session:
          </p>
          <div className="bg-gray-200 rounded-full p-1 flex flex-1">
            <button className="flex-1 py-2.5 bg-purple-600 text-white rounded-full text-sm font-medium">
              Quick Log
            </button>
            <button className="flex-1 py-2.5 text-gray-600 text-sm font-medium">
              Start Session
            </button>
          </div>
        </div>
      </div>

      {/* TITLE */}
      <div className="px-4 sm:px-6 mb-4">
        <p className="text-green-600 font-semibold text-sm">
          Quick Cardio Log:
        </p>
        <p className="text-xs text-gray-400">
          Log and submit what you completed during your cardio workout.
        </p>
      </div>

      {/* SESSIONS */}
      <div className="px-4 sm:px-6 space-y-5">
        {sessions.map((s, i) => (
          <div key={s.id} className="bg-white border rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

              {/* Action Buttons */}
              <div className="flex gap-2 self-start">
                <button className="bg-gray-100 p-2.5 rounded-xl">
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => deleteSession(s.id)}
                  className="bg-red-100 p-2.5 rounded-xl text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Activity Dropdown with Border */}
              <div className="flex-1 w-full">
                <div className={`border ${i === 0 ? "border-red-400" : "border-gray-300"} rounded-xl px-4 py-3 bg-white`}>
                  <select
                    value={s.name}
                    onChange={(e) =>
                      updateSession(s.id, "name", e.target.value)
                    }
                    className="w-full text-sm outline-none bg-transparent"
                  >
                    <option>BOXING BAG. HEAVY</option>
                    <option>RUNNING</option>
                    <option>CYCLING</option>
                    <option>SWIMMING</option>
                    <option>JUMP ROPE</option>
                  </select>
                </div>

                {/* Red Message - Only for first item */}
                {i === 0 && (
                  <p className="text-[10px] text-red-500 mt-1.5 pl-1">
                    It should take you about 29 minutes to burn 190 calories
                  </p>
                )}
              </div>

              {/* Calories Input */}
              <div className="bg-gray-50 px-5 py-3 rounded-2xl text-center min-w-[110px]">
                <input
                  type="number"
                  value={s.calories}
                  onChange={(e) =>
                    updateSession(s.id, "calories", Number(e.target.value))
                  }
                  className="w-20 bg-transparent text-blue-600 font-bold text-2xl text-center outline-none"
                />
                <p className="text-[10px] text-gray-400 -mt-1">Calories*</p>
              </div>

              {/* Minutes Input */}
              <div className="bg-gray-50 px-5 py-3 rounded-2xl text-center min-w-[110px]">
                <input
                  type="number"
                  value={s.minutes}
                  onChange={(e) =>
                    updateSession(s.id, "minutes", Number(e.target.value))
                  }
                  className="w-20 bg-transparent text-blue-600 font-bold text-2xl text-center outline-none"
                />
                <p className="text-[10px] text-gray-400 -mt-1">Minutes</p>
              </div>

              {/* Camera Button */}
              <button className="bg-purple-600 text-white p-3.5 rounded-2xl self-start sm:self-center">
                <Camera size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Button */}
      <div className="flex justify-center my-8">
        <button
          onClick={addSession}
          className="w-14 h-14 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* TOTALS */}
      <div className="mx-4 sm:mx-6 mb-10 border border-red-300 rounded-3xl bg-[#fdf2f2] p-6 text-center">
        <p className="text-purple-600 text-sm mb-5 font-medium">Totals:</p>

        <div className="flex justify-center gap-12 mb-8 flex-wrap">
          <div>
            <p className="text-xs text-gray-400">Total Calories</p>
            <p className="text-4xl font-bold text-gray-800">{totalCalories}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Minutes</p>
            <p className="text-4xl font-bold text-gray-800">{totalMinutes}</p>
          </div>
        </div>

        <button
          onClick={() => setShowPopup(true)}
          className="w-full bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white py-4 rounded-2xl font-semibold text-lg shadow-md"
        >
          Complete Cardio Session
        </button>
      </div>

      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl w-full max-w-[420px] p-6 relative">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-center mb-2">
              Cardio Completion
            </h2>
            <p className="text-center text-sm text-gray-500 mb-6">
              Choose how you want to save your completed Cardio Session
            </p>

            <div className="bg-gray-100 rounded-2xl p-5 mb-6">
              <p className="text-xs text-gray-500 mb-4">Choose One:</p>
              <div className="space-y-3">
                <label className="flex gap-3 text-sm cursor-pointer">
                  <input type="radio" name="cardio" className="mt-0.5" />
                  Cardio #20 due Wednesday
                </label>
                <label className="flex gap-3 text-sm cursor-pointer">
                  <input type="radio" name="cardio" className="mt-0.5" />
                  Cardio #13 due Thursday
                </label>
              </div>

              <button className="w-full mt-6 bg-gray-700 hover:bg-gray-800 transition text-white py-3 rounded-xl font-medium">
                Save Cardio
              </button>
            </div>

            <div className="text-center text-sm text-gray-400 mb-4">or</div>

            <button className="w-full bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white py-4 rounded-2xl font-semibold">
              Create a New One
            </button>
          </div>
        </div>
      )}
    </div>
  );
}