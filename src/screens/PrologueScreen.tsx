interface PrologueScreenProps {
  onEnter: () => void
}

export function PrologueScreen({ onEnter }: PrologueScreenProps) {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        {/* 배경 이미지 — 밝기 낮춤 */}
        <div
          className="absolute inset-0 bg-cover bg-center brightness-50"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuB4N6cNKB2VrF9pbvLnFxFK-hIYMQKPtwVSCk-LWxBqyFuVinnJMjhENCKaJG4tBkj2c13oBiTZOX-JUAv5lzxY3HLhGAYef0lEAQxSJl6cBowd3g7Yzwg5ibW47dEWTl9EeoP3r8ok9TDnG3U-woBQORJ2qKTIyj9Ks7t2d2TEM6GmM289SLAGOLwCtDKTAFHoMeRfPLpcTklw8eknTJC5IfJu12tayW2dZcVaoRaKP27e9KFmoHfoxtXzV8qzdEOLTn9OR1KD024')`,
          }}
        />
        {/* 상하단 어둡게 */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-surface/80" />
        {/* 중앙 미세 골드 광원 */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 70%)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl">
        <span className="font-label text-[10px] uppercase tracking-[0.4em] text-primary mb-8 block">
          현재 상영 중
        </span>

        <h1
          className="font-headline text-5xl md:text-8xl text-primary font-extrabold tracking-tighter mb-8 leading-none"
          style={{ textShadow: '0 2px 40px rgba(212,175,55,0.25)' }}
        >
          운명의 메아리
        </h1>

        <p className="font-body text-base md:text-lg text-on-surface/90 max-w-xl mx-auto mb-12 leading-loose">
          잊혀진 기록의 구석구석을 탐험하는 디지털 오디세이.<br />
          장막 너머로 발을 들여 시간이 자아내는 침묵의 기억을 마주하세요.
        </p>

        {/* CTA */}
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={onEnter}
            className="group relative px-12 py-4 bg-primary/10 border border-primary/50 text-primary font-label uppercase tracking-[0.25em] text-xs hover:bg-primary hover:text-surface transition-all duration-500"
          >
            공허 속으로 입장하기
          </button>

          <div className="flex gap-8 font-label text-[8px] uppercase tracking-widest text-on-surface/40">
            <span>제1권 — 프롤로그</span>
            <span>런타임: 무한</span>
            <span>포맷: 시네마틱 4K</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="font-label text-[8px] uppercase tracking-widest text-on-surface">강림하기</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent" />
      </div>
    </main>
  )
}
