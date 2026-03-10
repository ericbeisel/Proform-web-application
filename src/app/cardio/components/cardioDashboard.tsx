"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, Flame, Clock, Calendar, Check, BarChart2 } from "lucide-react";

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
    <div style={{ minHeight: "100vh", background: "#f4f4f8", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#1a1a2e" }}>

      {/* Top Bar */}
      <div style={{ background: "#ffffff", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e8e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button style={{ background: "transparent", border: "none", color: "#555", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px" }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ width: "38px", height: "38px", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "16px", color: "#fff" }}>4</div>
          <div>
            <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#7c3aed" }}>Cardio Goal</h1>
            <p style={{ margin: 0, fontSize: "12px", color: "#999" }}>{completedSessions}/{sessions.length} sessions completed • Track your weekly cardio progress</p>
          </div>
        </div>
        <button style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", border: "none", borderRadius: "8px", color: "#fff", padding: "10px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600", fontSize: "14px" }}>
          <Plus size={16} /> Add Session
        </button>
      </div>

      {/* Main Content */}
      <div style={{ padding: "28px", display: "grid", gridTemplateColumns: "420px 1fr", gap: "28px", maxWidth: "960px", margin: "0 auto" }}>

        {/* Left: Progress Overview */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", alignSelf: "start" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ margin: 0, fontWeight: "700", fontSize: "16px", color: "#1a1a2e" }}>Progress Overview</h2>
            <button
              onClick={() => setShowEditGoal(true)}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "#bbb", padding: "4px", borderRadius: "6px", display: "flex", alignItems: "center" }}
            >
              <Pencil size={15} />
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "2px" }}>
            <span style={{ fontSize: "52px", fontWeight: "800", color: "#22c55e", lineHeight: 1 }}>{completedCalories.toLocaleString()}</span>
            <span style={{ fontSize: "30px", color: "#ccc", fontWeight: "300" }}>/</span>
            <span style={{ fontSize: "52px", fontWeight: "800", color: "#7c3aed", lineHeight: 1 }}>{goalCalories.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", marginBottom: "18px" }}>
            <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: "600", minWidth: "90px" }}>Completed</span>
            <span style={{ fontSize: "12px", color: "#7c3aed", fontWeight: "600", marginLeft: "30px" }}>Goal</span>
          </div>
          <div style={{ marginBottom: "6px" }}>
            <div style={{ height: "7px", background: "#f0f0f4", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ width: `${progressPct}%`, height: "100%", background: "#22c55e", borderRadius: "999px", transition: "width 0.4s ease" }} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#aaa", marginBottom: "22px" }}>
            <span><span style={{ color: "#f97316", fontWeight: "600" }}>{scheduledCalories.toLocaleString()}</span> scheduled</span>
            <span><span style={{ color: "#22c55e", fontWeight: "600" }}>{Math.round(progressPct)}%</span> complete</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ background: "#eef2ff", borderRadius: "12px", padding: "16px 18px" }}>
              <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#888", fontWeight: "500" }}>Sessions Left</p>
              <p style={{ margin: 0, fontSize: "32px", fontWeight: "800", color: "#1a1a2e" }}>{sessions.length - completedSessions}</p>
            </div>
            <div style={{ background: "#fff8ed", borderRadius: "12px", padding: "16px 18px" }}>
              <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#888", fontWeight: "500" }}>Remaining</p>
              <p style={{ margin: 0, fontSize: "32px", fontWeight: "800", color: "#f97316" }}>{remainingCalories.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Right: Cardio Sessions */}
        <div>
          <h2 style={{ margin: "0 0 16px", fontWeight: "700", fontSize: "16px", color: "#1a1a2e" }}>Cardio Sessions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {sessions.map((session) => (
              <div key={session.id} onClick={() => openSession(session)} style={{ background: session.completed ? "#1e3a2e" : "#1e1e2e", borderRadius: "14px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", border: session.completed ? "1px solid #22c55e33" : "1px solid transparent", transition: "all 0.2s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: session.completed ? "#22c55e22" : "#3b3b8844", border: `2px solid ${session.completed ? "#22c55e" : "#7c3aed"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s ease" }}>
                    {session.completed && <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: "700", fontSize: "15px", color: "#ffffff" }}>Cardio #{session.id}</p>
                    <p style={{ margin: "3px 0 8px", fontSize: "12px", color: "#888" }}>By {session.day} @ {session.time}</p>
                    <span style={{ display: "inline-block", background: "#f97316", color: "#fff", fontSize: "12px", fontWeight: "600", padding: "3px 12px", borderRadius: "999px" }}>{session.calories.toLocaleString()} calories</span>
                  </div>
                </div>
                <button onClick={(e) => deleteSession(session.id, e)} style={{ background: "#2a2a3e", border: "none", borderRadius: "8px", color: "#888", cursor: "pointer", padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div onClick={closeModal} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, backdropFilter: "blur(2px)" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#ffffff", borderRadius: "24px", padding: "28px", width: "480px", boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <button style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#eef2ff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed" }}><Pencil size={17} /></button>
              <button style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#fff0f0", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}><Trash2 size={17} /></button>
            </div>
            <h2 style={{ textAlign: "center", fontSize: "32px", fontWeight: "800", color: "#1a1a2e", margin: "0 0 28px" }}>Cardio #{selectedSession.id}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "22px" }}>
              {/* Calories Card */}
              <div style={{ background: "linear-gradient(135deg, #f97316, #ea6c0a)", borderRadius: "16px", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}><Flame size={19} color="#fff" /></div>
                  <div>
                    <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.85)", fontWeight: "500" }}>Calories</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.85)", fontWeight: "500" }}>Schedule</p>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: "40px", fontWeight: "800", color: "#fff", lineHeight: 1 }}>{selectedSession.calories.toLocaleString()}</p>
                <div style={{ height: "2px", background: "rgba(255,255,255,0.35)", borderRadius: "999px", marginTop: "12px" }} />
              </div>
              {/* Scheduled Time Card */}
              <div style={{ background: "#f0eeff", borderRadius: "16px", padding: "20px" }}>
                <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#7c3aed", fontWeight: "600" }}>Scheduled Time</p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#e0d9ff", display: "flex", alignItems: "center", justifyContent: "center" }}><Clock size={19} color="#7c3aed" /></div>
                  <div>
                    <p style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#7c3aed" }}>By {selectedSession.day}</p>
                    <p style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#7c3aed" }}>@ {selectedSession.time}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Calendar size={13} color="#aaa" />
                  <span style={{ fontSize: "12px", color: "#aaa" }}>This week</span>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "18px" }}>
              <button onClick={completeActivity} style={{ background: selectedSession.completed ? "#22c55e" : "linear-gradient(135deg, #7c3aed, #6d28d9)", border: "none", borderRadius: "12px", color: "#fff", padding: "16px", cursor: "pointer", fontWeight: "700", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <Check size={17} />{selectedSession.completed ? "Completed!" : "Complete Activity"}
              </button>
              <button style={{ background: "transparent", border: "2px solid #7c3aed", borderRadius: "12px", color: "#7c3aed", padding: "16px", cursor: "pointer", fontWeight: "700", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <Calendar size={17} />Cardio Schedule
              </button>
            </div>
            <button onClick={closeModal} style={{ display: "block", width: "100%", background: "transparent", border: "none", color: "#aaa", cursor: "pointer", fontSize: "14px", fontWeight: "500", textAlign: "center", padding: "4px" }}>Close</button>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {showEditGoal && (
        <div onClick={() => setShowEditGoal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, backdropFilter: "blur(2px)" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#ffffff", borderRadius: "24px", padding: "36px 32px", width: "540px", boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "28px", fontWeight: "800", color: "#1a1a2e", lineHeight: 1.2 }}>
              Let's Update your activity level
            </h2>
            <p style={{ margin: "0 0 32px", fontSize: "14px", color: "#999", lineHeight: 1.5 }}>
              Enter your new weekly cardio goal to personalize your experience.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "22px" }}>
              {/* Current Goal */}
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", color: "#555", marginBottom: "8px" }}>
                  <Flame size={14} color="#f97316" /> Current Goal (kcal)*
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    value={goalCalories}
                    readOnly
                    style={{ width: "100%", padding: "15px 44px 15px 16px", border: "1.5px solid #e8e8f0", borderRadius: "12px", fontSize: "20px", fontWeight: "700", color: "#1a1a2e", background: "#fafafa", boxSizing: "border-box", outline: "none" }}
                  />
                  <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "2px" }}>
                    <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "#aaa", padding: "1px", lineHeight: 1, fontSize: "10px" }}>▲</button>
                    <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "#aaa", padding: "1px", lineHeight: 1, fontSize: "10px" }}>▼</button>
                  </div>
                </div>
              </div>
              {/* New Goal */}
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", color: "#555", marginBottom: "8px" }}>
                  <Flame size={14} color="#f97316" /> New Goal Per Week (kcal)*
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    value={newGoalValue}
                    onChange={(e) => setNewGoalValue(e.target.value)}
                    placeholder="e.g., 1500"
                    style={{ width: "100%", padding: "15px 44px 15px 16px", border: "1.5px solid #e8e8f0", borderRadius: "12px", fontSize: "20px", fontWeight: "700", color: "#1a1a2e", background: "#fafafa", boxSizing: "border-box", outline: "none" }}
                  />
                  <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "2px" }}>
                    <button onClick={() => setNewGoalValue(v => String((parseInt(v) || 0) + 100))} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#aaa", padding: "1px", lineHeight: 1, fontSize: "10px" }}>▲</button>
                    <button onClick={() => setNewGoalValue(v => String(Math.max(0, (parseInt(v) || 0) - 100)))} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#aaa", padding: "1px", lineHeight: 1, fontSize: "10px" }}>▼</button>
                  </div>
                </div>
              </div>
            </div>
            {/* Info Banner */}
            <div style={{ background: "#f0eeff", borderRadius: "12px", padding: "16px 18px", marginBottom: "28px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <BarChart2 size={17} color="#7c3aed" style={{ flexShrink: 0, marginTop: "1px" }} />
              <p style={{ margin: 0, fontSize: "13px", color: "#555", lineHeight: 1.6 }}>
                <strong>Progress Tracking:</strong> Regular photos and metrics help you see real changes that the scale might not show.
              </p>
            </div>
            {/* Continue Button */}
            <button onClick={handleContinue} style={{ width: "100%", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", border: "none", borderRadius: "999px", color: "#fff", padding: "18px", cursor: "pointer", fontWeight: "700", fontSize: "16px" }}>
              Continue
            </button>
          </div>
        </div>
      )}

    </div>
  );
}