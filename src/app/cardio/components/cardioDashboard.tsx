"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, Flame, Clock, Calendar, Check, BarChart2, X } from "lucide-react";

interface Session {
  id: number;
  day: string;
  time: string;
  calories: number;
  completed: boolean;
}

export default function CardioDashboard() {
  const [goalCalories, setGoalCalories] = useState(5000);
  const scheduledCalories = 4950;

  const [sessions, setSessions] = useState<Session[]>([
    { id: 1, day: "Sunday", time: "9:00 am", calories: 1200, completed: false },
    { id: 2, day: "Tuesday", time: "9:00 am", calories: 1250, completed: false },
    { id: 3, day: "Thursday", time: "9:00 am", calories: 1250, completed: false },
    { id: 4, day: "Saturday", time: "9:00 am", calories: 1250, completed: false },
  ]);

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [newGoalValue, setNewGoalValue] = useState("");

  const completedSessions = sessions.filter(s => s.completed).length;
  const completedCalories = sessions.filter(s => s.completed).reduce((sum, s) => sum + s.calories, 0);
  const remainingCalories = goalCalories - completedCalories;
  const progressPct = Math.min((completedCalories / goalCalories) * 100, 100);

  const openSession = (session: Session) => setSelectedSession(session);
  const closeModal = () => setSelectedSession(null);

  const completeActivity = () => {
    if (!selectedSession) return;
    setSessions(prev => prev.map(s => s.id === selectedSession.id ? { ...s, completed: true } : s));
    setSelectedSession(prev => prev ? { ...prev, completed: true } : null);
  };

  const deleteSession = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleContinue = () => {
    const parsed = parseInt(newGoalValue);
    if (!isNaN(parsed) && parsed > 0) {
      setGoalCalories(parsed);
    }
    setShowEditGoal(false);
    setNewGoalValue("");
  };

  return (
    <div className="min-h-screen bg-[#f4f4f8] font-['DM_Sans',_sans-serif] text-[#1a1a2e]">

      {/* Top Bar */}
      <div className="bg-white px-4 sm:px-6 lg:px-7 py-3.5 sm:py-4 flex items-center justify-between border-b border-[#e8e8f0] sticky top-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3.5">
       
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] rounded-full flex items-center justify-center font-extrabold text-base sm:text-lg text-white flex-shrink-0">
            4
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-[#7c3aed] m-0">Cardio Goal</h1>
            <p className="text-[10px] sm:text-xs text-[#999] m-0">{completedSessions}/{sessions.length} sessions completed • Track your weekly progress</p>
          </div>
        </div>
        <button className="bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] border-none rounded-lg text-white px-3 sm:px-5 py-2 sm:py-2.5 cursor-pointer flex items-center gap-1.5 font-semibold text-xs sm:text-sm whitespace-nowrap">
          <Plus size={16} /> <span className="hidden xs:inline">Add</span> Session
        </button>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-5 lg:p-7 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-5 lg:gap-7 max-w-6xl mx-auto">

        {/* Left: Progress Overview */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 order-2 lg:order-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-base text-[#1a1a2e] m-0">Progress Overview</h2>
            <button
              onClick={() => setShowEditGoal(true)}
              className="bg-transparent border-none cursor-pointer text-[#bbb] p-2 rounded-lg flex items-center"
            >
              <Pencil size={15} />
            </button>
          </div>

          {/* Big Numbers */}
          <div className="flex items-baseline gap-2 mb-1 flex-wrap">
            <span className="text-4xl sm:text-5xl font-extrabold text-green-500 leading-none">{completedCalories.toLocaleString()}</span>
            <span className="text-3xl sm:text-4xl text-[#ccc] font-light">/</span>
            <span className="text-4xl sm:text-5xl font-extrabold text-[#7c3aed] leading-none">{goalCalories.toLocaleString()}</span>
          </div>
          <div className="flex mb-4 text-xs">
            <span className="text-green-500 font-semibold min-w-[90px]">Completed</span>
            <span className="text-[#7c3aed] font-semibold ml-[30px]">Goal</span>
          </div>

          {/* Progress Bar */}
          <div className="mb-1.5">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
          <div className="flex justify-between text-xs text-[#aaa] mb-5">
            <span><span className="text-orange-500 font-semibold">{scheduledCalories.toLocaleString()}</span> scheduled</span>
            <span><span className="text-green-500 font-semibold">{Math.round(progressPct)}%</span> complete</span>
          </div>

          {/* Stat Boxes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-indigo-50 rounded-xl p-4">
              <p className="text-xs text-[#888] font-medium mb-1.5">Sessions Left</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#1a1a2e] m-0">{sessions.length - completedSessions}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-xs text-[#888] font-medium mb-1.5">Remaining</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-orange-500 m-0">{remainingCalories.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Right: Cardio Sessions */}
        <div className="order-1 lg:order-2">
          <h2 className="font-bold text-base text-[#1a1a2e] mb-4">Cardio Sessions</h2>
          <div className="flex flex-col gap-2.5">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => openSession(session)}
                className={`rounded-xl p-4 sm:p-5 flex items-center justify-between cursor-pointer transition-all ${
                  session.completed ? 'bg-[#1e3a2e] border border-green-500/20' : 'bg-[#1e1e2e]'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                    session.completed ? 'border-green-500 bg-green-500/10' : 'border-[#7c3aed] bg-[#3b3b88]/20'
                  }`}>
                    {session.completed && <Check size={14} className="text-green-500" strokeWidth={2.5} />}
                  </div>
                  <div>
                    <p className="font-bold text-sm sm:text-base text-white m-0">Cardio #{session.id}</p>
                    <p className="text-xs text-[#888] mt-1 mb-2">By {session.day} @ {session.time}</p>
                    <span className="inline-block bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                      {session.calories.toLocaleString()} cal
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => deleteSession(session.id, e)}
                  className="bg-[#2a2a3e] border-none rounded-lg text-[#888] cursor-pointer p-2 sm:p-2.5 flex items-center justify-center"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div
          onClick={closeModal}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-5 sm:p-7 w-full max-w-[480px] shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between mb-3">
              <button className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-indigo-50 border-none cursor-pointer flex items-center justify-center text-[#7c3aed]">
                <Pencil size={17} />
              </button>
              <button className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-red-50 border-none cursor-pointer flex items-center justify-center text-red-500">
                <Trash2 size={17} />
              </button>
            </div>
            <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-[#1a1a2e] mb-6">Cardio #{selectedSession.id}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {/* Calories Card */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/25 flex items-center justify-center">
                    <Flame size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-white/85 font-medium">Calories</p>
                    <p className="text-[10px] sm:text-xs text-white/85 font-medium">Schedule</p>
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl font-extrabold text-white leading-none">{selectedSession.calories.toLocaleString()}</p>
                <div className="h-0.5 bg-white/35 rounded-full mt-3" />
              </div>

              {/* Scheduled Time Card */}
              <div className="bg-indigo-50 rounded-xl p-4 sm:p-5">
                <p className="text-xs font-semibold text-[#7c3aed] mb-3">Scheduled Time</p>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-200 flex items-center justify-center">
                    <Clock size={18} className="text-[#7c3aed]" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-[#7c3aed]">By {selectedSession.day}</p>
                    <p className="text-sm font-extrabold text-[#7c3aed]">@ {selectedSession.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-[#aaa]" />
                  <span className="text-xs text-[#aaa]">This week</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <button
                onClick={completeActivity}
                className={`border-none rounded-xl text-white p-4 font-bold text-sm flex items-center justify-center gap-2 ${
                  selectedSession.completed ? 'bg-green-500' : 'bg-gradient-to-r from-[#7c3aed] to-[#6d28d9]'
                }`}
              >
                <Check size={17} /> {selectedSession.completed ? 'Completed!' : 'Complete Activity'}
              </button>
              <button className="bg-transparent border-2 border-[#7c3aed] rounded-xl text-[#7c3aed] p-4 font-bold text-sm flex items-center justify-center gap-2">
                <Calendar size={17} /> Cardio Schedule
              </button>
            </div>
            <button onClick={closeModal} className="w-full bg-transparent border-none text-[#aaa] cursor-pointer text-sm font-medium text-center p-2">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {showEditGoal && (
        <div
          onClick={() => setShowEditGoal(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-[540px] shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-end mb-2">
              <button onClick={() => setShowEditGoal(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1a1a2e] mb-2 leading-tight">
              Let's Update your activity level
            </h2>
            <p className="text-sm text-[#999] mb-6 leading-relaxed">
              Enter your new weekly cardio goal to personalize your experience.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {/* Current Goal */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#555] mb-2">
                  <Flame size={14} className="text-orange-500" /> Current Goal (kcal)*
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={goalCalories}
                    readOnly
                    className="w-full p-4 pr-12 border border-gray-200 rounded-xl text-lg sm:text-xl font-bold text-[#1a1a2e] bg-gray-50 outline-none"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col">
                    <button className="text-gray-400 hover:text-[#7c3aed] p-0.5 text-xs">▲</button>
                    <button className="text-gray-400 hover:text-[#7c3aed] p-0.5 text-xs">▼</button>
                  </div>
                </div>
              </div>

              {/* New Goal */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#555] mb-2">
                  <Flame size={14} className="text-orange-500" /> New Goal Per Week (kcal)*
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={newGoalValue}
                    onChange={(e) => setNewGoalValue(e.target.value)}
                    placeholder="e.g., 1500"
                    className="w-full p-4 pr-12 border border-gray-200 rounded-xl text-lg sm:text-xl font-bold text-[#1a1a2e] bg-white outline-none focus:border-[#7c3aed]"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col">
                    <button
                      onClick={() => setNewGoalValue(v => String((parseInt(v) || 0) + 100))}
                      className="text-gray-400 hover:text-[#7c3aed] p-0.5 text-xs"
                    >▲</button>
                    <button
                      onClick={() => setNewGoalValue(v => String(Math.max(0, (parseInt(v) || 0) - 100)))}
                      className="text-gray-400 hover:text-[#7c3aed] p-0.5 text-xs"
                    >▼</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-indigo-50 rounded-xl p-4 mb-6 flex items-start gap-3">
              <BarChart2 size={18} className="text-[#7c3aed] flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-[#555] leading-relaxed">
                <span className="font-semibold">Progress Tracking:</span> Regular photos and metrics help you see real changes that the scale might not show.
              </p>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] border-none rounded-full text-white py-4 font-bold text-sm sm:text-base cursor-pointer hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}