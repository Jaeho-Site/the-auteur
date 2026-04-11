import { useEffect, useRef, useState } from 'react'
import { useGemini } from '../hooks/useGemini'
import { LoadingSpinner } from '../components/LoadingSpinner'
import type { Genre, JobClass, StoryAct, StoryTurn } from '../types'

interface StoryScreenProps {
  genre: Genre
  character: { name: string; jobClass: JobClass }
  /** 3막이 모두 끝났을 때 완성된 턴 목록을 전달 */
  onComplete: (turns: StoryTurn[]) => void
  isGeneratingFinal: boolean
}

const MAX_TURNS = 3

export function StoryScreen({ genre, character, onComplete, isGeneratingFinal }: StoryScreenProps) {
  const { generateAllActs, isLoading, error } = useGemini()

  // 한 번에 받아온 3막 전체
  const [allActs, setAllActs] = useState<StoryAct[]>([])
  // 현재 보여주는 막 인덱스 (0~2)
  const [actIndex, setActIndex] = useState(0)
  // 사용자가 선택한 내용을 누적
  const [completedTurns, setCompletedTurns] = useState<StoryTurn[]>([])
  // 막 전환 애니메이션 트리거
  const [isTransitioning, setIsTransitioning] = useState(false)

  const initialized = useRef(false)

  // 마운트 시 3막 전체를 한 번에 받아온다
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    generateAllActs(genre, character)
      .then(setAllActs)
      .catch(() => {/* error는 hook이 관리 */})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const currentAct = allActs[actIndex] ?? null

  const handleChoice = (choice: string) => {
    if (!currentAct || isTransitioning) return

    const completedTurn: StoryTurn = {
      narrative: currentAct.narrative,
      choices: currentAct.choices,
      selectedChoice: choice,
    }
    const nextTurns = [...completedTurns, completedTurn]

    // 마지막 막이면 바로 완료 콜백
    if (actIndex + 1 >= MAX_TURNS) {
      onComplete(nextTurns)
      return
    }

    // 다음 막으로 즉시 전환 (fade 트랜지션)
    setIsTransitioning(true)
    setCompletedTurns(nextTurns)

    setTimeout(() => {
      setActIndex((i) => i + 1)
      setIsTransitioning(false)
    }, 400)
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center pt-32 pb-48 px-6">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center grayscale opacity-40"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDR_qfysk99XlIk06P5C6TUDU3Hixtt9SAN_FfNaeZeZacmWsBgr_DFRHg3EhjAy1wkFg1DZn7lWGUxgFylAIVbD8Iusx233K8w1W2uyxkWchmY5fiFmgPKhQzm5YsPQDjYOtaHVhD6Kk-TX3PfmSapKiT06r6zYmjfsSQG0aGqLzUJYtU1CzTxMIita3QnM96Ur0-DOLl-bL2dH8DYij3RNZuNEH8W0bPyp-vhu5nFUsW8WQhIkfa5dfX4IjjvrFxz_Uhw-s7d8bw')`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle, transparent 40%, rgba(14,14,14,0.95) 100%)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface/20 via-surface/40 to-surface" />
      </div>

      {/* 장르 뱃지 */}
      <div className="fixed bottom-8 left-8 z-[60] flex flex-col gap-2">
        <div className="w-12 h-[1px] bg-primary/30" />
        <div className="flex flex-col gap-1">
          <span className="font-label text-[8px] uppercase tracking-tighter text-on-surface/40">장르</span>
          <span className="font-headline text-[10px] tracking-widest text-primary italic">{genre}</span>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">

        {/* ── 로딩: 3막 전체를 처음 한 번만 기다림 ── */}
        {isLoading && allActs.length === 0 && (
          <LoadingSpinner message="AI가 당신의 운명을 집필하고 있습니다..." />
        )}

        {/* ── 최종 결과 생성 중 ── */}
        {isGeneratingFinal && (
          <LoadingSpinner message="운명의 결말을 기록하고 있습니다..." />
        )}

        {/* ── 오류 ── */}
        {error && !isLoading && (
          <div className="p-4 border border-error/30 bg-error-container/20 rounded text-error font-body text-sm text-center max-w-lg">
            오류가 발생했습니다: {error}
          </div>
        )}

        {/* ── 스토리 본문 (로딩 완료 후 즉시 렌더) ── */}
        {!isLoading && !isGeneratingFinal && currentAct && (
          <>
            {/* 막 표시 */}
            <div className="mb-16 flex flex-col items-center gap-2">
              <span
                className="font-label text-[10px] tracking-[0.4em] text-primary uppercase font-bold"
                style={{ textShadow: '0 0 20px rgba(242,202,80,0.2)' }}
              >
                제 {actIndex + 1} 막 / {MAX_TURNS}막
              </span>
              <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            </div>

            {/* 서사 + 선택지 — fade 트랜지션 */}
            <article
              className="text-center space-y-12 w-full transition-opacity duration-400"
              style={{ opacity: isTransitioning ? 0 : 1 }}
            >
              <p className="font-headline text-2xl md:text-3xl leading-relaxed text-on-surface italic font-light opacity-90 tracking-tight">
                {currentAct.narrative}
              </p>

              <div className="mt-16 w-full flex flex-col md:flex-row gap-6 justify-center items-stretch">
                {currentAct.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChoice(choice)}
                    disabled={isTransitioning}
                    className="group relative flex-1 px-8 py-6 border border-outline-variant/30 bg-surface-container-lowest/40 backdrop-blur-md transition-all duration-500 hover:bg-on-surface hover:text-surface disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 font-headline italic text-lg tracking-wide group-hover:font-bold">
                      {choice}
                    </span>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-primary" />
                  </button>
                ))}
              </div>

              {/* 진행 도트 */}
              <div className="flex gap-3 justify-center mt-8">
                {Array.from({ length: MAX_TURNS }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all duration-500 ${
                      i < actIndex
                        ? 'w-2 h-2 bg-primary'
                        : i === actIndex
                        ? 'w-3 h-3 bg-primary/70 scale-110'
                        : 'w-2 h-2 bg-outline-variant/30'
                    }`}
                  />
                ))}
              </div>
            </article>
          </>
        )}
      </div>
    </main>
  )
}
