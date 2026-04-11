import { useState, useCallback } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Genre, JobClass, StoryTurn, FinalResult } from '../types'

const getApiKey = (): string => {
  const key = import.meta.env.VITE_GEMINI_API_KEY
  if (!key) {
    throw new Error('VITE_GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. .env 파일을 확인하세요.')
  }
  return key
}

interface UseGeminiReturn {
  generateStoryTurn: (
    genre: Genre,
    character: { name: string; jobClass: JobClass },
    previousTurns: StoryTurn[],
    turnNumber: number
  ) => Promise<{ narrative: string; choices: [string, string] }>
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

  const generateStoryTurn = useCallback(
    async (
      genre: Genre,
      character: { name: string; jobClass: JobClass },
      previousTurns: StoryTurn[],
      turnNumber: number
    ): Promise<{ narrative: string; choices: [string, string] }> => {
      setIsLoading(true)
      setError(null)
      try {
        const genAI = new GoogleGenerativeAI(getApiKey())
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const historyText = previousTurns
          .filter((t) => t.selectedChoice !== null)
          .map(
            (t, i) =>
              `[${i + 1}막] 서사: ${t.narrative}\n선택: ${t.selectedChoice}`
          )
          .join('\n\n')

        const prompt = `당신은 시네마틱한 한국어 인터랙티브 소설의 서술자입니다.

장르: ${genre}
주인공 이름: ${character.name}
직업: ${character.jobClass}
현재 막: ${turnNumber + 1}막 / 3막

${historyText ? `이전 스토리:\n${historyText}\n\n` : ''}

위 설정으로 ${turnNumber === 0 ? '이야기를 시작하는' : '이야기를 이어가는'} 짧고 강렬한 서사 단락(3~5문장)을 한국어로 작성하세요.
그 다음, 주인공이 선택할 수 있는 두 가지 선택지를 제시하세요. 각 선택지는 짧고 행동 지향적(10~15자)이어야 합니다.

반드시 다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "narrative": "서사 내용",
  "choice1": "첫 번째 선택지",
  "choice2": "두 번째 선택지"
}`

        const result = await model.generateContent(prompt)
        const text = result.response.text().trim()

        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('AI 응답 파싱 실패')

        const parsed = JSON.parse(jsonMatch[0]) as {
          narrative: string
          choice1: string
          choice2: string
        }

        return {
          narrative: parsed.narrative,
          choices: [parsed.choice1, parsed.choice2],
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

  return { generateStoryTurn, generateFinalResult, isLoading, error }
}
