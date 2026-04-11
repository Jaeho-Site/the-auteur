/**
 * THE AUTEUR — Gemini API Proxy
 * AWS Lambda (Node.js 20.x) + API Gateway HTTP API
 *
 * POST /generate-acts    → 5막 전체 생성
 * POST /generate-result  → 최종 결말 생성
 * OPTIONS *              → CORS preflight 응답
 *
 * 환경변수:
 *   GEMINI_API_KEY   — Google AI Studio API 키 (필수)
 *   ALLOWED_ORIGIN   — CORS 허용 출처 (예: https://xxx.amplifyapp.com), 기본값 *
 */

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

const API_KEY = process.env.GEMINI_API_KEY
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? '*'

// ── 공통 응답 헬퍼 ────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function ok(body) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
    body: JSON.stringify(body),
  }
}

function fail(statusCode, message) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
    body: JSON.stringify({ error: message }),
  }
}

// ── Gemini REST 호출 ──────────────────────────────────────────

async function callGemini(prompt) {
  if (!API_KEY) throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.')

  const res = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })

  if (!res.ok) {
    const upstream = await res.text()
    const e = new Error(`Gemini API ${res.status}`)
    e.upstreamStatus = res.status
    e.upstreamBody = upstream
    throw e
  }

  const data = await res.json()
  return data.candidates[0].content.parts[0].text.trim()
}

function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('AI 응답에서 JSON을 찾을 수 없습니다.')
  return JSON.parse(match[0])
}

// ── /generate-acts ────────────────────────────────────────────

async function generateActs({ genre, character }) {
  if (!genre || !character?.name || !character?.jobClass) {
    const e = new Error('필수 파라미터 누락: genre, character.name, character.jobClass')
    e.statusCode = 400
    throw e
  }

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

  const text = await callGemini(prompt)
  const parsed = extractJSON(text)

  return {
    acts: parsed.acts.map((act) => ({
      narrative: act.narrative,
      choices: [act.choice1, act.choice2],
    })),
  }
}

// ── /generate-result ──────────────────────────────────────────

async function generateResult({ genre, character, turns }) {
  if (!genre || !character?.name || !character?.jobClass || !Array.isArray(turns)) {
    const e = new Error('필수 파라미터 누락: genre, character, turns')
    e.statusCode = 400
    throw e
  }

  const storyHistory = turns
    .map((t, i) => `[${i + 1}막] ${t.narrative} → 선택: "${t.selectedChoice ?? '미선택'}"`)
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

  const text = await callGemini(prompt)
  const parsed = extractJSON(text)

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
}

// ── Lambda 엔트리포인트 ───────────────────────────────────────

export const handler = async (event) => {
  // API Gateway HTTP API(v2)와 REST API(v1) 모두 지원
  const method =
    event.requestContext?.http?.method ?? event.httpMethod ?? 'UNKNOWN'
  const path = event.rawPath ?? event.path ?? ''

  // CORS preflight
  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }

  if (method !== 'POST') {
    return fail(405, 'Method Not Allowed')
  }

  let body
  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {
    return fail(400, '요청 body가 유효한 JSON이 아닙니다.')
  }

  try {
    if (path.endsWith('/generate-acts')) {
      return ok(await generateActs(body))
    }
    if (path.endsWith('/generate-result')) {
      return ok(await generateResult(body))
    }
    return fail(404, 'Not Found')
  } catch (e) {
    // 클라이언트 오류 (400)
    if (e.statusCode === 400) return fail(400, e.message)

    // Gemini upstream 오류 (429 Rate Limit 등) — 상태 코드 그대로 전달
    if (e.upstreamStatus) {
      return {
        statusCode: e.upstreamStatus,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        body: e.upstreamBody,
      }
    }

    console.error('[Lambda Error]', e)
    return fail(500, '서버 내부 오류가 발생했습니다.')
  }
}
