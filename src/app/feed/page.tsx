// src/app/feed/page.tsx
import { redirect } from "next/navigation";

export default function FeedPage() {
  // Redirect to main-feed since that's where the actual content is
  redirect("/feed/main-feed");
}