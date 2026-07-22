"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Settings,
  X,
  Trophy,
  Shield,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  User,
  Link2,
  Atom,
  Home,
  Plus,
} from "lucide-react";
import { coachApi, CoachTeam, LeaderboardCategoryResponse } from "@/api/coach/route";

// ── Choose Team Modal ─────────────────────────────────────────────────────────

function ChooseTeamModal({
  teams,
  onClose,
  onSelect,
}: {
  teams: CoachTeam[];
  onClose: () => void;
  onSelect: (team: CoachTeam) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl border-2 border-[#3B82F6] shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "88vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Choose Team:</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Team list */}
        <div className="overflow-y-auto p-6">
          {teams.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No teams found.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {teams.map((team) => {
                const initials = team.name
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase();
                return (
                  <button
                    key={team.id}
                    onClick={() => {
                      onSelect(team);
                      onClose();
                    }}
                    className="flex items-center gap-3 hover:bg-gray-50 border border-gray-100 hover:border-blue-300 rounded-xl p-3 transition text-left"
                  >
                    {team.logo ? (
                      <img
                        src={team.logo}
                        alt={team.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 bg-blue-600"
                      >
                        {initials}
                      </div>
                    )}
                    <span className="text-xs text-gray-800 font-bold leading-tight line-clamp-2">
                      {team.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Xanvas Hub Modal ──────────────────────────────────────────────────────────

function XanvasHubModal({
  teamId,
  teamName,
  onClose,
}: {
  teamId: string;
  teamName: string;
  onClose: () => void;
}) {
  const [devices, setDevices] = useState<Array<{ label: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadDevices = async () => {
    try {
      setLoading(true);
      const res = await coachApi.getXanvasAvailable(teamId);
      setDevices(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, [teamId]);

  const handleAssign = async (deviceId: number) => {
    try {
      const url = `${window.location.origin}/coach/leaderboard?team_id=${teamId}&team_name=${encodeURIComponent(teamName)}`;
      await coachApi.assignXanvas(deviceId, { teamId: Number(teamId), url });
      setMessage("Device linked successfully!");
      setTimeout(() => setMessage(""), 3000);
      loadDevices();
    } catch (err) {
      console.error(err);
      setMessage("Failed to link device.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#f5f5f7] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        style={{ maxHeight: "80vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="text-[#3B82F6] text-sm font-medium mb-3 block hover:underline"
          >
            Back ...
          </button>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Atom size={28} className="text-gray-700 animate-spin-slow" />
            <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Georgia, serif" }}>
              <span className="italic">Xanvas</span>{" "}
              <span className="font-black not-italic" style={{ fontFamily: "sans-serif" }}>Hub</span>
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-3 overflow-y-auto flex-1">
          <p className="text-sm font-semibold text-gray-500 mb-1">Available TV Casting Devices:</p>

          {message && (
            <p className="text-xs font-bold text-center text-blue-600 bg-blue-50 py-2 rounded-lg">
              {message}
            </p>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : devices.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No unassigned TV displays found.</p>
          ) : (
            devices.map((device) => (
              <div key={device.value} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 text-sm">{device.label}</p>
                </div>
                <button
                  onClick={() => handleAssign(device.value)}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shrink-0 flex items-center gap-1"
                >
                  <Link2 size={13} />
                  Cast
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Category Modal ─────────────────────────────────────────────────────────────

function CategoryModal({ cat, onClose }: { cat: any; onClose: () => void }) {
  const others = [];
  if (cat.rank1) others.push(cat.rank1);
  if (cat.rank2) others.push(cat.rank2);
  if (cat.rank3) others.push(cat.rank3);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient header */}
        <div className={`bg-gradient-to-r ${cat.headerGradient} px-5 pt-5 pb-6 relative`}>
          <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">
            Leaderboard Category
          </p>
          <p className="text-white font-black text-2xl leading-tight">
            {cat.name.split(" ")[0]}{" "}
            <span className="font-normal text-white/80 text-base">
              {cat.name.match(/\(([^)]+)\)/)?.[0] ?? ""}
            </span>
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition text-white"
          >
            <X size={14} />
          </button>
        </div>

        {/* Dark table body */}
        <div style={{ background: "#1a1535" }} className="px-0 py-0">
          {others.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-8">No entries yet</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ background: "#221b42" }}>
                  <th className="text-left py-3 px-5 text-white text-sm font-bold">UserName</th>
                  <th className="text-right py-3 px-5 text-white text-sm font-bold">Value</th>
                </tr>
              </thead>
              <tbody>
                {others.map((entry, i) => (
                  <tr
                    key={entry.memberId}
                    style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <td className="py-3.5 px-5 text-white/70 text-sm italic">@{entry.username}</td>
                    <td className="py-3.5 px-5 text-right text-[#a78bfa] font-semibold text-sm">
                      {entry.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────

function LeaderCard({ cat, onViewCategory }: { cat: any; onViewCategory: () => void }) {
  const noRecord = !cat.rank1;
  const initial = cat.rank1 ? cat.rank1.username[0].toUpperCase() : null;

  const others = [];
  if (cat.rank2) others.push(cat.rank2);
  if (cat.rank3) others.push(cat.rank3);

  return (
    <div className={`rounded-2xl overflow-hidden flex flex-col bg-gradient-to-br ${cat.gradient} shadow-lg border border-white/5`}>
      {/* Main section */}
      <div className="px-4 pt-4 pb-5 flex flex-col gap-3 flex-1">
        {/* Top row: rank + icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="bg-[#f59e0b] text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center leading-none">
              1
            </span>
            <span className="text-white/70 text-xs font-semibold">Team</span>
          </div>
          <Trophy size={20} className={`${cat.iconColor} opacity-80`} />
        </div>

        {/* Avatar + score row */}
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${cat.avatarBg} flex items-center justify-center shrink-0 shadow-inner`}>
            {cat.rank1?.profilePicture ? (
              <img
                src={cat.rank1.profilePicture}
                alt={cat.rank1.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : initial ? (
              <span className="text-white font-black text-2xl">{initial}</span>
            ) : (
              <User size={26} className="text-white/60" />
            )}
          </div>

          <div className="min-w-0">
            {noRecord ? (
              <p className="text-white font-black text-2xl sm:text-3xl leading-tight">No record</p>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-white font-black text-3xl sm:text-4xl leading-tight">
                  {cat.rank1.value}
                </span>
                <span className="text-white/60 text-xs">{cat.unit}</span>
              </div>
            )}
            <p className="text-white/80 text-xs font-bold uppercase tracking-wide truncate mt-0.5">
              {cat.name}
            </p>
            {cat.rank1 && (
              <p className="text-white/90 text-sm font-semibold truncate">@{cat.rank1.username}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom dark strip */}
      <div className="bg-black/25 px-4 py-3 flex items-center justify-between gap-2 min-h-[44px]">
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          {others.length === 0 ? (
            <p className="text-white/40 text-xs italic">No other entries</p>
          ) : (
            others.map((o) => (
              <p key={o.memberId} className="text-white/60 text-xs truncate">
                @{o.username} <span className="text-white/40">({o.value})</span>
              </p>
            ))
          )}
        </div>
        {!noRecord && (
          <button
            onClick={onViewCategory}
            className="text-white/80 text-xs font-semibold flex items-center gap-0.5 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            View Category <ChevronRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Content ───────────────────────────────────────────────────────────────────

const GRADIENTS = [
  {
    gradient: "from-[#4158D0] via-[#7B5CF6] to-[#8B4CF6]",
    headerGradient: "from-[#4158D0] to-[#8B4CF6]",
    avatarBg: "bg-[#9333ea]",
    iconColor: "text-orange-300",
  },
  {
    gradient: "from-[#0093E9] to-[#38bdf8]",
    headerGradient: "from-[#0093E9] to-[#38bdf8]",
    avatarBg: "bg-[#2563eb]",
    iconColor: "text-blue-200",
  },
  {
    gradient: "from-[#11998e] to-[#38ef7d]",
    headerGradient: "from-[#11998e] to-[#38ef7d]",
    avatarBg: "bg-[#f59e0b]",
    iconColor: "text-green-200",
  },
  {
    gradient: "from-[#f7971e] to-[#ffd200]",
    headerGradient: "from-[#f7971e] to-[#ffd200]",
    avatarBg: "bg-[#d97706]/40",
    iconColor: "text-yellow-200",
  },
  {
    gradient: "from-[#FF416C] to-[#FF4B2B]",
    headerGradient: "from-[#FF416C] to-[#FF4B2B]",
    avatarBg: "bg-[#f97316]",
    iconColor: "text-red-200",
  },
  {
    gradient: "from-[#7B2FBE] to-[#4A00E0]",
    headerGradient: "from-[#7B2FBE] to-[#4A00E0]",
    avatarBg: "bg-[#f97316]",
    iconColor: "text-purple-200",
  },
];

function LeaderboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTeamId = searchParams.get("team_id");
  const initialTeamName = searchParams.get("team_name");
  const code = searchParams.get("code");
  const isTvMode = !!code;

  const [teams, setTeams] = useState<CoachTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<CoachTeam | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState<any | null>(null);
  const [teamSwitcherOpen, setTeamSwitcherOpen] = useState(false);
  const [xanvasHubOpen, setXanvasHubOpen] = useState(false);
  const [chooseTeamOpen, setChooseTeamOpen] = useState(false);

  // Poll TV casting config if in kiosk mode
  useEffect(() => {
    if (!isTvMode || !code) return;
    const interval = setInterval(async () => {
      try {
        const res = await coachApi.resolveXanvas(code);
        if (res?.url && !res.url.includes(`code=${code}`)) {
          window.location.href = res.url;
        }
      } catch (err) {
        console.error("TV casting resolution poll failed:", err);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isTvMode, code]);

  // Load coach teams list
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const coachTeams = await coachApi.getCoachTeams();
        setTeams(coachTeams);

        if (initialTeamId) {
          const match = coachTeams.find((t) => String(t.id) === initialTeamId);
          if (match) setSelectedTeam(match);
        } else if (coachTeams.length > 0) {
          setSelectedTeam(coachTeams[0]);
        }
      } catch (err) {
        console.error("Failed to load coach teams:", err);
      }
    };
    fetchTeams();
  }, [initialTeamId]);

  // Load leaderboard categories and ranks
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!selectedTeam) return;
      try {
        setLoading(true);
        const res = await coachApi.getTeamLeaderboard(selectedTeam.id);
        const mapped = res.categories.map((cat, i) => {
          const style = GRADIENTS[i % GRADIENTS.length];
          return {
            id: cat.category.toLowerCase().replace(/[^a-z0-9]/g, "-"),
            name: cat.category,
            unit: cat.measurement,
            rank1: cat.rank1,
            rank2: cat.rank2,
            rank3: cat.rank3,
            ...style,
          };
        });
        setCategories(mapped);
      } catch (err) {
        console.error("Failed to fetch team rankings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedTeam]);

  const handleSelectTeam = (team: CoachTeam) => {
    setSelectedTeam(team);
    router.push(
      `/coach/leaderboard?team_id=${team.id}&team_name=${encodeURIComponent(
        team.name
      )}`
    );
  };

  const currentTeamName = selectedTeam?.name ?? initialTeamName ?? "My Team";
  const currentTeamId = selectedTeam?.id ?? initialTeamId ?? "";
  const initialLetter = currentTeamName[0]?.toUpperCase() ?? "T";

  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #0f0520 0%, #1a0a35 50%, #0a1020 100%)" }}
    >
      {/* Header - Hidden in TV casting mode */}
      {!isTvMode && (
        <header
          className="sticky top-0 z-40 px-4 sm:px-6 py-5 border-b border-white/10"
          style={{ background: "rgba(15,5,32,0.85)", backdropFilter: "blur(12px)" }}
        >
          <div className="flex items-center justify-between gap-2">
            {/* Left */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => setChooseTeamOpen(true)}
                className="flex items-center gap-1 text-[#60a5fa] text-xs sm:text-sm font-semibold hover:text-[#93c5fd] transition-colors shrink-0"
              >
                <ArrowLeft size={14} />
                <span>Change Teams</span>
              </button>
              {selectedTeam && (
                <button
                  onClick={() =>
                    router.push(
                      `/coach/leaderboard-options?team_id=${
                        selectedTeam.id
                      }&team_name=${encodeURIComponent(selectedTeam.name)}`
                    )
                  }
                  className="hover:opacity-70 transition shrink-0"
                >
                  <Settings size={15} className="text-white/40" />
                </button>
              )}
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#7C3AED] flex items-center justify-center text-white text-[10px] font-black shrink-0">
                {selectedTeam?.logo ? (
                  <img
                    src={selectedTeam.logo}
                    alt={currentTeamName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  initialLetter
                )}
              </div>
              <span className="text-white font-semibold text-sm truncate max-w-[100px] sm:max-w-none">
                {currentTeamName}
              </span>
            </div>

            {/* Center */}
            {selectedTeam && (
              <button
                onClick={() =>
                  router.push(
                    `/coach/team/${selectedTeam.id}?team_name=${encodeURIComponent(
                      selectedTeam.name
                    )}`
                  )
                }
                className="flex flex-col items-center shrink-0 absolute left-1/2 -translate-x-1/2 hover:opacity-80 transition"
              >
                <div className="w-10 h-10 rounded-full bg-[#7C3AED] flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.6)]">
                  <img
                    src="/images/proform-logo.jpg"
                    alt="Proform"
                    className="w-6 h-6 object-contain rounded-sm"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                      (e.currentTarget.parentElement as HTMLElement).innerHTML =
                        '<span class="text-white font-black text-sm">P</span>';
                    }}
                  />
                </div>
                <span className="text-[#a78bfa] text-[11px] sm:text-xs font-bold italic mt-1 whitespace-nowrap">
                  Team Leaderboard:
                </span>
              </button>
            )}

            {/* Right */}
            <button
              onClick={() => router.push("/coach/coach-dashboard")}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition shrink-0"
            >
              <X size={14} className="text-white/60" />
            </button>
          </div>
        </header>
      )}

      {/* Grid */}
      <div className="flex-1 px-4 sm:px-6 py-5 sm:py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 border-4 border-[#a78bfa] border-t-transparent rounded-full animate-spin" />
            <p className="text-white/60 text-sm font-semibold">Loading team statistics...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <Trophy size={48} className="text-white/20" />
            <p className="text-white/50 text-sm font-bold">No metrics configured for this team.</p>
            {!isTvMode && selectedTeam && (
              <button
                onClick={() =>
                  router.push(
                    `/coach/leaderboard-options?team_id=${
                      selectedTeam.id
                    }&team_name=${encodeURIComponent(selectedTeam.name)}`
                  )
                }
                className="px-6 py-2 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition shadow"
              >
                Configure Options
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <LeaderCard
                key={cat.id}
                cat={cat}
                onViewCategory={() => setActiveCategory(cat)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Category modal */}
      {activeCategory && (
        <CategoryModal cat={activeCategory} onClose={() => setActiveCategory(null)} />
      )}

      {/* Xanvas Hub modal */}
      {xanvasHubOpen && currentTeamId && (
        <XanvasHubModal
          teamId={String(currentTeamId)}
          teamName={currentTeamName}
          onClose={() => setXanvasHubOpen(false)}
        />
      )}

      {/* Choose Team modal */}
      {chooseTeamOpen && (
        <ChooseTeamModal
          teams={teams}
          onClose={() => setChooseTeamOpen(false)}
          onSelect={handleSelectTeam}
        />
      )}

      {/* Bottom-left team switcher - Hidden in TV casting mode */}
      {!isTvMode && teams.length > 0 && selectedTeam && (
        <div className="fixed bottom-5 left-4 z-40 flex items-end gap-2">
          {/* Chain icon button for Xanvas TV Casting */}
          <button
            onClick={() => setXanvasHubOpen(true)}
            className="w-11 h-11 rounded-2xl bg-[#2a2a3a] flex items-center justify-center shadow-lg shrink-0 border border-white/5 hover:bg-[#34344a] transition"
          >
            <Link2 size={18} className="text-[#60a5fa]" />
          </button>

          {/* Team Switcher dropdown */}
          <div className="relative flex flex-col">
            {teamSwitcherOpen && (
              <div className="absolute bottom-full mb-1 w-52 rounded-xl border border-[#7C3AED] bg-white overflow-hidden shadow-xl">
                {teams
                  .filter((t) => t.id !== selectedTeam.id)
                  .map((team) => (
                    <button
                      key={team.id}
                      onClick={() => {
                        handleSelectTeam(team);
                        setTeamSwitcherOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-[#7C3AED] font-semibold text-sm hover:bg-purple-50 transition-colors border-b border-purple-100 last:border-b-0"
                    >
                      {team.name}
                    </button>
                  ))}
              </div>
            )}

            <button
              onClick={() => setTeamSwitcherOpen((o) => !o)}
              className="w-52 flex items-center justify-between px-4 py-3 bg-white rounded-xl shadow-lg border border-gray-100"
            >
              <span className="text-[#1f1f1f] font-bold text-sm truncate">{selectedTeam.name}</span>
              {teamSwitcherOpen ? (
                <ChevronUp size={16} className="text-gray-500 shrink-0" />
              ) : (
                <ChevronDown size={16} className="text-gray-500 shrink-0" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export default function CoachLeaderboardPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #0f0520 0%, #1a0a35 100%)" }}
        >
          <div className="w-10 h-10 border-4 border-[#a78bfa] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LeaderboardContent />
    </Suspense>
  );
}
