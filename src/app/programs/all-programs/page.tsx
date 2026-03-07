"use client";

import { useState } from "react";
import {
  Search, ArrowLeft, LayoutGrid, AlignJustify, Eye, ShoppingBag,
  SlidersHorizontal, X, Check,
  Clock, Calendar, Award, Dumbbell, Users, Star,
  ChevronRight, Timer, Zap, FileText
} from "lucide-react";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════
   TYPES
═══════════════════════════════════ */
interface Program {
  id: number;
  title: string;
  description: string;
  duration: string;
  category: string;
  level: string;
  purchased: boolean;
  dollar: boolean;
  views: number;
  bought: number;
  image: string;
}

interface Week {
  label: string;
  title: string;
  desc: string;
  workouts: number;
  duration: string;
  img: string;
}

interface Objective {
  icon: string;
  title: string;
  desc: string;
  bg: string;
}

interface StartProgramPopupProps {
  program: Program;
  onClose: () => void;
}

interface ProgramDetailPageProps {
  program: Program;
  onBack: () => void;
}

interface AllProgramsGridProps {
  onSelectProgram: (program: Program) => void;
}

interface PillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

interface ChipProps {
  label: string;
  onRemove: () => void;
}

/* ═══════════════════════════════════
   DATA
═══════════════════════════════════ */
const programs: Program[] = [
  { id: 1, title: "July 4th Special!",  description: "Patriotic workout program celebrating American fitness culture with explosive movements and conditioning.",                                                   duration: "LIMITED TIME", category: "Conditioning", level: "Beginner",     purchased: true,  dollar: true, views: 717,   bought: 1817, image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80" },
  { id: 2, title: "RECONDITIONING",     description: "Whether you are traveling or just letting your body recover, use this program to maintain your muscles and prepare for the offseason.",                     duration: "3 WEEKS",      category: "Recovery",    level: "Intermediate", purchased: true,  dollar: true, views: 717,   bought: 1817, image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80" },
  { id: 3, title: "HYPERTROPHY",        description: "Think of this program as the beginning stages of a new off-season weight room to become stronger. Calorie intake is important for muscle growth.",         duration: "6 WEEKS",      category: "Strength",    level: "Advanced",     purchased: false, dollar: true, views: 717,   bought: 1817, image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80" },
  { id: 4, title: "HYPERTROPHY",        description: "Think of this program as the beginning stages of a new off-season weight room to become stronger. Calorie intake is important for muscle growth.",         duration: "6 WEEKS",      category: "Strength",    level: "Advanced",     purchased: false, dollar: true, views: 717,   bought: 1817, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80" },
  { id: 5, title: "HYPERTROPHY",        description: "Think of this program as the beginning stages of a new off-season weight room to become stronger. Calorie intake is important for muscle growth.",         duration: "6 WEEKS",      category: "Strength",    level: "Intermediate", purchased: false, dollar: true, views: 717,   bought: 1817, image: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=600&q=80" },
  { id: 6, title: "Elite Strength",     description: "6-week comprehensive strength building program with progressive overload targeting all major muscle groups for optimal growth.",                             duration: "6 WEEKS",      category: "Strength",    level: "Advanced",     purchased: false, dollar: true, views: 12400, bought: 3247, image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&q=80" },
];

const weeks: Week[] = [
  { label: "WEEK 1", title: "Foundation Week",     desc: "Build your base strength with fundamental compound movements", workouts: 4, duration: "60-75 min", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80" },
  { label: "WEEK 2", title: "Upper Body Focus",    desc: "Chest, back & shoulders with progressive overload",           workouts: 5, duration: "60-75 min", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80" },
  { label: "WEEK 3", title: "Lower Body Power",    desc: "Legs & glutes training for explosive strength",               workouts: 4, duration: "60-75 min", img: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=600&q=80" },
  { label: "WEEK 4", title: "Total Body Strength", desc: "Full body compound lifts for maximum gains",                  workouts: 5, duration: "60-75 min", img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80" },
  { label: "WEEK 5", title: "Hypertrophy Phase",   desc: "Muscle building volume with time under tension",              workouts: 5, duration: "75-90 min", img: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&q=80" },
  { label: "WEEK 6", title: "Peak Performance",    desc: "Maximum intensity training and testing your limits",          workouts: 4, duration: "60-75 min", img: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80" },
];

const objectives: Objective[] = [
  { icon: "🟠", title: "Muscle Stimulation",     desc: "Progressive overload targeting all major muscle groups for optimal growth", bg: "#FFF7ED" },
  { icon: "🔵", title: "Technique & Repetition", desc: "Perfect form with controlled tempo and optimal rep ranges",                  bg: "#EFF6FF" },
  { icon: "🟣", title: "Balance & Core Stability",desc: "Enhanced functional strength and injury prevention focus",                  bg: "#F5F3FF" },
  { icon: "🟢", title: "Performance Metrics",    desc: "Track progress with detailed analytics and strength benchmarks",            bg: "#ECFDF5" },
];

const DURATIONS: string[] = ["All", "LIMITED TIME", "3 WEEKS", "6 WEEKS"];
const LEVELS:    string[] = ["All", "Beginner", "Intermediate", "Advanced"];
const CATS:      string[] = ["All", "Conditioning", "Recovery", "Strength"];

/* ═══════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body   { font-family: 'DM Sans', sans-serif; }
    button { font-family: 'DM Sans', sans-serif; cursor: pointer; }
    input  { font-family: 'DM Sans', sans-serif; }

    @keyframes slideInRight { from { opacity:0; transform:translateX(40px);  } to { opacity:1; transform:translateX(0); } }
    @keyframes slideInLeft  { from { opacity:0; transform:translateX(-40px); } to { opacity:1; transform:translateX(0); } }
    @keyframes popIn        { from { opacity:0; transform:scale(0.9);        } to { opacity:1; transform:scale(1);      } }
    @keyframes slideDown    { from { opacity:0; transform:translateY(-8px);  } to { opacity:1; transform:translateY(0); } }

    .page-grid   { animation: slideInLeft  0.28s ease; }
    .page-detail { animation: slideInRight 0.28s ease; }

    .prog-card { background:white; border-radius:16px; overflow:hidden; border:1px solid #E5E7EB; cursor:pointer; transition:box-shadow 0.2s,transform 0.2s; }
    .prog-card:hover { box-shadow:0 8px 28px rgba(0,0,0,0.13); transform:translateY(-3px); }
    .prog-card:hover .card-img { transform:scale(1.05); }
    .card-img { transition:transform 0.35s ease; width:100%; height:100%; object-fit:cover; display:block; }

    .list-row { background:white; border-radius:14px; overflow:hidden; border:1px solid #E5E7EB; cursor:pointer; transition:box-shadow 0.18s,transform 0.18s; display:flex; }
    .list-row:hover { box-shadow:0 6px 22px rgba(0,0,0,0.11); transform:translateY(-2px); }
    .list-row:hover .card-img { transform:scale(1.05); }

    .week-card { transition:transform 0.2s ease,box-shadow 0.2s ease; cursor:pointer; }
    .week-card:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(108,58,232,0.15); }
    .preview-btn:hover { border-color:#6C3AE8 !important; color:#6C3AE8 !important; }

    .obj-card { background:white; border-radius:14px; padding:18px 20px; display:flex; align-items:flex-start; gap:14px; box-shadow:0 1px 4px rgba(0,0,0,0.06); border:1px solid #EFEFEF; }
    .stat-box { text-align:center; }
    .stat-box h3 { font-size:28px; font-weight:800; color:#1A1A2E; }
    .stat-box p  { font-size:12px; color:#9CA3AF; margin-top:2px; }
    .start-btn:hover { background:#5B2AC7 !important; }
    input:focus { outline:none; }
  `}</style>
);

/* ═══════════════════════════════════
   START PROGRAM POPUP
═══════════════════════════════════ */
function StartProgramPopup({ program, onClose }: StartProgramPopupProps) {
  const [inc, setInc] = useState(false);

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background:"white", borderRadius:24, padding:"36px 32px 28px", width:440, position:"relative", textAlign:"center", boxShadow:"0 24px 60px rgba(0,0,0,0.25)", animation:"popIn 0.22s ease" }}>

        <button onClick={onClose} style={{ position:"absolute", top:16, right:16, background:"#F3F4F6", border:"none", borderRadius:"50%", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <X size={16} color="#374151" />
        </button>

        <div style={{ width:68, height:68, borderRadius:20, background:"linear-gradient(135deg,#7C3AED,#6C3AE8)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 22px", position:"relative", boxShadow:"0 8px 24px rgba(108,58,232,0.4)" }}>
          <FileText size={30} color="white" />
          <div style={{ position:"absolute", bottom:-5, right:-5, width:24, height:24, borderRadius:"50%", background:"#3B82F6", border:"3px solid white", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"white" }} />
          </div>
        </div>

        <p style={{ fontSize:17, fontWeight:700, color:"#111827", lineHeight:1.4, marginBottom:10 }}>Add this program to your<br />Workout Queue:</p>
        <p style={{ fontSize:22, fontWeight:900, color:"#6C3AE8", letterSpacing:"0.05em", marginBottom:8 }}>{program.title.toUpperCase()}</p>
        <p style={{ fontSize:14, color:"#10B981", fontWeight:600, marginBottom:24 }}>*Add 9 Workout(s)</p>

        <label onClick={() => setInc(!inc)} style={{ display:"flex", alignItems:"center", gap:12, background:"#F9FAFB", border:"1.5px solid #E5E7EB", borderRadius:12, padding:"13px 16px", marginBottom:22, cursor:"pointer", textAlign:"left" }}>
          <div style={{ width:20, height:20, borderRadius:5, flexShrink:0, border:`2px solid ${inc ? "#6C3AE8" : "#D1D5DB"}`, background:inc ? "#6C3AE8" : "white", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
            {inc && <span style={{ color:"white", fontSize:12, fontWeight:900 }}>✓</span>}
          </div>
          <span style={{ fontSize:14, color:"#374151", fontWeight:500 }}>Include Supplemental Workouts (12)</span>
        </label>

        <button style={{ width:"100%", background:"linear-gradient(135deg,#7C3AED,#6C3AE8)", color:"white", border:"none", borderRadius:50, padding:"15px 0", fontSize:15, fontWeight:700, marginBottom:10, boxShadow:"0 4px 16px rgba(108,58,232,0.45)" }}>
          Add to Up Next
        </button>
        <button style={{ width:"100%", background:"#111827", color:"white", border:"none", borderRadius:50, padding:"15px 0", fontSize:15, fontWeight:700, marginBottom:16 }}>
          Add to Queue
        </button>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"#3B82F6", fontSize:14, fontWeight:600 }}>Go Back</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   PROGRAM DETAIL PAGE
═══════════════════════════════════ */
function ProgramDetailPage({ program, onBack }: ProgramDetailPageProps) {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="page-detail" style={{ fontFamily:"'DM Sans',sans-serif", background:"#F8F8FA", minHeight:"100vh" }}>
      {showPopup && <StartProgramPopup program={program} onClose={() => setShowPopup(false)} />}

      {/* Header */}
      <header style={{ background:"white", borderBottom:"1px solid #EFEFEF", padding:"14px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={onBack} style={{ background:"#F3F4F6", border:"none", borderRadius:8, padding:8, display:"flex", alignItems:"center" }}>
            <ArrowLeft size={18} color="#374151" />
          </button>
          <div>
            <h1 style={{ fontSize:17, fontWeight:800, color:"#111827" }}>{program.title}</h1>
            <p style={{ fontSize:12, color:"#9CA3AF" }}>6-week comprehensive strength building program</p>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, color:"#9CA3AF", fontSize:13 }}>
            <Eye size={15} /> <span>{program.views >= 1000 ? (program.views / 1000).toFixed(1) + "K" : program.views} views</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, color:"#9CA3AF", fontSize:13 }}>
            <Users size={15} /> <span>{program.bought.toLocaleString()} started</span>
          </div>
          <button onClick={() => setShowPopup(true)} style={{ background:"#6C3AE8", color:"white", border:"none", padding:"10px 22px", borderRadius:10, fontWeight:700, fontSize:14, display:"flex", alignItems:"center", gap:6 }}>
            Start Program <ChevronRight size={16} />
          </button>
        </div>
      </header>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 24px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr", gap:28, alignItems:"start" }}>

          {/* Objectives */}
          <section>
            <h2 style={{ fontSize:18, fontWeight:800, color:"#111827", marginBottom:16 }}>Program Objectives</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {objectives.map((o) => (
                <div key={o.title} className="obj-card">
                  <div style={{ width:40, height:40, borderRadius:10, background:o.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{o.icon}</div>
                  <div>
                    <p style={{ fontWeight:700, fontSize:14, color:"#111827", marginBottom:3 }}>{o.title}</p>
                    <p style={{ fontSize:13, color:"#6B7280", lineHeight:1.5 }}>{o.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Overview */}
          <section>
            <h2 style={{ fontSize:18, fontWeight:800, color:"#111827", marginBottom:16 }}>Program Overview</h2>
            <div style={{ background:"#18182A", borderRadius:16, padding:"24px", color:"white" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
                {[
                  { icon:<Clock size={16}/>,    label:"Duration",       value:"6 Weeks",           sub:"42 days of training"          },
                  { icon:<Calendar size={16}/>, label:"Schedule",       value:"4-5 workouts/week", sub:"60-90 minutes per session"    },
                  { icon:<Dumbbell size={16}/>, label:"Nutrition Focus", value:"Muscle Gain",       sub:"Caloric surplus recommended"  },
                  { icon:<Zap size={16}/>,      label:"Intensity",      value:"High – Advanced",   sub:"RPE: 7-9 range"               },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, color:"#9CA3AF", fontSize:12, marginBottom:4 }}>{item.icon}<span>{item.label}</span></div>
                    <p style={{ fontWeight:800, fontSize:15, color:"white", lineHeight:1.3 }}>{item.value}</p>
                    <p style={{ fontSize:11, color:"#6B7280", marginTop:2 }}>{item.sub}</p>
                  </div>
                ))}
              </div>
              <div style={{ borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:16, marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                  <div style={{ background:"rgba(108,58,232,0.3)", borderRadius:8, padding:6, display:"flex" }}>
                    <Award size={14} color="#A78BFA" />
                  </div>
                  <div>
                    <p style={{ fontSize:11, color:"#9CA3AF", marginBottom:2 }}>Prerequisites</p>
                    <p style={{ fontWeight:700, fontSize:14, color:"white" }}>6+ months training experience</p>
                    <p style={{ fontSize:12, color:"#6B7280", marginTop:2 }}>Familiarity with compound movements and proper form required</p>
                  </div>
                </div>
              </div>
              <div style={{ borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:16, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                <div className="stat-box"><h3>27</h3><p>Total Workouts</p></div>
                <div className="stat-box"><h3>135+</h3><p>Exercises</p></div>
                <div className="stat-box" style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <h3>4.8</h3>
                    <Star size={16} color="#FBBF24" fill="#FBBF24" style={{ marginTop:4 }} />
                  </div>
                  <p>Average Rating</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Weekly Breakdown */}
        <section style={{ marginTop:36 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <h2 style={{ fontSize:18, fontWeight:800, color:"#111827" }}>Weekly Program Breakdown</h2>
            <div style={{ display:"flex", alignItems:"center", gap:6, color:"#9CA3AF", fontSize:12 }}>
              <Award size={13} /> Complete all 6 weeks to unlock achievement
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
            {weeks.map((week) => (
              <div key={week.label} className="week-card" style={{ background:"white", borderRadius:14, overflow:"hidden", border:"1px solid #EFEFEF" }}>
                <div style={{ position:"relative" }}>
                  <img src={week.img} alt={week.title} style={{ width:"100%", height:145, objectFit:"cover", display:"block" }} />
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.72) 0%,rgba(0,0,0,0.15) 55%,transparent 100%)" }} />
                  <div style={{ position:"absolute", top:10, left:10, background:"#6C3AE8", color:"white", fontSize:10, fontWeight:800, padding:"4px 10px", borderRadius:20, letterSpacing:"0.06em" }}>{week.label}</div>
                  <div style={{ position:"absolute", bottom:10, left:12, right:12 }}>
                    <p style={{ fontWeight:800, fontSize:15, color:"white", lineHeight:1.3 }}>{week.title}</p>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,0.78)", marginTop:2, lineHeight:1.4 }}>{week.desc}</p>
                  </div>
                </div>
                <div style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5, color:"#9CA3AF", fontSize:12 }}><Dumbbell size={13} /> {week.workouts} workouts</div>
                    <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:12 }}><Timer size={13} color="#6C3AE8" /><span style={{ color:"#6C3AE8" }}>{week.duration}</span></div>
                  </div>
                  <button className="preview-btn" style={{ width:"100%", background:"none", border:"1.5px solid #E5E7EB", borderRadius:8, padding:"8px 0", fontSize:13, fontWeight:600, color:"#374151", display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"border-color 0.2s,color 0.2s" }}>
                    <ChevronRight size={14} /> Preview Week
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Sticky Footer */}
      <div style={{ position:"sticky", bottom:0, background:"white", borderTop:"1px solid #EFEFEF", padding:"14px 32px", display:"flex", justifyContent:"flex-end" }}>
        <button className="start-btn" onClick={() => setShowPopup(true)} style={{ background:"#6C3AE8", color:"white", border:"none", padding:"12px 30px", borderRadius:12, fontWeight:800, fontSize:15, display:"flex", alignItems:"center", gap:8, transition:"background 0.2s" }}>
          Start Program <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   ALL PROGRAMS GRID
═══════════════════════════════════ */
function AllProgramsGrid({ onSelectProgram }: AllProgramsGridProps) {
  const router = useRouter();
  const [searchQuery,     setSearchQuery]     = useState<string>("");
  const [viewMode,        setViewMode]        = useState<"grid" | "list">("grid");
  const [showFilters,     setShowFilters]     = useState<boolean>(false);
  const [filterDuration,  setFilterDuration]  = useState<string>("All");
  const [filterLevel,     setFilterLevel]     = useState<string>("All");
  const [filterCat,       setFilterCat]       = useState<string>("All");
  const [filterPurchased, setFilterPurchased] = useState<boolean>(false);

  const activeCount = [filterDuration !== "All", filterLevel !== "All", filterCat !== "All", filterPurchased].filter(Boolean).length;
  const clearAll = () => { setFilterDuration("All"); setFilterLevel("All"); setFilterCat("All"); setFilterPurchased(false); };

  const filtered = programs.filter((p) => {
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterDuration !== "All" && p.duration !== filterDuration) return false;
    if (filterLevel    !== "All" && p.level    !== filterLevel)    return false;
    if (filterCat      !== "All" && p.category !== filterCat)      return false;
    if (filterPurchased && !p.purchased) return false;
    return true;
  });

  const Pill = ({ label, active, onClick }: PillProps) => (
    <button onClick={onClick} style={{ border:`1.5px solid ${active ? "#6C3AE8" : "#E5E7EB"}`, borderRadius:8, padding:"7px 13px", fontSize:13, fontWeight:600, background:active ? "#6C3AE8" : "white", color:active ? "white" : "#374151", transition:"all 0.15s", display:"inline-flex", alignItems:"center", gap:5 }}>
      {active && <Check size={12} />}{label}
    </button>
  );

  const Chip = ({ label, onRemove }: ChipProps) => (
    <div style={{ background:"#EDE9FE", color:"#6C3AE8", fontSize:12, fontWeight:700, padding:"5px 10px", borderRadius:20, display:"flex", alignItems:"center", gap:6 }}>
      {label}
      <button onClick={onRemove} style={{ background:"none", border:"none", display:"flex", padding:0 }}><X size={11} color="#6C3AE8" /></button>
    </div>
  );

  return (
    <div className="page-grid" style={{ fontFamily:"'DM Sans',sans-serif", minHeight:"100vh", background:"#F3F4F6" }}>

      {/* Header */}
      <header style={{ background:"white", borderBottom:"1px solid #E5E7EB", padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        
          <div>
            <h1 style={{ fontSize:20, fontWeight:800, color:"#111827" }}>All Programs</h1>
            <p style={{ fontSize:12, color:"#9CA3AF", marginTop:1 }}>Browse and discover training programs for every goal</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={() => setViewMode("grid")} style={{ border:"none", borderRadius:8, padding:"8px 10px", display:"flex", background:viewMode === "grid" ? "#6C3AE8" : "#F3F4F6", transition:"background 0.15s" }}>
            <LayoutGrid size={16} color={viewMode === "grid" ? "white" : "#6B7280"} />
          </button>
          <button onClick={() => setViewMode("list")} style={{ border:"none", borderRadius:8, padding:"8px 10px", display:"flex", background:viewMode === "list" ? "#6C3AE8" : "#F3F4F6", transition:"background 0.15s" }}>
            <AlignJustify size={16} color={viewMode === "list" ? "white" : "#6B7280"} />
          </button>
        </div>
      </header>

      {/* Search bar */}
      <div style={{ background:"white", borderBottom:"1px solid #E5E7EB", padding:"12px 28px", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ flex:1, display:"flex", alignItems:"center", gap:10, border:"1.5px solid #E5E7EB", borderRadius:10, padding:"9px 14px" }}>
          <Search size={15} color="#9CA3AF" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search all programs..." style={{ border:"none", outline:"none", fontSize:14, color:"#374151", flex:1, background:"transparent" }} />
          {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background:"none", border:"none", display:"flex" }}><X size={14} color="#9CA3AF" /></button>}
        </div>
    <button 
  onClick={() => router.push('/programs/all-workout')}
  style={{ background:"#6C3AE8", color:"white", border:"none", borderRadius:10, padding:"10px 18px", fontWeight:700, fontSize:13, display:"flex", alignItems:"center", gap:7, whiteSpace:"nowrap" }}
>
  <Search size={14} /> Search All Workouts
</button>
        <button onClick={() => setShowFilters(!showFilters)} style={{ background:showFilters || activeCount > 0 ? "#6C3AE8" : "white", color:showFilters || activeCount > 0 ? "white" : "#374151", border:`1.5px solid ${showFilters || activeCount > 0 ? "#6C3AE8" : "#E5E7EB"}`, borderRadius:10, padding:"10px 14px", fontWeight:700, fontSize:13, display:"flex", alignItems:"center", gap:7, whiteSpace:"nowrap", transition:"all 0.15s" }}>
          <SlidersHorizontal size={14} /> Filters
          {activeCount > 0 && <span style={{ background:"rgba(255,255,255,0.3)", borderRadius:10, padding:"1px 7px", fontSize:11, fontWeight:800 }}>{activeCount}</span>}
        </button>
        <div style={{ background:"white", border:"1.5px solid #E5E7EB", borderRadius:10, padding:"10px 14px", fontSize:13, fontWeight:600, color:"#374151", whiteSpace:"nowrap" }}>
          {filtered.length} programs
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div style={{ background:"white", borderBottom:"1px solid #E5E7EB", padding:"16px 28px", display:"flex", flexDirection:"column", gap:14, animation:"slideDown 0.18s ease" }}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:32, flexWrap:"wrap" }}>
            {[
              { label:"Duration", options:DURATIONS, val:filterDuration, set:setFilterDuration },
              { label:"Level",    options:LEVELS,    val:filterLevel,    set:setFilterLevel    },
              { label:"Category", options:CATS,      val:filterCat,      set:setFilterCat      },
            ].map((f) => (
              <div key={f.label}>
                <p style={{ fontSize:11, fontWeight:700, color:"#9CA3AF", marginBottom:8, letterSpacing:"0.06em", textTransform:"uppercase" }}>{f.label}</p>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {f.options.map((o) => <Pill key={o} label={o} active={f.val === o} onClick={() => f.set(o)} />)}
                </div>
              </div>
            ))}
            <div>
              <p style={{ fontSize:11, fontWeight:700, color:"#9CA3AF", marginBottom:8, letterSpacing:"0.06em", textTransform:"uppercase" }}>Ownership</p>
              <Pill label="Purchased only" active={filterPurchased} onClick={() => setFilterPurchased(!filterPurchased)} />
            </div>
          </div>
          {activeCount > 0 && (
            <button onClick={clearAll} style={{ alignSelf:"flex-start", background:"none", border:"none", color:"#EF4444", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:5, padding:0 }}>
              <X size={13} /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Active chip bar */}
      {activeCount > 0 && !showFilters && (
        <div style={{ padding:"10px 28px", display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
          {filterDuration !== "All" && <Chip label={filterDuration}  onRemove={() => setFilterDuration("All")} />}
          {filterLevel    !== "All" && <Chip label={filterLevel}     onRemove={() => setFilterLevel("All")} />}
          {filterCat      !== "All" && <Chip label={filterCat}       onRemove={() => setFilterCat("All")} />}
          {filterPurchased          && <Chip label="Purchased only"  onRemove={() => setFilterPurchased(false)} />}
          <button onClick={clearAll} style={{ background:"none", border:"none", color:"#9CA3AF", fontSize:12, fontWeight:600 }}>Clear all</button>
        </div>
      )}

      {/* Content */}
      <div style={{ padding:"20px 28px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:"#9CA3AF" }}>
            <Search size={40} style={{ margin:"0 auto 12px", opacity:0.3 }} />
            <p style={{ fontSize:16, fontWeight:700 }}>No programs found</p>
            <p style={{ fontSize:13, marginTop:4 }}>Try adjusting your search or filters</p>
            <button onClick={clearAll} style={{ marginTop:16, background:"#6C3AE8", color:"white", border:"none", borderRadius:10, padding:"10px 20px", fontWeight:700, fontSize:14 }}>Clear filters</button>
          </div>

        ) : viewMode === "grid" ? (
          /* GRID */
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
            {filtered.map((prog) => (
              <div key={prog.id} className="prog-card" onClick={() => onSelectProgram(prog)}>
                <div style={{ position:"relative", height:185, overflow:"hidden" }}>
                  <img src={prog.image} alt={prog.title} className="card-img" />
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(0,0,0,0.18) 0%,transparent 60%)" }} />
                  {prog.dollar    && <div style={{ position:"absolute", top:10, left:10, width:28, height:28, borderRadius:"50%", background:"#F59E0B", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:14, color:"white", boxShadow:"0 2px 6px rgba(0,0,0,0.2)" }}>$</div>}
                  {prog.purchased && <div style={{ position:"absolute", top:10, right:10, background:"#10B981", color:"white", fontSize:10, fontWeight:800, padding:"4px 10px", borderRadius:20 }}>PURCHASED</div>}
                  <div style={{ position:"absolute", bottom:10, left:10, background:"#8B5CF6", color:"white", fontSize:10, fontWeight:800, padding:"4px 10px", borderRadius:20 }}>{prog.duration}</div>
                </div>
                <div style={{ padding:"16px 18px 18px" }}>
                  <h3 style={{ fontSize:16, fontWeight:800, color:"#111827", marginBottom:8 }}>{prog.title}</h3>
                  <p style={{ fontSize:13, color:"#6B7280", lineHeight:1.55, marginBottom:16, display:"-webkit-box", WebkitLineClamp:4, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{prog.description}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:24, paddingTop:12, borderTop:"1px solid #F3F4F6" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <Eye size={15} color="#3B82F6" />
                      <div><p style={{ fontSize:13, fontWeight:700, color:"#111827", lineHeight:1 }}>{prog.views.toLocaleString()}</p><p style={{ fontSize:11, color:"#9CA3AF", marginTop:2 }}>views</p></div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <ShoppingBag size={15} color="#10B981" />
                      <div><p style={{ fontSize:13, fontWeight:700, color:"#111827", lineHeight:1 }}>{prog.bought.toLocaleString()}</p><p style={{ fontSize:11, color:"#9CA3AF", marginTop:2 }}>bought</p></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        ) : (
          /* LIST */
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {filtered.map((prog) => (
              <div key={prog.id} className="list-row" onClick={() => onSelectProgram(prog)}>
                <div style={{ position:"relative", width:200, flexShrink:0, overflow:"hidden" }}>
                  <img src={prog.image} alt={prog.title} className="card-img" style={{ height:"100%", minHeight:130 }} />
                  {prog.purchased && <div style={{ position:"absolute", top:8, right:8, background:"#10B981", color:"white", fontSize:9, fontWeight:800, padding:"3px 8px", borderRadius:20 }}>PURCHASED</div>}
                  <div style={{ position:"absolute", bottom:8, left:8, background:"#8B5CF6", color:"white", fontSize:9, fontWeight:800, padding:"3px 8px", borderRadius:20 }}>{prog.duration}</div>
                </div>
                <div style={{ padding:"18px 22px", flex:1, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                      <span style={{ background:"#EDE9FE", color:"#6C3AE8", fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:20 }}>{prog.category}</span>
                      <span style={{ background:"#FFF7ED", color:"#F97316", fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:20 }}>{prog.level}</span>
                    </div>
                    <h3 style={{ fontSize:16, fontWeight:800, color:"#111827", marginBottom:6 }}>{prog.title}</h3>
                    <p style={{ fontSize:13, color:"#6B7280", lineHeight:1.55, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{prog.description}</p>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:14, paddingTop:12, borderTop:"1px solid #F3F4F6" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:20 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}><Eye size={13} color="#3B82F6" /><span style={{ fontSize:12, fontWeight:700, color:"#111827" }}>{prog.views.toLocaleString()}</span><span style={{ fontSize:11, color:"#9CA3AF" }}>views</span></div>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}><ShoppingBag size={13} color="#10B981" /><span style={{ fontSize:12, fontWeight:700, color:"#111827" }}>{prog.bought.toLocaleString()}</span><span style={{ fontSize:11, color:"#9CA3AF" }}>bought</span></div>
                    </div>
                    <button
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); onSelectProgram(prog); }}
                      style={{ background:"#6C3AE8", color:"white", border:"none", borderRadius:8, padding:"8px 18px", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}
                    >
                      View Program <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   ROOT APP
═══════════════════════════════════ */
export default function App() {
  const [page,    setPage]    = useState<"grid" | "detail">("grid");
  const [program, setProgram] = useState<Program | null>(null);

  const goToDetail = (prog: Program) => { setProgram(prog); setPage("detail"); };
  const goToGrid   = ()              => { setPage("grid"); };

  return (
    <>
      <GlobalStyles />
      {page === "grid"   && <AllProgramsGrid    onSelectProgram={goToDetail} />}
      {page === "detail" && program && <ProgramDetailPage program={program} onBack={goToGrid} />}
    </>
  );
}