interface PrologueScreenProps {
  onEnter: () => void
}

export function PrologueScreen({ onEnter }: PrologueScreenProps) {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuB4N6cNKB2VrF9pbvLnFxFK-hIYMQKPtwVSCk-LWxBqyFuVinnJMjhENCKaJG4tBkj2c13oBiTZOX-JUAv5lzxY3HLhGAYef0lEAQxSJl6cBowd3g7Yzwg5ibW47dEWTl9EeoP3r8ok9TDnG3U-woBQORJ2qKTIyj9Ks7t2d2TEM6GmM289SLAGOLwCtDKTAFHoMeRfPLpcTklw8eknTJC5IfJu12tayW2dZcVaoRaKP27e9KFmoHfoxtXzV8qzdEOLTn9OR1KD024')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-surface-container-lowest/40" />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at center, rgba(212,175,55,0.12) 0%, transparent 70%)' }}
        />
        <div
          className="absolute inset-0"
          style={{ boxShadow: 'inset 0 0 150px 50px #0E0E0E' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl">
        <span className="font-label text-[10px] uppercase tracking-[0.4em] text-primary/80 mb-6 block">
          현재 상영 중
        </span>
        <h1
          className="font-headline text-6xl md:text-9xl text-primary font-extrabold tracking-tighter mb-8 leading-none"
          style={{ textShadow: '0 0 15px rgba(242,202,80,0.3)' }}
        >
          운명의 메아리
        </h1>
        <p className="font-body text-lg md:text-xl text-on-surface/70 max-w-2xl mx-auto mb-12 leading-relaxed italic">
          잊혀진 기록의 구석구석을 탐험하는 디지털 오디세이.<br />
          장막 너머로 발을 들여 시간이 자아내는 침묵의 기억을 마주하세요.
        </p>

        {/* CTA */}
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={onEnter}
            className="group relative px-10 py-4 border border-outline-variant/30 text-on-surface font-label uppercase tracking-[0.2em] text-xs hover:border-primary transition-all duration-700 bg-surface-container-highest/20 backdrop-blur-md"
          >
            <span className="relative z-10 group-hover:text-primary transition-colors duration-500">
              공허 속으로 입장하기
            </span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-primary/5" />
          </button>
          <div className="flex gap-8 mt-4 font-label text-[8px] uppercase tracking-widest text-on-surface/30">
            <span>제1권 — 프롤로그</span>
            <span>런타임: 무한</span>
            <span>포맷: 시네마틱 4K</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="font-label text-[8px] uppercase tracking-widest">강림하기</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent" />
      </div>
    </main>
  )
}
