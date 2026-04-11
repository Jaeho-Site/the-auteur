import { useState, useCallback, useRef } from 'react'
import { GrainOverlay } from './components/GrainOverlay'
import { Header } from './components/Header'
import { PrologueScreen } from './screens/PrologueScreen'
import { GenreSelectScreen } from './screens/GenreSelectScreen'
import { CharacterSetupScreen } from './screens/CharacterSetupScreen'
import { StoryScreen } from './screens/StoryScreen'
import { ResultScreen } from './screens/ResultScreen'
import { useGemini } from './hooks/useGemini'
import type { Screen, Genre, JobClass, GameState, StoryTurn } from './types'

const INITIAL_STATE: GameState = {
  genre: null,
  character: null,
  turns: [],
  finalResult: null,
}

export function App() {
  const [screen, setScreen] = useState<Screen>('prologue')
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE)
  const [isGeneratingFinal, setIsGeneratingFinal] = useState(false)
  const { generateFinalResult } = useGemini()

  const handleGenreSelect = useCallback((genre: Genre) => {
    setGameState((prev) => ({ ...prev, genre }))
    setScreen('character-setup')
  }, [])

  const handleCharacterConfirm = useCallback((name: string, jobClass: JobClass) => {
    setGameState((prev) => ({
      ...prev,
      character: { name, jobClass },
      turns: [],
      finalResult: null,
    }))
    setScreen('story')
  }, [])

  // StoryScreen이 3막을 모두 완료하면 turns를 직접 전달받아 처리
  // gameStateRef를 통해 genre/character를 안정적으로 참조 (stale closure 방지)
  const gameStateRef = useRef(gameState)
  gameStateRef.current = gameState

  const handleStoryComplete = useCallback(
    async (turns: StoryTurn[]) => {
      const { genre, character } = gameStateRef.current
      if (!genre || !character) return

      setGameState((prev) => ({ ...prev, turns }))
      setIsGeneratingFinal(true)
      setScreen('result')

      try {
        const result = await generateFinalResult(genre, character, turns)
        setGameState((prev) => ({ ...prev, finalResult: result }))
      } catch {
        // ResultScreen이 isLoading 상태로 오류 처리
      } finally {
        setIsGeneratingFinal(false)
      }
    },
    [generateFinalResult]
  )

  const handleRestart = useCallback(() => {
    setGameState(INITIAL_STATE)
    setIsGeneratingFinal(false)
    setScreen('prologue')
  }, [])

  return (
    <div className="dark bg-surface text-on-surface font-body min-h-screen overflow-x-hidden selection:bg-primary/30">
      <GrainOverlay />
      <Header currentScreen={screen} onGoHome={handleRestart} />

      {screen === 'prologue' && (
        <PrologueScreen onEnter={() => setScreen('genre-select')} />
      )}

      {screen === 'genre-select' && (
        <GenreSelectScreen onSelect={handleGenreSelect} />
      )}

      {screen === 'character-setup' && (
        <CharacterSetupScreen onConfirm={handleCharacterConfirm} />
      )}

      {screen === 'story' && gameState.genre && gameState.character && (
        <StoryScreen
          genre={gameState.genre}
          character={gameState.character}
          onComplete={handleStoryComplete}
          isGeneratingFinal={isGeneratingFinal}
        />
      )}

      {screen === 'result' && (
        <ResultScreen
          characterName={gameState.character?.name ?? ''}
          result={gameState.finalResult}
          isLoading={isGeneratingFinal}
          onRestart={handleRestart}
        />
      )}

      <footer className="relative z-20 w-full py-8 flex flex-col items-center gap-3 bg-transparent">
        <div className="flex gap-8">
          {['개인정보 보호', '이용약관', '복호화'].map((label) => (
            <span key={label} className="font-label uppercase tracking-widest text-[8px] text-on-surface/20">
              {label}
            </span>
          ))}
        </div>
        <p className="font-label uppercase tracking-widest text-[8px] text-primary/40">
          © MMXXIV THE VOID COLLECTIVE
        </p>
      </footer>
    </div>
  )
}
