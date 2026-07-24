"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { ArrowLeft, Search, ChevronDown, ChevronUp, Menu } from "lucide-react";
import { coachApi, type CoachTeam, type TeamPlayer } from "@/api/coach/route";
import { CoachSidebar } from "@/app/coach/coach-dashboard/components/CoachSidebar";
import { invalidateDashboardCache } from "@/api/dashboard/route";
import { clearAuthSession, getAuthUser, getTokenPayload } from "@/lib/auth/session";
import { profileApi } from "@/api/profile/route";

function AddPlayerContent() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const teamName = searchParams.get("team_name") ?? "Team";

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
  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

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
        .then(({ players }) => setPlayers(players))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(timeout);
  }, [search, teamFilterId]);

  async function handleAddToTeam(playerId: number) {
    setError(null);
    setAddingId(playerId);
    try {
      await coachApi.addPlayerToTeam({ team_id: id, player_id: playerId });
      setAddedIds((prev) => new Set(prev).add(playerId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add player.");
    } finally {
      setAddingId(null);
    }
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
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-14 sm:h-16 flex items-center gap-2 sm:gap-3 sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-gray-200 transition shrink-0"
          >
            <Menu size={16} className="text-gray-700" />
          </button>
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-gray-200 transition shrink-0"
          >
            <ArrowLeft size={16} className="text-gray-700" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-black text-[#1f1f1f] truncate leading-tight">Add Player</h1>
            <p className="text-[10px] sm:text-xs text-gray-400 truncate leading-none">{teamName}</p>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Filter + Search row */}
            <div className="flex items-center gap-2 sm:gap-3 p-4 border-b border-gray-100">
              <div className="relative shrink-0">
                <button
                  onClick={() => setTeamFilterOpen((v) => !v)}
                  className="h-10 px-3 sm:px-4 rounded-xl border border-[#3B82F6] text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5 hover:bg-blue-50 transition"
                >
                  {teamFilterId === "all"
                    ? "All Teams"
                    : (teams.find((t) => String(t.id) === String(teamFilterId))?.name ?? "Filter By Teams")}
                  {teamFilterOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {teamFilterOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-52 max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-10">
                    <button
                      onClick={() => { setTeamFilterId("all"); setTeamFilterOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm font-medium text-[#F5A623] hover:bg-gray-50 transition"
                    >
                      All Teams
                    </button>
                    {teams.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => { setTeamFilterId(String(t.id)); setTeamFilterOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm font-medium text-[#F5A623] hover:bg-gray-50 transition truncate"
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative flex-1 min-w-0">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search By Name & Username"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[#f5f5f7] pl-9 pr-3 text-xs sm:text-sm outline-none border border-transparent focus:border-[#8B5CF6] transition"
                />
              </div>
            </div>

            {error && (
              <div className="px-4 pt-3">
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
              </div>
            )}

            {/* Player list */}
            <div className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                    <div className="w-11 h-11 rounded-full bg-gray-100 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-32 bg-gray-100 rounded" />
                      <div className="h-3 w-20 bg-gray-100 rounded" />
                    </div>
                    <div className="h-8 w-24 bg-gray-100 rounded-full" />
                  </div>
                ))
              ) : players.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">No players found.</p>
              ) : (
                players.map((p) => {
                  const displayName = p.name ?? p.username ?? "Player";
                  const isAlreadyInTeam = p.teamMembersAsPlayer?.some(
                    (tm) => String(tm.team_id) === String(id)
                  ) || addedIds.has(p.id);

                  return (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-11 h-11 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white text-sm font-bold overflow-hidden shrink-0">
                        {p.profile_picture ? (
                          <img src={p.profile_picture} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          displayName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#222] truncate">{displayName}</p>
                        {p.username && <p className="text-xs text-gray-400 truncate">@{p.username}</p>}
                      </div>
                      <button
                        onClick={() => handleAddToTeam(p.id)}
                        disabled={addingId === p.id || isAlreadyInTeam}
                        className={`shrink-0 h-8 px-4 rounded-full text-xs font-semibold transition disabled:opacity-60 ${
                          isAlreadyInTeam ? "bg-green-500 text-white cursor-default" : "bg-[#3B82F6] text-white hover:bg-[#2563EB]"
                        }`}
                      >
                        {isAlreadyInTeam ? "Added" : addingId === p.id ? "Adding..." : "Add to Team"}
                      </button>
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

export default function AddPlayerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AddPlayerContent />
    </Suspense>
  );
}
