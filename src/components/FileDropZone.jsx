import { useState, useRef } from 'react';

export default function FileDropZone({ isConnected, onSendFile, formatSize }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleSend = () => {
    if (selectedFile && isConnected) {
      onSendFile(selectedFile);
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="glass-card p-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
      <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
        Send a File
      </h2>

      {/* Drop Zone */}
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''} ${!isConnected ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
        />

        {!selectedFile ? (
          <div className="space-y-3">
            <div className="text-4xl">📂</div>
            <p className="text-text-secondary text-sm">
              <span className="text-burger-400 font-semibold">Click to browse</span> or drag & drop
            </p>
            <p className="text-text-muted text-xs">Any file type supported</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-3xl">📄</div>
            <p className="text-text-primary font-medium text-sm truncate max-w-xs mx-auto">
              {selectedFile.name}
            </p>
            <p className="text-text-muted text-xs">
              {formatSize(selectedFile.size)} · {selectedFile.type || 'Unknown type'}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      {selectedFile && (
        <div className="flex gap-2 mt-4">
          <button className="btn-subtle flex-1" onClick={handleClear}>
            Clear
          </button>
          <button
            className="btn-glow flex-1"
            onClick={handleSend}
            disabled={!isConnected}
          >
            🚀 Send File
          </button>
        </div>
      )}

      {!isConnected && (
        <p className="text-text-muted text-xs text-center mt-4">
          Connect to a peer first to send files
        </p>
      )}
    </div>
  );
}
