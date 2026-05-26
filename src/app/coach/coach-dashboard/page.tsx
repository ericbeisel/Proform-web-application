"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Award,
  FileText,
  Trophy,
  Target,
  SlidersHorizontal,
  Users,
  Megaphone,
  Search,
  X,
  Upload,
  Trash2,
  UserPlus,
  Copy,
  Check,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { coachApi, type CoachTeam } from "@/api/coach/route";

const quickActions = [
  { title: "Reminders", icon: Bell, color: "bg-[#7C4DFF]" },
  { title: "Standards", icon: Award, color: "bg-[#EF4444]" },
  { title: "Reports", icon: FileText, color: "bg-[#10B981]" },
  { title: "Challenges", icon: Trophy, color: "bg-[#F59E0B]" },
  { title: "Accountability", icon: Target, color: "bg-[#FB923C]" },
];

export default function CoachDashboardPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<CoachTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamOwner, setTeamOwner] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [inviteTeam, setInviteTeam] = useState<CoachTeam | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleCopyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    coachApi
      .getCoachTeams()
      .then(setTeams)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  }

  function handleCloseModal() {
    setShowCreateModal(false);
    setTeamName("");
    setTeamOwner("");
    setLogoFile(null);
    setLogoPreview(null);
  }

  async function handleCreateTeam() {
    if (!teamName.trim()) return;
    setCreating(true);
    try {
      const res = await coachApi.createCoachTeam({
        name: teamName.trim(),
        logo: logoFile,
      });
      const created = res?.team ?? (res as any)?.data ?? (res as any);
      setTeams((prev) => [
        ...prev,
        {
          id: created?.id ?? String(Date.now()),
          name: created?.name ?? teamName.trim(),
          tagged_players_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      handleCloseModal();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteTeam(id: string) {
    setDeletingId(id);
    try {
      await coachApi.deleteCoachTeam(id);
      setTeams((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }

  const teamsLeft: number = 3;

  return (
    <div className="min-h-screen bg-[#f5f5f7]">

      {/* ── Create Team Modal ── */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl p-5 sm:p-6 flex flex-col gap-5 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#222]">Team Details</h2>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-gray-200 transition"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>

            <p className="text-sm text-gray-500">
              You have{" "}
              <span className="font-semibold text-[#8B5CF6]">{teamsLeft}</span>{" "}
              {teamsLeft === 1 ? "team" : "teams"} left on your package
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#222]">Team Name</label>
              <input
                type="text"
                placeholder="Enter team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="h-11 rounded-xl bg-[#f5f5f7] px-4 text-sm outline-none border border-transparent focus:border-[#8B5CF6] transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#222]">Team Logo</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-24 rounded-xl border-2 border-dashed border-gray-200 bg-[#f5f5f7] hover:border-[#8B5CF6] hover:bg-[#f5f0ff] transition flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[#8B5CF6]"
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="preview" className="h-16 w-16 rounded-xl object-cover" />
                ) : (
                  <>
                    <Upload size={20} />
                    <span className="text-xs font-medium">Upload image</span>
                  </>
                )}
              </button>
              {logoFile && <p className="text-xs text-gray-400 truncate">{logoFile.name}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#222]">Team Owner</label>
              <input
                type="text"
                placeholder="Enter owner name"
                value={teamOwner}
                onChange={(e) => setTeamOwner(e.target.value)}
                className="h-11 rounded-xl bg-[#f5f5f7] px-4 text-sm outline-none border border-transparent focus:border-[#8B5CF6] transition"
              />
            </div>

            <button
              onClick={handleCreateTeam}
              disabled={!teamName.trim() || creating}
              className="h-12 rounded-2xl bg-[#8B5CF6] text-white text-sm font-semibold hover:bg-[#7C3AED] transition shadow-[0_6px_16px_rgba(139,92,246,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Creating…" : "Create Team"}
            </button>
          </div>
        </div>
      )}

      {/* ── Invite Modal ── */}
      {inviteTeam && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setInviteTeam(null)}
        >
          <div
            className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl p-5 sm:p-6 flex flex-col gap-5 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {inviteTeam.logo ? (
                  <img src={inviteTeam.logo} alt={inviteTeam.name} className="w-12 h-12 rounded-2xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6] flex items-center justify-center text-white font-bold text-lg">
                    {inviteTeam.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  {inviteTeam.owner_name && (
                    <p className="text-[11px] font-semibold text-orange-500 uppercase">{inviteTeam.owner_name}</p>
                  )}
                  <h3 className="text-base font-bold text-[#222]">{inviteTeam.name}</h3>
                </div>
              </div>
              <button
                onClick={() => setInviteTeam(null)}
                className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-gray-200 transition shrink-0"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>

            <h2 className="text-lg font-bold text-[#8B5CF6]">Invite Player(s)</h2>

            <div className="bg-[#f5f5f7] rounded-2xl p-4 sm:p-6 flex flex-col items-center gap-3">
              <div className="p-3 bg-white rounded-2xl border-2 border-[#8B5CF6]">
                <QRCodeSVG
                  value={`https://proformapp-web.onrender.com/team/joiningCode?code=${inviteTeam.unique_code ?? ""}&team_id=${inviteTeam.id}`}
                  size={140}
                />
              </div>
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                Invite up to 45 people to join your team. Share your custom QR
                Code or URL to send them an invite
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold text-[#222]">Share with URL:</p>
              <div className="h-11 rounded-xl bg-[#f5f5f7] px-4 flex items-center text-xs text-gray-500 truncate border border-transparent">
                {`https://proformapp-web.onrender.com/team/joiningCode?code=${inviteTeam.unique_code ?? ""}&team_id=${inviteTeam.id}`}
              </div>
              <button
                onClick={() =>
                  handleCopyUrl(
                    `https://proformapp-web.onrender.com/team/joiningCode?code=${inviteTeam.unique_code ?? ""}&team_id=${inviteTeam.id}`,
                  )
                }
                className="h-12 rounded-2xl bg-[#8B5CF6] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#7C3AED] transition shadow-[0_6px_16px_rgba(139,92,246,0.35)]"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy URL"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="h-14 sm:h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <h1 className="text-base sm:text-2xl font-black text-[#1f1f1f] truncate">
            Coach Dashboard
          </h1>
          <button className="hidden sm:flex h-9 px-4 rounded-xl bg-[#8B5CF6] text-white text-sm font-semibold items-center justify-center hover:bg-[#7C3AED] transition shrink-0">
            Switch to Player
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-gray-200 transition">
            <Search size={17} className="text-gray-700" />
          </button>
          <button
            onClick={() => router.push("/coach/bulletin")}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-gray-200 transition"
          >
            <Megaphone size={17} className="text-gray-700" />
          </button> */}
          <button className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-gray-200 transition">
            <Bell size={17} className="text-gray-700" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">

        {/* Title */}
        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-[#222]">My Team</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage your teams and track their progress</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-5 gap-3 sm:gap-6">
          {quickActions.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex flex-col items-center group">
                <button
                  className={`
                    relative w-12 h-12 sm:w-16 sm:h-16 rounded-[18px] sm:rounded-[22px]
                    ${item.color}
                    flex items-center justify-center
                    shadow-[0_8px_16px_rgba(0,0,0,0.16)]
                    border border-white/30
                    transition-all duration-300
                    group-hover:-translate-y-1
                    group-hover:shadow-[0_14px_24px_rgba(0,0,0,0.2)]
                    active:translate-y-[2px]
                    overflow-hidden
                  `}
                >
                  <div className="absolute inset-[2px] rounded-[16px] sm:rounded-[20px] bg-white/5" />
                  <Icon size={20} className="text-white relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] sm:hidden" />
                  <Icon size={26} className="text-white relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] hidden sm:block" />
                </button>
                <span className="mt-2 text-[10px] sm:text-xs font-semibold text-gray-700 tracking-tight text-center leading-tight">
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Filter Bar */}
        <div className="mt-4 sm:mt-5 bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 shadow-sm">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Filter Teams"
              className="w-full h-10 sm:h-11 rounded-xl bg-[#f5f5f7] px-4 text-sm outline-none border border-transparent focus:border-[#8B5CF6]"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowCreateModal(true)}
              className="h-9 px-4 rounded-xl bg-[#8B5CF6] text-white text-sm font-semibold hover:bg-[#7C3AED] transition shadow-[0_4px_12px_rgba(139,92,246,0.3)] whitespace-nowrap"
            >
              + New Team
            </button>

            <button className="w-9 h-9 rounded-full bg-[#f5f5ff] flex items-center justify-center text-[#8B5CF6] border border-white/70 shadow-[0_8px_18px_rgba(139,92,246,0.18),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:scale-105 active:scale-95 transition-all duration-200">
              <SlidersHorizontal size={18} />
            </button>

            <label className="flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap">
              <input type="checkbox" className="accent-[#8B5CF6]" />
              Show only teams I am admin for
            </label>
          </div>
        </div>

        {/* Team Cards */}
        {teams.length === 0 && !loading ? (
          <div className="mt-4 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center text-center gap-5">
            <h3 className="text-lg sm:text-xl font-bold text-[#222]">
              Select a team or create a new team.
            </h3>

            <button
              onClick={() => setShowCreateModal(true)}
              className="h-11 px-6 rounded-2xl bg-[#8B5CF6] text-white text-sm font-semibold hover:bg-[#7C3AED] transition shadow-[0_6px_16px_rgba(139,92,246,0.35)]"
            >
              Create a New Team
            </button>

            <div className="w-full border-t border-gray-100" />

            <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
              You don&apos;t have any team plans yet. You can view/purchase team
              plans or activate your plan using the code one of our reps has
              given you below:
            </p>

            <div className="flex items-center gap-3">
              <button className="h-10 px-5 rounded-xl bg-[#f5f5f7] text-sm font-semibold text-[#222] hover:bg-gray-200 transition">
                View Plans
              </button>
              <button className="h-10 px-5 rounded-xl border border-[#8B5CF6] text-sm font-semibold text-[#8B5CF6] hover:bg-[#f5f0ff] transition">
                Use Code
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm animate-pulse">
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {teams.map((team) => (
              <div
                key={team.id}
                onClick={() => router.push(`/coach/team/${team.id}`)}
                className="bg-white border border-gray-200 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition cursor-pointer"
              >
                <div className="flex justify-between gap-3">
                  {/* Left */}
                  <div className="flex gap-3 min-w-0">
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="w-14 h-14 rounded-2xl object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-[#8B5CF6] flex items-center justify-center text-white text-xl font-bold shrink-0">
                        {team.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-[#222] truncate">
                        {team.name}
                      </h3>
                      <span className="inline-flex mt-1.5 px-2.5 py-1 rounded-full bg-[#F3E8FF] text-[#8B5CF6] text-[10px] sm:text-[11px] font-semibold">
                        Created {new Date(team.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-start gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setInviteTeam(team)}
                      className="w-9 h-9 rounded-full bg-[#f0fdf4] flex items-center justify-center text-green-500 hover:bg-green-100 hover:text-green-600 transition"
                      title="Invite player"
                    >
                      <UserPlus size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      disabled={deletingId === team.id}
                      className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete team"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Bottom */}
                <div className="flex items-center mt-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center">
                      <Users size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#222]">{team.tagged_players_count}</p>
                      <p className="text-[11px]">players</p>
                    </div>
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
