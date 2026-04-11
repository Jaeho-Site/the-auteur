import { useState } from 'react'
import type { JobClass, JobCardInfo } from '../types'

interface CharacterSetupScreenProps {
  onConfirm: (name: string, jobClass: JobClass) => void
}

const JOBS: JobCardInfo[] = [
  {
    id: '요리사',
    englishName: 'Chef',
    icon: 'skillet',
    description: '생존을 위한 맛의 연금술사. 어떤 재료로도 활력을 불어넣는 요리를 만듭니다.',
  },
  {
    id: '의사',
    englishName: 'Doctor',
    icon: 'medical_services',
    description: '생명의 경계에 선 자. 치명적인 상처를 치료하고 죽음의 위기에서 구합니다.',
  },
  {
    id: '개발자',
    englishName: 'Developer',
    icon: 'terminal',
    description: '보이지 않는 코드로 세상을 재구성하는 자. 시스템의 틈새를 발견하고 조작합니다.',
  },
  {
    id: '가수',
    englishName: 'Singer',
    icon: 'mic_external_on',
    description: '목소리로 영혼을 울리는 자. 절망적인 상황에서도 사람들에게 희망의 노래를 들려줍니다.',
  },
  {
    id: '배우',
    englishName: 'Actor',
    icon: 'theater_comedy',
    description: '수천 개의 가면을 가진 자. 완벽한 연기로 타인을 속이거나 상황을 통제합니다.',
  },
  {
    id: '운동선수',
    englishName: 'Athlete',
    icon: 'fitness_center',
    description: '육체의 한계를 시험하는 자. 압도적인 체력과 반사신경으로 위기를 돌파합니다.',
  },
  {
    id: '무술감독',
    englishName: 'Martial Arts Director',
    icon: 'sports_martial_arts',
    description: '전투를 예술로 승화시키는 자. 주변의 모든 사물을 무기로 활용합니다.',
  },
  {
    id: '대학생',
    englishName: 'University Student',
    icon: 'school',
    description: '지식에 굶주린 탐구자. 유연한 사고와 빠른 습득력으로 해답을 찾아냅니다.',
  },
  {
    id: '고등학교 교사',
    englishName: 'High School Teacher',
    icon: 'history_edu',
    description: '지혜의 등불을 든 자. 타인을 이끄는 리더십과 냉철한 판단력을 갖췄습니다.',
  },
  {
    id: '프로게이머',
    englishName: 'Pro Gamer',
    icon: 'sports_esports',
    description: '가상 세계의 지배자. 초 단위의 정밀한 컨트롤과 전략으로 승리를 쟁취합니다.',
  },
  {
    id: '탐정',
    englishName: 'Detective',
    icon: 'search_check',
    description: '진실의 조각을 맞추는 자. 사소한 단서도 놓치지 않는 예리한 관찰력을 가졌습니다.',
  },
  {
    id: '해커',
    englishName: 'Hacker',
    icon: 'vpn_lock',
    description: '봉인된 문을 여는 열쇠. 디지털 세계의 모든 보안을 무력화하고 정보를 탈취합니다.',
  },
]

export function CharacterSetupScreen({ onConfirm }: CharacterSetupScreenProps) {
  const [name, setName] = useState('')
  const [selectedJob, setSelectedJob] = useState<JobClass | null>(null)

  const handleConfirm = () => {
    if (!name.trim() || !selectedJob) return
    onConfirm(name.trim(), selectedJob)
  }

  return (
    <main className="relative min-h-screen w-full flex items-start justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          alt="cinematic background"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOaQUG34t3i5HCxm_BDyACJTiVuhKVp6jmN8_M2QuRA0-b9PCRl4uVvzUIONoRNtT48W8WhmdZHNkoE_zRcrCb-aDjTY9vQ6p4NLG12p56WMPV28A8u4P8kSCBxcZS9Z4nzo0GpeisYBDu0CA1sZ7WQG-J8aTw-HhXp8h1Q8S0dGRCC68ceQYr4XamBDWYQnyXLLk6iHCU3DX956QFw0iC608KuHUjKcEhGZtkpTEhsTL-L6WsHNOScyC-VBOOEnFLmC2XjgvInjk"
          className="w-full h-full object-cover grayscale brightness-[0.4] contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/20" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: 'inset 0 0 150px rgba(0,0,0,0.9)' }}
        />
      </div>

      {/* Content */}
      <section className="relative z-10 w-full max-w-6xl px-8 pt-32 pb-16 flex flex-col items-center">
        {/* Header */}
        <header className="mb-12 text-center">
          <p className="font-label text-xs uppercase tracking-[0.4em] text-primary mb-4">
            The Digital Auteur Presents
          </p>
          <h1 className="font-headline text-5xl md:text-7xl italic tracking-tighter text-on-surface">
            운명의 길을 여십시오
          </h1>
          <div className="w-12 h-px bg-primary mx-auto mt-6" />
        </header>

        {/* Name Input */}
        <div className="w-full flex flex-col items-center mb-12">
          <label className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant mb-4">
            당신의 그림자에 이름을 부여하십시오
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="w-full max-w-lg bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-center font-headline text-3xl md:text-4xl text-on-surface transition-all duration-500 py-4 italic outline-none placeholder:text-on-surface/30"
          />
        </div>

        {/* Job Selection */}
        <div className="w-full">
          <div className="text-center mb-10">
            <h2 className="font-headline text-xl text-primary-fixed-dim italic">
              운명의 길을 선택하십시오
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
            {JOBS.map((job) => {
              const isSelected = selectedJob === job.id
              return (
                <button
                  key={job.id}
                  onClick={() => setSelectedJob(job.id)}
                  className={`group relative flex flex-col text-left transition-all duration-500 p-5 border ${
                    isSelected
                      ? 'bg-primary-container/20 border-primary/60'
                      : 'bg-surface-container-low/40 border-outline-variant/15 hover:bg-primary-container/10 hover:border-primary/20'
                  } backdrop-blur-md`}
                >
                  <span
                    className={`material-symbols-outlined mb-4 transition-all duration-300 ${
                      isSelected ? 'text-primary opacity-100' : 'text-primary opacity-40 group-hover:opacity-100'
                    }`}
                    style={{ fontSize: '32px' }}
                  >
                    {job.icon}
                  </span>
                  <div className="mt-2">
                    <p className="font-label text-[8px] uppercase tracking-widest text-primary/60 mb-1">
                      {job.englishName}
                    </p>
                    <h3
                      className={`font-headline text-xl mb-3 transition-colors ${
                        isSelected ? 'text-primary' : 'text-on-surface group-hover:text-primary'
                      }`}
                    >
                      {job.id}
                    </h3>
                    <p className="text-xs leading-relaxed text-on-surface-variant/80 font-body">
                      {job.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <footer className="mt-16 flex flex-col items-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <button
              onClick={handleConfirm}
              disabled={!name.trim() || !selectedJob}
              className={`relative px-16 py-5 font-headline text-2xl italic tracking-tight border border-primary-container/20 transition-all duration-500 ${
                name.trim() && selectedJob
                  ? 'bg-primary text-on-primary hover:scale-[1.02] cursor-pointer'
                  : 'bg-surface-container text-on-surface/30 cursor-not-allowed'
              }`}
            >
              운명 깨우기
            </button>
          </div>
          <p className="mt-8 font-label text-[10px] uppercase tracking-[0.5em] text-on-surface-variant/40">
            Act I: The Beginning of Your Archive
          </p>
        </footer>
      </section>
    </main>
  )
}
