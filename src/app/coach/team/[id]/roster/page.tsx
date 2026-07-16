"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, Suspense } from "react";
import { ArrowLeft, X, ShieldCheck, ChevronDown, CheckCircle2, Menu, FolderPlus, RefreshCw, ArrowLeftRight } from "lucide-react";
import { coachApi, type TeamPlayer } from "@/api/coach/route";
import { CoachSidebar } from "@/app/coach/coach-dashboard/components/CoachSidebar";
import { TeamInviteQrModal } from "@/app/coach/coach-dashboard/components/TeamInviteQrModal";
import { CreatePlayerModal, type CreatePlayerFormValues } from "@/app/coach/coach-dashboard/components/CreatePlayerModal";
import { invalidateDashboardCache } from "@/api/dashboard/route";
import { clearAuthSession, getAuthUser, getTokenPayload } from "@/lib/auth/session";
import { profileApi } from "@/api/profile/route";

// TODO(backend): Load / W.O.C. / Power / Kcal / Strength / Last Workout / group / notes
// have no API yet beyond `score` (used for W.O.C.). Values below are dummy placeholders
// layered on top of the real player list until those fields are added to `GET /coach-team/players`.
interface RosterPlayer extends TeamPlayer {
  load: string;
  power: string;
  kcal: string;
  strength: string;
  lastWorkout: string;
  group: string;
  verified: boolean;
  notes: string;
}

const DUMMY_GROUPS = ["Group A", "Group B"];

function decoratePlayer(p: TeamPlayer, index: number): RosterPlayer {
  const variants: Array<Pick<RosterPlayer, "load" | "power" | "kcal" | "strength" | "lastWorkout" | "verified">> = [
    { load: "-", power: "-", kcal: "-", strength: "-", lastWorkout: "-", verified: false },
    { load: "0", power: "0", kcal: "0", strength: "42 kg", lastWorkout: "-", verified: true },
    { load: "-", power: "-", kcal: "-", strength: "-", lastWorkout: "-", verified: false },
  ];
  const v = variants[index % variants.length];
  return {
    ...p,
    ...v,
    group: DUMMY_GROUPS[index % DUMMY_GROUPS.length],
    notes: "",
  };
}

function RosterContent() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const teamName = searchParams.get("team_name") ?? "Team";
  const orgName = searchParams.get("org_name") ?? "";
  const teamLogo = searchParams.get("logo") ?? "";

  const handleLogOut = () => {
    invalidateDashboardCache();
    clearAuthSession();
    localStorage.removeItem("user");
    router.replace("/auth/login");
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState("");

  const [players, setPlayers] = useState<RosterPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [groupFilterOpen, setGroupFilterOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [addToGroupOpen, setAddToGroupOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState<number | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

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

  function refetchPlayers() {
    if (!id) return;
    setLoading(true);
    coachApi.getTeamPlayers({ team_id: id, limit: 50 })
      .then(({ players }) => setPlayers(players.map(decoratePlayer)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    refetchPlayers();
  }, [id]);

  const visiblePlayers = useMemo(
    () => (groupFilter === "all" ? players : players.filter((p) => p.group === groupFilter)),
    [players, groupFilter],
  );

  const allVisibleSelected = visiblePlayers.length > 0 && visiblePlayers.every((p) => selectedIds.has(p.id));

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        visiblePlayers.forEach((p) => next.delete(p.id));
        return next;
      }
      const next = new Set(prev);
      visiblePlayers.forEach((p) => next.add(p.id));
      return next;
    });
  }

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

  function removePlayer(playerId: number) {
    // TODO(backend): no endpoint yet to remove a player from a team — local-only for now.
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
  }

  // Fallback in case the backend didn't return an inviteLink for this pending player.
  function buildSignLink(p: RosterPlayer): string {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const params = new URLSearchParams({
      team_id: id,
      player_id: String(p.id),
      name: p.name ?? "",
      email: p.email ?? "",
    });
    return `${origin}/auth/signup?${params.toString()}`;
  }

  // Backend already emails the signup link when the player was created via invitePlayer —
  // this just lets the coach re-share that same link (matches mobile's Share.share()).
  async function handleSendInvite(p: RosterPlayer) {
    const link = p.inviteLink;
    if (!link) {
      alert("No signup invitation link is available.");
      return;
    }
    const message = `Hey! Coach ${orgName || teamName} has invited you to join the team "${teamName}" on Paxlete. Register and download the app here: ${link}`;
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

  async function handleCreatePlayer(values: CreatePlayerFormValues) {
    const response = await coachApi.invitePlayer({ team_id: id, name: values.name, email: values.email });
    if (response.status === "added" || response.status === "created") {
      // Backend either linked the existing account or created a new one and emailed
      // temporary credentials — either way the player is already on the team.
      refetchPlayers();
      alert(
        response.message ??
          (response.status === "added"
            ? "Player Added: this player already has an account and was added directly to your team."
            : "Player Created: a new account has been created for this player and added to your team. Temporary credentials have been sent to their email."),
      );
    } else {
      // No account yet — pending invite. Show a local card with the invite link to share.
      const pendingPlayer: TeamPlayer = {
        id: Math.floor(Math.random() * 1_000_000) + 100_000,
        name: values.name,
        email: values.email,
        username: values.email.split("@")[0],
        profile_picture: values.image ? URL.createObjectURL(values.image) : null,
        pendingSignup: true,
        inviteLink: response.inviteLink,
      };
      setPlayers((prev) => [...prev, decoratePlayer(pendingPlayer, prev.length)]);
    }
  }

  function handleCopySignLink(p: RosterPlayer) {
    navigator.clipboard.writeText(p.inviteLink ?? buildSignLink(p));
    setCopiedLinkId(p.id);
    setTimeout(() => setCopiedLinkId((current) => (current === p.id ? null : current)), 2000);
  }

  function handleAddSelectedToGroup(group: string) {
    setPlayers((prev) => prev.map((p) => (selectedIds.has(p.id) ? { ...p, group } : p)));
    setAddToGroupOpen(false);
    setSelectedIds(new Set());
  }

  function handleSyncSelected() {
    // TODO(backend): no endpoint exists yet to sync selected players' data.
    alert(`Syncing ${selectedIds.size} player(s) — coming soon (backend endpoint pending).`);
  }

  function handleRemoveSelected() {
    // TODO(backend): no endpoint yet to remove players from a team — local-only for now.
    setPlayers((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
  }

  function handleMoveSelected() {
    // TODO(backend): no endpoint exists yet to move players to another team.
    alert(`Move ${selectedIds.size} player(s) to another team — coming soon (backend endpoint pending).`);
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
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
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
              {orgName && (
                <p className="text-[10px] sm:text-xs font-semibold text-[#3B82F6] uppercase leading-none truncate">
                  {orgName}
                </p>
              )}
              <h1 className="text-base sm:text-xl font-black text-[#1f1f1f] truncate leading-tight">
                {teamName}
              </h1>
            </div>
          </div>

          {teamLogo ? (
            <img src={teamLogo} alt={teamName} className="w-9 h-9 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#1f1f1f] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {teamName.charAt(0).toUpperCase()}
            </div>
          )}
        </header>

        {/* Body */}
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 px-4 sm:px-5 py-3 border-b border-gray-100">
              <button
                onClick={() => alert("View Coaches — coming soon (backend endpoint pending).")}
                className="h-9 px-3 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-50 transition flex items-center gap-1.5"
              >
                <ShieldCheck size={14} /> View Coaches
              </button>
              <button
                onClick={() => alert("Connect ID's — coming soon (backend endpoint pending).")}
                className="h-9 px-4 rounded-full bg-[#1f1f1f] text-white text-xs font-semibold hover:bg-black transition"
              >
                Connect ID&apos;s
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="h-9 px-4 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                + Create Player(s)
              </button>
              <button
                onClick={() => {
                  const params = new URLSearchParams({ team_name: teamName });
                  router.push(`/coach/team/${id}/add-player?${params.toString()}`);
                }}
                className="h-9 px-4 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                + Add Player(s)
              </button>
              <button
                onClick={() => setShowQrModal(true)}
                className="h-9 px-4 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                + Add Via QR
              </button>
            </div>

            {/* Bulk actions — shown when at least one player is selected */}
            {selectedIds.size > 0 && (
              <div className="flex flex-wrap items-center gap-2 px-4 sm:px-5 py-3 border-b border-gray-100 bg-[#f5f0ff]/40">
                <span className="text-xs font-semibold text-gray-500 mr-1">
                  {selectedIds.size} selected
                </span>

                <div className="relative">
                  <button
                    onClick={() => setAddToGroupOpen((v) => !v)}
                    className="h-9 px-4 rounded-full border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center gap-1.5"
                  >
                    <FolderPlus size={14} /> Add To Group
                  </button>
                  {addToGroupOpen && (
                    <div className="absolute left-0 top-full mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-10">
                      {DUMMY_GROUPS.map((g) => (
                        <button
                          key={g}
                          onClick={() => handleAddSelectedToGroup(g)}
                          className="w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSyncSelected}
                  className="h-9 px-4 rounded-full border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center gap-1.5"
                >
                  <RefreshCw size={14} /> Sync Selected Player(s)
                </button>

                <button
                  onClick={handleRemoveSelected}
                  className="h-9 px-4 rounded-full border border-red-200 bg-white text-xs font-semibold text-red-500 hover:bg-red-50 transition flex items-center gap-1.5"
                >
                  <X size={14} /> Remove
                </button>

                <button
                  onClick={handleMoveSelected}
                  className="h-9 px-4 rounded-full border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center gap-1.5"
                >
                  <ArrowLeftRight size={14} /> Move Player
                </button>
              </div>
            )}

            {/* Filter + select all */}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-gray-100">
              <div className="relative">
                <button
                  onClick={() => setGroupFilterOpen((v) => !v)}
                  className="h-9 px-4 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 flex items-center gap-2 hover:bg-gray-50 transition"
                >
                  {groupFilter === "all" ? "Filter By Group" : groupFilter}
                  <ChevronDown size={13} />
                </button>
                {groupFilterOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-10">
                    <button
                      onClick={() => { setGroupFilter("all"); setGroupFilterOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                    >
                      All Groups
                    </button>
                    {DUMMY_GROUPS.map((g) => (
                      <button
                        key={g}
                        onClick={() => { setGroupFilter(g); setGroupFilterOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-[#8B5CF6] focus:ring-[#8B5CF6]"
                />
                Select All Players
              </label>
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
              ) : visiblePlayers.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">No players found.</p>
              ) : (
                visiblePlayers.map((p) => {
                  const displayName = p.name ?? p.username ?? "Player";
                  return (
                    <div key={p.id} className="relative bg-[#fafafa] px-4 sm:px-5 py-4">
                      <button
                        onClick={() => removePlayer(p.id)}
                        className="absolute top-3 right-4 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
                        title="Remove from roster"
                      >
                        <X size={12} className="text-gray-500" />
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
                            <h3 className="text-sm font-bold text-[#222]">{displayName}</h3>
                            <div className="flex items-center gap-2 pr-8">
                              <input
                                type="text"
                                placeholder="Enter Notes"
                                value={p.notes}
                                onChange={(e) => updateNotes(p.id, e.target.value)}
                                className="h-7 w-40 sm:w-52 rounded-lg border border-gray-200 bg-white px-2.5 text-xs outline-none focus:border-[#8B5CF6] transition"
                              />
                              <button
                                onClick={() => alert(`Notes saved for ${displayName} (dummy — backend endpoint pending).`)}
                                className="text-xs font-semibold text-[#3B82F6] hover:underline whitespace-nowrap"
                              >
                                Save Notes
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-5 gap-2 max-w-md">
                            {[
                              { label: "Load", value: p.load },
                              { label: "W.O.C.", value: p.score ?? "0/4" },
                              { label: "Power", value: p.power },
                              { label: "Kcal", value: p.kcal },
                              { label: "Strength", value: p.strength },
                            ].map((stat) => (
                              <div key={stat.label}>
                                <p className="text-[10px] font-semibold text-gray-400">{stat.label}</p>
                                <p className="text-xs font-bold text-[#222]">{stat.value}</p>
                              </div>
                            ))}
                          </div>

                          <p className="text-[11px] text-gray-400 mt-2">Last Workout: {p.lastWorkout}</p>

                          {p.pendingSignup && (
                            <div className="flex flex-wrap items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
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

                          <div className="flex items-center justify-end gap-4 mt-3">
                            <button
                              onClick={() => alert(`Print Schedule for ${displayName} — coming soon.`)}
                              className="text-xs font-semibold text-[#3B82F6] hover:underline"
                            >
                              Print Schedule
                            </button>
                            <button
                              onClick={() => {
                                if (!p.username) return;
                                router.push(`/profile?username=${encodeURIComponent(p.username)}`);
                              }}
                              disabled={!p.username}
                              className="h-8 px-4 rounded-full bg-[#1f1f1f] text-white text-xs font-semibold hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Profile
                            </button>
                          </div>
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

      {/* QR invite modal — same component used on the coach dashboard */}
      {showQrModal && (
        <TeamInviteQrModal
          team={{ id, name: teamName, logo: teamLogo, school: orgName }}
          onClose={() => setShowQrModal(false)}
        />
      )}

      {/* Create Player modal — shared with the team detail page */}
      {showCreateModal && (
        <CreatePlayerModal
          teamName={teamName}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreatePlayer}
        />
      )}
    </div>
  );
}

export default function RosterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RosterContent />
    </Suspense>
  );
}
