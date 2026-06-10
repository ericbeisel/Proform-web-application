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
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { coachApi, type CoachTeam } from "@/api/coach/route";
import { getAuthUser, getUserIdFromToken, getTokenPayload, clearAuthSession } from "@/lib/auth/session";
import { invalidateDashboardCache } from "@/api/dashboard/route";
import { fetchCountries, fetchStates, fetchCities } from "@/api/account-setup/route";
import { profileApi } from "@/api/profile/route";

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
  const [createError, setCreateError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmTeam, setDeleteConfirmTeam] = useState<CoachTeam | null>(null);
  const [inviteTeam, setInviteTeam] = useState<CoachTeam | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string>("");
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [activateCode, setActivateCode] = useState("");
  const [activating, setActivating] = useState(false);
  const [activateError, setActivateError] = useState<string | null>(null);
  const [validatingCode, setValidatingCode] = useState(false);
  const [validPlanName, setValidPlanName] = useState<string | null>(null);
  const [teamPlanActivated, setTeamPlanActivated] = useState(false);

  const [hasOrganization, setHasOrganization] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState<string>("N/A");
  const [orgDisplayName, setOrgDisplayName] = useState<string | null>(null);
  const [orgLogo, setOrgLogo] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Admin Details form
  const [showAdminDetailsModal, setShowAdminDetailsModal] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminAddress, setAdminAddress] = useState("");
  const [orgCountry, setOrgCountry] = useState("");
  const [orgState, setOrgState] = useState("");
  const [orgCity, setOrgCity] = useState("");
  const [orgLogoFile, setOrgLogoFile] = useState<File | null>(null);
  const [orgLogoPreview, setOrgLogoPreview] = useState<string | null>(null);
  const [existingMascot, setExistingMascot] = useState<string | null>(null);
  const [savingOrg, setSavingOrg] = useState(false);
  const [orgSaveError, setOrgSaveError] = useState<string | null>(null);

  // Location dropdowns
  const [countries, setCountries] = useState<{ id: number; name: string }[]>([]);
  const [states, setStates] = useState<{ id: number; name: string }[]>([]);
  const [cities, setCities] = useState<{ id: number; name: string }[]>([]);

  const orgLogoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleCloseAdminModal() {
    setShowAdminDetailsModal(false);
    setOrgName(""); setOrgType(""); setAdminEmail(""); setAdminPhone("");
    setAdminAddress(""); setOrgCountry(""); setOrgState(""); setOrgCity("");
    setOrgLogoFile(null); setOrgLogoPreview(null);
    setOrgSaveError(null); setStates([]); setCities([]);
  }

  function handleNewTeamClick() {
    if (hasOrganization) {
      setShowCreateModal(true);
    } else {
      setShowAdminDetailsModal(true);
    }
  }

  function handleCopyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    coachApi.getCoachTeams()
      .then(setTeams)
      .catch(console.error)
      .finally(() => setLoading(false));

    coachApi.getInstitutionDetails()
      .then((inst) => {
        if (!inst) return;
        setHasOrganization(true);
        if (inst.title) setOrgDisplayName(inst.title);
        if (inst.mascot) setOrgLogo(inst.mascot);
      })
      .catch(console.error);

    const user = getAuthUser();
    if (user?.name) setUserInitial((user.name as string)[0]?.toUpperCase() ?? "N/A");
    const tokenPayload = getTokenPayload();
    const username = (user?.username as string | undefined) ?? tokenPayload?.username;
    const emailInitial = tokenPayload?.email?.[0]?.toUpperCase();
    console.log("[avatar] getAuthUser:", user, "| tokenPayload:", tokenPayload, "| username:", username);
    if (username) {
      profileApi.getProfileByUsername(username)
        .then((profile) => {
          console.log("[avatar] profile fetched:", profile);
          if (profile?.image) {
            console.log("[avatar] setting profilePicture:", profile.image);
            setProfilePicture(profile.image);
          } else {
            console.log("[avatar] no image in profile");
          }
          if (!user?.name) {
            const displayName = profile?.name || profile?.username || username;
            console.log("[avatar] setting userInitial from profile:", displayName);
            if (displayName) setUserInitial((displayName as string)[0]?.toUpperCase() ?? "N/A");
          }
        })
        .catch((err) => console.error("[avatar] profile fetch failed:", err));
    } else if (emailInitial) {
      console.log("[avatar] no username, using email initial:", emailInitial);
      setUserInitial(emailInitial);
    } else {
      console.log("[avatar] no username or email found");
    }

    coachApi.getRemainingTeamLimit()
      .then((info) => {
        setTeamsLeft(info.remaining);
        setPlanName(info.planName ?? null);
        if (info.hasActivePlan && info.totalAllowed > 0) setTeamPlanActivated(true);
      })
      .catch(console.error);
  }, []);

  // Close profile menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuOpen]);

  // Fetch real invite link when invite modal opens
  useEffect(() => {
    if (!inviteTeam) { setInviteUrl(""); return; }
    setLoadingInvite(true);
    coachApi.getTeamInvite(inviteTeam.id)
      .then((info) => {
        const origin = typeof window !== "undefined" ? window.location.origin : "https://proformapp-web.onrender.com";
        const extractCode = (link?: string | null) =>
          link ? link.split("/").filter(Boolean).pop() ?? "" : "";
        const code =
          info.unique_code ||
          extractCode(info.invite_link) ||
          inviteTeam.unique_code ||
          extractCode(inviteTeam.invite_link) ||
          "";
        const params = new URLSearchParams({
          code,
          team_id: inviteTeam.id,
          team_name: info.name ?? inviteTeam.name,
          org_name: info.institution?.title ?? inviteTeam.school ?? "",
          owner_name: info.owner ?? inviteTeam.owner_name ?? "",
        });
        setInviteUrl(`${origin}/player/team-invite?${params.toString()}`);
      })
      .catch(() => {
        const origin = typeof window !== "undefined" ? window.location.origin : "https://proformapp-web.onrender.com";
        const extractCode = (link?: string | null) =>
          link ? link.split("/").filter(Boolean).pop() ?? "" : "";
        const params = new URLSearchParams({
          code: inviteTeam.unique_code || extractCode(inviteTeam.invite_link) || "",
          team_id: inviteTeam.id,
          team_name: inviteTeam.name,
          org_name: inviteTeam.school ?? "",
          owner_name: inviteTeam.owner_name ?? "",
        });
        setInviteUrl(`${origin}/player/team-invite?${params.toString()}`);
      })
      .finally(() => setLoadingInvite(false));
  }, [inviteTeam]);

  // Auto-validate activation code
  useEffect(() => {
    setValidPlanName(null);
    setActivateError(null);
    if (activateCode.trim().length < 6) return;
    setValidatingCode(true);
    const timer = setTimeout(() => {
      coachApi.getPlanDetails(activateCode.trim())
        .then((plan) => {
          setValidPlanName((plan as any)?.name ?? (plan as any)?.code ?? activateCode.trim());
          setActivateError(null);
        })
        .catch(() => {
          setActivateError("Plan code not found. Please check and try again.");
          setValidPlanName(null);
        })
        .finally(() => setValidatingCode(false));
    }, 500);
    return () => clearTimeout(timer);
  }, [activateCode]);

  // When admin modal opens: load countries and pre-fill existing data
  useEffect(() => {
    if (!showAdminDetailsModal) return;
    fetchCountries().then(setCountries).catch(console.error);
    coachApi.getInstitutionDetails().then((inst) => {
      if (!inst) return;
      setOrgName(inst.title ?? "");
      setOrgType(inst.type ?? "");
      setAdminEmail(inst.email ?? "");
      setAdminPhone(inst.phone ?? "");
      setAdminAddress(inst.address ?? "");
      setExistingMascot(inst.mascot ?? null);
      if (inst.country) {
        setOrgCountry(inst.country);
        fetchStates(inst.country).then(setStates).catch(console.error);
      }
      if (inst.state) {
        setOrgState(inst.state);
        fetchCities(inst.state).then(setCities).catch(console.error);
      }
      if (inst.city) setOrgCity(inst.city);
    }).catch(console.error);
  }, [showAdminDetailsModal]);

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
    setCreateError(null);
  }

  async function handleCreateTeam() {
    if (!teamName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await coachApi.createCoachTeam({
        name: teamName.trim(),
        logo: logoFile,
      });
      handleCloseModal();
      // Re-fetch teams from API to get full data including logo URL
      coachApi.getCoachTeams().then(setTeams).catch(console.error);
    } catch (err: any) {
      setCreateError(err.message || "Failed to create team. Please try again.");
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

  const [teamsLeft, setTeamsLeft] = useState<number | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);

  const [floatingOpen, setFloatingOpen] = useState(true);
  const [fabPos, setFabPos] = useState({ x: 0, y: 0 });
  const fabInitialized = useRef(false);
  const dragging = useRef(false);
  const wasDragged = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const fabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fabInitialized.current && typeof window !== "undefined") {
      // 56px bubble + 16px margin from edges
      setFabPos({ x: window.innerWidth - 72, y: window.innerHeight - 72 });
      fabInitialized.current = true;
    }
  }, []);

  function onFabMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("button[data-action='nav']")) return;
    dragging.current = true;
    wasDragged.current = false;
    dragOffset.current = {
      x: e.clientX - fabPos.x,
      y: e.clientY - fabPos.y,
    };
    e.preventDefault();
  }

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current) return;
      wasDragged.current = true;
      setFabPos({
        x: Math.min(Math.max(0, e.clientX - dragOffset.current.x), window.innerWidth - 60),
        y: Math.min(Math.max(0, e.clientY - dragOffset.current.y), window.innerHeight - 60),
      });
    }
    function onMouseUp() { dragging.current = false; }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

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
              {teamsLeft === null ? (
                <span className="inline-block w-4 h-3 bg-gray-200 rounded animate-pulse align-middle" />
              ) : (
                <span className="font-semibold text-[#8B5CF6]">{teamsLeft}</span>
              )}{" "}
              {teamsLeft === 1 ? "team" : "teams"} left on your{" "}
              {planName ? <span className="font-semibold text-[#8B5CF6]">{planName}</span> : "package"}
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

            {createError && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2.5 text-center leading-snug">
                {createError}
              </p>
            )}

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
                {loadingInvite ? (
                  <div className="w-[140px] h-[140px] bg-gray-100 animate-pulse rounded-xl" />
                ) : (
                  <QRCodeSVG value={inviteUrl || " "} size={140} />
                )}
              </div>
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                Invite up to 50 people to join your team. Share your custom QR
                Code or URL to send them an invite
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold text-[#222]">Share with URL:</p>
              <div className="h-11 rounded-xl bg-[#f5f5f7] px-4 flex items-center text-xs text-gray-500 truncate border border-transparent">
                {inviteUrl}
              </div>
              <button
                onClick={() =>
                  handleCopyUrl(
                    inviteUrl,
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

      {/* ── Activate Team Plan Modal ── */}
      {showActivateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => { setShowActivateModal(false); setActivateCode(""); setActivateError(null); setValidPlanName(null); }}
        >
          <div
            className="relative bg-white w-full max-w-sm mx-4 rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setShowActivateModal(false); setActivateCode(""); setActivateError(null); setValidPlanName(null); }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 transition"
            >
              <X size={20} />
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#1a1a1a]">Activate Team Plan:</h2>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed max-w-[260px] mx-auto">
                Use the 6-10 digit code that we sent to your email address to activate your team plan.
              </p>
            </div>

            <div className="w-full relative">
              <input
                type="text"
                value={activateCode}
                onChange={(e) => setActivateCode(e.target.value.replace(/[^a-zA-Z0-9-]/g, ""))}
                placeholder="--- - ---"
                maxLength={12}
                className={`w-full h-14 rounded-2xl border bg-white px-5 text-center text-lg font-semibold tracking-widest text-[#1a1a1a] placeholder:text-gray-300 outline-none transition ${
                  validPlanName ? "border-green-400" : activateError ? "border-red-400" : "border-gray-200 focus:border-[#8B5CF6]"
                }`}
              />
              {validatingCode && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {validPlanName && (
              <div className="w-full bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-center">
                <p className="text-xs text-green-600 font-semibold">✓ Valid code</p>
                <p className="text-sm font-bold text-green-700 mt-0.5">{validPlanName}</p>
              </div>
            )}

            {activateError && (
              <p className="w-full text-sm text-red-500 text-center bg-red-50 rounded-xl px-3 py-2">
                {activateError}
              </p>
            )}

            <button
              disabled={activateCode.trim().length < 6 || activating || validatingCode || !!activateError}
              onClick={async () => {
                setActivating(true);
                setActivateError(null);
                try {
                  const userId = getAuthUser()?.id ?? getUserIdFromToken();
                  if (!userId) throw new Error("Not logged in.");
                  await coachApi.activatePlan({ userId, code: activateCode.trim() });
                  setTeamPlanActivated(true);
                  setShowActivateModal(false);
                  setActivateCode("");
                  // Refresh limit info after activation
                  coachApi.getRemainingTeamLimit()
                    .then((info) => {
                      setTeamsLeft(info.remaining);
                      setPlanName(info.planName ?? null);
                    })
                    .catch(console.error);
                } catch (err: any) {
                  setActivateError(err.message || "Invalid or expired code. Please try again.");
                } finally {
                  setActivating(false);
                }
              }}
              className="w-full h-12 rounded-2xl bg-[#8B5CF6] text-white text-sm font-bold hover:bg-[#7C3AED] transition shadow-[0_6px_16px_rgba(139,92,246,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {activating ? "Activating…" : "Submit & Activate"}
            </button>
          </div>
        </div>
      )}

      {/* ── Admin Details Modal ── */}
  {showAdminDetailsModal && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    onClick={handleCloseAdminModal}
  >
    <div
      className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-10 flex flex-col gap-5 max-h-[92vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close */}
      <button
        onClick={handleCloseAdminModal}
        className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-700 transition"
      >
        <X size={22} />
      </button>

      {/* Title */}
      <div className="text-center pb-1">
        <h2 className="text-3xl font-bold text-[#1a1a1a]">Admin. Details:</h2>
        <p className="mt-1.5 text-sm text-gray-400 leading-relaxed">
          Set up your organization profile to get started.
        </p>
      </div>

      {/* Organization Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Organization Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="Enter organization name"
          className="h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm text-[#1a1a1a] outline-none focus:border-[#8B5CF6] transition placeholder:text-gray-300"
        />
      </div>

      {/* Logo / Mascot */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Logo / Mascot <span className="text-red-400">*</span>
        </label>
        <input
          ref={orgLogoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setOrgLogoFile(f);
            setOrgLogoPreview(f ? URL.createObjectURL(f) : null);
          }}
        />
        <button
          type="button"
          onClick={() => orgLogoInputRef.current?.click()}
          className="h-12 rounded-xl border-2 border-dashed border-gray-200 bg-white hover:border-[#8B5CF6] hover:bg-[#faf5ff] transition flex items-center justify-center gap-2 text-gray-400 hover:text-[#8B5CF6] text-sm font-medium"
        >
          {orgLogoPreview ? (
            <img src={orgLogoPreview} alt="logo" className="h-8 w-8 rounded-lg object-cover" />
          ) : (
            <>
              <Upload size={16} />
              <span>Upload +</span>
            </>
          )}
        </button>
      </div>

      {/* Organization Type */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Organization Type <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <select
            value={orgType}
            onChange={(e) => setOrgType(e.target.value)}
            className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 pr-9 text-sm text-[#1a1a1a] outline-none focus:border-[#8B5CF6] appearance-none transition"
          >
            <option value="">Choose One</option>
            <option>High School Gym</option>
            <option>Commercial Gym</option>
            <option>Private Boxing Gym</option>
            <option>Group Fitness Studio</option>
            <option>Apartment/Hotel Gym</option>
            <option>College Athletic Center</option>
            <option>College Rec Center</option>
            <option>Public Rec Center</option>
            <option>Home/Home Gym</option>
          </select>
          <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Admin Email + Phone */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="admin@org.com"
            className="h-12 rounded-xl border border-gray-200 bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#8B5CF6] transition placeholder:text-gray-300"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Phone <span className="text-red-400">*</span>
          </label>
          <input
            type="tel"
            value={adminPhone}
            onChange={(e) => setAdminPhone(e.target.value)}
            placeholder="+1 000 0000"
            className="h-12 rounded-xl border border-gray-200 bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#8B5CF6] transition placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Mailing Address */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Mailing Address <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={adminAddress}
          onChange={(e) => setAdminAddress(e.target.value)}
          placeholder="Street address"
          className="h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm text-[#1a1a1a] outline-none focus:border-[#8B5CF6] transition placeholder:text-gray-300"
        />
      </div>

      {/* Country */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Country <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <select
            value={orgCountry}
            onChange={(e) => {
              const id = e.target.value;
              setOrgCountry(id); setOrgState(""); setOrgCity(""); setStates([]); setCities([]);
              if (id) fetchStates(id).then(setStates).catch(console.error);
            }}
            className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 pr-9 text-sm text-[#1a1a1a] outline-none focus:border-[#8B5CF6] appearance-none transition"
          >
            <option value="">Choose One</option>
            {countries.map((c) => (
              <option key={c.id} value={String(c.id)}>{c.name}</option>
            ))}
          </select>
          <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* State + City */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            State <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <select
              value={orgState}
              onChange={(e) => {
                const id = e.target.value;
                setOrgState(id); setOrgCity(""); setCities([]);
                if (id) fetchCities(id).then(setCities).catch(console.error);
              }}
              className="w-full h-12 rounded-xl border border-gray-200 bg-white px-3 pr-8 text-sm text-[#1a1a1a] outline-none focus:border-[#8B5CF6] appearance-none transition"
            >
              <option value="">Select</option>
              {states.map((s) => (
                <option key={s.id} value={String(s.id)}>{s.name}</option>
              ))}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            City <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <select
              value={orgCity}
              onChange={(e) => setOrgCity(e.target.value)}
              className="w-full h-12 rounded-xl border border-gray-200 bg-white px-3 pr-8 text-sm text-[#1a1a1a] outline-none focus:border-[#8B5CF6] appearance-none transition"
            >
              <option value="">Select</option>
              {cities.map((c) => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {orgSaveError && (
        <p className="text-sm text-red-500 text-center bg-red-50 rounded-xl px-3 py-2">{orgSaveError}</p>
      )}

      {/* Next */}
      <button
        disabled={savingOrg || !orgName.trim() || !orgType || !adminEmail.trim() || !adminPhone.trim() || !adminAddress.trim() || !orgCountry || !orgState || !orgCity}
        onClick={async () => {
          setSavingOrg(true); setOrgSaveError(null);
          try {
            await coachApi.saveInstitutionDetails({
              title: orgName.trim(),
              mascot: existingMascot ?? "",
              type: orgType,
              email: adminEmail.trim(),
              phone: adminPhone.trim(),
              address: adminAddress.trim(),
              country: orgCountry,
              state: orgState,
              city: orgCity,
              maxCoaches: 3,
              sponsored: false,
            }, orgLogoFile ?? undefined);
            setHasOrganization(true);
            // Re-fetch to update header logo + name immediately
            coachApi.getInstitutionDetails().then((inst) => {
              if (!inst) return;
              if (inst.title) setOrgDisplayName(inst.title);
              if (inst.mascot) setOrgLogo(inst.mascot);
            }).catch(console.error);
            handleCloseAdminModal();
            setShowCreateModal(true);
          } catch (err: any) {
            setOrgSaveError(err.message || "Failed to save. Please try again.");
          } finally {
            setSavingOrg(false);
          }
        }}
        className="w-full h-14 rounded-2xl bg-[#8B5CF6] text-white text-base font-bold hover:bg-[#7C3AED] transition shadow-[0_6px_16px_rgba(139,92,246,0.35)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {savingOrg ? "Saving…" : "Next"}
      </button>
    </div>
  </div>
)}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirmTeam && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setDeleteConfirmTeam(null)}
        >
          <div
            className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Red warning header */}
            <div className="bg-red-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white text-lg font-black">⚠ WARNING!!</span>
              </div>
              <button
                onClick={() => setDeleteConfirmTeam(null)}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6 flex flex-col gap-4">
              <p className="text-base font-bold text-[#111]">
                Deleting:{" "}
                <span className="text-red-500">{deleteConfirmTeam.name}</span>
              </p>

              <p className="text-sm text-gray-600 leading-relaxed">
                You would lose all data and the players will lose access to this team.
              </p>

              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                <p className="text-xs font-semibold text-red-500">
                  Note: This process cannot be reversed
                </p>
              </div>

              <p className="text-sm font-semibold text-[#111] text-center">
                Do you wish to continue?
              </p>

              <div className="grid grid-cols-2 gap-3 mt-1">
                <button
                  onClick={() => setDeleteConfirmTeam(null)}
                  className="h-11 rounded-2xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  No, Return
                </button>
                <button
                  onClick={async () => {
                    const id = deleteConfirmTeam.id;
                    setDeleteConfirmTeam(null);
                    await handleDeleteTeam(id);
                  }}
                  disabled={deletingId === deleteConfirmTeam.id}
                  className="h-11 rounded-2xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="h-14 sm:h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 relative">
        {/* Centered logo */}
        <button
          onClick={() => router.push("/dashboard")}
          className="absolute left-1/2 -translate-x-1/2 cursor-pointer"
        >
          <img
            src="/images/proform-logo.jpg"
            alt="Proform"
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-contain"
          />
        </button>

        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <h1 className="text-base sm:text-2xl font-black text-[#1f1f1f] truncate">
            Coach Dashboard
          </h1>
          <button
            onClick={() => router.replace("/team/teams")}
            className="hidden sm:flex h-9 px-4 rounded-xl bg-[#8B5CF6] text-white text-sm font-semibold items-center justify-center hover:bg-[#7C3AED] transition shrink-0"
          >
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
          {/* Avatar with profile menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen((v) => !v)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white font-bold text-sm overflow-hidden hover:opacity-90 transition"
            >
              {profilePicture ? (
                <img src={profilePicture} alt="profile" className="w-full h-full object-cover" />
              ) : (
                userInitial
              )}
            </button>

            {profileMenuOpen && (
              <div className="fixed left-2 right-2 sm:left-auto sm:right-4 top-16 sm:w-[400px] bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] border border-[#e8e6f0] z-[999] overflow-y-auto max-h-[calc(100vh-80px)]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                      {profilePicture ? (
                        <img src={profilePicture} alt="profile" className="w-full h-full object-cover" />
                      ) : (
                        userInitial
                      )}
                    </div>
                    <span className="font-semibold text-[#1a1825] text-sm">{userInitial}</span>
                  </div>
                  <button
                    onClick={() => setProfileMenuOpen(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#f7f6fb] text-[#8b879e] transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="h-px bg-[#f0eef8] mx-5" />

                {/* Menu — two columns on sm+, single column stacked on mobile */}
                <div className="flex flex-col sm:flex-row px-5 py-4 gap-4 sm:gap-8">
                
                  <div className="flex-1 flex flex-col gap-0.5">
                    {[
                      { label: "Teams", href: "/coach/coach-dashboard" },
                      { label: "Reports", href: "/coach/coach-dashboard" },
                      { label: "Queue", href: "/coach/coach-dashboard" },
                      { label: "Challenges (New)", href: "/coach/coach-dashboard", highlight: true },
                      { label: "Settings", href: "/account" },
                      { label: "Leaderboard", href: "/coach/coach-dashboard" },
                      { label: "Player Logs", href: "/coach/activity" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => { setProfileMenuOpen(false); router.push(item.href); }}
                        className={`text-[13px] py-2 sm:py-1.5 text-left hover:text-[#8B5CF6] transition-colors ${item.highlight ? "text-[#e17055] font-medium" : "text-[#3d3a4a]"}`}
                      >
                        {item.label}
                      </button>
                    ))}

                    <div className="h-px bg-[#f0eef8] my-2" />

                    {[
                      { label: "My Exercises", href: "/coach/coach-dashboard" },
                      { label: "Connect TVs", href: "/coach/coach-dashboard" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => { setProfileMenuOpen(false); router.push(item.href); }}
                        className="text-[13px] py-2 sm:py-1.5 text-left text-[#3d3a4a] hover:text-[#8B5CF6] transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="h-px bg-[#f0eef8] sm:hidden" />

                  {/* Right column - Tools */}
                  <div className="flex-1 flex flex-col gap-0.5">
                    <span className="text-[11px] font-semibold text-[#b0adc0] uppercase tracking-wide mb-1">Tools</span>
                    {[
                      { label: "Players", href: "/coach/coach-dashboard" },
                      { label: "Announcements", href: "/coach/coach-dashboard" },
                      { label: "Exercise Locations", href: "/coach/coach-dashboard" },
                      { label: "Sessions", href: "/coach/coach-dashboard" },
                      { label: "Team Licenses", href: "/coach/coach-dashboard" },
                      { label: "Reminders", href: "/coach/coach-dashboard" },
                      { label: "Player Submissions", href: "/coach/coach-dashboard" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => { setProfileMenuOpen(false); router.push(item.href); }}
                        className="text-[13px] py-2 sm:py-1.5 text-left text-[#3d3a4a] hover:text-[#8B5CF6] transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}

                    <div className="h-px bg-[#f0eef8] my-2" />

                    <button
                      onClick={() => { setProfileMenuOpen(false); router.replace("/team/teams"); }}
                      className="text-[13px] py-2 sm:py-1.5 text-left text-[#8B5CF6] font-medium hover:opacity-80 transition-opacity"
                    >
                      Switch to Player
                    </button>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        invalidateDashboardCache();
                        clearAuthSession();
                        localStorage.removeItem("user");
                        router.replace("/auth/login");
                      }}
                      className="text-[13px] py-2 sm:py-1.5 text-left text-[#e17055] font-medium hover:opacity-80 transition-opacity"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">

        {/* Title */}
        <div className="mb-5 flex items-center gap-3">
          {orgLogo && (
            <img
              src={orgLogo}
              alt={orgDisplayName ?? "Org"}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-sm border border-gray-100 shrink-0"
            />
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-orange-500">
              {orgDisplayName || "No Organisation Set Up"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {orgDisplayName ? "Manage your teams and track their progress" : "Set up your organisation to get started"}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        
        <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 shadow-sm">
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
            <div className="flex flex-col items-start gap-1">
              <button
                onClick={handleNewTeamClick}
                disabled={(teams.length === 0 && !teamPlanActivated) || teamsLeft === 0}
                title={
                  teamsLeft === 0
                    ? "You have 0 teams left on your package"
                    : teams.length === 0 && !teamPlanActivated
                    ? "Activate a plan first using Use Code"
                    : undefined
                }
                className="h-9 px-4 rounded-xl bg-[#8B5CF6] text-white text-sm font-semibold hover:bg-[#7C3AED] transition shadow-[0_4px_12px_rgba(139,92,246,0.3)] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + New Team
              </button>
              {teamsLeft === 0 && (
                <p className="text-xs text-red-500 font-medium">
                  You have 0 teams left on your package
                </p>
              )}
            </div>

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
              onClick={handleNewTeamClick}
              disabled={!teamPlanActivated || teamsLeft === 0}
              title={
                teamsLeft === 0
                  ? "You have 0 teams left on your package"
                  : !teamPlanActivated
                  ? "Activate a plan first using Use Code"
                  : undefined
              }
              className="h-11 px-6 rounded-2xl bg-[#8B5CF6] text-white text-sm font-semibold hover:bg-[#7C3AED] transition shadow-[0_6px_16px_rgba(139,92,246,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create a New Team
            </button>

            {teamsLeft === 0 && (
              <p className="text-sm text-red-500 font-medium">
                You have 0 teams left on your package
              </p>
            )}

            {!teamPlanActivated && (
              <>
                <div className="w-full border-t border-gray-100" />

                <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
                  You don&apos;t have any team plans yet. You can view/purchase team
                  plans or activate your plan using the code one of our reps has
                  given you below:
                </p>

                <div className="flex items-center gap-3">
                  <button disabled className="h-10 px-5 rounded-xl bg-[#f5f5f7] text-sm font-semibold text-gray-300 cursor-not-allowed">
                    View Plans
                  </button>
                  <button
                    onClick={() => setShowActivateModal(true)}
                    className="h-10 px-5 rounded-xl border border-[#8B5CF6] text-sm font-semibold text-[#8B5CF6] hover:bg-[#f5f0ff] transition"
                  >
                    Use Code
                  </button>
                </div>
              </>
            )}
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
                onClick={() => {
                  const params = new URLSearchParams({
                    team_name: team.name,
                    org_name: team.school ?? "",
                    owner_name: team.owner_name ?? "",
                    logo: team.logo ?? "",
                  });
                  router.push(`/coach/team/${team.id}?${params.toString()}`);
                }}
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
                      {team.school && (
                        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wide truncate leading-none mb-0.5">
                          {team.school}
                        </p>
                      )}
                      <h3 className="text-base sm:text-lg font-bold text-[#222] truncate">
                        {team.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {team.organization_type && (
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] text-[10px] font-semibold">
                            {team.organization_type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-start gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setInviteTeam(team)}
                      disabled={team.tagged_players_count >= 50}
                      title={team.tagged_players_count >= 50 ? "Team is full (50/50 players)" : "Invite player"}
                      className="w-9 h-9 rounded-full bg-[#f0fdf4] flex items-center justify-center text-green-500 hover:bg-green-100 hover:text-green-600 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#f0fdf4] disabled:hover:text-green-500"
                    >
                      <UserPlus size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmTeam(team)}
                      disabled={deletingId === team.id}
                      className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete team"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Bottom */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#8B5CF6] flex items-center justify-center">
                      <Users size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#222]">
                        {team.tagged_players_count}
                        <span className={team.tagged_players_count >= 50 ? "text-red-500 font-semibold" : "text-[#222] font-semibold"}>/50</span>
                      </p>
                      <p className="text-[11px]">
                        {team.tagged_players_count >= 50
                          ? <span className="text-red-500 font-semibold">Team Full</span>
                          : "players"
                        }
                      </p>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="relative w-9 h-9 rounded-full bg-[#f0f0ff] flex items-center justify-center text-[#8B5CF6] hover:bg-[#ede9fe] hover:text-[#7C3AED] transition"
                      title="Messages"
                    >
                      <MessageCircle size={16} />
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center leading-none">
                        3
                      </span>
                    </button>
                    <div>
                      <p className="text-sm font-semibold text-[#222]">3</p>
                      <p className="text-[11px] text-gray-500">new</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Floating Action Menu ── */}
      <div
        ref={fabRef}
        onMouseDown={onFabMouseDown}
        style={{
          position: "fixed",
          left: fabPos.x > 0 ? fabPos.x : "auto",
          right: fabPos.x > 0 ? "auto" : 16,
          top: fabPos.y > 0 ? fabPos.y : "auto",
          bottom: fabPos.y > 0 ? "auto" : 16,
          zIndex: 9999,
          userSelect: "none",
          width: 56,
          height: 56,
        }}
      >
        {/* Menu panel — absolutely above the bubble, right-aligned so it opens leftward */}
        {floatingOpen && (
          <div
            style={{ position: "absolute", bottom: "calc(100% + 10px)", right: 0 }}
            className="bg-[#2d1b69] rounded-2xl shadow-[0_8px_32px_rgba(45,27,105,0.4)] border border-purple-800/30 p-2 flex flex-col gap-0.5 w-[185px]"
          >
            {[
              { label: "All Teams", icon: Users, href: "/coach/coach-dashboard" },
              { label: "All Players", icon: UserPlus, href: "/coach/activity" },
              { label: "All Activities", icon: Target, href: "/coach/activity" },
            ].map(({ label, icon: Icon, href }) => (
              <button
                key={label}
                data-action="nav"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => { setFloatingOpen(false); router.push(href); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white/90 hover:text-white transition-colors text-sm font-medium w-full text-left"
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Purple bubble */}
        <button
          data-action="toggle"
          onClick={() => { if (wasDragged.current) { wasDragged.current = false; return; } setFloatingOpen((v) => !v); }}
          className="w-14 h-14 rounded-full bg-[#8B5CF6] flex items-center justify-center shadow-[0_8px_24px_rgba(139,92,246,0.5)] hover:bg-[#7C3AED] active:scale-95 transition-all"
        >
          {floatingOpen
            ? <X size={22} className="text-white" />
            : <SlidersHorizontal size={20} className="text-white" />
          }
        </button>
      </div>
    </div>
  );
}
