import { useState, useCallback } from 'react'
import type { Genre, JobClass, StoryAct, StoryTurn, FinalResult } from '../types'

// ── Mock data imports ──────────────────────────────────────────────────────
import romanceData from '../../lambda/romance.json'
import fantasyData from '../../lambda/fantasy.json'
import sfData from '../../lambda/sf.json'
import horrorData from '../../lambda/horror.json'
import comedyData from '../../lambda/comedy.json'
import apocalypseData from '../../lambda/apocalypse.json'

type MockEntry = {
  genre: string
  jobClass: string
  acts: Array<{
    act: number
    narrative: string
    choices: { A: string; B: string }
  }>
  results: Record<string, { finalSentence: string; fate: string }>
}

const MOCK_DATA: MockEntry[] = [
  ...(romanceData as MockEntry[]),
  ...(fantasyData as MockEntry[]),
  ...(sfData as MockEntry[]),
  ...(horrorData as MockEntry[]),
  ...(comedyData as MockEntry[]),
  ...(apocalypseData as MockEntry[]),
]

// 현재 진행 중인 모크 엔트리를 저장 (generateAllActs → generateFinalResult 연결용)
let _currentMockEntry: MockEntry | null = null

function findMockEntry(genre: Genre, jobClass: JobClass): MockEntry | null {
  // 장르 + 직업 정확 일치 우선
  const exact = MOCK_DATA.find(e => e.genre === genre && e.jobClass === jobClass)
  if (exact) return exact
  // 장르만 일치하는 첫 번째 항목으로 폴백
  return MOCK_DATA.find(e => e.genre === genre) ?? null
}

function mockGenerateAllActs(genre: Genre, character: { name: string; jobClass: JobClass }): StoryAct[] {
  const entry = findMockEntry(genre, character.jobClass)
  if (!entry) throw new Error(`'${genre}' 장르의 모크 데이터가 없습니다.`)
  _currentMockEntry = entry
  return entry.acts.map(act => ({
    narrative: act.narrative,
    choices: [act.choices.A, act.choices.B] as [string, string],
  }))
}

function mockGenerateFinalResult(turns: StoryTurn[]): FinalResult {
  if (!_currentMockEntry) throw new Error('스토리 데이터가 초기화되지 않았습니다.')
  const key = turns
    .map((turn, i) => {
      const mockAct = _currentMockEntry!.acts[i]
      return turn.selectedChoice === mockAct?.choices.A ? 'A' : 'B'
    })
    .join('-')
  const mockResult = _currentMockEntry.results[key]
  if (!mockResult) throw new Error(`결과 키 '${key}'에 해당하는 데이터가 없습니다.`)
  return {
    finalSentence: mockResult.finalSentence,
    fate: mockResult.fate,
  }
}

// ── API helpers ────────────────────────────────────────────────────────────
const getBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_BASE_URL
  if (!url) throw new Error('VITE_API_BASE_URL 환경 변수가 설정되지 않았습니다.')
  return url.replace(/\/$/, '')
}

// ── Hook ───────────────────────────────────────────────────────────────────
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
        // API URL이 없으면 바로 모크 사용
        if (!import.meta.env.VITE_API_BASE_URL) {
          return mockGenerateAllActs(genre, character)
        }

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
        // API 실패 시 모크 데이터로 폴백
        try {
          console.warn('[useGemini] API 실패, 모크 데이터로 대체합니다:', err)
          return mockGenerateAllActs(genre, character)
        } catch (mockErr) {
          const message = mockErr instanceof Error ? mockErr.message : '알 수 없는 오류'
          setError(message)
          throw mockErr
        }
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
        // API URL이 없으면 바로 모크 사용
        if (!import.meta.env.VITE_API_BASE_URL) {
          return mockGenerateFinalResult(turns)
        }

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
        // API 실패 시 모크 데이터로 폴백
        try {
          console.warn('[useGemini] API 실패, 모크 데이터로 대체합니다:', err)
          return mockGenerateFinalResult(turns)
        } catch (mockErr) {
          const message = mockErr instanceof Error ? mockErr.message : '알 수 없는 오류'
          setError(message)
          throw mockErr
        }
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { generateAllActs, generateFinalResult, isLoading, error }
}
