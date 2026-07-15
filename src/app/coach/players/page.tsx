"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { X, Search, ChevronDown, ChevronUp, Menu, CheckCircle2, Crown } from "lucide-react";
import { coachApi, type CoachTeam, type TeamPlayer } from "@/api/coach/route";
import { CoachSidebar } from "@/app/coach/coach-dashboard/components/CoachSidebar";
import { invalidateDashboardCache } from "@/api/dashboard/route";
import { clearAuthSession, getAuthUser, getTokenPayload } from "@/lib/auth/session";
import { profileApi } from "@/api/profile/route";

// TODO(backend): Ov. Load / W.O.C. / Power / BF% / Strength / Last Workout have no API yet
// beyond `score` (used for W.O.C.). Dummy placeholders layered on top of the real player
// list until those fields are added to the players endpoint.
interface AllPlayer extends TeamPlayer {
  load: string;
  power: string;
  bf: string;
  strength: string;
  lastWorkout: string;
  verified: boolean;
  notes: string;
}

function decoratePlayer(p: TeamPlayer, index: number): AllPlayer {
  const variants: Array<
    Pick<AllPlayer, "load" | "power" | "bf" | "strength" | "lastWorkout" | "verified">
  > = [
    { load: "0", power: "0", bf: "0", strength: "445 lbs", lastWorkout: "-", verified: true },
    { load: "0", power: "0", bf: "0", strength: "1050 lbs", lastWorkout: "-", verified: true },
    { load: "-", power: "-", bf: "-", strength: "-", lastWorkout: "-", verified: false },
  ];
  const v = variants[index % variants.length];
  return { ...p, ...v, notes: "" };
}

export default function AllPlayersPage() {
  const router = useRouter();

  const handleLogOut = () => {
    invalidateDashboardCache();
    clearAuthSession();
    localStorage.removeItem("user");
    router.replace("/auth/login");
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState("");

  const [teams, setTeams] = useState<CoachTeam[]>([]);
  const [teamFilterOpen, setTeamFilterOpen] = useState(false);
  const [teamFilterId, setTeamFilterId] = useState<string>("all");

  const [search, setSearch] = useState("");
  const [players, setPlayers] = useState<AllPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const user = getAuthUser();
    if (user?.name) setUserInitial((user.name as string)[0]?.toUpperCase() ?? "");
    const tokenPayload = getTokenPayload();
    const username = (user?.username as string | undefined) ?? tokenPayload?.username;
    if (username) {
      profileApi.getProfileByUsername(username).then((profile) => {
        if (profile?.image) setProfilePicture(profile.image);
        if (!user?.name) {
          const display = profile?.name || profile?.username || username;
          if (display) setUserInitial((display as string)[0]?.toUpperCase() ?? "");
        }
      }).catch(() => {});
    } else if (tokenPayload?.email) {
      setUserInitial(tokenPayload.email[0]?.toUpperCase() ?? "");
    }
  }, []);

  useEffect(() => {
    coachApi.getCoachTeams().then(setTeams).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      coachApi
        .searchAllPlayers({
          team_id: teamFilterId !== "all" ? teamFilterId : undefined,
          search,
          limit: 20,
        })
        .then(({ players }) => setPlayers(players.map(decoratePlayer)))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(timeout);
  }, [search, teamFilterId]);

  function toggleSelect(playerId: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId); else next.add(playerId);
      return next;
    });
  }

  function updateNotes(playerId: number, notes: string) {
    setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, notes } : p)));
  }

  function handleAddPlayers() {
    if (teamFilterId === "all") {
      alert('Select a team from "Filter By Teams" first to add players to it.');
      return;
    }
    const team = teams.find((t) => t.id === teamFilterId);
    const params = new URLSearchParams({ team_name: team?.name ?? "Team" });
    router.push(`/coach/team/${teamFilterId}/add-player?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex overflow-x-hidden">
      <CoachSidebar
        profilePicture={profilePicture}
        userInitial={userInitial}
        onSwitchToPlayer={() => router.replace("/team/teams")}
        onLogOut={handleLogOut}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="md:ml-[220px] flex-1 min-w-0 flex flex-col">

        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-gray-200 transition shrink-0"
          >
            <Menu size={16} className="text-gray-700" />
          </button>
          <h1 className="flex-1 text-center text-base sm:text-lg font-semibold text-gray-500">
            Search Players
          </h1>
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-gray-200 transition shrink-0"
          >
            <X size={16} className="text-gray-700" />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Search + Filter + actions row */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-4 border-b border-gray-100">
              <div className="relative flex-1 min-w-[180px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search By Name & Username"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[#f5f5f7] pl-9 pr-3 text-xs sm:text-sm outline-none border border-transparent focus:border-[#8B5CF6] transition"
                />
              </div>

              <div className="relative shrink-0">
                <button
                  onClick={() => setTeamFilterOpen((v) => !v)}
                  className="h-10 px-3 sm:px-4 rounded-xl border border-[#3B82F6] text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5 hover:bg-blue-50 transition"
                >
                  {teamFilterId === "all" ? "Filter By Teams" : teams.find((t) => t.id === teamFilterId)?.name ?? "Filter By Teams"}
                  {teamFilterOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {teamFilterOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-10">
                    <button
                      onClick={() => { setTeamFilterId("all"); setTeamFilterOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm font-medium text-[#F5A623] hover:bg-gray-50 transition"
                    >
                      All Teams
                    </button>
                    {teams.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => { setTeamFilterId(t.id); setTeamFilterOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm font-medium text-[#F5A623] hover:bg-gray-50 transition truncate"
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => alert("Connect ID's — coming soon (backend endpoint pending).")}
                className="h-10 px-4 rounded-full bg-[#1f1f1f] text-white text-xs sm:text-sm font-semibold hover:bg-black transition shrink-0"
              >
                Connect ID&apos;s
              </button>
              <button
                onClick={handleAddPlayers}
                className="h-10 px-4 rounded-full border border-gray-300 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shrink-0"
              >
                + Add Player(s)
              </button>
            </div>

            {/* Player list */}
            <div className="divide-y divide-gray-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-4 sm:px-5 py-4 animate-pulse">
                    <div className="w-5 h-5 rounded bg-gray-100 shrink-0" />
                    <div className="w-14 h-14 rounded-full bg-gray-100 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-32 bg-gray-100 rounded" />
                      <div className="h-3 w-48 bg-gray-100 rounded" />
                    </div>
                  </div>
                ))
              ) : players.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">No players found.</p>
              ) : (
                players.map((p) => {
                  const displayName = p.name ?? p.username ?? "Player";
                  return (
                    <div key={p.id} className="relative bg-[#fafafa] px-4 sm:px-5 py-4">
                      <button
                        onClick={() => {
                          if (!p.username) return;
                          router.push(`/coach/players/${encodeURIComponent(p.username)}`);
                        }}
                        disabled={!p.username}
                        className="absolute bottom-3 right-4 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="View Master Profile"
                      >
                        <Crown size={20} className="text-[#F5A623]" fill="#F5A623" />
                      </button>

                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          className="mt-2 w-4 h-4 rounded border-gray-300 text-[#8B5CF6] focus:ring-[#8B5CF6] shrink-0"
                        />

                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="relative w-14 h-14 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white font-bold overflow-hidden">
                            {p.profile_picture ? (
                              <img src={p.profile_picture} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                              displayName.charAt(0).toUpperCase()
                            )}
                            {p.verified && (
                              <CheckCircle2 size={16} className="absolute -bottom-0.5 -right-0.5 text-[#3B82F6] bg-white rounded-full" />
                            )}
                          </div>
                          {p.username && <p className="text-[11px] text-gray-500">@{p.username}</p>}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="grid grid-cols-5 gap-2 max-w-md">
                              {[
                                { label: "Ov. Load", value: p.load },
                                { label: "W.O.C.", value: p.score ?? "0/4" },
                                { label: "Power", value: p.power },
                                { label: "BF%", value: p.bf },
                                { label: "Strength", value: p.strength },
                              ].map((stat) => (
                                <div key={stat.label}>
                                  <p className="text-[10px] font-semibold text-gray-400">{stat.label}</p>
                                  <p className="text-xs font-bold text-[#222]">{stat.value}</p>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <input
                                type="text"
                                placeholder="Enter Notes"
                                value={p.notes}
                                onChange={(e) => updateNotes(p.id, e.target.value)}
                                className="h-7 w-32 sm:w-44 rounded-lg border border-gray-200 bg-white px-2.5 text-xs outline-none focus:border-[#8B5CF6] transition"
                              />
                              <button
                                onClick={() => alert(`Notes saved for ${displayName} (dummy — backend endpoint pending).`)}
                                className="text-xs font-semibold text-[#3B82F6] hover:underline whitespace-nowrap"
                              >
                                Save Notes
                              </button>
                            </div>
                          </div>

                          <p className="text-[11px] text-gray-400 mt-2">Last Workout: {p.lastWorkout}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
