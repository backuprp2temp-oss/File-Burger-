import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'peerjs';

const CHUNK_SIZE = 64 * 1024; // 64 KB

function generateId() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function usePeer() {
  const [peerId, setPeerId] = useState('');
  const [status, setStatus] = useState('idle'); // idle | waiting | connected | error
  const [error, setError] = useState('');
  const [transferState, setTransferState] = useState(null);
  // { direction: 'send'|'receive', fileName, fileSize, transferred, speed, percent, status: 'transferring'|'complete'|'error' }
  const [receivedFiles, setReceivedFiles] = useState([]);

  const peerRef = useRef(null);
  const connRef = useRef(null);
  const receiveBufferRef = useRef({});
  const speedIntervalRef = useRef(null);
  const lastTransferredRef = useRef(0);

  // Initialize peer
  useEffect(() => {
    const id = generateId();
    const peer = new Peer(id, {
      debug: 0,
    });

    peer.on('open', (openedId) => {
      setPeerId(openedId);
      setStatus('waiting');
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      setError(err.type === 'peer-unavailable' ? 'Peer not found. Check the ID and try again.' : err.message);
      setStatus('error');
      setTimeout(() => {
        setError('');
        setStatus(connRef.current ? 'connected' : 'waiting');
      }, 4000);
    });

    peer.on('connection', (conn) => {
      handleConnection(conn);
    });

    peerRef.current = peer;

    return () => {
      peer.destroy();
    };
  }, []);

  const handleConnection = useCallback((conn) => {
    connRef.current = conn;

    conn.on('open', () => {
      setStatus('connected');
      setError('');
    });

    conn.on('close', () => {
      connRef.current = null;
      setStatus('waiting');
      setTransferState(null);
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
      setError('Connection error: ' + err.message);
    });

    conn.on('data', (data) => {
      handleIncomingData(data);
    });
  }, []);

  const handleIncomingData = useCallback((data) => {
    // Metadata message
    if (data && data.type === 'file-meta') {
      receiveBufferRef.current = {
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileType: data.fileType,
        totalChunks: data.totalChunks,
        chunks: [],
        received: 0,
      };
      lastTransferredRef.current = 0;
      startSpeedTracking('receive');
      setTransferState({
        direction: 'receive',
        fileName: data.fileName,
        fileSize: data.fileSize,
        transferred: 0,
        speed: 0,
        percent: 0,
        status: 'transferring',
      });
      return;
    }

    // Chunk data
    if (data && data.type === 'file-chunk') {
      const buf = receiveBufferRef.current;
      buf.chunks.push(data.chunk);
      buf.received += data.chunk.byteLength;

      const percent = Math.round((buf.received / buf.fileSize) * 100);
      setTransferState((prev) => ({
        ...prev,
        transferred: buf.received,
        percent,
      }));

      // All chunks received
      if (buf.chunks.length === buf.totalChunks) {
        stopSpeedTracking();
        const blob = new Blob(buf.chunks, { type: buf.fileType || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);

        setReceivedFiles((prev) => [
          ...prev,
          {
            id: Date.now(),
            fileName: buf.fileName,
            fileSize: buf.fileSize,
            url,
            fileType: buf.fileType,
          },
        ]);

        setTransferState((prev) => ({
          ...prev,
          percent: 100,
          transferred: buf.fileSize,
          status: 'complete',
        }));

        receiveBufferRef.current = {};
      }
      return;
    }
  }, []);

  const startSpeedTracking = useCallback((direction) => {
    stopSpeedTracking();
    lastTransferredRef.current = 0;
    speedIntervalRef.current = setInterval(() => {
      setTransferState((prev) => {
        if (!prev || prev.status !== 'transferring') return prev;
        const speed = prev.transferred - lastTransferredRef.current;
        lastTransferredRef.current = prev.transferred;
        return { ...prev, speed };
      });
    }, 1000);
  }, []);

  const stopSpeedTracking = useCallback(() => {
    if (speedIntervalRef.current) {
      clearInterval(speedIntervalRef.current);
      speedIntervalRef.current = null;
    }
  }, []);

  const connectToPeer = useCallback((remoteId) => {
    if (!peerRef.current) return;
    setError('');
    const conn = peerRef.current.connect(remoteId, { reliable: true });
    handleConnection(conn);
  }, [handleConnection]);

  const disconnect = useCallback(() => {
    if (connRef.current) {
      connRef.current.close();
      connRef.current = null;
    }
    setStatus('waiting');
    setTransferState(null);
  }, []);

  const sendFile = useCallback((file) => {
    const conn = connRef.current;
    if (!conn || !file) return;

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    // Send metadata
    conn.send({
      type: 'file-meta',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      totalChunks,
    });

    setTransferState({
      direction: 'send',
      fileName: file.name,
      fileSize: file.size,
      transferred: 0,
      speed: 0,
      percent: 0,
      status: 'transferring',
    });

    lastTransferredRef.current = 0;
    startSpeedTracking('send');

    const reader = new FileReader();
    let offset = 0;
    let chunkIndex = 0;

    const readNextChunk = () => {
      const slice = file.slice(offset, offset + CHUNK_SIZE);
      reader.readAsArrayBuffer(slice);
    };

    reader.onload = (e) => {
      const chunk = e.target.result;
      conn.send({
        type: 'file-chunk',
        chunk: chunk,
        index: chunkIndex,
      });

      offset += chunk.byteLength;
      chunkIndex++;
      const percent = Math.round((offset / file.size) * 100);

      setTransferState((prev) => ({
        ...prev,
        transferred: offset,
        percent: Math.min(percent, 100),
        status: chunkIndex === totalChunks ? 'complete' : 'transferring',
      }));

      if (chunkIndex === totalChunks) {
        stopSpeedTracking();
      } else {
        // Small delay to avoid overwhelming the data channel
        setTimeout(readNextChunk, 5);
      }
    };

    reader.onerror = () => {
      stopSpeedTracking();
      setTransferState((prev) => ({
        ...prev,
        status: 'error',
      }));
      setError('Failed to read file.');
    };

    readNextChunk();
  }, [startSpeedTracking, stopSpeedTracking]);

  return {
    peerId,
    status,
    error,
    transferState,
    receivedFiles,
    connectToPeer,
    disconnect,
    sendFile,
    formatSize,
  };
}
