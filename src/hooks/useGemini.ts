import { useState, useCallback } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Genre, JobClass, StoryAct, StoryTurn, FinalResult } from '../types'

const getApiKey = (): string => {
  const key = import.meta.env.VITE_GEMINI_API_KEY
  if (!key) {
    throw new Error('VITE_GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. .env 파일을 확인하세요.')
  }
  return key
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
        const genAI = new GoogleGenerativeAI(getApiKey())
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const prompt = `당신은 한국어 인터랙티브 소설 작가입니다.

장르: ${genre}
주인공 이름: ${character.name}
직업: ${character.jobClass}

아래 규칙에 따라 5막 구조의 이야기를 작성하세요.

[서사 규칙]
- 각 막의 서사는 3~4문장, 간결하고 핵심만 담을 것.
- 각 막은 바로 앞 막의 사건을 원인으로 이어지는 인과 구조여야 한다.
- 장르와 주인공 직업이 서사에 자연스럽게 녹아들어야 한다.
- 5막 전체가 하나의 완결된 이야기 호를 이루어야 한다.
  - 1막: 발단 — 사건의 시작
  - 2막: 전개 — 첫 번째 위기
  - 3막: 위기 — 상황 악화 혹은 반전
  - 4막: 절정 — 핵심 갈등의 정점
  - 5막: 결말 직전 — 마지막 선택의 기로

[선택지 규칙]
- 선택지는 반드시 그 막의 서사 상황에서 자연스럽게 발생하는 두 가지 행동이어야 한다.
- 선택지 두 개의 방향성은 대조적이어야 한다 (예: 도망 vs 맞섬, 믿음 vs 의심, 한다 vs 안한다).
- 각 선택지는 10자 내외의 짧은 행동 표현으로 작성한다.

반드시 다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "acts": [
    { "narrative": "1막 서사", "choice1": "선택지A", "choice2": "선택지B" },
    { "narrative": "2막 서사", "choice1": "선택지A", "choice2": "선택지B" },
    { "narrative": "3막 서사", "choice1": "선택지A", "choice2": "선택지B" },
    { "narrative": "4막 서사", "choice1": "선택지A", "choice2": "선택지B" },
    { "narrative": "5막 서사", "choice1": "선택지A", "choice2": "선택지B" }
  ]
}`

        const result = await model.generateContent(prompt)
        const text = result.response.text().trim()

        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('AI 응답 파싱 실패')

        const parsed = JSON.parse(jsonMatch[0]) as {
          acts: Array<{ narrative: string; choice1: string; choice2: string }>
        }

        return parsed.acts.map((act) => ({
          narrative: act.narrative,
          choices: [act.choice1, act.choice2] as [string, string],
        }))
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
        const genAI = new GoogleGenerativeAI(getApiKey())
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const storyHistory = turns
          .map(
            (t, i) =>
              `[${i + 1}막] ${t.narrative} → 선택: "${t.selectedChoice ?? '미선택'}"`
          )
          .join('\n')

        const prompt = `당신은 한국어 인터랙티브 소설 작가입니다.

장르: ${genre}
주인공 이름: ${character.name}
직업: ${character.jobClass}

아래는 주인공이 걸어온 5막의 여정과 각 막에서 내린 선택입니다:

${storyHistory}

[결말 작성 규칙]
- 결말은 위의 선택들이 쌓인 직접적인 결과여야 한다. 선택과 결말 사이의 인과가 명확해야 한다.
- finalSentence: 주인공의 최후를 묘사하는 두 문장. 서사의 흐름과 선택이 어떻게 이 결말을 만들었는지 느껴지도록 쓸 것.
- fate: "${character.name}, [선택들을 관통하는 주인공의 특성 한 구절]" 형식의 한 줄 요약.
- keyMoments: 5막 중 결말에 가장 큰 영향을 준 3개의 막을 골라, 그 선택이 어떤 결과를 낳았는지 한 문장씩 서술한다.

반드시 다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "finalSentence": "결말 두 문장",
  "fate": "${character.name}, [한 줄 요약]",
  "keyMoments": [
    { "actNumber": 1, "label": "제 1막의 선택", "description": "이 선택이 낳은 결과 한 문장" },
    { "actNumber": 3, "label": "제 3막의 선택", "description": "이 선택이 낳은 결과 한 문장" },
    { "actNumber": 5, "label": "제 5막의 선택", "description": "이 선택이 낳은 결과 한 문장" }
  ]
}`

        const result = await model.generateContent(prompt)
        const text = result.response.text().trim()

        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('AI 응답 파싱 실패')

        const parsed = JSON.parse(jsonMatch[0]) as {
          finalSentence: string
          fate: string
          keyMoments: Array<{ actNumber: number; label: string; description: string }>
        }

        const icons = ['looks_one', 'looks_3', 'looks_5']
        return {
          finalSentence: parsed.finalSentence,
          fate: parsed.fate,
          choicesSummary: parsed.keyMoments.map((m, i) => ({
            icon: icons[i] ?? 'star',
            label: m.label,
            description: m.description,
          })),
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
