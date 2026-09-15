export function BackgroundMotion() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Base deep background */}
      <div className="absolute inset-0 bg-[#090A0F]" />

      {/* Primary ambient drifting blob 1 (Hero & Contact warm orange) */}
      <div
        className="absolute w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] rounded-full blur-[120px] animate-ambient-1"
        style={{
          top: '-15%',
          left: '10%',
          background: 'radial-gradient(circle, rgba(200,77,22,0.12) 0%, rgba(200,77,22,0) 70%)',
          willChange: 'transform, opacity',
        }}
      />

      {/* Secondary drifting blob 2 (Mid-page / Skills / Projects cool technical hint) */}
      <div
        className="absolute w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full blur-[140px] animate-ambient-2"
        style={{
          top: '35%',
          right: '-10%',
          background: 'radial-gradient(circle, rgba(116,116,217,0.05) 0%, rgba(32,184,137,0.03) 40%, rgba(19,21,29,0) 70%)',
          willChange: 'transform, opacity',
        }}
      />

      {/* Tertiary warm contact climax blob at the bottom */}
      <div
        className="absolute w-[550px] h-[550px] sm:w-[750px] sm:h-[750px] rounded-full blur-[130px] animate-ambient-3"
        style={{
          bottom: '-10%',
          right: '15%',
          background: 'radial-gradient(circle, rgba(200,77,22,0.15) 0%, rgba(228,102,39,0.06) 45%, rgba(9,10,15,0) 70%)',
          willChange: 'transform, opacity',
        }}
      />

      {/* Fine subtle noise overlay for editorial texture */}
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
