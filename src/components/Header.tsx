import { useState } from 'react'
import type { Screen } from '../types'

interface HeaderProps {
  currentScreen: Screen
  onGoHome: () => void
}

export function Header({ currentScreen, onGoHome }: HeaderProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLogoClick = () => {
    if (currentScreen === 'prologue') return
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    setShowConfirm(false)
    onGoHome()
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  return (
    <>
      <header
        className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-6"
        style={{ background: 'radial-gradient(at top, rgba(14,14,14,0.9), transparent)' }}
      >
        <button
          className={`text-2xl font-bold tracking-tighter font-headline transition-colors duration-300 ${
            currentScreen === 'prologue'
              ? 'text-primary/50 cursor-default'
              : 'text-primary hover:text-primary/70'
          }`}
          onClick={handleLogoClick}
        >
          THE AUTEUR
        </button>

        {/* 현재 단계 표시 — 네비게이션 역할 없음 */}
        <div className="hidden md:flex items-center gap-2">
          {(['genre-select', 'character-setup', 'story', 'result'] as Screen[]).map((s, i) => {
            const SCREEN_ORDER: Screen[] = ['prologue', 'genre-select', 'character-setup', 'story', 'result']
            const currentIdx = SCREEN_ORDER.indexOf(currentScreen)
            const thisIdx = SCREEN_ORDER.indexOf(s)
            const isDone = thisIdx < currentIdx
            const isCurrent = thisIdx === currentIdx
            return (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && (
                  <div
                    className={`w-6 h-[1px] transition-colors duration-500 ${
                      isDone || isCurrent ? 'bg-primary/40' : 'bg-outline-variant/30'
                    }`}
                  />
                )}
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                    isCurrent
                      ? 'bg-primary scale-125'
                      : isDone
                      ? 'bg-primary/40'
                      : 'bg-outline-variant/30'
                  }`}
                />
              </div>
            )
          })}
        </div>

        <div className="w-6" />
      </header>

      {/* 홈 이동 확인 토스트 */}
      {showConfirm && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center pb-10 px-6 pointer-events-none">
          <div
            className="pointer-events-auto w-full max-w-sm bg-surface-container-lowest border border-outline-variant/40 px-6 py-5 flex flex-col gap-4 shadow-2xl"
            style={{ animation: 'slideUp 0.25s ease-out' }}
          >
            <div className="flex flex-col gap-1">
              <span className="font-label text-[9px] uppercase tracking-[0.3em] text-primary">경고</span>
              <p className="font-body text-sm text-on-surface/80 leading-relaxed">
                현재 스토리가 초기화됩니다.<br />홈으로 이동하시겠습니까?
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="font-label text-[10px] uppercase tracking-widest text-on-surface/50 hover:text-on-surface transition-colors duration-300 px-4 py-2"
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                className="font-label text-[10px] uppercase tracking-widest text-primary border border-primary/30 hover:bg-primary/10 transition-colors duration-300 px-4 py-2"
              >
                초기화 후 이동
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
