"use client";

import { useState, useEffect, useRef } from "react";
import { Info, Target, PenLine, TrendingUp, Dumbbell, Zap, X, BarChart2, Activity, Percent, Award } from "lucide-react";
import {
  getMetrics,
  updateMetrics,
  getPlayerCard,
  getDashboard,
} from "@/api/metrics/route";
import type { UserMetrics, PlayerCardData, OtherDetail } from "@/api/metrics/route";
import type { LiftKey } from "./components/types";
import { WeightCard } from "./components/WeightCard";
import { GoalBox } from "./components/GoalBox";
import { AdjusterModal } from "./components/AdjusterModal";
import { BulkEditModal } from "./components/BulkEditModal";

export default function MetricsPage() {
  const [metricsData, setMetricsData] = useState<UserMetrics | null>(null);
  const [cardData, setCardData] = useState<PlayerCardData | null>(null);
  const [otherDetail, setOtherDetail] = useState<OtherDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [adjusterVisible, setAdjusterVisible] = useState(false);
  const [adjusterType, setAdjusterType] = useState<"RMP" | "GOAL">("RMP");
  const [selectedLift, setSelectedLift] = useState<LiftKey>("benchPress");
  const [selectedLiftLabel, setSelectedLiftLabel] = useState("");
  const [defaultLiftValue, setDefaultLiftValue] = useState(0);
  const [adjusterSaving, setAdjusterSaving] = useState(false);
  const [adjusterError, setAdjusterError] = useState("");

  const [bulkEditVisible, setBulkEditVisible] = useState(false);
  const [bulkEditType, setBulkEditType] = useState<"CMP" | "RMP">("CMP");
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkError, setBulkError] = useState("");

  const [goalBench, setGoalBench] = useState("400");
  const [goalSquat, setGoalSquat] = useState("550");
  const [goalClean, setGoalClean] = useState("300");
  const [goalDeadlift, setGoalDeadlift] = useState("600");

  const cmpRef = useRef<HTMLDivElement>(null);
  const rmpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("metrics_goals");
      if (stored) {
        const p = JSON.parse(stored);
        if (p.bench) setGoalBench(p.bench);
        if (p.squat) setGoalSquat(p.squat);
        if (p.clean) setGoalClean(p.clean);
        if (p.deadlift) setGoalDeadlift(p.deadlift);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [metrics, card, dashboard] = await Promise.allSettled([
          getMetrics(),
          getPlayerCard(),
          getDashboard(),
        ]);

        const metricsVal = metrics.status === "fulfilled" ? metrics.value : null;
        const cardVal = card.status === "fulfilled" ? card.value : null;
        const dashVal = dashboard.status === "fulfilled" ? dashboard.value : null;

        console.group("[Metrics] API Data");

        console.group("GET /metrics");
        console.log("raw:", metricsVal ?? (metrics.status === "rejected" ? (metrics as PromiseRejectedResult).reason : null));
        console.log("CMP — bench:", metricsVal?.comprehensive_benchPress, "squat:", metricsVal?.comprehensive_backSquat, "clean:", metricsVal?.comprehensive_powerClean, "deadlift:", metricsVal?.comprehensive_deadlift);
        console.log("RMP — bench:", metricsVal?.r_bench_press, "squat:", metricsVal?.r_back_squat, "clean:", metricsVal?.r_power_clean, "deadlift:", metricsVal?.r_deadlift);
        console.groupEnd();

        console.group("GET /player-card");
        console.log("raw:", cardVal ?? (card as PromiseRejectedResult).reason);
        console.log("bodyCampScore:", cardVal?.bodyCampScore, "smm:", cardVal?.smm, "bodyFat:", cardVal?.bodyFat, "weight:", cardVal?.currentWeight, "height:", cardVal?.height);
        console.groupEnd();

        console.group("GET /dashboard → OtherDetail");
        const otherDetailVal = dashVal?.user?.OtherDetail ?? null;
        console.log("OtherDetail:", otherDetailVal ?? "❌ not present in response");
        console.log("measurement_unit:", otherDetailVal?.measurement_unit ?? "not set (defaulting to lbs)");
        console.groupEnd();

        console.groupEnd();

        if (metrics.status === "fulfilled") setMetricsData(metrics.value);
        if (card.status === "fulfilled") setCardData(card.value);
        if (dashboard.status === "fulfilled")
          setOtherDetail(dashboard.value.user?.OtherDetail ?? null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const refetchMetrics = async () => {
    try {
      const m = await getMetrics();
      setMetricsData(m);
    } catch {}
  };

  // Derived values
  const compScore = cardData?.bodyCampScore ?? null;
  const smm = cardData?.smm ?? null;
  const bfPct = cardData?.bodyFat ?? null;
  const wellnessScore =
    compScore !== null
      ? Math.max(1, Math.min(10, Math.round(compScore / 10)))
      : 3;

  const cmpBench = Number(metricsData?.comprehensive_benchPress ?? otherDetail?.bench_cmp ?? 0);
  const cmpSquat = Number(metricsData?.comprehensive_backSquat ?? otherDetail?.squat_cmp ?? 0);
  const cmpPower = Number(metricsData?.comprehensive_powerClean ?? otherDetail?.clean_cmp ?? 0);
  const cmpDeadlift = Number(metricsData?.comprehensive_deadlift ?? otherDetail?.deadlift_cmp ?? 0);
  const cmpTotal = metricsData?.comprehensive_ov_strength ?? (cmpBench + cmpSquat + cmpPower + cmpDeadlift);
  const cmpRatio = metricsData?.adjusted_overall_strength
    ? String(metricsData.adjusted_overall_strength)
    : cmpTotal > 0 && smm
    ? (cmpTotal / smm).toFixed(2)
    : "0";

  const oldCmpBench = Number(metricsData?.old_bench_cmp ?? otherDetail?.old_bench_cmp ?? 0);
  const oldCmpSquat = Number(metricsData?.old_squat_cmp ?? otherDetail?.old_squat_cmp ?? 0);
  const oldCmpPower = Number(metricsData?.old_clean_cmp ?? otherDetail?.old_clean_cmp ?? 0);
  const oldCmpDeadlift = Number(metricsData?.old_deadlift_cmp ?? otherDetail?.old_deadlift_cmp ?? 0);

  const rmpBench = Number(metricsData?.r_bench_press ?? otherDetail?.r_bench_press ?? 0);
  const rmpSquat = Number(metricsData?.r_back_squat ?? otherDetail?.r_back_squat ?? 0);
  const rmpPower = Number(metricsData?.r_power_clean ?? otherDetail?.r_power_clean ?? 0);
  const rmpDeadlift = Number(metricsData?.r_deadlift ?? otherDetail?.r_deadlift ?? 0);

  const unit = otherDetail?.measurement_unit || "lbs";

  const openRMPAdjuster = (key: LiftKey, label: string, current: number) => {
    setAdjusterType("RMP");
    setSelectedLift(key);
    setSelectedLiftLabel(label);
    setDefaultLiftValue(current);
    setAdjusterError("");
    setAdjusterVisible(true);
  };

  const openGoalAdjuster = (key: LiftKey, label: string, current: number) => {
    setAdjusterType("GOAL");
    setSelectedLift(key);
    setSelectedLiftLabel(label);
    setDefaultLiftValue(current);
    setAdjusterError("");
    setAdjusterVisible(true);
  };

  const handleAdjusterUpdate = async (val: number) => {
    if (adjusterType === "RMP") {
      setAdjusterSaving(true);
      setAdjusterError("");
      try {
        const payload: Partial<UserMetrics> = {};
        if (selectedLift === "benchPress") payload.r_bench_press = val;
        else if (selectedLift === "backSquat") payload.r_back_squat = val;
        else if (selectedLift === "powerClean") payload.r_power_clean = val;
        else if (selectedLift === "deadlift") payload.r_deadlift = val;
        await updateMetrics(payload);
        await refetchMetrics();
        setAdjusterVisible(false);
      } catch (e: unknown) {
        setAdjusterError(e instanceof Error ? e.message : "Failed to update.");
      } finally {
        setAdjusterSaving(false);
      }
    } else {
      let b = goalBench, s = goalSquat, c = goalClean, d = goalDeadlift;
      if (selectedLift === "benchPress") { setGoalBench(String(val)); b = String(val); }
      else if (selectedLift === "backSquat") { setGoalSquat(String(val)); s = String(val); }
      else if (selectedLift === "powerClean") { setGoalClean(String(val)); c = String(val); }
      else if (selectedLift === "deadlift") { setGoalDeadlift(String(val)); d = String(val); }
      localStorage.setItem("metrics_goals", JSON.stringify({ bench: b, squat: s, clean: c, deadlift: d }));
      setAdjusterVisible(false);
    }
  };

  const handleBulkSave = async (fields: { bench: string; squat: string; clean: string; deadlift: string }) => {
    setBulkSaving(true);
    setBulkError("");
    try {
      const payload: Partial<UserMetrics> = {};
      if (bulkEditType === "CMP") {
        payload.comprehensive_benchPress = Number(fields.bench) || cmpBench || 303;
        payload.comprehensive_backSquat = Number(fields.squat) || cmpSquat || 357;
        payload.comprehensive_powerClean = Number(fields.clean) || cmpPower || 117;
        payload.comprehensive_deadlift = Number(fields.deadlift) || cmpDeadlift || 173;
      } else {
        payload.r_bench_press = Number(fields.bench) || rmpBench || 340;
        payload.r_back_squat = Number(fields.squat) || rmpSquat || 450;
        payload.r_power_clean = Number(fields.clean) || rmpPower || 280;
        payload.r_deadlift = Number(fields.deadlift) || rmpDeadlift || 515;
      }
      await updateMetrics(payload);
      await refetchMetrics();
      setBulkEditVisible(false);
    } catch (e: unknown) {
      setBulkError(e instanceof Error ? e.message : "Failed to update metrics.");
    } finally {
      setBulkSaving(false);
    }
  };

  const iconTabs = [
    { icon: TrendingUp, title: "CMP", onClick: () => cmpRef.current?.scrollIntoView({ behavior: "smooth" }) },
    { icon: Dumbbell, title: "RMP", onClick: () => rmpRef.current?.scrollIntoView({ behavior: "smooth" }) },
    { icon: PenLine, title: "Edit CMP", onClick: () => { setBulkEditType("CMP"); setBulkError(""); setBulkEditVisible(true); } },
    { icon: Zap, title: "Edit RMP", onClick: () => { setBulkEditType("RMP"); setBulkError(""); setBulkEditVisible(true); } },
    { icon: Target, title: "Goals", onClick: () => {} },
  ];

  const statCards = [
    { label: "Comp Score", value: compScore !== null ? compScore.toFixed(1) : "49.2", color: "#7B5EA7", iconBg: "#F3E8FF", Icon: BarChart2 },
    { label: "SMM", value: smm !== null ? Math.round(smm).toString() : "91", color: "#06BCC1", iconBg: "#E0F7FA", Icon: Activity },
    { label: "BF%", value: bfPct !== null ? Math.round(bfPct).toString() : "19", color: "#F59E0B", iconBg: "#FEF3C7", Icon: Percent },
  ];

  const muscleActivation = [
    { label: "CHEST", value: "14.05" },
    { label: "TRICEPS", value: "8.75" },
    { label: "SCAPS", value: "3.75" },
    { label: "ABDOMINALS", value: "3.15" },
    { label: "FRONTSYABS", value: "2.6" },
    { label: "LATS/UPPERBACK", value: "2.5" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      {/* ── Sticky top bar: title + tabs only ── */}
      <div
        className="relative overflow-hidden sticky top-0 z-20 px-6 pt-5 pb-4"
        style={{ background: "linear-gradient(135deg, #9B59D4 0%, #7C3AED 100%)" }}
      >
        <div className="relative flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white shrink-0">My Metrics!</h1>
          <div className="flex flex-1 gap-2">
            {iconTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.title}
                  title={tab.title}
                  onClick={tab.onClick}
                  className="flex-1 h-12 rounded-2xl flex items-center justify-center transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
                >
                  <Icon size={20} color="#ffffff" />
                </button>
              );
            })}
          </div>
          <button className="shrink-0 w-8 h-8 flex items-center justify-center transition-opacity hover:opacity-70">
            <X size={20} color="rgba(255,255,255,0.85)" />
          </button>
        </div>
      </div>

      {/* ── Scrollable purple section: wellness + stat cards ── */}
      <div
        className="relative overflow-hidden px-6 pt-5 pb-6 rounded-b-3xl"
        style={{ background: "linear-gradient(135deg, #9B59D4 0%, #7C3AED 100%)" }}
      >
        {/* Decorative circles */}
        <div className="absolute rounded-full pointer-events-none"
          style={{ width: 260, height: 260, backgroundColor: "rgba(255,255,255,0.08)", top: -80, left: -60 }} />
        <div className="absolute rounded-full pointer-events-none"
          style={{ width: 180, height: 180, backgroundColor: "rgba(255,255,255,0.07)", bottom: -80, left: 40 }} />

        {/* Wellness score (left) + Stat cards (right) */}
        <div className="relative flex items-stretch gap-5">
          <div className="flex flex-col justify-between shrink-0" style={{ minWidth: 170 }}>
            <div className="flex items-center gap-1.5">
              <Award size={15} color="rgba(255,255,255,0.85)" />
              <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>
                Optimal Wellness Score
              </span>
              <Info size={13} color="rgba(255,255,255,0.6)" />
            </div>

            {isLoading ? (
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin my-4" />
            ) : (
              <span className="font-bold text-white leading-none" style={{ fontSize: 80 }}>
                {wellnessScore}
              </span>
            )}

            <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
              Your overall wellness performance metric
            </p>
          </div>

          <div className="flex flex-1 gap-3">
            {statCards.map((stat) => (
              <div key={stat.label} className="flex-1 bg-white rounded-3xl px-5 py-4 flex flex-col justify-between">
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: stat.iconBg }}
                  >
                    <stat.Icon size={18} color={stat.color} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: "#94A3B8" }}>
                    {stat.label}
                  </span>
                </div>
                <span className="text-4xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="bg-white px-5 pt-4 pb-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs" style={{ color: "#94A3B8" }}>
            Reach out to our help Experts and Stay
          </p>
          <button
            className="px-4 py-2 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#9333EA" }}
          >
            All Activity
          </button>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5">
          {/* Left column: My Weights */}
          <div>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#1A1A1A" }}>
              My Weights:
            </h2>

            <div ref={cmpRef}>
              <WeightCard
                title="Comprehensive Max (CMP):"
                total={cmpTotal}
                ratio={cmpRatio}
                description="This is the total weight of all your comprehensive moves and many best lifts that you have completed. These weights are constantly evolving. It is not only the best; this only represents your current capability."
                bench={cmpBench}
                squat={cmpSquat}
                powerClean={cmpPower}
                deadlift={cmpDeadlift}
                oldBench={oldCmpBench}
                oldSquat={oldCmpSquat}
                oldPowerClean={oldCmpPower}
                oldDeadlift={oldCmpDeadlift}
                buttonLabel="View Progress"
                onButtonClick={() => {}}
                benchUpdatedAt={metricsData?.bench_cmp_updated_at}
                squatUpdatedAt={metricsData?.squat_cmp_updated_at}
                powerCleanUpdatedAt={metricsData?.clean_cmp_updated_at}
                deadliftUpdatedAt={metricsData?.deadlift_cmp_updated_at}
                showDaysAgo={true}
                unit={unit}
              />
            </div>

            <div ref={rmpRef}>
              <WeightCard
                title="Current Relative Max (RMP):"
                description="These are the weights you achieve relative to an intent for each exercise during one of your workouts. These values update automatically. If you can, you will want to beat them."
                bench={rmpBench}
                squat={rmpSquat}
                powerClean={rmpPower}
                deadlift={rmpDeadlift}
                buttonLabel="View Max Changes"
                onButtonClick={() => {}}
                onBenchEdit={() => openRMPAdjuster("benchPress", "BENCH PRESS", rmpBench)}
                onSquatEdit={() => openRMPAdjuster("backSquat", "BACK SQUAT", rmpSquat)}
                onPowerCleanEdit={() => openRMPAdjuster("powerClean", "POWER CLEAN", rmpPower)}
                onDeadliftEdit={() => openRMPAdjuster("deadlift", "DEADLIFT", rmpDeadlift)}
                unit={unit}
              />
            </div>
          </div>

          {/* Right column: Goal + Scores + Muscle */}
          <div className="flex flex-col gap-4">
            {/* Goal card */}
            <div
              className="rounded-2xl p-4 border"
              style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }}
            >
              <h3 className="text-base font-bold mb-1" style={{ color: "#D97706" }}>Goal:</h3>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "#92400E" }}>
                These are Max Weight Goals to keep yourself motivated. You can adjust and edit these
                yourself at any time. They are used to help you progress.
              </p>
              <div className="flex flex-wrap gap-2">
                <GoalBox value={goalBench} label="BENCH PRESS" unit={unit} onEdit={() => openGoalAdjuster("benchPress", "BENCH PRESS", parseFloat(goalBench) || 400)} />
                <GoalBox value={goalSquat} label="BACK SQUAT" unit={unit} onEdit={() => openGoalAdjuster("backSquat", "BACK SQUAT", parseFloat(goalSquat) || 550)} />
                <GoalBox value={goalClean} label="POWER CLEAN" unit={unit} onEdit={() => openGoalAdjuster("powerClean", "POWER CLEAN", parseFloat(goalClean) || 300)} />
                <GoalBox value={goalDeadlift} label="DEADLIFT" unit={unit} onEdit={() => openGoalAdjuster("deadlift", "DEADLIFT", parseFloat(goalDeadlift) || 600)} />
              </div>
            </div>

            {/* Avg Scores */}
            <div>
              <h2 className="text-base font-bold mb-0.5" style={{ color: "#1A1A1A" }}>Avg Scores:</h2>
              <p className="text-xs mb-2.5" style={{ color: "#64748B" }}>
                Here are your average personal scores from the last 4 weeks
              </p>
              <div className="flex gap-2">
                {[
                  { value: compScore !== null ? Math.round(compScore).toString() : "140", color: "#7B5EA7" },
                  { value: smm !== null ? Math.round(smm).toString() : "78", color: "#06BCC1" },
                  { value: bfPct !== null ? Math.round(bfPct).toString() : "484", color: "#F59E0B" },
                ].map((chip, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-2xl py-4 flex items-center justify-center"
                    style={{ backgroundColor: chip.color }}
                  >
                    <span className="text-2xl font-bold text-white">{chip.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Muscle Activation */}
            <div>
              <h2 className="text-base font-bold mb-2.5" style={{ color: "#1A1A1A" }}>
                Avg. Weekly Muscle Activation by Load:
              </h2>
              <div className="flex flex-col rounded-2xl overflow-hidden border" style={{ borderColor: "#E2E8F0" }}>
                {muscleActivation.map((item, i) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between px-4 py-3"
                    style={{
                      backgroundColor: i % 2 === 0 ? "#F8FAFC" : "#FFFFFF",
                      borderBottom: i < muscleActivation.length - 1 ? "1px solid #E2E8F0" : "none",
                    }}
                  >
                    <span className="text-xs font-bold tracking-wide" style={{ color: "#94A3B8", letterSpacing: "0.5px" }}>
                      {item.label}
                    </span>
                    <span className="text-base font-bold" style={{ color: "#1A1A1A" }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AdjusterModal
        visible={adjusterVisible}
        adjusterType={adjusterType}
        liftKey={selectedLift}
        liftLabel={selectedLiftLabel}
        defaultValue={defaultLiftValue}
        unit={unit}
        isSaving={adjusterSaving}
        error={adjusterError}
        onClose={() => setAdjusterVisible(false)}
        onUpdate={handleAdjusterUpdate}
      />

      <BulkEditModal
        visible={bulkEditVisible}
        editType={bulkEditType}
        cmpValues={{ bench: cmpBench, squat: cmpSquat, power: cmpPower, deadlift: cmpDeadlift }}
        rmpValues={{ bench: rmpBench, squat: rmpSquat, power: rmpPower, deadlift: rmpDeadlift }}
        unit={unit}
        isSaving={bulkSaving}
        error={bulkError}
        onClose={() => setBulkEditVisible(false)}
        onSave={handleBulkSave}
      />
    </div>
  );
}
