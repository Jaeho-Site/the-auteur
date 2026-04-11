import { useState } from 'react'
import type { Screen } from '../types'

interface HeaderProps {
  currentScreen: Screen
  onGoHome: () => void
}

export function Header({ currentScreen, onGoHome }: HeaderProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  // 홈(프롤로그)에서는 헤더 자체를 숨김
  if (currentScreen === 'prologue') return null

  const handleLogoClick = () => setShowConfirm(true)

  const handleConfirm = () => {
    setShowConfirm(false)
    onGoHome()
  }

  return (
    <>
      <header
        className="fixed top-0 w-full z-50 flex items-center px-8 py-6"
        style={{ background: 'linear-gradient(to bottom, rgba(14,14,14,0.85) 0%, transparent 100%)' }}
      >
        <button
          className="text-3xl font-bold tracking-tighter text-primary/80 font-headline hover:text-primary transition-colors duration-300"
          onClick={handleLogoClick}
        >
          THE AUTEUR
        </button>
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
                onClick={() => setShowConfirm(false)}
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
