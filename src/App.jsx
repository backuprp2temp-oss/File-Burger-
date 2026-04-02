import Header from './components/Header';
import ConnectionPanel from './components/ConnectionPanel';
import FileDropZone from './components/FileDropZone';
import TransferProgress from './components/TransferProgress';
import ReceivedFiles from './components/ReceivedFiles';
import { usePeer } from './hooks/usePeer';

export default function App() {
  const {
    peerId,
    status,
    error,
    transferState,
    receivedFiles,
    connectToPeer,
    disconnect,
    sendFile,
    formatSize,
  } = usePeer();

  const isConnected = status === 'connected';

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center px-4 pb-16">
      <div className="w-full max-w-lg">
        <Header />

        <div className="space-y-5">
          <ConnectionPanel
            peerId={peerId}
            status={status}
            error={error}
            onConnect={connectToPeer}
            onDisconnect={disconnect}
          />

          <FileDropZone
            isConnected={isConnected}
            onSendFile={sendFile}
            formatSize={formatSize}
          />

          <TransferProgress
            transferState={transferState}
            formatSize={formatSize}
          />

          <ReceivedFiles
            files={receivedFiles}
            formatSize={formatSize}
          />
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-text-muted text-xs">
          <p>
            Files are sent directly between browsers via WebRTC.
            <br />
            Nothing is ever stored on a server.
          </p>
        </footer>
      </div>
    </div>
  );
}
