# 🍔 File Burger

**Peer-to-peer file transfer, straight from your browser.**

File Burger lets you send files directly from one browser to another using **WebRTC** — no server uploads, no cloud storage, no file size limits imposed by a backend. Just generate a peer ID, share it with a friend, connect, and start transferring.

![File Burger Screenshot](https://img.shields.io/badge/status-active-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![Built With](https://img.shields.io/badge/built%20with-React%20%2B%20Vite-61dafb)

---

## ✨ Features

- **🔗 True P2P Transfer** — Files travel directly between browsers via WebRTC data channels. No intermediary server ever touches your data.
- **📋 Simple Peer ID System** — A short 6-character alphanumeric ID is generated for each session. Copy it, share it, and connect instantly.
- **📂 Drag & Drop** — Drop files onto the drop zone or click to browse. Any file type is supported.
- **📊 Real-Time Progress** — Live progress bar with percentage, transferred size, and transfer speed (KB/s, MB/s).
- **📥 Instant Downloads** — Received files appear in a list with a one-click download button.
- **🌙 Dark Glassmorphism UI** — A sleek, modern interface with frosted glass cards, gradient accents, smooth animations, and a burger-themed orange color palette.
- **⚡ Chunked Transfer** — Files are split into 64 KB chunks for reliable delivery over the data channel, with automatic reassembly on the receiving end.
- **🔒 Privacy First** — Your files never leave the direct connection between peers. The only server involved is PeerJS's signaling server (used solely to establish the initial WebRTC handshake).

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [React 19](https://react.dev/) | UI framework |
| [Vite 8](https://vite.dev/) | Build tool & dev server |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling |
| [PeerJS](https://peerjs.com/) | WebRTC abstraction layer |

---

## 📁 Project Structure

```
fileburger/
├── public/                     # Static assets
├── src/
│   ├── components/
│   │   ├── Header.jsx          # App branding & tagline
│   │   ├── ConnectionPanel.jsx # Peer ID display, connect/disconnect UI
│   │   ├── FileDropZone.jsx    # Drag & drop file selection
│   │   ├── TransferProgress.jsx# Progress bar, speed, status
│   │   └── ReceivedFiles.jsx   # List of received files with download
│   ├── hooks/
│   │   └── usePeer.js          # Core PeerJS logic & file transfer engine
│   ├── App.jsx                 # Root component
│   ├── main.jsx                # React entry point
│   └── index.css               # Tailwind v4 + custom design system
├── index.html                  # HTML shell with Inter font
├── vite.config.js              # Vite + Tailwind plugin config
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later

### Installation

```bash
# Clone the repository
git clone https://github.com/backuprp2temp-oss/File-Burger-.git
cd File-Burger-

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at **http://localhost:5173/**.

### Production Build

```bash
npm run build
npm run preview
```

---

## 📖 How It Works

### Connection Flow

```
┌─────────────┐                          ┌─────────────┐
│   Peer A     │                          │   Peer B     │
│              │                          │              │
│  1. Generate │                          │              │
│     Peer ID  │──── Share ID via ───────▶│  2. Enter    │
│   (e.g.      │     chat/text/etc.       │     Peer A's │
│    "hr96dq") │                          │     ID       │
│              │                          │              │
│              │◀──── WebRTC Handshake ──▶│  3. Click    │
│              │      (via PeerJS         │     Connect  │
│              │       signaling server)  │              │
│              │                          │              │
│  4. ✅ Connected ◀─────────────────────▶│  4. ✅ Connected
└─────────────┘                          └─────────────┘
```

### File Transfer Flow

1. **Sender** selects a file (drag & drop or file picker)
2. **Sender** clicks "🚀 Send File"
3. File metadata (name, size, type, chunk count) is sent first
4. File is read in **64 KB chunks** using `FileReader`
5. Each chunk is sent as an `ArrayBuffer` over the WebRTC data channel
6. **Receiver** collects chunks and reassembles them into a `Blob`
7. A download link is created for the receiver to save the file

### Key Technical Details

- **Chunk Size:** 64 KB (`64 * 1024` bytes) — balanced for throughput and reliability
- **Speed Tracking:** Sampled every 1 second by comparing bytes transferred
- **Peer ID Format:** 6 characters from `abcdefghjkmnpqrstuvwxyz23456789` (ambiguous characters like `0/O`, `1/l/I` are excluded)
- **Signaling:** Uses PeerJS's free cloud signaling server (`0.peerjs.com`) for the initial WebRTC handshake only

---

## 🎨 Design System

The UI uses a custom dark theme built on Tailwind CSS v4:

| Token | Value | Usage |
|---|---|---|
| `burger-400` | `#ffa333` | Primary accent (highlights, links) |
| `burger-500` | `#ff8c00` | Buttons, progress bar |
| `burger-600` | `#cc7000` | Button gradients, hover states |
| `surface` | `#0f0f14` | Page background |
| `surface-light` | `#1a1a24` | Input backgrounds |
| `glass` | `rgba(255,255,255,0.04)` | Glass card backgrounds |
| `success` | `#22c55e` | Connected status, transfer complete |
| `error` | `#ef4444` | Error states |

### UI Components

- **Glass Cards** — Frosted glass containers with `backdrop-filter: blur(20px)`
- **Glow Buttons** — Gradient buttons with hover glow and shine sweep animation
- **Pulse Dot** — Animated status indicator for connection state
- **Shimmer Progress** — Progress bar with animated shimmer effect
- **Fade-Up Animations** — Staggered entrance animations for each card

---

## 🧩 Component Reference

### `usePeer()` Hook

The core hook that manages all PeerJS and file transfer logic.

**Returns:**

| Property | Type | Description |
|---|---|---|
| `peerId` | `string` | Your generated 6-char peer ID |
| `status` | `string` | `'idle'` \| `'waiting'` \| `'connected'` \| `'error'` |
| `error` | `string` | Current error message (auto-clears after 4s) |
| `transferState` | `object \| null` | Current transfer progress (see below) |
| `receivedFiles` | `array` | List of received files with download URLs |
| `connectToPeer(id)` | `function` | Connect to a remote peer by ID |
| `disconnect()` | `function` | Close the active connection |
| `sendFile(file)` | `function` | Send a `File` object to the connected peer |
| `formatSize(bytes)` | `function` | Utility to format bytes → human readable |

**Transfer State Object:**

```js
{
  direction: 'send' | 'receive',
  fileName: 'photo.jpg',
  fileSize: 1048576,       // bytes
  transferred: 524288,     // bytes sent/received so far
  speed: 65536,            // bytes per second
  percent: 50,             // 0–100
  status: 'transferring' | 'complete' | 'error'
}
```

---

## ⚠️ Limitations

- **Same network preferred** — While WebRTC peer-to-peer (P2P) connections perform optimally on the same network or with robust NAT traversal, strict firewalls or symmetric NATs can occasionally block connections. However, testing confirms that this web app reliably connects peers across different networks in most real-world scenarios.
- **Single file at a time** — The current implementation sends one file per transfer. Queue support could be added in the future.
- **Browser tab must stay open** — Since files are held in memory as `Blob` objects, closing the tab loses received files.
- **No encryption beyond WebRTC** — WebRTC data channels use DTLS encryption by default, but there's no additional end-to-end encryption layer.

---

## 🗺️ Roadmap

- [ ] Multi-file transfer queue
- [ ] Folder/zip transfer support
- [ ] QR code for peer ID sharing
- [ ] Custom PeerJS server option
- [ ] End-to-end encryption with passphrase
- [ ] Transfer history persistence (IndexedDB)
- [ ] Mobile-responsive refinements

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with 🍔 by <a href="https://github.com/backuprp2temp-oss">backuprp2temp-oss</a>
</p>
