"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Heart, Send, X } from "lucide-react";
import { getAuthUser, getUserIdFromToken } from "@/lib/auth/session";
import { feedApi } from "@/api/feed/route";
import { useFeedLike } from "@/hooks/useFeedLike";
import FeedComments from "@/components/FeedComments";

const getImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("wix:image://v1/")) {
    const match = imageUrl.match(/wix:image:\/\/v1\/([^/]+)/);
    if (match?.[1]) return `/api/image-proxy/media/${match[1]}`;
  }
  if (imageUrl.match(/^[a-f0-9_]+~mv2/i)) return `/api/image-proxy/media/${imageUrl}`;
  if (imageUrl.includes("static.wixstatic.com/media/")) {
    const path = imageUrl.replace("https://static.wixstatic.com/", "");
    return `/api/image-proxy/${path}`;
  }
  return imageUrl;
};

// A recovery record has no like/comment endpoints of its own — but completing
// one also posts a "CompleteRecovery" Feed item, and that Feed item is fully
// likeable/commentable. We resolve this record's matching feed post via
// Feed.activity_id (the same field workouts use to point back at their
// session) so likes/comments here hit the real, persisted feed APIs.
const FEED_LOOKUP_MAX_PAGES = 5;

function LikeButton({
  feedId,
  initialLiked,
  initialLikeCount,
}: {
  feedId: string;
  initialLiked: boolean;
  initialLikeCount: number;
}) {
  const { liked, count, toggle, pending } = useFeedLike(feedId, initialLiked, initialLikeCount);
  return (
    <button
      onClick={toggle}
      disabled={pending}
      className="flex items-center gap-1.5 text-[#8b5cf6] disabled:opacity-60 transition"
    >
      <Heart size={18} className={liked ? "fill-[#8b5cf6]" : ""} />
      <span className="text-sm font-semibold">{count}</span>
    </button>
  );
}

type FeedLookup =
  | { status: "loading" }
  | { status: "found"; feedId: string; liked: boolean; likeCount: number }
  | { status: "not-found" };

interface LocalComment {
  id: string;
  text: string;
}

// No Feed post exists yet for this recovery record (backend doesn't create
// one on completion the way it does for workouts), so there's nothing for
// the real like/comment APIs to attach to. Until that's added server-side,
// this gives an interactive-but-unpersisted stand-in so the page isn't dead.
function LocalLikeButton() {
  const [liked, setLiked] = useState(false);
  return (
    <button
      onClick={() => setLiked((v) => !v)}
      className="flex items-center gap-1.5 text-[#8b5cf6] transition"
    >
      <Heart size={18} className={liked ? "fill-[#8b5cf6]" : ""} />
      <span className="text-sm font-semibold">{liked ? 1 : 0}</span>
    </button>
  );
}

function LocalComments() {
  const [comments, setComments] = useState<LocalComment[]>([]);
  const [inputOpen, setInputOpen] = useState(false);
  const [input, setInput] = useState("");

  const submit = () => {
    if (!input.trim()) return;
    setComments((prev) => [{ id: `${prev.length}-${Date.now()}`, text: input.trim() }, ...prev]);
    setInput("");
    setInputOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[15px] font-bold text-gray-900">
          Comments:
          {comments.length > 0 && (
            <span className="text-gray-400 font-normal ml-1 text-[13px]">({comments.length})</span>
          )}
        </p>
        {!inputOpen && (
          <button
            onClick={() => setInputOpen(true)}
            className="text-[13px] font-semibold text-purple-600 hover:text-purple-700 transition"
          >
            Add a Comment
          </button>
        )}
      </div>

      {inputOpen && (
        <div className="mb-5 space-y-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setInputOpen(false);
                setInput("");
              }
            }}
            placeholder="Write a comment…"
            rows={3}
            autoFocus
            className="w-full resize-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition placeholder:text-gray-400"
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => {
                setInputOpen(false);
                setInput("");
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-gray-400 hover:text-gray-600 transition"
            >
              <X size={13} /> Cancel
            </button>
            <button
              onClick={submit}
              disabled={!input.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-[12px] font-semibold transition"
            >
              <Send size={13} /> Send
            </button>
          </div>
        </div>
      )}

      {comments.length === 0 ? (
        <p className="text-[13px] text-gray-400 py-2">There are no comments yet.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-semibold text-purple-600">You</span>
                <p className="text-[13px] text-gray-700 leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RecoveryRecordDetailPage() {
  const router = useRouter();
  const routeParams = useParams();
  const searchParams = useSearchParams();
  const recordId = String(routeParams.id || "");

  const title = searchParams.get("title") || "Recovery Session";
  const timeSpent = searchParams.get("time") || "0";
  const date = searchParams.get("date") || "";
  const image = searchParams.get("image") || "";

  // getAuthUser()/getUserIdFromToken() read localStorage, which the server
  // can't see — reading them directly during render would make the server
  // HTML ("You") mismatch the client's real value ("@aarya"). Defer to an
  // effect so the initial client render matches the server, then swap in.
  const [profile, setProfile] = useState<{ name: string; username: string; image: string } | null>(null);
  const userName = profile?.name || "You";
  const userUsername = profile?.username || "";
  const userImage = profile?.image || "";

  const [feedLookup, setFeedLookup] = useState<FeedLookup>({ status: "loading" });

  useEffect(() => {
    const user = getAuthUser();
    setProfile({
      name: (user?.name as string) || (user?.username as string) || "You",
      username: (user?.username as string) || "",
      image: (user?.image as string) || "",
    });
  }, []);

  useEffect(() => {
    if (!recordId) {
      setFeedLookup({ status: "not-found" });
      return;
    }
    const currentUserId = getUserIdFromToken();
    let cancelled = false;

    (async () => {
      for (let page = 1; page <= FEED_LOOKUP_MAX_PAGES; page++) {
        let res;
        try {
          res = await feedApi.getFeed(page);
        } catch {
          break;
        }
        const match = res.feeds?.find(
          (f) =>
            f.type === "CompleteRecovery" &&
            (String(f.activity_id) === recordId || String((f as any).othertable_id) === recordId),
        );
        if (match) {
          if (!cancelled) {
            setFeedLookup({
              status: "found",
              feedId: String(match.id),
              liked: currentUserId != null && (match.likes || []).some((l) => String(l) === String(currentUserId)),
              likeCount: match.likeCount ?? (match.likes || []).length,
            });
          }
          return;
        }
        if (!res.feeds || res.feeds.length === 0) break;
      }
      if (!cancelled) setFeedLookup({ status: "not-found" });
    })();

    return () => {
      cancelled = true;
    };
  }, [recordId]);

  const formatDate = (d: string) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return d;
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f8] pb-10">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center hover:bg-purple-700 transition"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <h1 className="font-bold text-[16px] text-gray-900 truncate flex-1">Recovery Session</h1>
      </div>

      <div className="px-4 py-6 max-w-xl mx-auto space-y-5">
        {/* User + like row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center overflow-hidden flex-shrink-0">
              {userImage ? (
                <img src={userImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm font-bold">{userName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <p className="text-[13px] text-gray-500">
                {userUsername ? <span className="font-semibold text-gray-800">@{userUsername}</span> : userName} completed
              </p>
              <p className="text-[15px] font-bold text-gray-900">{title}</p>
            </div>
          </div>

          {feedLookup.status === "found" ? (
            <LikeButton
              feedId={feedLookup.feedId}
              initialLiked={feedLookup.liked}
              initialLikeCount={feedLookup.likeCount}
            />
          ) : feedLookup.status === "loading" ? (
            <div className="flex items-center gap-1.5 text-gray-300">
              <Heart size={18} />
              <span className="text-sm font-semibold">…</span>
            </div>
          ) : (
            <LocalLikeButton />
          )}
        </div>

        {/* Cover image */}
        {image && (
          <div className="w-full h-48 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center p-4">
            <img
              src={getImageUrl(image)}
              alt={title}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        {date && <p className="text-[12px] text-gray-400">{formatDate(date)}</p>}

        {/* Results */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Results:</p>
          <div className="border border-gray-200 rounded-2xl py-8 flex flex-col items-center justify-center">
            <p className="text-4xl font-extrabold text-gray-900">{timeSpent}</p>
            <p className="text-[13px] text-gray-400 mt-1">Minutes</p>
          </div>
          <p className="text-center text-gray-500 text-[13px] mt-4">{title}</p>
        </div>

        {/* Comments */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
          {feedLookup.status === "loading" && (
            <p className="text-[13px] text-gray-400 py-2">Loading comments…</p>
          )}
          {feedLookup.status === "found" && <FeedComments feedId={feedLookup.feedId} />}
          {feedLookup.status === "not-found" && <LocalComments />}
        </div>
      </div>
    </div>
  );
}
