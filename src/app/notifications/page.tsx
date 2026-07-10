"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  AlertTriangle,
  RotateCcw,
  ChevronRight,
  Loader2,
  LucideIcon,
  Dumbbell,
  Check,
  Award,
} from "lucide-react";
import { notificationsApi, NotificationItem } from "@/api/notifications/route";

interface NotificationView {
  badge?: string;
  badgeClass?: string;
  showDot?: boolean;
  avatarInitials?: string;
  avatarClass?: string;
  icon?: LucideIcon;
  iconClass?: string;
  accentClass: string;
  actionLabel?: string;
  actionRoute?: string;
  actionClass?: string;
}

const PURPLE_BADGE = "bg-purple-100 text-[#6c5ce7]";
const AMBER_BADGE = "bg-amber-100 text-amber-600";
const GREEN_BADGE = "bg-green-100 text-green-600";

function extractMentionInitials(message: string): string | null {
  const match = message.match(/@([A-Za-z0-9_]+)/);
  if (!match) return null;
  return match[1].slice(0, 2).toUpperCase();
}

function actorInitials(n: NotificationItem): string | null {
  const handle = n.player?.username || n.user?.username || n.player?.name || n.user?.name;
  return handle ? handle.slice(0, 2).toUpperCase() : null;
}

function getNotificationMessage(n: NotificationItem): string {
  return n.message || n.body || n.description || "";
}

function getNotificationView(n: NotificationItem): NotificationView {
  const title = (n.title ?? "").toLowerCase();
  const type = (n.type ?? "").toLowerCase();
  const message = getNotificationMessage(n);

  const isActivity =
    type.includes("activity") ||
    title.includes("started a workout") ||
    title.includes("completed session") ||
    /@[A-Za-z0-9_]+/.test(message) ||
    Boolean(n.player || n.user);

  if (isActivity) {
    const initials = extractMentionInitials(message) ?? actorInitials(n);
    return {
      badge: "Activity",
      badgeClass: PURPLE_BADGE,
      showDot: true,
      avatarInitials: initials ?? undefined,
      avatarClass: "bg-[#6c5ce7]",
      icon: initials ? undefined : Dumbbell,
      iconClass: "bg-[#6c5ce7] text-white",
      accentClass: "border-l-4 border-[#6c5ce7]",
      actionLabel: title.includes("completed") ? "View Result" : "View Session",
      actionRoute: "/live-sessions",
      actionClass: PURPLE_BADGE,
    };
  }

  const isCompleted =
    type.includes("workout_completed") ||
    type.includes("session_completed") ||
    title.includes("activity completed") ||
    title.includes("workout completed");
  if (isCompleted) {
    return {
      badge: "Completed",
      badgeClass: GREEN_BADGE,
      icon: Check,
      iconClass: GREEN_BADGE,
      accentClass: "border-l-4 border-green-400",
      actionLabel: "View Progress",
      actionRoute: "/player-progress",
      actionClass: GREEN_BADGE,
    };
  }

  const isPoints = type.includes("points") || title.includes("points earned") || title.includes("pro points");
  if (isPoints) {
    return {
      badge: "Points",
      badgeClass: AMBER_BADGE,
      icon: Award,
      iconClass: AMBER_BADGE,
      accentClass: "border-l-4 border-amber-400",
      actionLabel: "View History",
      actionRoute: "/points",
      actionClass: AMBER_BADGE,
    };
  }

  const isMissed = type.includes("missed") || title.includes("missed") || title.includes("reschedule");
  if (isMissed) {
    return {
      badge: "Missed",
      badgeClass: AMBER_BADGE,
      icon: RotateCcw,
      iconClass: AMBER_BADGE,
      accentClass: "border-l-4 border-amber-400",
      actionLabel: "Reschedule",
      actionRoute: "/checklist/missed-activity",
      actionClass: AMBER_BADGE,
    };
  }

  const isUrgent =
    type.includes("urgent") ||
    type.includes("overdue") ||
    title.includes("overdue") ||
    title.includes("player card");
  if (isUrgent) {
    return {
      badge: "Urgent",
      badgeClass: AMBER_BADGE,
      icon: AlertTriangle,
      iconClass: AMBER_BADGE,
      accentClass: "border-l-4 border-amber-400",
      actionLabel: "Submit Now",
      actionRoute: "/player-cards",
      actionClass: AMBER_BADGE,
    };
  }

  return {
    icon: Bell,
    iconClass: "bg-[#6c5ce7]/10 text-[#6c5ce7]",
    accentClass: "border-l-4 border-[#6c5ce7]/30",
  };
}

function formatClockTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatRelative(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 10) return `${diffHr}h ago`;

  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);
  const time = formatClockTime(date);

  if (diffDays === 0) return `Today ${time}`;
  if (diffDays === 1) return `Yesterday ${time}`;
  if (diffDays < 7) return `${date.toLocaleDateString(undefined, { weekday: "short" })} ${time}`;
  return `${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ${time}`;
}

function groupLabel(dateStr?: string): string {
  if (!dateStr) return "EARLIER";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "EARLIER";
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);
  if (diffDays === 0) return "TODAY";
  if (diffDays === 1) return "YESTERDAY";
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
}

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const isRead = (n: NotificationItem) => Boolean(n.is_read ?? n.read ?? false);

  const load = async (pageNum: number) => {
    const res = await notificationsApi.getNotifications(pageNum, 20);
    setItems((prev) => (pageNum === 1 ? res.notifications : [...prev, ...res.notifications]));
    setHasMore(Boolean(res.hasMore));
    setPage(pageNum);
  };

  useEffect(() => {
    load(1).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      await load(page + 1);
    } catch {
    } finally {
      setLoadingMore(false);
    }
  };

  const markOneAsRead = async (id: number) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true, read: true } : n)));
    try {
      await notificationsApi.markAsRead(id);
    } catch {}
  };

  const handleAction = (n: NotificationItem, route: string) => {
    if (!isRead(n)) markOneAsRead(n.id);
    router.push(route);
  };

  const groups = useMemo(() => {
    const map = new Map<string, NotificationItem[]>();
    for (const n of items) {
      const label = groupLabel(n.created_at || n.timestamp || n.date);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(n);
    }
    return Array.from(map.entries());
  }, [items]);

  return (
    <div className="min-h-screen bg-[#f5f4fa]">
      <div className="sticky top-0 z-40 bg-[#6c5ce7] px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition"
        >
          <ArrowLeft size={18} />
        </button>
        <Bell size={18} className="text-white" />
        <h1 className="font-bold text-[16px] text-white flex-1">Notifications</h1>
      </div>

      <div className="max-w-xl mx-auto px-4 py-5">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-[#f1eefe] flex items-center justify-center mb-3">
              <Bell size={22} className="text-[#6c5ce7]" />
            </div>
            <p className="text-gray-500 text-sm">No notifications yet</p>
          </div>
        ) : (
          <>
            {groups.map(([label, groupItems]) => (
              <div key={label} className="mb-6">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[11px] font-bold text-gray-400 tracking-wide">{label}</span>
                  <span className="text-[12px] font-bold text-gray-500">{groupItems.length}</span>
                </div>

                <div className="space-y-3">
                  {groupItems.map((n) => {
                    const view = getNotificationView(n);
                    const Icon = view.icon;

                    return (
                      <div
                        key={n.id}
                        className={`bg-white rounded-2xl p-4 shadow-sm ${view.accentClass} ${
                          isRead(n) ? "opacity-70" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {view.avatarInitials ? (
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[11px] font-bold ${view.avatarClass}`}
                              >
                                {view.avatarInitials}
                              </div>
                            ) : Icon ? (
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${view.iconClass}`}
                              >
                                <Icon size={15} />
                              </div>
                            ) : null}
                            {view.badge && (
                              <span
                                className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${view.badgeClass}`}
                              >
                                {view.badge}
                                {view.showDot && <span className="w-1.5 h-1.5 rounded-full bg-[#6c5ce7]" />}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400">
                            {formatRelative(n.created_at || n.timestamp || n.date)}
                          </span>
                        </div>

                        {n.title && (
                          <p className="text-[14px] font-bold text-gray-900">{n.title}</p>
                        )}
                        {getNotificationMessage(n) && (
                          <p className="text-[13px] text-gray-500 mt-1">{getNotificationMessage(n)}</p>
                        )}
                        {view.actionLabel && view.actionRoute && (
                          <button
                            onClick={() => handleAction(n, view.actionRoute!)}
                            className={`mt-3 inline-flex items-center gap-1 text-[13px] font-bold px-3 py-1.5 rounded-full ${view.actionClass} hover:brightness-95 transition`}
                          >
                            {view.actionLabel}
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full py-3 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-white transition disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
