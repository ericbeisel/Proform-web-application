"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2, ChevronDown, X } from "lucide-react";
import { feedApi, FeedComment } from "@/api/feed/route";

interface Props {
  feedId: string;
  onCommentAdded?: () => void;
}

function formatCommentTime(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const date = d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${date} ${time}`;
  } catch {
    return "";
  }
}

export default function FeedComments({ feedId, onCommentAdded }: Props) {
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [inputOpen, setInputOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLoading(true);
    feedApi.getFeedComments(feedId, 1).then(({ comments, total, hasMore }) => {
      setComments(comments);
      setTotal(total);
      setHasMore(hasMore);
      setPage(1);
    }).finally(() => setLoading(false));
  }, [feedId]);

  const openInput = () => {
    setInputOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const loadMore = async () => {
    const next = page + 1;
    setLoadingMore(true);
    const { comments: more, hasMore: moreAvail } = await feedApi.getFeedComments(feedId, next);
    setComments(prev => [...prev, ...more]);
    setHasMore(moreAvail);
    setPage(next);
    setLoadingMore(false);
  };

  const submit = async () => {
    if (!input.trim() || submitting) return;
    setSubmitting(true);
    const text = input.trim();
    setInput("");
    setInputOpen(false);
    const tempComment: FeedComment = {
      id: `temp-${Date.now()}`,
      text,
      comment: text,
      created_at: new Date().toISOString(),
    };
    setComments(prev => [tempComment, ...prev]);
    setTotal(t => t + 1);
    onCommentAdded?.();
    const added = await feedApi.addFeedComment(feedId, text);
    if (added && added.id !== tempComment.id) {
      setComments(prev => prev.map(c => c.id === tempComment.id ? added : c));
    }
    setSubmitting(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[15px] font-bold text-gray-900">
          Comments:{total > 0 && <span className="text-gray-400 font-normal ml-1 text-[13px]">({total})</span>}
        </p>
        {!inputOpen && (
          <button
            onClick={openInput}
            className="text-[13px] font-semibold text-purple-600 hover:text-purple-700 transition"
          >
            Add a Comment
          </button>
        )}
      </div>

      {/* Textarea input */}
      {inputOpen && (
        <div className="mb-5 space-y-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Escape") { setInputOpen(false); setInput(""); } }}
            placeholder="Write a comment…"
            rows={3}
            className="w-full resize-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition placeholder:text-gray-400"
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => { setInputOpen(false); setInput(""); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-gray-400 hover:text-gray-600 transition"
            >
              <X size={13} /> Cancel
            </button>
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={submit}
              disabled={!input.trim() || submitting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-[12px] font-semibold transition"
            >
              {submitting
                ? <><Loader2 size={13} className="animate-spin" /> Sending…</>
                : <><Send size={13} /> Send</>}
            </button>
          </div>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 size={18} className="text-purple-400 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-[13px] text-gray-400 py-2">No comments yet.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {c.user?.image ? (
                  <img src={c.user.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-[12px] font-bold">
                    {(c.user?.username || c.user?.name || "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[13px] font-semibold text-purple-600">
                    {c.user ? `@${c.user.username || c.user.name}` : "You"}
                  </span>
                  {c.created_at && (
                    <span className="text-[11px] text-gray-400 flex-shrink-0">{formatCommentTime(c.created_at)}</span>
                  )}
                </div>
                <p className="text-[13px] text-gray-700 leading-relaxed">{c.text || c.comment}</p>
              </div>
            </div>
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-purple-600 py-1 transition"
            >
              {loadingMore ? <Loader2 size={13} className="animate-spin" /> : <ChevronDown size={13} />}
              {loadingMore ? "Loading…" : `Load more (${total - comments.length} remaining)`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
