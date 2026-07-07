"use client";

interface Props {
  load: number;
  str: number;
  cal: number;
  pwr: number;
}

export default function PerformanceStatsCard({ load, str, cal, pwr }: Props) {
  const stats = [
    { label: "LOAD", value: load },
    { label: "STR", value: str },
    { label: "CAL", value: cal },
    { label: "PWR", value: pwr },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {stats.map(({ label, value }) => (
        <div key={label} className="bg-white rounded-lg p-2.5 text-center">
          <div className="text-[#6c5ce7] text-xl font-bold">{value}</div>
          <div className="text-[#8b879e] text-[10px] mt-0.5">{label}</div>
        </div>
      ))}
    </div>
  );
}
