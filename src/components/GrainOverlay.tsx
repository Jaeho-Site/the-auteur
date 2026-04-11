export function GrainOverlay() {
  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-[999]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.04,
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none z-[90]"
        style={{
          background: 'radial-gradient(circle, transparent 40%, rgba(14,14,14,0.85) 100%)',
        }}
      />
    </>
  )
}
