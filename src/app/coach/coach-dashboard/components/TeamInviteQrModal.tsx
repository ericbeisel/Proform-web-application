"use client";

import { useEffect, useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { coachApi } from "@/api/coach/route";

interface InviteTeamInfo {
  id: string;
  name: string;
  logo?: string | null;
  owner_name?: string | null;
  school?: string | null;
  unique_code?: string | null;
  invite_link?: string | null;
}

interface TeamInviteQrModalProps {
  team: InviteTeamInfo;
  onClose: () => void;
}

export function TeamInviteQrModal({ team, onClose }: TeamInviteQrModalProps) {
  const [inviteUrl, setInviteUrl] = useState("");
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoadingInvite(true);
    coachApi.getTeamInvite(team.id)
      .then((info) => {
        const origin = typeof window !== "undefined" ? window.location.origin : "https://proformapp-web.onrender.com";
        const extractCode = (link?: string | null) => (link ? link.split("/").filter(Boolean).pop() ?? "" : "");
        const code =
          info.unique_code ||
          extractCode(info.invite_link) ||
          team.unique_code ||
          extractCode(team.invite_link) ||
          "";
        const params = new URLSearchParams({
          code,
          team_id: team.id,
          team_name: info.name ?? team.name,
          org_name: info.institution?.title ?? team.school ?? "",
          owner_name: info.owner ?? team.owner_name ?? "",
        });
        setInviteUrl(`${origin}/player/team-invite?${params.toString()}`);
      })
      .catch(() => {
        const origin = typeof window !== "undefined" ? window.location.origin : "https://proformapp-web.onrender.com";
        const extractCode = (link?: string | null) => (link ? link.split("/").filter(Boolean).pop() ?? "" : "");
        const params = new URLSearchParams({
          code: team.unique_code || extractCode(team.invite_link) || "",
          team_id: team.id,
          team_name: team.name,
          org_name: team.school ?? "",
          owner_name: team.owner_name ?? "",
        });
        setInviteUrl(`${origin}/player/team-invite?${params.toString()}`);
      })
      .finally(() => setLoadingInvite(false));
  }, [team.id, team.name, team.owner_name, team.school, team.unique_code, team.invite_link]);

  function handleCopyUrl() {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl p-5 sm:p-6 flex flex-col gap-5 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {team.logo ? (
              <img src={team.logo} alt={team.name} className="w-12 h-12 rounded-2xl object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6] flex items-center justify-center text-white font-bold text-lg">
                {team.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              {team.owner_name && (
                <p className="text-[11px] font-semibold text-orange-500 uppercase">{team.owner_name}</p>
              )}
              <h3 className="text-base font-bold text-[#222]">{team.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
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
            onClick={handleCopyUrl}
            className="h-12 rounded-2xl bg-[#8B5CF6] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#7C3AED] transition shadow-[0_6px_16px_rgba(139,92,246,0.35)]"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy URL"}
          </button>
        </div>
      </div>
    </div>
  );
}
