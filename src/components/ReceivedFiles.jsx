export default function ReceivedFiles({ files, formatSize }) {
  if (files.length === 0) return null;

  const handleDownload = (file) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="glass-card p-6 animate-fade-up" style={{ animationDelay: '0.3s' }}>
      <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
        📦 Received Files
      </h2>

      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-3 rounded-lg bg-surface-light/50 border border-glass-border hover:border-burger-500/30 transition-all"
          >
            <div className="flex-1 min-w-0 mr-3">
              <p className="text-sm text-text-primary font-medium truncate">
                {file.fileName}
              </p>
              <p className="text-xs text-text-muted">
                {formatSize(file.fileSize)}
              </p>
            </div>
            <button
              className="btn-glow !py-2 !px-4 text-xs"
              onClick={() => handleDownload(file)}
            >
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
