"use client";

import { useState } from "react";
import { feedApi } from "@/api/feed/route";

export function useFeedLike(feedId: string, initialLiked: boolean, initialCount: number) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  const toggle = async () => {
    if (!feedId || pending) return;
    const wasLiked = liked;

    setLiked(!wasLiked);
    setCount((c) => (wasLiked ? c - 1 : c + 1));
    setPending(true);

    try {
      if (wasLiked) {
        await feedApi.unlikeFeed(feedId);
      } else {
        await feedApi.likeFeed(feedId);
      }
    } catch {
      setLiked(wasLiked);
      setCount((c) => (wasLiked ? c + 1 : c - 1));
    } finally {
      setPending(false);
    }
  };

  return { liked, count, toggle, pending };
}
