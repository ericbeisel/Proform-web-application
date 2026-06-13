"use client";

import { LiftBox } from "./LiftBox";
import { fmt } from "./helpers";

interface WeightCardProps {
  title: string;
  total?: number | string;
  ratio?: string | null;
  description?: string;
  bench: number;
  squat: number;
  powerClean: number;
  deadlift: number;
  oldBench?: number;
  oldSquat?: number;
  oldPowerClean?: number;
  oldDeadlift?: number;
  buttonLabel: string;
  onButtonClick: () => void;
  benchUpdatedAt?: string;
  squatUpdatedAt?: string;
  powerCleanUpdatedAt?: string;
  deadliftUpdatedAt?: string;
  showDaysAgo?: boolean;
  onBenchEdit?: () => void;
  onSquatEdit?: () => void;
  onPowerCleanEdit?: () => void;
  onDeadliftEdit?: () => void;
  unit?: string;
}

export function WeightCard({
  title,
  total,
  ratio,
  description,
  bench,
  squat,
  powerClean,
  deadlift,
  oldBench,
  oldSquat,
  oldPowerClean,
  oldDeadlift,
  buttonLabel,
  onButtonClick,
  benchUpdatedAt,
  squatUpdatedAt,
  powerCleanUpdatedAt,
  deadliftUpdatedAt,
  showDaysAgo,
  onBenchEdit,
  onSquatEdit,
  onPowerCleanEdit,
  onDeadliftEdit,
  unit = "lbs",
}: WeightCardProps) {
  return (
    <div
      className="bg-white rounded-2xl p-4 mb-4 border"
      style={{ borderColor: "#E8ECF0", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}
    >
      <div className="flex justify-between items-center mb-1.5">
        <h3 className="text-lg font-bold" style={{ color: "#1A1A1A" }}>
          {title}
        </h3>
      </div>

      {total !== undefined && (
        <div className="mb-0.5">
          <span
            className="font-bold"
            style={{ color: "#6202AC", fontSize: 42, lineHeight: "1.2" }}
          >
            {total}
            {ratio ? (
              <span className="font-medium" style={{ color: "#94A3B8", fontSize: 20 }}>
                {" "}/ {ratio}
              </span>
            ) : null}
          </span>
        </div>
      )}

      {description && (
        <p
          className="text-xs leading-relaxed mb-3.5 mt-1.5"
          style={{ color: "#64748B" }}
        >
          {description}
        </p>
      )}

      <div className="flex flex-wrap gap-2.5 mb-3.5">
        <LiftBox
          value={fmt(bench)}
          oldValue={oldBench !== undefined ? fmt(oldBench) : undefined}
          label="BENCH PRESS"
          color="#7B5EA7"
          updatedAt={benchUpdatedAt}
          showDaysAgo={showDaysAgo}
          onEdit={onBenchEdit}
          unit={unit}
          showEdit={!showDaysAgo}
        />
        <LiftBox
          value={fmt(squat)}
          oldValue={oldSquat !== undefined ? fmt(oldSquat) : undefined}
          label="BACK SQUAT"
          color="#06BCC1"
          updatedAt={squatUpdatedAt}
          showDaysAgo={showDaysAgo}
          onEdit={onSquatEdit}
          unit={unit}
          showEdit={!showDaysAgo}
        />
        <LiftBox
          value={fmt(powerClean)}
          oldValue={oldPowerClean !== undefined ? fmt(oldPowerClean) : undefined}
          label="POWER CLEAN"
          color="#F59E0B"
          updatedAt={powerCleanUpdatedAt}
          showDaysAgo={showDaysAgo}
          onEdit={onPowerCleanEdit}
          unit={unit}
          showEdit={!showDaysAgo}
        />
        <LiftBox
          value={fmt(deadlift)}
          oldValue={oldDeadlift !== undefined ? fmt(oldDeadlift) : undefined}
          label="DEADLIFT"
          color="#EF4444"
          updatedAt={deadliftUpdatedAt}
          showDaysAgo={showDaysAgo}
          onEdit={onDeadliftEdit}
          unit={unit}
          showEdit={!showDaysAgo}
        />
      </div>

      <button
        onClick={onButtonClick}
        className="w-full py-3.5 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#6202AC" }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
