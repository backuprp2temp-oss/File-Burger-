export default function TransferProgress({ transferState, formatSize }) {
  if (!transferState) return null;

  const { direction, fileName, fileSize, transferred, speed, percent, status } = transferState;

  const isSending = direction === 'send';
  const label = isSending ? 'Sending' : 'Receiving';
  const icon = isSending ? '📤' : '📥';

  return (
    <div className="glass-card p-6 animate-fade-up" style={{ animationDelay: '0.25s' }}>
      <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
        {icon} {label}
      </h2>

      {/* File Info */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-text-primary text-sm font-medium truncate flex-1 mr-4">
          {fileName}
        </p>
        <span className="text-xs text-text-muted whitespace-nowrap">
          {formatSize(transferred)} / {formatSize(fileSize)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="progress-track mb-3">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-xs">
        <span className={`font-semibold ${status === 'complete' ? 'text-success' : status === 'error' ? 'text-error' : 'text-burger-400'}`}>
          {status === 'complete' && '✓ Transfer complete'}
          {status === 'error' && '✗ Transfer failed'}
          {status === 'transferring' && `${percent}%`}
        </span>
        {status === 'transferring' && speed > 0 && (
          <span className="text-text-muted">
            {formatSize(speed)}/s
          </span>
        )}
      </div>
    </div>
  );
}
