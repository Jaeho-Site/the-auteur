import { useState, useCallback } from 'react'
import type { Genre, JobClass, StoryAct, StoryTurn, FinalResult } from '../types'

const getBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_BASE_URL
  if (!url) {
    throw new Error('VITE_API_BASE_URL 환경 변수가 설정되지 않았습니다. .env 파일을 확인하세요.')
  }
  return url.replace(/\/$/, '') // trailing slash 제거
}

interface UseGeminiReturn {
  generateAllActs: (
    genre: Genre,
    character: { name: string; jobClass: JobClass }
  ) => Promise<StoryAct[]>
  generateFinalResult: (
    genre: Genre,
    character: { name: string; jobClass: JobClass },
    turns: StoryTurn[]
  ) => Promise<FinalResult>
  isLoading: boolean
  error: string | null
}

export function useGemini(): UseGeminiReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateAllActs = useCallback(
    async (
      genre: Genre,
      character: { name: string; jobClass: JobClass }
    ): Promise<StoryAct[]> => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`${getBaseUrl()}/generate-acts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ genre, character }),
        })

        if (!res.ok) {
          const text = await res.text()
          throw new Error(`API 오류 ${res.status}: ${text}`)
        }

        const { acts } = await res.json() as {
          acts: Array<{ narrative: string; choices: [string, string] }>
        }
        return acts
      } catch (err) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const generateFinalResult = useCallback(
    async (
      genre: Genre,
      character: { name: string; jobClass: JobClass },
      turns: StoryTurn[]
    ): Promise<FinalResult> => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`${getBaseUrl()}/generate-result`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ genre, character, turns }),
        })

        if (!res.ok) {
          const text = await res.text()
          throw new Error(`API 오류 ${res.status}: ${text}`)
        }

        return await res.json() as FinalResult
      } catch (err) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { generateAllActs, generateFinalResult, isLoading, error }
}
