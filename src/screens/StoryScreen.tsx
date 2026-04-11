import { useEffect, useRef, useState } from 'react'
import { useGemini } from '../hooks/useGemini'
import { LoadingSpinner } from '../components/LoadingSpinner'
import type { Genre, JobClass, StoryTurn } from '../types'

interface StoryScreenProps {
  genre: Genre
  character: { name: string; jobClass: JobClass }
  onChoiceMade: (turn: StoryTurn) => void
  onFinish: () => void
  isGeneratingFinal: boolean
  completedTurns: StoryTurn[]
}

const MAX_TURNS = 3

export function StoryScreen({
  genre,
  character,
  onChoiceMade,
  onFinish,
  isGeneratingFinal,
  completedTurns,
}: StoryScreenProps) {
  const { generateStoryTurn, isLoading, error } = useGemini()
  const [currentTurn, setCurrentTurn] = useState<{
    narrative: string
    choices: [string, string]
  } | null>(null)
  const initialized = useRef(false)

  const turnNumber = completedTurns.length

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    const load = async () => {
      try {
        const result = await generateStoryTurn(genre, character, completedTurns, turnNumber)
        setCurrentTurn(result)
      } catch {
        // handled by hook
      }
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChoice = async (choice: string) => {
    if (!currentTurn) return

    const completedTurn: StoryTurn = {
      narrative: currentTurn.narrative,
      choices: currentTurn.choices,
      selectedChoice: choice,
    }
    onChoiceMade(completedTurn)

    if (turnNumber + 1 >= MAX_TURNS) {
      onFinish()
      return
    }

    setCurrentTurn(null)
    try {
      const nextTurns = [...completedTurns, completedTurn]
      const result = await generateStoryTurn(genre, character, nextTurns, nextTurns.length)
      setCurrentTurn(result)
    } catch {
      // handled by hook
    }
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

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        {/* Turn indicator */}
        <div className="mb-16 flex flex-col items-center gap-2">
          <span
            className="font-label text-[10px] tracking-[0.4em] text-primary uppercase font-bold"
            style={{ textShadow: '0 0 20px rgba(242,202,80,0.2)' }}
          >
            제 {turnNumber + 1} 막 / {MAX_TURNS}막
          </span>
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>

        {/* Genre badge */}
        <div className="fixed bottom-8 left-8 z-[60] flex flex-col gap-2">
          <div className="w-12 h-[1px] bg-primary/30" />
          <div className="flex flex-col gap-1">
            <span className="font-label text-[8px] uppercase tracking-tighter text-on-surface/40">장르</span>
            <span className="font-headline text-[10px] tracking-widest text-primary italic">{genre}</span>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 border border-error/30 bg-error-container/20 rounded text-error font-body text-sm text-center max-w-lg">
            오류: {error}
          </div>
        )}

        {(isLoading && !currentTurn) || isGeneratingFinal ? (
          <LoadingSpinner
            message={
              isGeneratingFinal
                ? '운명의 결말을 작성하고 있습니다...'
                : 'AI가 운명을 직조하고 있습니다...'
            }
          />
        ) : currentTurn ? (
          <article className="text-center space-y-12 w-full">
            <p className="font-headline text-2xl md:text-3xl leading-relaxed text-on-surface italic font-light opacity-90 tracking-tight">
              {currentTurn.narrative}
            </p>

            <div className="mt-16 w-full flex flex-col md:flex-row gap-6 justify-center items-stretch">
              {currentTurn.choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChoice(choice)}
                  disabled={isLoading}
                  className="group relative flex-1 px-8 py-6 border border-outline-variant/30 bg-surface-container-lowest/40 backdrop-blur-md transition-all duration-500 hover:bg-on-surface hover:text-surface disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 font-headline italic text-lg tracking-wide group-hover:font-bold">
                    {choice}
                  </span>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-primary" />
                </button>
              ))}
            </div>

            {/* Progress dots */}
            <div className="flex gap-3 justify-center mt-8">
              {Array.from({ length: MAX_TURNS }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    i < turnNumber
                      ? 'bg-primary'
                      : i === turnNumber
                      ? 'bg-primary/50 scale-125'
                      : 'bg-outline-variant/30'
                  }`}
                />
              ))}
            </div>
          </article>
        ) : null}
      </div>
    </main>
  )
}
