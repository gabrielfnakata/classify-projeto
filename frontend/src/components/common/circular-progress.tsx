interface CircularProgressProps {
  percent: number
  size?: number
  stroke?: number
}

export function CircularProgress({ percent, size = 120, stroke = 10 }: CircularProgressProps) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - percent / 100)
  const center = size / 2

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={center} cy={center} r={radius} strokeWidth={stroke} className="stroke-muted" fill="none" />
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          className="stroke-info-foreground"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-foreground">
        {percent}%
      </div>
    </div>
  )
}
