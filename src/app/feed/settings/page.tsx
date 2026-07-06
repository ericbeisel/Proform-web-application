"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, SlidersHorizontal, Check, Loader2,
  Dumbbell, Activity, Heart, Droplets,
  Mail, Bell, BellOff, ChevronRight,
} from "lucide-react";
import { feedApi } from "@/api/feed/route";

const ACTIVITY_TYPES = [
  {
    key: "workouts",
    filterLabel: "Workouts",
    notifLabel: "Workout",
    icon: Dumbbell,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    key: "cardio",
    filterLabel: "Cardio Sessions",
    notifLabel: "Cardio Activity",
    icon: Activity,
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
  },
  {
    key: "recovery",
    filterLabel: "Recovery",
    notifLabel: "Recovery Log",
    icon: Heart,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    key: "hydration",
    filterLabel: "Hydration",
    notifLabel: "Hydration Check-in",
    icon: Droplets,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
] as const;

type ActivityKey = typeof ACTIVITY_TYPES[number]["key"];
type NotifValue = "Email" | "Push" | "None";

type Filters = Record<ActivityKey, boolean>;
type NotifPrefs = Record<ActivityKey, NotifValue>;

const LS_FILTERS_KEY = "feedActivityFilters";
const LS_NOTIF_KEY   = "feedNotifPrefs";

const defaultFilters = (): Filters =>
  Object.fromEntries(ACTIVITY_TYPES.map(t => [t.key, true])) as Filters;

const defaultNotifs = (): NotifPrefs =>
  Object.fromEntries(ACTIVITY_TYPES.map(t => [t.key, "Push" as NotifValue])) as NotifPrefs;

const NOTIF_OPTIONS: { val: NotifValue; Icon: typeof Mail }[] = [
  { val: "Email", Icon: Mail },
  { val: "Push",  Icon: Bell },
  { val: "None",  Icon: BellOff },
];

export default function FeedSettingsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(defaultFilters());
  const [notifs,  setNotifs]  = useState<NotifPrefs>(defaultNotifs());
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    try {
      const f = localStorage.getItem(LS_FILTERS_KEY);
      if (f) setFilters(prev => ({ ...prev, ...JSON.parse(f) }));
      const n = localStorage.getItem(LS_NOTIF_KEY);
      if (n) setNotifs(prev => ({ ...prev, ...JSON.parse(n) }));
    } catch {}
    feedApi.getFeedSettings().then(remote => {
      if (!remote) return;
      if (remote.filters) setFilters(prev => ({ ...prev, ...remote.filters }));
      if (remote.notifs)  setNotifs(prev => ({ ...prev, ...remote.notifs as Record<string, NotifValue> }));
    }).catch(() => {});
  }, []);

  const toggleFilter = (key: ActivityKey) =>
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));

  const enableAll  = () => setFilters(Object.fromEntries(ACTIVITY_TYPES.map(t => [t.key, true]))  as Filters);
  const disableAll = () => setFilters(Object.fromEntries(ACTIVITY_TYPES.map(t => [t.key, false])) as Filters);

  const setNotif = (key: ActivityKey, val: NotifValue) =>
    setNotifs(prev => ({ ...prev, [key]: val }));

  const save = async () => {
    setSaving(true);
    localStorage.setItem(LS_FILTERS_KEY, JSON.stringify(filters));
    localStorage.setItem(LS_NOTIF_KEY,   JSON.stringify(notifs));
    await feedApi.saveFeedSettings({ filters, notifs });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f4f4f8] pb-10">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-violet-600 to-purple-700 sticky top-0 z-40 px-5 py-6 overflow-hidden">
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute bottom-0 left-16 w-16 h-16 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition flex-shrink-0"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h1 className="font-bold text-[17px] text-white flex items-center gap-2">
              <SlidersHorizontal size={17} className="text-white" /> Feed Settings
            </h1>
            <p className="text-[12px] text-white/70 mt-0.5">Personalise your activity feed</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5 max-w-xl mx-auto">

        {/* Section 1 — Activity filters */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-[#6c3fef] flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">1</span>
            <div>
              <p className="text-[15px] font-extrabold text-gray-900">Activity type filters</p>
              <p className="text-[12px] text-gray-400 mt-0.5">Choose which activities appear in your feed</p>
            </div>
          </div>

          <div className="px-5 space-y-1">
            {ACTIVITY_TYPES.map(({ key, filterLabel, icon: Icon, iconBg, iconColor }) => {
              const on = filters[key];
              return (
                <button
                  key={key}
                  onClick={() => toggleFilter(key)}
                  className="w-full flex items-center justify-between px-2 py-3 rounded-2xl transition hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
                      <Icon size={18} className={iconColor} />
                    </span>
                    <span className={`text-[14px] font-semibold ${on ? "text-gray-800" : "text-gray-400"}`}>
                      {filterLabel}
                    </span>
                  </div>
                  <div className={`w-11 h-6 rounded-full relative transition-colors ${on ? "bg-[#6c3fef]" : "bg-gray-200"}`}>
                    <span className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all ${on ? "left-[22px]" : "left-[3px]"}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Enable / Disable All — at bottom */}
          <div className="px-5 pt-3 pb-5 flex gap-3">
            <button
              onClick={enableAll}
              className="flex-1 text-[13px] font-bold text-purple-600 bg-purple-50 border border-purple-100 py-2.5 rounded-2xl hover:bg-purple-100 transition"
            >
              Enable All
            </button>
            <button
              onClick={disableAll}
              className="flex-1 text-[13px] font-bold text-gray-500 bg-gray-50 border border-gray-200 py-2.5 rounded-2xl hover:bg-gray-100 transition"
            >
              Disable All
            </button>
          </div>
        </div>

        {/* Section 2 — Notification preferences */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-[#6c3fef] flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">
              2
            </span>
            <div>
              <p className="text-[15px] font-extrabold text-gray-900">Notification preferences</p>
              <p className="text-[12px] text-gray-400 mt-0.5">Choose how you're notified per activity type</p>
            </div>
          </div>

          <div className="px-5 pb-5 space-y-3">
            {ACTIVITY_TYPES.map(({ key, notifLabel, icon: Icon, iconBg, iconColor }) => (
              <div key={key} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                    <Icon size={16} className={iconColor} />
                  </span>
                  <span className="text-[13px] font-semibold text-gray-700 leading-tight">{notifLabel}</span>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 flex-shrink-0">
                  {NOTIF_OPTIONS.map(({ val, Icon: NIcon }) => (
                    <button
                      key={val}
                      onClick={() => setNotif(key, val)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition ${
                        notifs[key] === val
                          ? "bg-[#6c3fef] text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <NIcon size={11} />
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-[#6c3fef] text-white font-bold py-4 rounded-2xl text-[15px] flex items-center justify-center gap-2 hover:bg-purple-700 disabled:opacity-70 transition"
        >
          {saving ? (
            <><Loader2 size={17} className="animate-spin" /> Saving…</>
          ) : saved ? (
            <><Check size={17} /> Saved!</>
          ) : (
            <><ChevronRight size={17} /> Save Feed Settings</>
          )}
        </button>

      </div>
    </div>
  );
}
