"use client";

import { useState } from "react";
import {
  ArrowLeft, Clock, Calendar, Flame, Target, Award,
  Dumbbell, Eye, Users, Star, ChevronRight, Timer, Zap,
  X, FileText
} from "lucide-react";

const weeks = [
  {
    label: "WEEK 1",
    title: "Foundation Week",
    desc: "Build your base strength with fundamental compound movements",
    workouts: 4,
    duration: "60-75 min",
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
  },
  {
    label: "WEEK 2",
    title: "Upper Body Focus",
    desc: "Chest, back & shoulders with progressive overload",
    workouts: 5,
    duration: "60-75 min",
    img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
  },
  {
    label: "WEEK 3",
    title: "Lower Body Power",
    desc: "Legs & glutes training for explosive strength",
    workouts: 4,
    duration: "60-75 min",
    img: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=600&q=80",
  },
  {
    label: "WEEK 4",
    title: "Total Body Strength",
    desc: "Full body compound lifts for maximum gains",
    workouts: 5,
    duration: "60-75 min",
    img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80",
  },
  {
    label: "WEEK 5",
    title: "Hypertrophy Phase",
    desc: "Muscle building volume with time under tension",
    workouts: 5,
    duration: "80-75 min",
    img: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&q=80",
  },
  {
    label: "WEEK 6",
    title: "Peak Performance",
    desc: "Maximum intensity training and testing your limits",
    workouts: 4,
    duration: "60-75 min",
    img: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80",
  },
];

const objectives = [
  {
    icon: "🟠",
    title: "Muscle Stimulation",
    desc: "Progressive overload targeting all major muscle groups for optimal growth",
    color: "#F97316",
    bg: "#FFF7ED",
  },
  {
    icon: "🔵",
    title: "Technique & Repetition",
    desc: "Perfect form with controlled tempo and optimal rep ranges",
    color: "#3B82F6",
    bg: "#EFF6FF",
  },
  {
    icon: "🟣",
    title: "Balance & Core Stability",
    desc: "Enhanced functional strength and injury prevention focus",
    color: "#8B5CF6",
    bg: "#F5F3FF",
  },
  {
    icon: "🟢",
    title: "Performance Metrics",
    desc: "Track progress with detailed analytics and strength benchmarks",
    color: "#10B981",
    bg: "#ECFDF5",
  },
];

/* ─── POPUP ─── */
function StartProgramPopup({ onClose }) {
  const [includeSupplemental, setIncludeSupplemental] = useState(false);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <style>{`@keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "white", borderRadius: 24, padding: "36px 32px 28px",
          width: 440, position: "relative", textAlign: "center",
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
          animation: "popIn 0.22s ease",
        }}
      >
        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "#F3F4F6", border: "none", borderRadius: "50%",
          width: 36, height: 36, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <X size={16} color="#374151" />
        </button>

        {/* Icon */}
        <div style={{
          width: 68, height: 68, borderRadius: 20,
          background: "linear-gradient(135deg, #7C3AED, #6C3AE8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 22px", position: "relative",
          boxShadow: "0 8px 24px rgba(108,58,232,0.4)",
        }}>
          <FileText size={30} color="white" />
          <div style={{
            position: "absolute", bottom: -5, right: -5,
            width: 24, height: 24, borderRadius: "50%",
            background: "#3B82F6", border: "3px solid white",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "white" }} />
          </div>
        </div>

        <p style={{ fontSize: 17, fontWeight: 700, color: "#111827", lineHeight: 1.4, marginBottom: 10 }}>
          Add this program to your<br />Workout Queue:
        </p>
        <p style={{ fontSize: 22, fontWeight: 900, color: "#6C3AE8", letterSpacing: "0.05em", marginBottom: 8 }}>
          ELITE STRENGTH
        </p>
        <p style={{ fontSize: 14, color: "#10B981", fontWeight: 600, marginBottom: 24 }}>
          *Add 9 Workout(s)
        </p>

        {/* Checkbox */}
        <label
          onClick={() => setIncludeSupplemental(!includeSupplemental)}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "#F9FAFB", border: "1.5px solid #E5E7EB",
            borderRadius: 12, padding: "13px 16px", marginBottom: 22,
            cursor: "pointer", textAlign: "left",
          }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: 5, flexShrink: 0,
            border: `2px solid ${includeSupplemental ? "#6C3AE8" : "#D1D5DB"}`,
            background: includeSupplemental ? "#6C3AE8" : "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}>
            {includeSupplemental && <span style={{ color: "white", fontSize: 12, fontWeight: 900, lineHeight: 1 }}>✓</span>}
          </div>
          <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>
            Include Supplemental Workouts (12)
          </span>
        </label>

        <button style={{
          width: "100%", background: "linear-gradient(135deg, #7C3AED, #6C3AE8)",
          color: "white", border: "none", borderRadius: 50,
          padding: "15px 0", fontSize: 15, fontWeight: 700, cursor: "pointer",
          marginBottom: 10, boxShadow: "0 4px 16px rgba(108,58,232,0.45)",
        }}>
          Add to Up Next
        </button>

        <button style={{
          width: "100%", background: "#111827",
          color: "white", border: "none", borderRadius: 50,
          padding: "15px 0", fontSize: 15, fontWeight: 700, cursor: "pointer",
          marginBottom: 16,
        }}>
          Add to Queue
        </button>

        <button onClick={onClose} style={{
          background: "none", border: "none", color: "#3B82F6",
          fontSize: 14, fontWeight: 600, cursor: "pointer",
        }}>
          Go Back
        </button>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function EliteStrengthPage() {
  const [hovered, setHovered] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F8F8FA", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .week-card { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
        .week-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(108,58,232,0.15); }
        .obj-card { background: white; border-radius: 14px; padding: 18px 20px; display: flex; align-items: flex-start; gap: 14px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); border: 1px solid #EFEFEF; }
        .stat-box { text-align: center; }
        .stat-box h3 { font-size: 28px; font-weight: 800; color: #1A1A2E; }
        .stat-box p { font-size: 12px; color: #9CA3AF; margin-top: 2px; }
      `}</style>

      {/* Popup */}
      {showPopup && <StartProgramPopup onClose={() => setShowPopup(false)} />}

      {/* Top Nav */}
      <header style={{
        background: "white",
        borderBottom: "1px solid #EFEFEF",
        padding: "14px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 800, color: "#111827" }}>Elite Strength</h1>
            <p style={{ fontSize: 12, color: "#9CA3AF" }}>6-week comprehensive strength building program</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#9CA3AF", fontSize: 13 }}>
            <Eye size={15} /> <span>12.4K views</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#9CA3AF", fontSize: 13 }}>
            <Users size={15} /> <span>3,247 started</span>
          </div>
          <button
            onClick={() => setShowPopup(true)}
            style={{
              background: "#6C3AE8", color: "white", border: "none",
              padding: "10px 22px", borderRadius: 10, fontWeight: 700,
              fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            }}
          >
            Start Program <ChevronRight size={16} />
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 28, alignItems: "start" }}>

          {/* LEFT: Program Objectives */}
          <section>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 16 }}>Program Objectives</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {objectives.map((o) => (
                <div key={o.title} className="obj-card">
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: o.bg, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 18, flexShrink: 0,
                  }}>{o.icon}</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 3 }}>{o.title}</p>
                    <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.5 }}>{o.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* RIGHT: Program Overview */}
          <section>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 16 }}>Program Overview</h2>
            <div style={{ background: "#18182A", borderRadius: 16, padding: "24px", color: "white" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                {[
                  { icon: <Clock size={16} />, label: "Duration", value: "6 Weeks", sub: "42 days of training" },
                  { icon: <Calendar size={16} />, label: "Schedule", value: "4-5 workouts/week", sub: "60-90 minutes per session" },
                  { icon: <Dumbbell size={16} />, label: "Nutrition Focus", value: "Muscle Gain", sub: "Caloric surplus recommended" },
                  { icon: <Zap size={16} />, label: "Intensity", value: "High – Advanced", sub: "RPE: 7-9 range" },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#9CA3AF", fontSize: 12, marginBottom: 4 }}>
                      {item.icon} <span>{item.label}</span>
                    </div>
                    <p style={{ fontWeight: 800, fontSize: 15, color: "white", lineHeight: 1.3 }}>{item.value}</p>
                    <p style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{item.sub}</p>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16, marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ background: "rgba(108,58,232,0.3)", borderRadius: 8, padding: 6, display: "flex" }}>
                    <Award size={14} color="#A78BFA" />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 2 }}>Prerequisites</p>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "white" }}>6+ months training experience</p>
                    <p style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>Familiarity with compound movements and proper form required</p>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <div className="stat-box"><h3>27</h3><p>Total Workouts</p></div>
                <div className="stat-box"><h3>135+</h3><p>Exercises</p></div>
                <div className="stat-box" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <h3>4.8</h3>
                    <Star size={16} color="#FBBF24" fill="#FBBF24" style={{ marginTop: 4 }} />
                  </div>
                  <p>Average Rating</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Weekly Program Breakdown */}
        <section style={{ marginTop: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>Weekly Program Breakdown</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#9CA3AF", fontSize: 12 }}>
              <Award size={13} /> Complete all 6 weeks to unlock achievement
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {weeks.map((week, i) => (
              <div
                key={week.label}
                className="week-card"
                style={{ background: "white", borderRadius: 14, overflow: "hidden", border: "1px solid #EFEFEF" }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <div style={{ position: "relative" }}>
                  <img
                    src={week.img}
                    alt={week.title}
                    style={{ width: "100%", height: 145, objectFit: "cover", display: "block" }}
                  />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)"
                  }} />
                  <div style={{
                    position: "absolute", top: 10, left: 10,
                    background: "#6C3AE8", color: "white", fontSize: 10, fontWeight: 800,
                    padding: "4px 10px", borderRadius: 20, letterSpacing: "0.06em",
                  }}>{week.label}</div>
                  <div style={{ position: "absolute", bottom: 10, left: 12, right: 12 }}>
                    <p style={{ fontWeight: 800, fontSize: 15, color: "white", lineHeight: 1.3 }}>{week.title}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.78)", marginTop: 2, lineHeight: 1.4 }}>{week.desc}</p>
                  </div>
                </div>
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#9CA3AF", fontSize: 12 }}>
                      <Dumbbell size={13} /> {week.workouts} workouts
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                      <Timer size={13} color="#6C3AE8" /> <span style={{ color: "#6C3AE8" }}>{week.duration}</span>
                    </div>
                  </div>
                  <button
                    style={{
                      width: "100%", background: "none", border: "1.5px solid #E5E7EB",
                      borderRadius: 8, padding: "8px 0", fontSize: 13, fontWeight: 600,
                      color: "#374151", cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center", gap: 6,
                      transition: "border-color 0.2s, color 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#6C3AE8"; e.currentTarget.style.color = "#6C3AE8"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; }}
                  >
                    <ChevronRight size={14} /> Preview Week
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Sticky Footer */}
      <div style={{
        position: "sticky", bottom: 0,
        background: "white", borderTop: "1px solid #EFEFEF",
        padding: "14px 32px", display: "flex", justifyContent: "flex-end",
      }}>
        <button
          onClick={() => setShowPopup(true)}
          style={{
            background: "#6C3AE8", color: "white", border: "none",
            padding: "12px 30px", borderRadius: 12, fontWeight: 800,
            fontSize: 15, cursor: "pointer", display: "flex",
            alignItems: "center", gap: 8, transition: "background 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#5B2AC7"}
          onMouseLeave={e => e.currentTarget.style.background = "#6C3AE8"}
        >
          Start Program <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}