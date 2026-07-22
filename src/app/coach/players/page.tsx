"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { X, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Menu, CheckCircle2, Crown } from "lucide-react";
import { coachApi, type CoachTeam, type TeamPlayer } from "@/api/coach/route";
import { CoachSidebar } from "@/app/coach/coach-dashboard/components/CoachSidebar";
import { CreatePlayerModal, type CreatePlayerFormValues } from "@/app/coach/coach-dashboard/components/CreatePlayerModal";
import { invalidateDashboardCache } from "@/api/dashboard/route";
import { clearAuthSession, getAuthUser, getTokenPayload } from "@/lib/auth/session";
import { profileApi } from "@/api/profile/route";

interface AllPlayer extends TeamPlayer {
  load: string;
  power: string;
  bf: string;
  strength: string;
  lastWorkout: string;
  verified: boolean;
  notes: string;
  // Set only on a freshly-created pending-signup card — this page isn't
  // scoped to one team, so unlike roster.tsx there's no single team_id to
  // fall back on for Send Invite/Copy Sign Link; this remembers which team
  // the coach actually picked in the modal for that specific player.
  _createdForTeamId?: string;
}

function decoratePlayer(p: TeamPlayer): AllPlayer {
  return {
    ...p,
    load: p.load ?? "-",
    power: p.power ?? "-",
    bf: p.bf ?? "-",
    strength: p.strength ?? "-",
    lastWorkout: p.lastWorkout ?? "-",
    verified: p.verified ?? false,
    notes: p.notes ?? "",
  };
}

const PAGE_LIMIT = 20;

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
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState<number | null>(null);

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

  // Search/team-filter changes always start back at page 1 — otherwise a
  // narrower result set could leave `page` pointing past the new last page.
  useEffect(() => {
    setPage(1);
  }, [search, teamFilterId]);

  function fetchPlayers() {
    setLoading(true);
    coachApi
      .searchAllPlayers({
        team_id: teamFilterId !== "all" ? teamFilterId : undefined,
        search,
        page,
        limit: PAGE_LIMIT,
      })
      .then(({ players, total }) => {
        console.log("[AllPlayersPage] /coach-team/players raw response:", { total, count: players.length, players });
        setPlayers(players.map(decoratePlayer));
        setTotal(total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timeout = setTimeout(fetchPlayers, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, teamFilterId, page]);

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

  function handleCreatePlayerClick() {
    if (teams.length === 0) {
      alert("You don't have any teams yet — create a team first.");
      return;
    }
    setShowCreateModal(true);
  }

  // Copied from roster/page.tsx's handleCreatePlayer — same backend call/branching.
  // Unlike roster.tsx (team is implicit from the route), this page isn't scoped to
  // one team, so the modal itself asks which team the player belongs to (values.teamId)
  // rather than depending on "Filter By Teams" — the coach can browse "All Teams" and
  // still create a player for any specific team.
  async function handleCreatePlayer(values: CreatePlayerFormValues) {
    const teamId = values.teamId!;
    const response = await coachApi.invitePlayer({ team_id: teamId, name: values.name, email: values.email });
    if (response.status === "added") {
      // Existing account was linked directly — refresh from backend, no invite link to share.
      fetchPlayers();
      alert(response.message ?? "Player Added: this player already has an account and was added directly to your team.");
      return;
    }

    // "created" (new account made, temp credentials emailed) or "invited" (no account yet) —
    // both give the coach a link worth re-sharing, so show it on the new card via
    // Send Invite / Copy Sign Link instead of refetching it away.
    const pendingPlayer: TeamPlayer = {
      id: Math.floor(Math.random() * 1_000_000) + 100_000,
      name: values.name,
      email: values.email,
      username: values.email.split("@")[0],
      profile_picture: values.image ? URL.createObjectURL(values.image) : null,
      pendingSignup: true,
      inviteLink: response.inviteLink,
    };
    setPlayers((prev) => [...prev, { ...decoratePlayer(pendingPlayer, prev.length), _createdForTeamId: teamId }]);

    if (response.status === "created") {
      alert(
        response.message ??
          "Player Created: a new account has been created for this player and added to your team. Temporary credentials have been sent to their email.",
      );
    }
  }

  // Fallback in case the backend didn't return an inviteLink for this pending player.
  function buildSignLink(p: AllPlayer): string {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const params = new URLSearchParams({
      team_id: p._createdForTeamId ?? "",
      player_id: String(p.id),
      name: p.name ?? "",
      email: p.email ?? "",
    });
    return `${origin}/auth/signup?${params.toString()}`;
  }

  async function handleSendInvite(p: AllPlayer) {
    const link = p.inviteLink;
    if (!link) {
      alert("No signup invitation link is available.");
      return;
    }
    const teamName = teams.find((t) => t.id === p._createdForTeamId)?.name ?? "the team";
    const message = `Hey! You've been invited to join the team "${teamName}" on Paxlete. Register and download the app here: ${link}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text: message });
      } catch {
        // user dismissed the share sheet — nothing to do
      }
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(message);
      alert("Invite message copied to clipboard.");
    }
  }

  function handleCopySignLink(p: AllPlayer) {
    navigator.clipboard.writeText(p.inviteLink ?? buildSignLink(p));
    setCopiedLinkId(p.id);
    setTimeout(() => setCopiedLinkId((current) => (current === p.id ? null : current)), 2000);
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex">
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
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 overflow-x-hidden">
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
                  className="h-10 px-3 sm:px-4 rounded-xl border border-[#3B82F6] text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5 hover:bg-blue-50 transition max-w-[160px] sm:max-w-none"
                >
                  <span className="truncate">
                    {teamFilterId === "all" ? "Filter By Teams" : teams.find((t) => t.id === teamFilterId)?.name ?? "Filter By Teams"}
                  </span>
                  {teamFilterOpen ? <ChevronUp size={14} className="shrink-0" /> : <ChevronDown size={14} className="shrink-0" />}
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
                onClick={handleCreatePlayerClick}
                className="h-10 px-4 rounded-full border border-gray-300 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shrink-0"
              >
                + Create Player(s)
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
                    <div key={p.id} className="relative bg-[#fafafa] px-4 sm:px-5 py-4 pr-12 sm:pr-14">
                      <button
                        onClick={() => {
                          const target = p.username || p.id;
                          if (!target) return;
                          router.push(`/coach/players/${encodeURIComponent(target)}`);
                        }}
                        disabled={!p.username && !p.id}
                        className="absolute top-3 right-4 sm:top-auto sm:bottom-3 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110 transition-transform"
                        title="View Master Profile"
                      >
                        <Crown size={20} className="text-[#F5A623]" fill="#F5A623" />
                      </button>

                      <div className="flex items-start gap-3 sm:gap-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          className="mt-2 w-4 h-4 rounded border-gray-300 text-[#8B5CF6] focus:ring-[#8B5CF6] shrink-0"
                        />

                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white font-bold overflow-hidden">
                            {p.profile_picture ? (
                              <img src={p.profile_picture} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                              displayName.charAt(0).toUpperCase()
                            )}
                            {p.verified && (
                              <CheckCircle2 size={16} className="absolute -bottom-0.5 -right-0.5 text-[#3B82F6] bg-white rounded-full" />
                            )}
                          </div>
                          {p.username && <p className="text-xs text-gray-500 truncate max-w-[64px] sm:max-w-none">@{p.username}</p>}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-[#222] truncate sm:hidden mb-2">{displayName}</p>

                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-x-2 gap-y-2 max-w-full sm:max-w-md">
                              {[
                                { label: "Ov. Load", value: p.load },
                                { label: "W.O.C.", value: p.score ?? "0/4" },
                                { label: "Power", value: p.power },
                                { label: "BF%", value: p.bf },
                                { label: "Strength", value: p.strength },
                              ].map((stat) => (
                                <div key={stat.label}>
                                  <p className="text-[11px] font-semibold text-gray-400">{stat.label}</p>
                                  <p className="text-sm font-bold text-[#222]">{stat.value}</p>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Enter Notes"
                                value={p.notes}
                                onChange={(e) => updateNotes(p.id, e.target.value)}
                                className="h-7 flex-1 min-w-0 sm:w-44 sm:flex-none rounded-lg border border-gray-200 bg-white px-2.5 text-sm outline-none focus:border-[#8B5CF6] transition"
                              />
                              <button
                                onClick={() => alert(`Notes saved for ${displayName} (dummy — backend endpoint pending).`)}
                                className="text-sm font-semibold text-[#3B82F6] hover:underline whitespace-nowrap shrink-0"
                              >
                                Save Notes
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-gray-400 mt-2">Last Workout: {p.lastWorkout}</p>

                          {p.pendingSignup && (
                            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                              <button
                                onClick={() => handleSendInvite(p)}
                                className="h-8 px-4 rounded-full border border-[#8B5CF6] text-[#8B5CF6] text-xs font-semibold hover:bg-[#f5f0ff] transition"
                              >
                                Send Invite
                              </button>
                              <button
                                onClick={() => handleCopySignLink(p)}
                                className="h-8 px-4 rounded-full border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition"
                              >
                                {copiedLinkId === p.id ? "Copied!" : "Copy Sign Link"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {!loading && total > 0 && (
              <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  {total} player{total !== 1 ? "s" : ""} total
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-[#f5f5f7] hover:bg-gray-200 disabled:opacity-30 transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-[#f5f5f7] hover:bg-gray-200 disabled:opacity-30 transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreatePlayerModal
          teamName={teams.find((t) => t.id === teamFilterId)?.name ?? "Team"}
          teamOptions={teams.map((t) => ({ id: t.id, name: t.name }))}
          defaultTeamId={teamFilterId !== "all" ? teamFilterId : undefined}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreatePlayer}
        />
      )}
    </div>
  );
}
