// app/dashboard/components/CircleProgress.tsx
type CircleProgressProps = {
  pct?: number
  color?: string
  size?: number
  stroke?: number
}

export default function CircleProgress({
  pct = 0,
  color = '#6c5ce7',
  size = 68,
  stroke = 6,
}: CircleProgressProps) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="w-[68px] h-[68px]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0eff4" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="11"
        fontWeight="800"
        fill="#1a1825"
      >
        {pct}%
      </text>
    </svg>
  )
}