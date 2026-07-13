"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Rss, ChevronRight, Calendar, Activity, Users, Menu, X } from "lucide-react";

const navItems = [
  { label: "Feed",      icon: Rss,          href: "/feed/main-feed" },
  { label: "Next",      icon: ChevronRight, href: "/dashboard" },
  { label: "Itinerary", icon: Calendar,     href: "/itinerary/itinerary-page" },
  { label: "Metrics",   icon: Activity,     href: "/metrics" },
  { label: "Teams",     icon: Users,        href: "/team/teams" },
];

const BUBBLE_SIZE = 36;
const MARGIN = 16;

export default function FloatingNavBubble() {
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  const clamp = (x: number, y: number) => ({
    x: Math.min(Math.max(MARGIN, x), window.innerWidth - BUBBLE_SIZE - MARGIN),
    y: Math.min(Math.max(MARGIN, y), window.innerHeight - BUBBLE_SIZE - MARGIN),
  });

  const startDrag = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    draggingRef.current = true;
    movedRef.current = false;
    offsetRef.current = { x: clientX - rect.left, y: clientY - rect.top };
  };

  useEffect(() => {
    const onResize = () => {
      setPosition((prev) => (prev ? clamp(prev.x, prev.y) : prev));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onMove = (clientX: number, clientY: number) => {
      if (!draggingRef.current) return;
      movedRef.current = true;
      setPosition(clamp(clientX - offsetRef.current.x, clientY - offsetRef.current.y));
    };
    const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onMove(t.clientX, t.clientY);
    };
    const stopDrag = () => { draggingRef.current = false; };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", stopDrag);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", stopDrag);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isOpen]);

  const isActive = (href: string | null) =>
    !!href && (pathname === href || pathname.startsWith(`${href}/`));

  const handleBubbleClick = () => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    setIsOpen((v) => !v);
  };

  const style = position
    ? { left: position.x, top: position.y, right: "auto", bottom: "auto" }
    : undefined;

  if (pathname?.startsWith("/coach")) return null;

  // The workout session view has its own fixed mobile bottom nav bar
  // (Results/Session/Powersets/Map/Start) once a session is active — sitting
  // at the default bottom-5 would overlap its rightmost "Start" tab. Raise the
  // bubble clear of that bar on mobile only; desktop never shows that bar.
  const isOnSessionNavPage = pathname?.startsWith("/workout/viewWorkoutSession");
  // The workout detail page has its own fixed centered "View Workout" pill
  // at bottom-6 — line the bubble's vertical center up with that button
  // (at every size, since that button isn't mobile-only) instead of the
  // default bottom-5.
  const isOnWorkoutDetailPage = pathname?.startsWith("/workout/detail");

  return (
    <div
      ref={containerRef}
      className={`fixed z-[100] right-5 select-none ${
        isOnSessionNavPage
          ? "bottom-20 lg:bottom-5"
          : isOnWorkoutDetailPage
            ? "bottom-8"
            : "bottom-5"
      }`}
      style={style}
    >
      {isOpen && (
        <div className="absolute bottom-[44px] right-0 w-40 bg-white rounded-2xl shadow-2xl border border-[#e8e6f0] py-1.5 flex flex-col">
          {navItems.map(({ label, icon: Icon, href }) => (
            <button
              key={label}
              onClick={() => {
                setIsOpen(false);
                if (href) router.push(href);
              }}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                isActive(href)
                  ? "text-[#6c5ce7] bg-[#f1eefe]"
                  : "text-[#4a4658] hover:bg-[#f7f6fb]"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      )}

      <button
        onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
        onTouchStart={(e) => {
          const t = e.touches[0];
          if (t) startDrag(t.clientX, t.clientY);
        }}
        onClick={handleBubbleClick}
        aria-label="Quick navigation"
        className="w-9 h-9 rounded-full bg-[#6c5ce7] text-white shadow-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all cursor-grab active:cursor-grabbing"
      >
        {isOpen ? <X size={15} /> : <Menu size={15} />}
      </button>
    </div>
  );
}
