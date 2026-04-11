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

// ── localStorage — "이미 본 결과" 추적 ────────────────────────────────────

const LS_KEY = 'auteur_seen_results'

function getSeenKeys(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

function markAsSeen(key: string): void {
  try {
    const seen = getSeenKeys()
    seen.add(key)
    localStorage.setItem(LS_KEY, JSON.stringify([...seen]))
  } catch {
    // localStorage 사용 불가 환경에서는 무시
  }
}

/**
 * 장르:직업:A-B-A 형태의 결과 고유 키 생성
 * _currentMockEntry의 choices.A와 비교해 A/B를 판별한다.
 */
function buildResultKey(genre: Genre, character: { jobClass: JobClass }, turns: StoryTurn[]): string {
  const seq = turns
    .map((turn, i) => (turn.selectedChoice === _currentMockEntry?.acts[i]?.choices.A ? 'A' : 'B'))
    .join('-')
  return `${genre}:${character.jobClass}:${seq}`
}

// ── API helper ─────────────────────────────────────────────────────────────

function getBaseUrl(): string {
  const url = import.meta.env.VITE_API_BASE_URL
  if (!url) throw new Error('VITE_API_BASE_URL 환경 변수가 없습니다.')
  return url.replace(/\/$/, '')
}

async function apiGenerateFinalResult(
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

  /**
   * 항상 목업 데이터 반환.
   * 어차피 고정된 시나리오이므로 API 호출 불필요.
   */
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

  /**
   * 결과 전략:
   *  - 처음 보는 결과 → 목업 즉시 반환 + localStorage에 기록
   *  - 동일 경로를 다시 선택한 경우 → 실제 API 호출 (실패 시 목업 폴백)
   */
  const generateFinalResult = useCallback(
    async (
      genre: Genre,
      character: { name: string; jobClass: JobClass },
      turns: StoryTurn[]
    ): Promise<FinalResult> => {
      setIsLoading(true)
      setError(null)
      try {
        const resultKey = buildResultKey(genre, character, turns)
        const seen = getSeenKeys()

        if (!seen.has(resultKey)) {
          // 첫 번째 플레이: 목업 반환 후 키 저장
          markAsSeen(resultKey)
          return mockGetFinalResult(turns)
        }

        // 동일 경로 재플레이: 실제 API 시도
        try {
          return await apiGenerateFinalResult(genre, character, turns)
        } catch (apiErr) {
          console.warn('[useGemini] API 실패, 목업으로 대체합니다:', apiErr)
          return mockGetFinalResult(turns)
        }
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
