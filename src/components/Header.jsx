export default function Header() {
  return (
    <header className="text-center pt-10 pb-6 animate-fade-up">
      <div className="inline-flex items-center gap-3 mb-3">
        <span className="text-5xl" role="img" aria-label="burger">
          🍔
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-burger-400 via-burger-500 to-burger-600 bg-clip-text text-transparent">
            File
          </span>{' '}
          <span className="text-text-primary">Burger</span>
        </h1>
      </div>
      <p className="text-text-secondary text-sm sm:text-base max-w-md mx-auto leading-relaxed">
        Peer-to-peer file transfer powered by WebRTC.
        <br />
        <span className="text-text-muted">No servers. No uploads. Just direct.</span>
      </p>
    </header>
  );
}
