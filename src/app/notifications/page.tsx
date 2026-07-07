"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Check, Loader2 } from "lucide-react";
import { notificationsApi, NotificationItem } from "@/api/notifications/route";

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

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

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await notificationsApi.markAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true, read: true })));
    } catch {} finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0eff4]">
      <div className="sticky top-0 z-40 bg-white border-b border-[#e8e6f0] px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-[#f1eefe] flex items-center justify-center text-[#6c5ce7] hover:bg-[#e6e0fd] transition"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-bold text-[16px] text-gray-900 flex-1">Notifications</h1>
        <button
          onClick={markAllAsRead}
          disabled={markingAll || items.every(isRead)}
          className="text-[13px] font-semibold text-[#6c5ce7] hover:text-[#5b4bd4] disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Mark all as read
        </button>
      </div>

      <div className="max-w-xl mx-auto px-4 py-5 space-y-3">
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
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => !isRead(n) && markOneAsRead(n.id)}
                className={`w-full text-left flex items-start gap-3 p-4 rounded-2xl border transition ${
                  isRead(n)
                    ? "bg-white border-gray-100"
                    : "bg-[#f1eefe] border-[#e6e0fd] hover:bg-[#e6e0fd]"
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-[#6c5ce7]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bell size={15} className="text-[#6c5ce7]" />
                </div>
                <div className="flex-1 min-w-0">
                  {n.title && (
                    <p className="text-[14px] font-semibold text-gray-900">{n.title}</p>
                  )}
                  {(n.message || n.body) && (
                    <p className="text-[13px] text-gray-600 mt-0.5">{n.message || n.body}</p>
                  )}
                  {n.created_at && (
                    <p className="text-[11px] text-gray-400 mt-1">{n.created_at}</p>
                  )}
                </div>
                {!isRead(n) && (
                  <span className="w-2 h-2 rounded-full bg-[#6c5ce7] flex-shrink-0 mt-2" />
                )}
                {isRead(n) && (
                  <Check size={14} className="text-gray-300 flex-shrink-0 mt-2" />
                )}
              </button>
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
