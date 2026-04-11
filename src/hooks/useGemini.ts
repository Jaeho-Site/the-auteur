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

        const prompt = `당신은 시네마틱한 한국어 인터랙티브 소설의 서술자입니다.

장르: ${genre}
주인공 이름: ${character.name}
직업: ${character.jobClass}

기승전결이 있는 3막 구조의 이야기 전체를 한 번에 작성하세요.
- 각 막은 짧고 강렬한 서사(3~5문장)로 구성됩니다.
- 각 막 말미에 주인공이 선택할 수 있는 두 가지 선택지(10~15자)를 제시합니다.
- 1막은 도입부, 2막은 위기·전환, 3막은 절정으로 구성하세요.
- 이야기 전체가 하나의 일관된 흐름을 가져야 합니다.

반드시 다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "acts": [
    { "narrative": "1막 서사", "choice1": "선택지A", "choice2": "선택지B" },
    { "narrative": "2막 서사", "choice1": "선택지A", "choice2": "선택지B" },
    { "narrative": "3막 서사", "choice1": "선택지A", "choice2": "선택지B" }
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
              `[${i + 1}막] 서사: ${t.narrative}\n선택: ${t.selectedChoice ?? '미선택'}`
          )
          .join('\n\n')

        const prompt = `당신은 시네마틱한 한국어 인터랙티브 소설의 서술자입니다.

장르: ${genre}
주인공 이름: ${character.name}
직업: ${character.jobClass}

전체 스토리:
${storyHistory}

위 이야기의 결말을 작성해 주세요.

반드시 다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "finalSentence": "주인공의 운명을 묘사하는 한두 문장의 강렬한 최종 선고 (따옴표 포함)",
  "fate": "주인공의 이름과 직업을 포함한 한 줄 운명 요약 (예: '${character.name}, 생존을 갈구했던 ${character.jobClass}')",
  "choices": [
    { "label": "선택 01", "description": "첫 번째 막에서 한 선택의 결과 한 문장" },
    { "label": "선택 02", "description": "두 번째 막에서 한 선택의 결과 한 문장" },
    { "label": "최종 결정", "description": "마지막 막의 선택과 그 결과 한 문장" }
  ]
}`

        const result = await model.generateContent(prompt)
        const text = result.response.text().trim()

        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('AI 응답 파싱 실패')

        const parsed = JSON.parse(jsonMatch[0]) as {
          finalSentence: string
          fate: string
          choices: Array<{ label: string; description: string }>
        }

        const icons = ['terminal', 'direction_run', 'error']
        return {
          finalSentence: parsed.finalSentence,
          fate: parsed.fate,
          choicesSummary: parsed.choices.map((c, i) => ({
            icon: icons[i] ?? 'star',
            label: c.label,
            description: c.description,
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
