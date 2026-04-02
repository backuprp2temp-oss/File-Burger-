import { useState } from 'react';

export default function ConnectionPanel({ peerId, status, error, onConnect, onDisconnect }) {
  const [remoteId, setRemoteId] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(peerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = () => {
    if (remoteId.trim()) {
      onConnect(remoteId.trim().toLowerCase());
      setRemoteId('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleConnect();
  };

  const isConnected = status === 'connected';

  return (
    <div className="glass-card p-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
      {/* Status */}
      <div className="flex items-center gap-2 mb-5">
        <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
        <span className="text-sm font-medium text-text-secondary">
          {status === 'idle' && 'Initializing...'}
          {status === 'waiting' && 'Waiting for connection'}
          {status === 'connected' && 'Connected to peer'}
          {status === 'error' && 'Connection issue'}
        </span>
      </div>

      {/* Your Peer ID */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">
          Your Peer ID
        </label>
        <div className="flex items-center gap-2">
          <div className="input-field flex-1 flex items-center justify-between !py-3.5">
            <span className="text-burger-400 font-bold text-lg tracking-widest">
              {peerId || '------'}
            </span>
            <button
              onClick={handleCopy}
              className="text-text-muted hover:text-text-primary transition-colors ml-3 flex items-center gap-1 text-xs"
              title="Copy to clipboard"
            >
              {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Connect to Peer */}
      {!isConnected ? (
        <div>
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">
            Connect to Peer
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              className="input-field flex-1"
              placeholder="Enter peer ID..."
              value={remoteId}
              onChange={(e) => setRemoteId(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={10}
            />
            <button
              className="btn-glow whitespace-nowrap"
              onClick={handleConnect}
              disabled={!remoteId.trim() || status === 'idle'}
            >
              Connect
            </button>
          </div>
        </div>
      ) : (
        <button className="btn-subtle w-full" onClick={onDisconnect}>
          Disconnect
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
