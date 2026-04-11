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

// generateAllActs → generateFinalResult 간 모크 엔트리 공유
let _currentMockEntry: MockEntry | null = null

// ── Mock helpers ───────────────────────────────────────────────────────────

function findMockEntry(genre: Genre, jobClass: JobClass): MockEntry {
  const exact = MOCK_DATA.find(e => e.genre === genre && e.jobClass === jobClass)
  if (exact) return exact
  const fallback = MOCK_DATA.find(e => e.genre === genre)
  if (fallback) return fallback
  throw new Error(`'${genre}' 장르의 모크 데이터가 없습니다.`)
}

function mockGetAllActs(genre: Genre, character: { name: string; jobClass: JobClass }): StoryAct[] {
  const entry = findMockEntry(genre, character.jobClass)
  _currentMockEntry = entry
  return entry.acts.map(act => ({
    narrative: act.narrative,
    choices: [act.choices.A, act.choices.B] as [string, string],
  }))
}

function mockGetFinalResult(turns: StoryTurn[]): FinalResult {
  if (!_currentMockEntry) throw new Error('스토리 데이터가 초기화되지 않았습니다.')
  const key = turns
    .map((turn, i) => (turn.selectedChoice === _currentMockEntry!.acts[i]?.choices.A ? 'A' : 'B'))
    .join('-')
  const found = _currentMockEntry.results[key]
  if (!found) throw new Error(`결과 키 '${key}'를 찾을 수 없습니다.`)
  return { finalSentence: found.finalSentence, fate: found.fate }
}

// ── Gemini API 연동 (Lambda 프록시) ───────────────────────────────────────
// AWS Lambda → Gemini 2.5 Flash 를 통해 스토리와 결말을 동적으로 생성한다.
// Lambda 엔드포인트: POST /generate-acts, POST /generate-result

function getBaseUrl(): string {
  const url = import.meta.env.VITE_API_BASE_URL
  if (!url) throw new Error('VITE_API_BASE_URL 환경 변수가 없습니다.')
  return url.replace(/\/$/, '')
}

export async function generateFinalResultFromAPI(
  genre: Genre,
  character: { name: string; jobClass: JobClass },
  turns: StoryTurn[]
): Promise<FinalResult> {
  const res = await fetch(`${getBaseUrl()}/generate-result`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ genre, character, turns }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API 오류 ${res.status}: ${text}`)
  }
  return res.json() as Promise<FinalResult>
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
        return mockGetAllActs(genre, character)
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
      _genre: Genre,
      _character: { name: string; jobClass: JobClass },
      turns: StoryTurn[]
    ): Promise<FinalResult> => {
      setIsLoading(true)
      setError(null)
      try {
        return mockGetFinalResult(turns)
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
