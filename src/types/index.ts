export type Screen = 'prologue' | 'genre-select' | 'character-setup' | 'story' | 'result'

export type Genre =
  | '아포칼립스'
  | '판타지'
  | 'SF 탐사'
  | '공포'
  | '코미디'
  | '로맨스'

export type JobClass =
  | '요리사'
  | '의사'
  | '개발자'
  | '가수'
  | '배우'
  | '운동선수'
  | '무술감독'
  | '대학생'
  | '고등학교 교사'
  | '프로게이머'
  | '탐정'
  | '해커'

export interface Character {
  name: string
  jobClass: JobClass
}

export interface StoryAct {
  narrative: string
  choices: [string, string]
}

export interface StoryTurn extends StoryAct {
  selectedChoice: string | null
}

export interface GameState {
  genre: Genre | null
  character: Character | null
  turns: StoryTurn[]
  finalResult: FinalResult | null
}

export interface FinalResult {
  finalSentence: string
  fate: string
  choicesSummary: Array<{
    icon: string
    label: string
    description: string
  }>
}

export interface GenreCard {
  id: Genre
  realityNumber: string
  imageUrl: string
  description: string
}

export interface JobCardInfo {
  id: JobClass
  englishName: string
  icon: string
  description: string
}
