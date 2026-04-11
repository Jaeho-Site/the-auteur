import type { Screen } from '../types'

interface HeaderProps {
  currentScreen: Screen
  onNavigate: (screen: Screen) => void
}

const NAV_ITEMS: Array<{ label: string; screen: Screen }> = [
  { label: '프롤로그', screen: 'prologue' },
  { label: '장르 선택', screen: 'genre-select' },
  { label: '캐릭터', screen: 'character-setup' },
  { label: '스토리', screen: 'story' },
]

export function Header({ currentScreen, onNavigate }: HeaderProps) {
  return (
    <header
      className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-6"
      style={{ background: 'radial-gradient(at top, rgba(14,14,14,0.9), transparent)' }}
    >
      <button
        className="text-2xl font-bold tracking-tighter text-primary font-headline"
        onClick={() => onNavigate('prologue')}
      >
        THE AUTEUR
      </button>
      <nav className="hidden md:flex gap-10 items-center">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.screen}
            onClick={() => onNavigate(item.screen)}
            className={`font-label text-[10px] uppercase tracking-[0.2em] transition-colors duration-500 ${
              currentScreen === item.screen
                ? 'text-primary border-b border-primary'
                : 'text-on-surface/60 hover:text-primary'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <button className="material-symbols-outlined text-on-surface/60 hover:text-primary transition-colors duration-300">
        menu
      </button>
    </header>
  )
}
