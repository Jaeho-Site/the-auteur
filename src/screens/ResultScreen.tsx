import type { FinalResult } from '../types'
import { LoadingSpinner } from '../components/LoadingSpinner'

interface ResultScreenProps {
  characterName: string
  result: FinalResult | null
  isLoading: boolean
  onRestart: () => void
}

export function ResultScreen({ characterName, result, isLoading, onRestart }: ResultScreenProps) {
  return (
    <main className="relative z-20 min-h-screen">
      {/* Fixed Background */}
      <div
        className="fixed inset-0 z-[-1]"
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCxhJ_bw37UpG5AZ5sdS236N7TRXIFr3iY3nY9VoJgKG3VWiFLZ7W0y-wF6eagysVjrwM4byJ21YNEv90Xg7Prod7bqxl8hotFNrHD9rMfrqU6ntsqcr5t3rpqsQvA3FLnzMJd9iICvbLTftPAgir-PFahq5VHj5OdniZnVTIJ4-fkm19Yr8z1oBewxGIQB7Y4PEEocT6Qxpbe4AcLfINBoARKbjp80Ek2r4S7LGbPuSXvMe0ccxuHmyoPyd2UBSHaM9aJXjnpt-0c')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.2) saturate(0.3) blur(2px)',
        }}
      />

      {isLoading || !result ? (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner message="운명의 결말을 기록하고 있습니다..." />
        </div>
      ) : (
        <>
          {/* Hero Result Section */}
          <section className="h-screen flex flex-col justify-center items-center px-6 text-center">
            <div className="mb-4">
              <span className="font-label text-[10px] uppercase tracking-[0.4em] text-primary/60">
                운명의 결과
              </span>
            </div>
            <h1
              className="font-headline italic text-5xl md:text-8xl text-primary tracking-tighter mb-6 max-w-5xl"
              style={{ textShadow: '0 10px 30px rgba(0,0,0,0.9), 0 0 20px rgba(212,175,55,0.3)' }}
            >
              당신의 운명이<br />결정되었습니다
            </h1>
            <div className="mt-4 p-4 border-t border-b border-primary/20">
              <p className="font-body text-xl md:text-2xl text-on-surface opacity-90 tracking-wide">
                {characterName},{' '}
                <span className="italic text-primary/80">{result.fate}</span>
              </p>
            </div>
            <div className="w-px h-24 bg-gradient-to-b from-primary/60 to-transparent mt-12" />
          </section>

          {/* Final Summary Content */}
          <article className="max-w-4xl mx-auto px-6 pb-40 space-y-24">
            {/* Final Sentence */}
            <section className="text-center px-4 md:px-12 py-16 bg-surface-container-low/40 backdrop-blur-md border border-outline-variant/10 rounded-sm">
              <span className="material-symbols-outlined text-primary/40 text-4xl mb-6 block">skull</span>
              <h2 className="font-body text-xl md:text-3xl leading-relaxed text-on-surface font-light italic">
                {result.finalSentence}
              </h2>
            </section>

            {/* Key Journey Recap */}
            {result.choicesSummary && result.choicesSummary.length > 0 && (
              <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {result.choicesSummary.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center text-center p-8 bg-surface-container-high/20 border-t border-primary/20"
                  >
                    <span className="material-symbols-outlined text-primary/60 mb-4 text-3xl">
                      {item.icon}
                    </span>
                    <span className="font-label text-[9px] uppercase tracking-widest text-primary/60 mb-2">
                      {item.label}
                    </span>
                    <p className="font-body text-sm text-on-surface/80">{item.description}</p>
                  </div>
                ))}
              </section>
            )}

            {/* Final CTA */}
            <section className="flex flex-col items-center pt-20 border-t border-outline-variant/10">
              <div className="mb-12 text-center">
                <h3 className="font-headline text-4xl text-on-surface mb-4">
                  여정의 끝, 그리고 시작.
                </h3>
                <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary/60">
                  하나의 기록이 닫히고 새로운 가능성이 열립니다.
                </p>
              </div>
              <button
                onClick={onRestart}
                className="group relative px-16 py-6 bg-primary-container text-on-primary-container font-label font-bold uppercase tracking-[0.2em] text-sm overflow-hidden transition-all duration-500 hover:shadow-[0_0_50px_rgba(212,175,55,0.4)] active:scale-95"
              >
                <span className="relative z-10">새로운 운명을 개척하기</span>
                <div className="absolute inset-0 bg-primary-fixed transform translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
              </button>

              <div className="mt-24 flex items-center gap-8 opacity-20">
                <div className="w-12 h-[1px] bg-on-surface" />
                <span className="material-symbols-outlined text-xl">rebase_edit</span>
                <div className="w-12 h-[1px] bg-on-surface" />
              </div>
            </section>
          </article>
        </>
      )}
    </main>
  )
}
