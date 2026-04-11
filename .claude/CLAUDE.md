# THE AUTEUR — CLAUDE.md

## 프로젝트 개요

시네마틱 인터랙티브 소설 웹앱. Stitch 프로젝트(ID: `3581511354152413552`) 디자인 기반.
사용자가 장르·캐릭터를 선택하면 Gemini AI가 3막 구조의 스토리를 **한 번에** 생성하고,
사용자는 로딩 없이 막을 넘기며 선택한다. 마지막 선택 후 최종 결말을 생성한다.

---

## 기술 스택

| 항목 | 버전 | 비고 |
|------|------|------|
| React | 18.3 | 함수형 컴포넌트 only |
| Vite | 6.x | 빌드 도구 |
| TypeScript | 5.6 | strict 모드 |
| Tailwind CSS | 3.4 | 커스텀 디자인 토큰 사용 |
| `@google/generative-ai` | 0.24 | Gemini 2.5 Flash |

---

## 실행 방법

```bash
# 최초 설치 (Windows esbuild postinstall 버그 우회 필수)
npm install --ignore-scripts
node node_modules/esbuild/install.js

# 개발 서버
npm run dev        # http://localhost:5173

# 타입 체크
npx tsc --noEmit

# 프로덕션 빌드
npm run build
```

### 환경변수 (`.env`)

```
VITE_GEMINI_API_KEY=<Google AI Studio에서 발급>
```

> `.env`가 없으면 스토리 화면에서 오류 발생. `VITE_` 접두사 필수.

---

## 파일 구조

```
src/
├── App.tsx                    # 게임 상태(GameState) 단일 관리, 화면 라우팅
├── main.tsx
├── index.css                  # Tailwind base + 커스텀 유틸리티
├── vite-env.d.ts             # ImportMetaEnv 타입 선언
├── types/index.ts             # 모든 도메인 타입 (여기서만 정의)
├── hooks/
│   └── useGemini.ts           # AI API 전담 훅 (generateAllActs, generateFinalResult)
├── components/
│   ├── Header.tsx             # 화면 전환 네비게이션
│   ├── GrainOverlay.tsx       # 필름 그레인 + 비네트 효과 (fixed, z-999)
│   └── LoadingSpinner.tsx     # AI 대기 스피너
└── screens/
    ├── PrologueScreen.tsx     # 1화면: 히어로 CTA
    ├── GenreSelectScreen.tsx  # 2화면: 장르 6종 그리드
    ├── CharacterSetupScreen.tsx # 3화면: 이름 입력 + 직업 12종
    ├── StoryScreen.tsx        # 4화면: 3막 전체 한 번에 로드 후 즉시 전환
    └── ResultScreen.tsx       # 5화면: 운명 요약
```

---

## 아키텍처 규칙

### API 호출 흐름 (2회 총계)

```
캐릭터 확정
  └─ StoryScreen 마운트
       └─ [API #1] generateAllActs → 3막 전체(narrative+choices) 한 번에 수신
            사용자가 1막 선택 → 2막 즉시 표시 (로딩 없음)
            사용자가 2막 선택 → 3막 즉시 표시 (로딩 없음)
            사용자가 3막 선택 → onComplete(turns) 호출
                 └─ [API #2] generateFinalResult → 운명 요약 수신
```

### 상태 소유권

모든 게임 상태(`GameState`)는 `App.tsx`가 단독 소유한다.
`StoryScreen`은 내부적으로 `actIndex`·`completedTurns`·`allActs`를 관리하되,
3막 완료 시 `onComplete(turns: StoryTurn[])` 콜백으로 결과만 올려보낸다.
`App.tsx`는 받은 turns를 `gameState`에 저장 후 즉시 `generateFinalResult`를 호출한다.

### StoryScreen 핵심 구조

```tsx
const [allActs, setAllActs] = useState<StoryAct[]>([])  // API로 받은 3막 전체
const [actIndex, setActIndex] = useState(0)              // 현재 막 (0~2)
const [isTransitioning, setIsTransitioning] = useState(false)  // fade 전환 중

// 마운트 시 한 번만 호출
useEffect(() => { generateAllActs(...).then(setAllActs) }, [])

// 선택 시: 즉시 index 증가 (setTimeout 400ms fade 후)
const handleChoice = (choice) => {
  if (actIndex + 1 >= MAX_TURNS) { onComplete(nextTurns); return }
  setIsTransitioning(true)
  setTimeout(() => { setActIndex(i => i + 1); setIsTransitioning(false) }, 400)
}
```

### 화면 전환

`Screen` 타입의 string union → `useState`로 관리. 라우터 라이브러리 없음.
`Header.tsx`의 `onNavigate`로 임의 이동 가능 (개발·디버깅용).

### AI 훅 (`useGemini`)

| 함수 | 역할 | 입력 | 출력 |
|------|------|------|------|
| `generateAllActs` | 3막 전체 일괄 생성 | genre, character | `StoryAct[]` |
| `generateFinalResult` | 선택 기반 결말 생성 | genre, character, turns | `FinalResult` |

- 모델: **`gemini-2.5-flash`** (변경 시 두 함수 모두 수정)
- 응답은 항상 `text.match(/\{[\s\S]*\}/)` 로 JSON 추출 (마크다운 펜스 대응)
- `isLoading` / `error` 상태는 두 함수가 공유

---

## 타입 구조

```typescript
// types/index.ts

StoryAct   → { narrative, choices: [string, string] }   // API 응답 단위
StoryTurn  → StoryAct & { selectedChoice: string|null } // 사용자 선택 포함

GameState  → { genre, character, turns: StoryTurn[], finalResult }
FinalResult → { finalSentence, fate, choicesSummary[] }
```

`StoryTurn extends StoryAct` 구조이므로, `StoryAct[]`를 받으면
선택 추가만 해서 `StoryTurn[]`로 승격 가능.

---

## 디자인 시스템

### 컬러 토큰 (Tailwind 클래스)

| 토큰 | 값 | 용도 |
|------|----|------|
| `primary` | `#f2ca50` | 골드 강조, 버튼, 제목 |
| `surface` | `#131313` | 페이지 배경 |
| `surface-container-lowest` | `#0e0e0e` | 가장 어두운 패널 |
| `on-surface` | `#e5e2e1` | 본문 텍스트 |
| `on-surface-variant` | `#d0c5af` | 보조 텍스트 |
| `outline-variant` | `#4d4635` | 경계선, 구분선 |
| `primary-container` | `#d4af37` | 선택된 카드 배경 tint |
| `error` | `#ffb4ab` | 오류 메시지 |

### 폰트 클래스

```
font-headline   → Newsreader (제목, italic 자주 사용)
font-body       → Noto Serif KR (본문)
font-label      → Inter (레이블, uppercase + tracking)
```

### Z-index 계층

```
z-[999]  GrainOverlay (film grain, pointer-events-none 필수)
z-[90]   Vignette
z-50     Header
z-[60]   floating badge (장르 표시 등)
z-20     본문 콘텐츠
z-0      배경 이미지
```

### 공통 UI 패턴

**카드 호버**
```tsx
className="group ... hover:bg-primary-container/10"
// 아이콘: opacity-40 group-hover:opacity-100
// 테두리: border-primary/0 group-hover:border-primary/20
```

**CTA 버튼**
```tsx
className="bg-primary text-on-primary font-headline text-2xl italic hover:scale-[1.02] transition-all duration-500"
```

**섹션 레이블**
```tsx
className="font-label text-[10px] uppercase tracking-[0.4em] text-primary"
```

---

## 자주 하는 작업

### 장르 추가
1. `types/index.ts` → `Genre` union에 추가
2. `screens/GenreSelectScreen.tsx` → `GENRES` 배열에 객체 추가

### 직업 추가
1. `types/index.ts` → `JobClass` union에 추가
2. `screens/CharacterSetupScreen.tsx` → `JOBS` 배열에 객체 추가

### 스토리 막 수 변경
`screens/StoryScreen.tsx` 상단 `MAX_TURNS` 상수 수정.
`hooks/useGemini.ts` → `generateAllActs` 프롬프트의 막 수도 같이 변경.

### Gemini 프롬프트 수정
`hooks/useGemini.ts` → `generateAllActs` 또는 `generateFinalResult` 내 template literal.

---

## 주의사항 (트랩)

- **npm install**: 반드시 `--ignore-scripts`. Windows esbuild postinstall 실패.
  이후 `node node_modules/esbuild/install.js` 별도 실행.
- **StoryScreen 이중 호출**: `useRef(initialized)`가 StrictMode 이중 실행을 막는다.
  `useEffect` deps 배열을 채우면 다시 이중 호출됨. 비워둘 것.
- **AI JSON 파싱**: Gemini 응답이 마크다운 코드블록일 수 있음.
  `text.match(/\{[\s\S]*\}/)` 패턴 절대 제거 금지.
- **`VITE_` 접두사**: 없으면 클라이언트에 환경변수가 노출되지 않음.
- **GrainOverlay z-index**: `z-[999]` + `pointer-events-none` 세트. 하나라도 빠지면 클릭 불가.
- **`generateAllActs` 응답 구조**: `{ acts: [...] }` 래퍼가 있음. `parsed.acts`로 접근.
