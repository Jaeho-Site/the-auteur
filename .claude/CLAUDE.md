# THE AUTEUR — CLAUDE.md

## 프로젝트 개요

시네마틱 인터랙티브 소설 웹앱. Stitch 프로젝트(ID: `3581511354152413552`) 디자인 기반.
사용자가 장르·캐릭터를 선택하면 Gemini AI가 3막 구조의 스토리를 실시간 생성한다.

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
│   └── useGemini.ts           # AI API 전담 훅
├── components/
│   ├── Header.tsx             # 화면 전환 네비게이션
│   ├── GrainOverlay.tsx       # 필름 그레인 + 비네트 효과 (fixed, z-999)
│   └── LoadingSpinner.tsx     # AI 대기 스피너
└── screens/
    ├── PrologueScreen.tsx     # 1화면: 히어로 CTA
    ├── GenreSelectScreen.tsx  # 2화면: 장르 6종 그리드
    ├── CharacterSetupScreen.tsx # 3화면: 이름 입력 + 직업 12종
    ├── StoryScreen.tsx        # 4화면: AI 서사 + 2지선다 (3막)
    └── ResultScreen.tsx       # 5화면: 운명 요약
```

---

## 아키텍처 규칙

### 상태 관리 패턴

모든 게임 상태는 `App.tsx`의 `GameState` 하나로 관리한다.
화면 컴포넌트는 상태를 직접 변경하지 않고 콜백 prop을 통해서만 상위에 알린다.

```
App.tsx (GameState 소유)
  └─ StoryScreen (completedTurns: StoryTurn[], onChoiceMade, onFinish)
       └─ useGemini (API 호출)
```

`StoryScreen`은 자체 `useRef(initialized)`로 첫 AI 호출을 한 번만 실행한다.
선택 완료 후 다음 막은 `StoryScreen` 내부에서 직접 호출해 라운드트립을 줄인다.

### 화면 전환

`Screen` 타입의 string union을 `useState`로 관리. 라우터 라이브러리 없음.
`Header.tsx`의 `onNavigate`로 임의 이동 가능 (개발/디버깅용).

### AI 훅 (`useGemini`)

- `generateStoryTurn`: 막 번호·이전 턴 히스토리를 포함한 프롬프트 → JSON 파싱
- `generateFinalResult`: 전체 턴 요약 → `FinalResult` 반환
- 두 함수 모두 `isLoading` / `error` 상태를 공유한다
- 모델: **`gemini-2.5-flash`** (변경 시 두 함수 모두 수정)
- 응답은 항상 `text.match(/\{[\s\S]*\}/)` 로 JSON 추출 (마크다운 펜스 대응)

---

## 디자인 시스템

### 컬러 토큰 (Tailwind 클래스로 사용)

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

### Material Symbols 아이콘

```html
<span className="material-symbols-outlined">icon_name</span>
```

`index.css`의 `.material-symbols-outlined` 유틸리티로 `FILL 0, wght 300` 기본값 설정됨.

### 시네마틱 레이어 Z-index 계층

```
z-[999]  GrainOverlay (film grain SVG, opacity 0.04)
z-[90]   Vignette (radial-gradient 비네트)
z-50     Header (fixed top nav)
z-[60]   화면 내 floating badge (장르 표시 등)
z-20     본문 콘텐츠
z-10     배경 overlay
z-0      배경 이미지
```

### 공통 UI 패턴

**카드 호버 효과**
```tsx
className="group relative ... transition-all duration-500 hover:bg-primary-container/10"
// 내부 아이콘: opacity-40 group-hover:opacity-100
// 내부 테두리: border-primary/0 group-hover:border-primary/20
```

**CTA 버튼**
```tsx
className="relative px-16 py-5 bg-primary text-on-primary font-headline text-2xl italic tracking-tight hover:scale-[1.02] transition-all duration-500"
```

**섹션 레이블**
```tsx
className="font-label text-[10px] uppercase tracking-[0.4em] text-primary"
```

---

## 타입 추가 규칙

`src/types/index.ts`에서만 도메인 타입을 정의한다.
새 화면·기능 추가 시 먼저 타입부터 정의하고 구현한다.

- `Screen` union에 새 화면 추가 → `App.tsx` 라우팅 분기 추가
- `Genre` / `JobClass` union에 항목 추가 → 해당 데이터 배열(`GENRES`, `JOBS`)도 업데이트
- AI 응답 구조 변경 → `FinalResult` 인터페이스 수정 후 `useGemini` 프롬프트·파싱 동시 수정

---

## 자주 하는 작업

### 장르 추가

1. `src/types/index.ts` → `Genre` union에 추가
2. `src/screens/GenreSelectScreen.tsx` → `GENRES` 배열에 객체 추가 (imageUrl 필요)

### 직업 추가

1. `src/types/index.ts` → `JobClass` union에 추가
2. `src/screens/CharacterSetupScreen.tsx` → `JOBS` 배열에 객체 추가

### 스토리 막 수 변경

`src/screens/StoryScreen.tsx` 상단 `MAX_TURNS` 상수 수정.

### Gemini 프롬프트 수정

`src/hooks/useGemini.ts` → `generateStoryTurn` 또는 `generateFinalResult` 내 template literal.

---

## 주의사항 (트랩)

- **npm install**: 반드시 `--ignore-scripts` 사용. esbuild postinstall이 Windows에서 실패함.
  그 후 `node node_modules/esbuild/install.js` 별도 실행.
- **`StoryScreen` 재마운트**: `useRef(initialized)`로 첫 AI 호출 중복 방지 중.
  `useEffect` deps 배열을 건드리면 StrictMode에서 이중 호출됨.
- **AI JSON 파싱**: Gemini가 마크다운 코드블록으로 감쌀 수 있음.
  `text.match(/\{[\s\S]*\}/)` 패턴을 제거하거나 변경하지 말 것.
- **`VITE_` 접두사**: 환경변수는 반드시 `VITE_`로 시작해야 클라이언트에 노출됨.
- **z-index 충돌**: `GrainOverlay`가 `z-[999]`이므로 `pointer-events-none` 필수.
  새 오버레이 추가 시 계층 표를 확인할 것.
