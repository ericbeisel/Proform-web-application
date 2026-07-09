"use client";

import { useState } from "react";
import {
  Users,
  BarChart2,
  Zap,
  MapPin,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";

const NAV_ITEMS: { label: string; Icon: LucideIcon }[] = [
  { label: "Results", Icon: BarChart2 },
  { label: "Session", Icon: Users },
  { label: "Powersets", Icon: Zap },
  { label: "Map", Icon: MapPin },
];

type Props = {
  // athenaWorkout wants the collapse-to-icon-rail toggle; viewWorkoutSession
  // stays a fixed-width static sidebar (matches its original behavior).
  collapsible?: boolean;
  title: string;
  subtitle: string;
  progressPercent: number;
  activeView: string;
  onNavClick: (label: string) => void;
  bottomLabel: string;
  onBottomClick: () => void;
  bottomDisabled?: boolean;
  BottomIcon: LucideIcon;
  // Play's original "Start Workout"/"Train Session" rendering used a solid
  // triangle (fill="currentColor"); Home (Overview) never did — preserve
  // that distinction instead of flattening both to the same outline icon.
  bottomIconFilled?: boolean;
};

export default function WorkoutSidebar({
  collapsible = false,
  title,
  subtitle,
  progressPercent,
  activeView,
  onNavClick,
  bottomLabel,
  onBottomClick,
  bottomDisabled = false,
  BottomIcon,
  bottomIconFilled = false,
}: Props) {
  // Collapsible sidebars (athenaWorkout) start collapsed; the static
  // variant (viewWorkoutSession) is always effectively open regardless.
  const [open, setOpen] = useState(!collapsible);
  const isOpen = !collapsible || open;

  return (
    <div
      className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 bg-gradient-to-b from-[#8b5cf6] to-[#6d28d9] text-white overflow-hidden ${isOpen ? "w-[220px]" : "w-12"}`}
    >
      {collapsible && (
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center w-full py-3 hover:bg-white/10 transition flex-shrink-0"
        >
          {open ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
      )}

      {isOpen ? (
        <div className={`flex flex-col flex-1 ${collapsible ? "px-4 pb-4 overflow-hidden" : "p-6"}`}>
          <div className={`bg-white/10 rounded-[20px] p-4 ${collapsible ? "mb-6" : "mb-8 rounded-[24px]"}`}>
            <h2 className="text-[11px] font-black leading-tight uppercase tracking-wide truncate">
              {title}
            </h2>
            <p className="text-[10px] uppercase mt-1 opacity-70">{subtitle}</p>
            <div className="mt-4 h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-right text-[10px] mt-2 font-bold">{progressPercent}%</div>
          </div>

          <div className={collapsible ? "space-y-2" : "space-y-3"}>
            {NAV_ITEMS.map(({ label, Icon }) => (
              <button
                key={label}
                onClick={() => onNavClick(label)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  activeView === label ? "bg-white text-[#7c3aed]" : "bg-white/10 hover:bg-white/20"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={onBottomClick}
            disabled={bottomDisabled}
            className={`mt-auto py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition ${
              bottomDisabled ? "bg-white/20 text-white/40 cursor-not-allowed" : "bg-white text-[#7c3aed] hover:bg-white/90"
            }`}
          >
            <BottomIcon size={16} {...(bottomIconFilled ? { fill: "currentColor" } : {})} />
            {bottomLabel}
          </button>
        </div>
      ) : (
        <div className="flex flex-col flex-1 items-center gap-2 pt-2 px-1 pb-4">
          {NAV_ITEMS.map(({ label, Icon }) => (
            <button
              key={label}
              title={label}
              onClick={() => { onNavClick(label); setOpen(true); }}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition ${
                activeView === label ? "bg-white text-[#7c3aed]" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              <Icon size={16} />
            </button>
          ))}

          <button
            title={bottomLabel}
            onClick={onBottomClick}
            disabled={bottomDisabled}
            className={`mt-auto w-9 h-9 flex items-center justify-center rounded-xl transition ${
              bottomDisabled ? "bg-white/20 text-white/40 cursor-not-allowed" : "bg-white text-[#7c3aed] hover:bg-white/90"
            }`}
          >
            <BottomIcon size={16} {...(bottomIconFilled ? { fill: "currentColor" } : {})} />
          </button>
        </div>
      )}
    </div>
  );
}
