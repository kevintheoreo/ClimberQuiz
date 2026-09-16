interface StatBarProps {
  label: string
  value: number
}

function StatBar({ label, value }: StatBarProps) {
  const percent = Math.round(value)

  return (
    <div
      className="stat-bar"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="stat-bar-header">
        <span className="stat-bar-label">{label}</span>
        <span className="stat-bar-value">{percent}</span>
      </div>
      <div className="stat-bar-track">
        <div className="stat-bar-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export default StatBar
