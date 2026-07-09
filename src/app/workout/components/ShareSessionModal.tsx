"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { generateSessionShareLink, inviteToSession } from "@/api/workouts/route";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
};

// Exact port of mobile's ShareSessionModal: header + session-id subtitle, QR
// code, Invite via Link, Invite via Email. Self-contained — only driven by
// isOpen/sessionId, same as mobile's isVisible/sessionId props.
export default function ShareSessionModal({ isOpen, onClose, sessionId }: Props) {
  const [shareSessionUrl, setShareSessionUrl] = useState("");
  const [shareLinkLoading, setShareLinkLoading] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setShareLinkCopied(false);
    setShareEmail("");
    if (!sessionId) return;
    let cancelled = false;
    setShareLinkLoading(true);
    generateSessionShareLink(sessionId)
      .then((url) => {
        if (cancelled) return;
        // The backend's own domain (e.g. the onrender.com host) shouldn't
        // be shown to users — always rewrite to the paxlete.com origin,
        // keeping whatever path/query the backend returned.
        const path = url ? url.replace(/^https?:\/\/[^/]+/, "") : `/workout/viewWorkoutSession?sessionId=${sessionId}`;
        setShareSessionUrl(`https://paxlete.com${path}`);
      })
      .catch(() => {
        if (!cancelled) setShareSessionUrl(`https://paxlete.com/workout/viewWorkoutSession?sessionId=${sessionId}`);
      })
      .finally(() => {
        if (!cancelled) setShareLinkLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, sessionId]);

  const handleCopyShareLink = () => {
    if (!shareSessionUrl) return;
    navigator.clipboard.writeText(shareSessionUrl);
    setShareLinkCopied(true);
    setTimeout(() => setShareLinkCopied(false), 2000);
    window.alert("Link Copied\nSession URL has been copied to your clipboard!");
  };

  const handleSendShareInvite = async () => {
    if (!shareEmail) return;
    if (!/\S+@\S+\.\S+/.test(shareEmail)) {
      window.alert("Invalid Email\nPlease enter a valid email address.");
      return;
    }
    setSendingInvite(true);
    try {
      await inviteToSession(sessionId, shareEmail);
      window.alert(`Invite Sent\nAn invitation has been successfully sent to ${shareEmail}`);
      setShareEmail("");
    } catch (err) {
      window.alert(`Error\n${err instanceof Error ? err.message : "Failed to send invite email. Please try again."}`);
    } finally {
      setSendingInvite(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm max-h-[90vh] rounded-[28px] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[20px] font-black text-[#8B5CF6]">Share This Session:</h2>
              <p className="text-[12px] text-gray-400 mt-0.5">
                Session ID: {sessionId.slice(0, 8) || "pending"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition ml-3 shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-6 pb-8 overflow-y-auto flex flex-col gap-6">
          {/* Scan code */}
          <div className="w-full bg-[#F9FAFB] rounded-[20px] p-6 flex flex-col items-center">
            <div className="bg-white rounded-[20px] p-4 border-[2.5px] border-[#8B5CF6] shadow-sm flex items-center justify-center w-[162px] h-[162px] mb-4">
              {shareLinkLoading || !shareSessionUrl ? (
                <Loader2 size={32} className="animate-spin text-[#8B5CF6]" />
              ) : (
                <QRCodeSVG value={shareSessionUrl} size={130} />
              )}
            </div>
            <p className="text-[13px] text-gray-500 text-center">Scan this code to join the session</p>
          </div>

          {/* Invite via Link */}
          <div className="w-full">
            <p className="text-[15px] font-black text-[#111827] mb-3">Invite via Link</p>
            <div className="bg-[#F9FAFB] rounded-2xl p-3 flex flex-col gap-3">
              <div className="bg-white border border-gray-200 rounded-xl px-4 h-12 flex items-center">
                {shareLinkLoading ? (
                  <Loader2 size={16} className="animate-spin text-[#8B5CF6]" />
                ) : (
                  <p className="text-[13px] text-gray-500 truncate">{shareSessionUrl || "Generating link..."}</p>
                )}
              </div>
              <button
                onClick={handleCopyShareLink}
                disabled={shareLinkLoading || !shareSessionUrl}
                className="w-full h-12 rounded-xl bg-[#3B82F6] text-white text-[15px] font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-200 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed transition"
              >
                {shareLinkCopied ? <Check size={18} /> : <Copy size={18} />}
                {shareLinkCopied ? "Copied" : "Copy URL"}
              </button>
            </div>
          </div>

          {/* Invite via Email */}
          <div className="w-full">
            <p className="text-[15px] font-black text-[#111827] mb-3">Invite via Email</p>
            <div className="bg-[#F9FAFB] rounded-2xl p-3 flex flex-col gap-3">
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="Enter athlete's email"
                autoCapitalize="none"
                className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-[14px] text-gray-800 placeholder-gray-400 outline-none focus:border-[#8B5CF6] transition"
              />
              <button
                onClick={handleSendShareInvite}
                disabled={sendingInvite || !shareEmail}
                className="w-full h-12 rounded-xl bg-[#8B5CF6] text-white text-[15px] font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-200 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed transition"
              >
                {sendingInvite && <Loader2 size={18} className="animate-spin" />}
                Send Invite
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
