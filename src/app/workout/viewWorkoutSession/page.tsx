"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Play,
  ChevronRight,
  Users,
  Share2,
  ClipboardList,
  UserPlus,
  Home,
  Activity,
  MapPin,
  Edit,
  X,
  Sparkles,
  Calendar,
  Eye,
  Search,
  Copy,
  Link,
  Zap,
  Flame,
  ChevronUp,
  ChevronDown,
  Dumbbell,
  CheckCircle2,
} from "lucide-react";

import { useEffect, useState } from "react";

export default function ViewWorkoutSessionPage() {
  const router = useRouter();

  const [location, setLocation] = useState<string | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [followerSearch, setFollowerSearch] = useState("");
  const [activeView, setActiveView] = useState("Overview");
  const [selectedSets, setSelectedSets] = useState<Set<string>>(new Set());
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());

  const toggleCard = (i: number) => {
    setSelectedCards(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };
  const [selectedExercises, setSelectedExercises] = useState<Set<number>>(new Set());
  const [collapsedRounds, setCollapsedRounds] = useState<Set<number>>(new Set());

  const toggleExercise = (id: number) => {
    setSelectedExercises(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleRound = (id: number) => {
    setCollapsedRounds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSet = (key: string) => {
    setSelectedSets(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  useEffect(() => {
    const savedLocation = localStorage.getItem("selectedLocation");
    if (savedLocation) {
      setLocation(savedLocation);
    }
  }, []);

  const warmup = [
    { name: "Band-Resisted Row-to-Squat", reps: "12-15" },
    { name: "Floor Groin Flow", reps: "8/e" },
    { name: "Band-Resisted Crossover Step Up", reps: "8/e" },
  ];

  const round1 = [
    { name: "Box SL Depth Squat", reps: "15/e" },
    { name: "Barbell Back Squat", reps: "8-12", notes: ["@12 EL", "@12 EL", "@10 EL"] },
    { name: "Dumbbell RDL", reps: "20" },
  ];

  const round2 = [
    { name: "Balance-Pad Adduction", reps: "15-20" },
    { name: 'Band-Resisted "X" Lateral Walk', reps: "20/e" },
    { name: "Dumbbell Goblet Squat", reps: "12-15" },
  ];

  const ExerciseCard = ({ ex }: any) => (
    <div className="bg-white rounded-[24px] border border-[#e8e8ef] p-5 min-h-[180px] sm:min-h-[210px] relative hover:shadow-md transition-all">
      <div className="absolute top-4 left-4 text-emerald-500">
        <Home size={16} />
      </div>
      <div className="w-14 h-14 rounded-2xl bg-[#f3f3f6] mx-auto mb-6 flex items-center justify-center">
        <div className="w-7 h-7 rounded-full bg-[#1e1e22]" />
      </div>
      <h3 className="text-[13px] font-semibold text-center text-[#222] leading-tight min-h-[38px] flex items-center justify-center">
        {ex.name}
      </h3>
      <div className="mt-4 text-center">
        <p className="text-[32px] sm:text-[40px] leading-none font-black tracking-tight text-[#222]">
          {ex.reps}
        </p>
      </div>
      {ex.notes && (
        <div className="flex gap-2 justify-center mt-4 flex-wrap">
          {ex.notes.map((note: string, i: number) => (
            <div key={i} className="px-2 py-1 rounded-md bg-[#f4f4f5] text-[8px] font-bold text-gray-500 uppercase">
              {note}
            </div>
          ))}
        </div>
      )}
      <div className="absolute bottom-4 right-4 text-[#7c3aed]">
        <Edit size={16} />
      </div>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden bg-[#f7f7fa] flex">

      {/* SIDEBAR */}
      <div className="hidden lg:flex w-[220px] bg-gradient-to-b from-[#8b5cf6] to-[#6d28d9] text-white flex-col p-6 flex-shrink-0">

        <div className="bg-white/10 rounded-[24px] p-4 mb-8">
          <h2 className="text-[11px] font-black leading-tight break-words uppercase tracking-wide">
            RECONDITIONING
          </h2>
          <p className="text-[10px] uppercase mt-1 opacity-70">Upper Body</p>
          <div className="mt-4 h-2 rounded-full bg-white/20 overflow-hidden">
            <div className="w-[35%] h-full bg-white rounded-full" />
          </div>
          <div className="text-right text-[10px] mt-2 font-bold">35%</div>
        </div>

        <div className="space-y-3">
          {["Overview", "Session", "Results", "Powersets", "Map"].map((item, i) => (
            <button
              key={i}
              onClick={() => {
                if (item === "Session") setShowSessionModal(true);
                else setActiveView(item);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition
              ${activeView === item ? "bg-white text-[#7c3aed]" : "bg-white/10 hover:bg-white/20"}`}
            >
              <Activity size={16} />
              {item}
            </button>
          ))}
        </div>

        <button  onClick={() => router.push("/workout/athenaWorkout")} className="mt-auto bg-white text-[#7c3aed] py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2">
          <Play size={16} fill="currentColor" />
          Start Workout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden pb-16 lg:pb-0">

        {/* HEADER */}
        <div className="bg-white border-b border-[#ececf2] px-4 sm:px-6 lg:px-10 py-4 flex-shrink-0 z-20">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-5">
              <button onClick={() => router.back()} className="text-gray-500">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-black text-[#3b82f6] tracking-tight leading-none uppercase">
                  Formula-1
                </h1>
                <p className="text-[12px] font-black uppercase tracking-wide text-[#222] mt-1">
                  Lower Body
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">

              {/* Session info + Share in a box */}
              <div className="hidden md:flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-2 bg-gray-50">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400">Session</p>
                  <p className="text-[12px] font-black text-[#222]">5/11/2026 @ 11:22 AM</p>
                </div>
                <button onClick={() => setShowInviteModal(true)} className="w-8 h-8 rounded-full bg-[#7c3aed] text-white flex items-center justify-center">
                  <Share2 size={15} />
                </button>
              </div>

              <button className="w-9 h-9 rounded-full bg-[#f3f3f6] text-gray-500 flex items-center justify-center">
                <ClipboardList size={16} />
              </button>

              <button
                onClick={() => setShowSessionModal(true)}
                className="w-9 h-9 rounded-full bg-[#7c3aed] text-white flex items-center justify-center"
              >
                <Users size={16} />
              </button>
            </div>
          </div>

          {activeView !== "Results" && activeView !== "Powersets" && activeView !== "Map" && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">

              {/* Right Side - Location + Buttons + Free Text */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto sm:ml-auto">

                {/* Location Text - Close to buttons */}
                <div className="flex items-center gap-2 text-[12px] font-semibold text-gray-500">
                  <MapPin size={14} className="text-[#7c3aed]" />
                  <span className="text-[#7c3aed]">Location :</span>
                  <span>{location || "Home"}</span>
                </div>

                {/* Buttons Container */}
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <button className="bg-[#7c3aed] text-white px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5">
                      Start a new Session
                      <ChevronRight size={14} />
                    </button>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="border border-[#7c3aed] text-[#7c3aed] px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5"
                    >
                      <UserPlus size={14} />
                      Invite User
                    </button>
                  </div>

                  {/* "This workout is free" - Below Invite User Button */}
                  <p className="text-emerald-500 text-[11px] font-semibold">
                    • This workout is free
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 py-6">

          {activeView === "Results" ? (
            <div className="space-y-8">

              {/* PAGE TITLE */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#7c3aed] flex items-center justify-center text-white">
                  <Activity size={18} />
                </div>
                <div>
                  <h2 className="text-[20px] font-black text-[#222]">Live Results</h2>
                  <p className="text-[11px] text-gray-400">Real-time performance data</p>
                </div>
              </div>

              {/* THIS WORKOUT */}
              <div>
                <p className="text-[13px] font-black text-[#222] mb-4 flex items-center gap-2">
                  <Users size={14} className="text-gray-400" /> This Workout:
                </p>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="rounded-[20px] bg-gradient-to-br from-[#3b82f6] to-[#2563eb] p-5 text-white flex flex-col items-center justify-center min-h-[100px] sm:min-h-[130px]">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-3">
                      <Activity size={16} />
                    </div>
                    <p className="text-[32px] sm:text-[44px] font-black leading-none">97</p>
                    <p className="text-[11px] opacity-80 mt-1">Load</p>
                  </div>
                  <div className="rounded-[20px] bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] p-5 text-white flex flex-col items-center justify-center min-h-[100px] sm:min-h-[130px]">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-3">
                      <Zap size={16} />
                    </div>
                    <p className="text-[32px] sm:text-[44px] font-black leading-none">26</p>
                    <p className="text-[11px] opacity-80 mt-1">Power</p>
                  </div>
                  <div className="rounded-[20px] bg-gradient-to-br from-[#f97316] to-[#ea580c] p-5 text-white flex flex-col items-center justify-center min-h-[100px] sm:min-h-[130px]">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-3">
                      <Flame size={16} />
                    </div>
                    <p className="text-[32px] sm:text-[44px] font-black leading-none">277</p>
                    <p className="text-[11px] opacity-80 mt-1">Cals</p>
                  </div>
                </div>
              </div>

              {/* COMPARISON TABLE */}
              <div className="bg-white rounded-[20px] border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 sm:divide-x divide-gray-100">
                  {/* YOUR AVG */}
                  <div className="p-5">
                    <p className="text-[11px] font-black text-[#222] mb-4">Your Average Workout:</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[["Load","85","text-[#3b82f6]"],["Power","22","text-[#7c3aed]"],["Cals","245","text-orange-500"]].map(([label,val,color]) => (
                        <div key={label}>
                          <p className="text-[10px] text-gray-400 mb-1">{label}</p>
                          <p className={`text-[22px] font-black ${color}`}>{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* ALL USERS AVG */}
                  <div className="p-5 border-t sm:border-t-0 border-gray-100">
                    <p className="text-[11px] font-black text-[#222] mb-4 flex items-center gap-1">
                      <Users size={11} className="text-[#7c3aed]" /> This Workout Avg. (all users):
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[["Load","78","text-[#3b82f6]"],["Power","20","text-[#7c3aed]"],["Cals","230","text-orange-500"]].map(([label,val,color]) => (
                        <div key={label}>
                          <p className="text-[10px] text-gray-400 mb-1">{label}</p>
                          <p className={`text-[22px] font-black ${color}`}>{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* LOAD CHART */}
              <div>
                <p className="text-[13px] font-black text-[#222] mb-4">Load Chart:</p>
                <div className="bg-white rounded-[20px] border border-gray-100 p-5">
                  <svg viewBox="0 0 540 200" className="w-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.15"/>
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    {/* Y-axis labels */}
                    {[["60",162],["65",143],["70",124],["78",98],["85",73],["97",31]].map(([v,y]) => (
                      <text key={v} x="32" y={Number(y)+4} textAnchor="end" className="fill-[#7c3aed]" fontSize="11" fontWeight="700">{v}</text>
                    ))}
                    {/* Grid lines */}
                    {[162,143,124,98,73,31].map((y) => (
                      <line key={y} x1="40" y1={y} x2="530" y2={y} stroke="#f0f0f5" strokeWidth="1"/>
                    ))}
                    {/* Fill area */}
                    <path d="M40,162 L136,143 L232,124 L328,98 L424,73 L520,31 L520,180 L40,180 Z" fill="url(#chartGrad)"/>
                    {/* Line */}
                    <polyline points="40,162 136,143 232,124 328,98 424,73 520,31" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
                    {/* Dots */}
                    {[[40,162],[136,143],[232,124],[328,98],[424,73],[520,31]].map(([x,y],i) => (
                      <circle key={i} cx={x} cy={y} r="4" fill="#7c3aed"/>
                    ))}
                  </svg>
                  <div className="flex items-center gap-2 mt-3 justify-end">
                    <div className="w-3 h-3 rounded-full bg-[#7c3aed]"/>
                    <span className="text-[11px] text-gray-400 font-medium">Your Progress</span>
                  </div>
                </div>
              </div>

            </div>
          ) : activeView === "Powersets" ? (
            <div className="space-y-6 pb-20">

              {/* PAGE TITLE */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-[#7c3aed] flex items-center justify-center text-white">
                  <Zap size={18} />
                </div>
                <div>
                  <h2 className="text-[20px] font-black text-[#222]">Power Sets</h2>
                  <p className="text-[11px] text-gray-400">Your strength movements</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-black text-[#7c3aed] uppercase tracking-widest">RECONDITIONING</p>
                <p className="text-[18px] font-black text-[#222]">LOWER BODY, Day 1, Week 1</p>
              </div>

              {/* CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    round: "ROUND 1", roundColor: "bg-teal-500",
                    moneyset: true,
                    name: "BARBELL BENCH SQUAT (ECCL)",
                    sets: 3,
                    rows: [{ n:1, w:"45 lbs", r:"10 reps" }, { n:2, w:"95 lbs", r:"8 reps" }, { n:3, w:"135 lbs", r:"5 reps" }],
                  },
                  {
                    round: "ROUND 2", roundColor: "bg-[#7c3aed]",
                    moneyset: true,
                    name: "BARBELL BOX SQUAT",
                    sets: 3,
                    rows: [{ n:1, w:"135 lbs", r:"5 reps" }, { n:2, w:"185 lbs", r:"3 reps" }, { n:3, w:"225 lbs", r:"1 rep" }],
                  },
                  {
                    round: "ROUND 2", roundColor: "bg-[#7c3aed]",
                    moneyset: false,
                    name: "ANTI-LATERAL RUN (SB HOLD 40 LBS + LAT BAR)",
                    sets: null,
                    rows: [],
                  },
                  {
                    round: "ROUND 3", roundColor: "bg-emerald-500",
                    moneyset: true,
                    name: "HAMSTRING CURL MACHINE (SL CURL LL OR ALT)",
                    sets: 3,
                    rows: [{ n:1, w:"50 lbs", r:"12 reps" }, { n:2, w:"70 lbs", r:"10 reps" }, { n:3, w:"90 lbs", r:"8 reps" }],
                  },
                ].map((card, ci) => {
                  const sel = selectedCards.has(ci);
                  return (
                    <button
                      key={ci}
                      onClick={() => toggleCard(ci)}
                      className={`text-left w-full rounded-[20px] border-2 p-5 relative transition-all ${
                        sel
                          ? "bg-[#f5f0ff] border-[#7c3aed] shadow-md shadow-purple-100"
                          : "bg-white border-[#ede9fe] hover:border-[#c4b5fd]"
                      }`}
                    >
                      {/* TOP ROW */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase ${card.roundColor}`}>
                            {card.round}
                          </span>
                          {card.moneyset && (
                            <span className="bg-emerald-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                              ★ MONEY SET
                            </span>
                          )}
                        </div>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${sel ? "bg-[#7c3aed]" : "bg-gray-100"}`}>
                          <Edit size={13} className={sel ? "text-white" : "text-gray-400"} />
                        </div>
                      </div>

                      {/* EXERCISE INFO */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${sel ? "bg-[#ede9fe]" : "bg-[#f3f3f6]"}`}>
                          <Zap size={16} className="text-[#7c3aed]" />
                        </div>
                        <div>
                          <p className={`text-[12px] font-black uppercase leading-tight ${sel ? "text-[#7c3aed]" : "text-[#222]"}`}>{card.name}</p>
                          {card.sets && <p className="text-[10px] text-gray-400 mt-0.5">{card.sets} sets</p>}
                        </div>
                      </div>

                      {/* SET ROWS (display only) */}
                      {card.rows.map((row) => (
                        <div key={row.n} className="flex items-center gap-3 mb-2 px-1">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-black flex-shrink-0 ${sel ? "bg-[#7c3aed]" : "bg-gray-300"}`}>
                            {row.n}
                          </div>
                          <p className={`text-[12px] font-bold flex-1 ${sel ? "text-[#7c3aed]" : "text-[#222]"}`}>{row.w}</p>
                          <p className="text-[10px] text-gray-400">{row.r}</p>
                        </div>
                      ))}
                    </button>
                  );
                })}
              </div>

              {/* BOTTOM BANNER */}
              <div className="fixed bottom-20 lg:bottom-4 left-4 lg:left-[236px] right-4 lg:right-8 z-10">
                <div className="bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] rounded-2xl py-3 px-5 text-white flex items-center justify-center gap-3 shadow-lg">
                  <Zap size={14} fill="currentColor" />
                  <p className="text-[13px] font-black">3 Money Sets</p>
                  <span className="text-[10px] opacity-70">· Focus on progressive overload for maximum gains</span>
                </div>
              </div>

            </div>
          ) : activeView === "Map" ? (() => {
            const rounds = [
              {
                id: 1, label: "Round 1: Warm-up & Mobility",
                exercises: [
                  { id: 1, name: "Dynamic Stretching",  loc: "HOME" },
                  { id: 2, name: "Foam Rolling",         loc: "HOME" },
                  { id: 3, name: "Band Pull-aparts",     loc: "HOME" },
                ],
              },
              {
                id: 2, label: "Round 2: Strength Training",
                exercises: [
                  { id: 4, name: "Barbell Bench Squat",  loc: "GYM" },
                  { id: 5, name: "Barbell Box Squat",    loc: "GYM" },
                  { id: 6, name: "Anti-Lateral Run",     loc: "GYM" },
                ],
              },
              {
                id: 3, label: "Round 3: Accessory Work",
                exercises: [
                  { id: 7, name: "Hamstring Curl Machine", loc: "GYM" },
                  { id: 8, name: "Leg Extensions",         loc: "GYM" },
                  { id: 9, name: "Calf Raises",            loc: "GYM" },
                ],
              },
            ];
            return (
              <div className="space-y-6">
                {/* HEADER */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#7c3aed] flex items-center justify-center text-white">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h2 className="text-[22px] font-black text-[#222]">Workout Map</h2>
                      <p className="text-[11px] text-gray-400">Exercise breakdown by rounds</p>
                    </div>
                  </div>
                  <button className="bg-emerald-500 hover:bg-emerald-600 transition text-white font-black text-[13px] px-6 py-3 rounded-2xl">
                    Complete Workout
                  </button>
                </div>

                {/* ROUND CARDS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rounds.map((round) => {
                    const done = round.exercises.filter(e => selectedExercises.has(e.id)).length;
                    const collapsed = collapsedRounds.has(round.id);
                    return (
                      <div key={round.id} className="bg-white rounded-[20px] border border-gray-100 overflow-hidden shadow-sm">
                        {/* ROUND HEADER */}
                        <button
                          onClick={() => toggleRound(round.id)}
                          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-[13px] font-black flex-shrink-0">
                            {round.id}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-[13px] font-black text-[#222]">{round.label}</p>
                            <p className="text-[10px] text-gray-400">{done}/{round.exercises.length} exercises</p>
                          </div>
                          {collapsed ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronUp size={16} className="text-gray-400" />}
                        </button>

                        {/* EXERCISES */}
                        {!collapsed && (
                          <div className="px-4 pb-4 space-y-2">
                            {round.exercises.map((ex) => {
                              const sel = selectedExercises.has(ex.id);
                              return (
                                <button
                                  key={ex.id}
                                  onClick={() => toggleExercise(ex.id)}
                                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${sel ? "bg-emerald-50 border border-emerald-200" : "bg-gray-50 border border-transparent hover:border-gray-200"}`}
                                >
                                  <span className={`text-[11px] font-bold w-5 text-center flex-shrink-0 ${sel ? "text-emerald-500" : "text-gray-400"}`}>
                                    {ex.id}
                                  </span>
                                  <span className={`flex-1 text-left text-[12px] font-semibold ${sel ? "text-emerald-600" : "text-[#222]"}`}>
                                    {ex.name}
                                  </span>
                                  <span className={`flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-full ${ex.loc === "HOME" ? "bg-gray-100 text-gray-500" : "bg-red-50 text-red-400"}`}>
                                    {ex.loc === "HOME" ? <Home size={9} /> : <Dumbbell size={9} />}
                                    {ex.loc}
                                  </span>
                                  {sel
                                    ? <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" fill="white" />
                                    : <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300 flex-shrink-0" />
                                  }
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })() : (
            <div className="space-y-10">

              {/* WARMUP */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-1 rounded-full bg-orange-400" />
                  <h2 className="text-[11px] font-black uppercase tracking-wider text-gray-500">Warm-Up (1x)</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                  {warmup.map((ex, i) => <ExerciseCard key={i} ex={ex} />)}
                </div>
              </section>

              {/* ROUND 1 */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-1 rounded-full bg-[#7c3aed]" />
                  <h2 className="text-[11px] font-black uppercase tracking-wider text-gray-500">Round 1 (3x)</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                  {round1.map((ex, i) => <ExerciseCard key={i} ex={ex} />)}
                </div>
              </section>

              {/* ROUND 2 */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-1 rounded-full bg-emerald-500" />
                  <h2 className="text-[11px] font-black uppercase tracking-wider text-gray-500">Round 3 (3x)</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                  {round2.map((ex, i) => <ExerciseCard key={i} ex={ex} />)}
                </div>
              </section>

            </div>
          )}

        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 flex items-center">
        {["Overview", "Session", "Results", "Powersets", "Map"].map((item) => (
          <button
            key={item}
            onClick={() => {
              if (item === "Session") setShowSessionModal(true);
              else setActiveView(item);
            }}
            className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 text-[9px] font-bold uppercase tracking-wide transition-colors ${
              activeView === item ? "text-[#7c3aed]" : "text-gray-400"
            }`}
          >
            <Activity size={18} />
            {item}
          </button>
        ))}
        <button className="flex-1 flex flex-col items-center py-2.5 gap-0.5 text-[9px] font-bold uppercase tracking-wide text-[#7c3aed]">
          <Play size={18} fill="currentColor" />
          Start
        </button>
      </div>

      {/* SESSION DETAILS MODAL */}
      {showSessionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => setShowSessionModal(false)}
        >
          <div
            className="w-full max-w-[380px] rounded-[24px] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* PURPLE HEADER */}
            <div className="bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] px-5 pt-5 pb-5 text-white">

              {/* TOP */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Users size={15} />
                  </div>

                  <span className="text-[14px] font-black">
                    Session Details
                  </span>
                </div>

                <button
                  onClick={() => setShowSessionModal(false)}
                  className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
                >
                  <X size={13} />
                </button>
              </div>

              {/* SESSION BADGE */}
              <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-[10px] font-bold mb-3">
                <Sparkles size={8} />
                ID: 5si8ln
              </div>

              {/* TITLE */}
              <h2 className="text-[22px] leading-[24px] font-black uppercase mb-1">
                RECONDITIONING
                <br />
                UPPER BODY
              </h2>

              <p className="text-[13px] opacity-75 mb-4">
                Week 1, Day 1 • Reconditioning
              </p>

              {/* STATS */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white/15 rounded-2xl px-3.5 py-3">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase opacity-70 mb-1">
                    <Calendar size={8} />
                    Created
                  </div>

                  <p className="text-[10px] font-black">
                    5/11/2026 2:35 PM
                  </p>
                </div>

                <div className="bg-white/15 rounded-2xl px-3.5 py-3">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase opacity-70 mb-1">
                    <Users size={8} />
                    Joined
                  </div>

                  <p className="text-[10px] font-black">
                    0 People
                  </p>
                </div>
              </div>
            </div>

            {/* WHITE SECTION */}
            <div className="bg-white px-5 py-5">

              {/* HEADER */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] font-black text-[#222]">
                  Participants
                </span>

                <button className="w-8 h-8 rounded-full bg-[#7c3aed] text-white flex items-center justify-center">
                  <Share2 size={12} />
                </button>
              </div>

              {/* CARD */}
              <div className="bg-[#fafafa] border border-gray-100 rounded-[22px] p-5 text-center">

                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#f0eeff] flex items-center justify-center mb-4">
                  <UserPlus size={24} className="text-[#7c3aed] opacity-70" />
                </div>

                <h3 className="text-[14px] font-black text-[#222] mb-1">
                  Waiting for teammates
                </h3>

                <p className="text-[10px] text-gray-400 leading-relaxed mb-5">
                  Share this workout session with your team.
                </p>

                {/* PREVIEW BUTTON */}
                <button className="w-full border border-dashed border-gray-300 text-gray-500 py-3 rounded-2xl text-[11px] font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2">
                  <Eye size={14} />
                  Preview Mode
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INVITE / SHARE MODAL */}
      {showInviteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => setShowInviteModal(false)}
        >
          <div
            className="w-full max-w-[380px] flex flex-col bg-white rounded-[24px] overflow-hidden shadow-2xl"
            style={{ height: "520px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-[18px] font-black text-[#7c3aed]">Share This Session:</h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">Session ID: apxsoc</p>
                </div>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition mt-0.5"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
              {/* QR CODE */}
              <div className="bg-[#f5f5f7] rounded-2xl p-5 flex flex-col items-center">
                <div className="border-2 border-[#7c3aed] rounded-xl p-3 bg-white mb-3">
                  <svg width="100" height="100" viewBox="0 0 100 100" className="text-[#1e1e22]">
                    {/* QR code pattern approximation */}
                    <rect x="0"  y="0"  width="40" height="40" rx="4" fill="currentColor"/>
                    <rect x="60" y="0"  width="40" height="40" rx="4" fill="currentColor"/>
                    <rect x="0"  y="60" width="40" height="40" rx="4" fill="currentColor"/>
                    <rect x="8"  y="8"  width="24" height="24" rx="2" fill="white"/>
                    <rect x="68" y="8"  width="24" height="24" rx="2" fill="white"/>
                    <rect x="8"  y="68" width="24" height="24" rx="2" fill="white"/>
                    <rect x="16" y="16" width="8" height="8" fill="currentColor"/>
                    <rect x="76" y="16" width="8" height="8" fill="currentColor"/>
                    <rect x="16" y="76" width="8" height="8" fill="currentColor"/>
                    <rect x="52" y="4"  width="6" height="6" fill="currentColor"/>
                    <rect x="62" y="4"  width="6" height="6" fill="currentColor"/>
                    <rect x="52" y="14" width="6" height="6" fill="currentColor"/>
                    <rect x="4"  y="52" width="6" height="6" fill="currentColor"/>
                    <rect x="14" y="52" width="6" height="6" fill="currentColor"/>
                    <rect x="24" y="52" width="6" height="6" fill="currentColor"/>
                    <rect x="52" y="52" width="6" height="6" fill="currentColor"/>
                    <rect x="62" y="62" width="6" height="6" fill="currentColor"/>
                    <rect x="74" y="52" width="6" height="6" fill="currentColor"/>
                    <rect x="84" y="62" width="6" height="6" fill="currentColor"/>
                    <rect x="52" y="74" width="6" height="6" fill="currentColor"/>
                    <rect x="64" y="84" width="6" height="6" fill="currentColor"/>
                    <rect x="84" y="84" width="6" height="6" fill="currentColor"/>
                  </svg>
                </div>
                <p className="text-[11px] text-gray-400 font-medium">Scan this code to join the session</p>
              </div>

              {/* SHARE WITH FOLLOWERS */}
              <div>
                <p className="text-[13px] font-black text-[#222] mb-3">Share with Followers:</p>
                <div className="flex items-center gap-2 border border-gray-200 rounded-2xl px-4 py-2.5 mb-3">
                  <Search size={14} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search Followers"
                    value={followerSearch}
                    onChange={(e) => setFollowerSearch(e.target.value)}
                    className="flex-1 text-[12px] outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                  />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    { initials: "JD", name: "johndoe",  color: "bg-[#7c3aed]" },
                    { initials: "SK", name: "sarahk",   color: "bg-blue-500" },
                    { initials: "AM", name: "alexm",    color: "bg-orange-400" },
                    { initials: "LW", name: "lisawong",  color: "bg-teal-400" },
                    { initials: "RG", name: "robg",     color: "bg-green-500" },
                    { initials: "TP", name: "tompark",  color: "bg-yellow-400" },
                    { initials: "MK", name: "marykay",  color: "bg-red-400" },
                  ].map((u) => (
                    <div key={u.initials} className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full ${u.color} flex items-center justify-center text-white text-[11px] font-black`}>
                        {u.initials}
                      </div>
                      <span className="text-[9px] text-gray-400 font-medium">{u.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* INVITE VIA LINK */}
              <div>
                <p className="text-[13px] font-black text-[#222] mb-3">Invite via Link</p>
                <div className="border border-gray-200 rounded-2xl px-4 py-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Link size={12} className="text-gray-400 flex-shrink-0" />
                    <p className="text-[11px] text-gray-400 truncate">https://www.proformapp.com/session/apxsoc</p>
                  </div>
                </div>
                <button className="w-full bg-[#3b82f6] text-white py-3.5 rounded-2xl font-bold text-[13px] flex items-center justify-center gap-2">
                  <Copy size={14} />
                  Copy URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
