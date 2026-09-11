interface ProgressBarProps {
  progress: number
  label: string
}

function ProgressBar({ progress, label }: ProgressBarProps) {
  const percent = Math.round(progress * 100)

  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="progress-bar-label">{label}</span>
    </div>
  )
}

export default ProgressBar
