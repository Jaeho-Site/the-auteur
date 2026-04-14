import type { Genre, GenreCard } from '../types'

interface GenreSelectScreenProps {
  onSelect: (genre: Genre) => void
}

const GENRES: GenreCard[] = [
  {
    id: '아포칼립스',
    realityNumber: 'Reality 01',
    imageUrl: '/genre/apocallipse.jpg',
    description: '황폐해진 세상 속에서의 생존 투쟁',
  },
  {
    id: '판타지',
    realityNumber: 'Reality 02',
    imageUrl: '/genre/판타지.jpg',
    description: '마법과 고대 신화가 살아 숨쉬는 대지',
  },
  {
    id: 'SF 탐사',
    realityNumber: 'Reality 03',
    imageUrl: '/genre/sf.jpg',
    description: '광활한 우주를 향한 인류의 끝없는 도약',
  },
  {
    id: '공포',
    realityNumber: 'Reality 04',
    imageUrl: '/genre/공포.jpg',
    description: '어둠 속에 도사리는 원초적인 공포',
  },
  {
    id: '코미디',
    realityNumber: 'Reality 05',
    imageUrl: '/genre/코미디.jpg',
    description: '예상치 못한 순간에 터져 나오는 유쾌함',
  },
  {
    id: '로맨스',
    realityNumber: 'Reality 06',
    imageUrl: '/genre/로맨스.avif',
    description: '운명적인 만남이 빚어내는 가슴 떨리는 이야기',
  },
]

export function GenreSelectScreen({ onSelect }: GenreSelectScreenProps) {
  return (
    <main className="relative min-h-screen pt-32 pb-24 px-6 md:px-12 flex flex-col items-center">
      {/* Hero Section */}
      <div className="max-w-4xl text-center mb-16 relative z-10">
        <p className="font-label text-[10px] uppercase tracking-[0.6em] text-primary mb-6">
          Reality Selection
        </p>
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary tracking-tighter leading-none mb-8">
          장르를 선택하세요.
        </h1>
        <p className="text-on-surface-variant font-body italic max-w-2xl mx-auto text-lg opacity-80 leading-relaxed">
          당신만의 세계를 설계할 건축가가 되어보세요.<br />
          세상이 드러날 장막을 선택해야 합니다.
        </p>
      </div>

      {/* Wide Genre Grid - 가로 레이아웃 개선: 2열 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl relative z-10 px-4">
        {GENRES.map((genre) => (
          <button
            key={genre.id}
            onClick={() => onSelect(genre.id)}
            className="genre-card group relative rounded-lg overflow-hidden text-left"
            style={{ aspectRatio: '16/9' }}
          >
            <img
              alt={genre.id}
              src={genre.imageUrl}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(to top, rgba(14,14,14,0.9) 0%, rgba(14,14,14,0.4) 40%, transparent 100%)',
              }}
            />
            {/* Border overlay */}
            <div
              className="absolute inset-0 rounded-lg pointer-events-none transition-all duration-700"
              style={{ border: '1px solid rgba(242,202,80,0.1)' }}
            />
            {/* Text */}
            <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end">
              <span className="font-label text-[10px] uppercase tracking-[0.4em] text-primary mb-2">
                {genre.realityNumber}
              </span>
              <h3 className="font-headline text-3xl font-bold text-on-surface tracking-tight">
                {genre.id}
              </h3>
              <p className="text-[12px] text-on-surface-variant/70 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {genre.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      <style>{`
        .genre-card {
          transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .genre-card:hover {
          transform: scale(1.02);
          z-index: 20;
        }
        .genre-card:hover .card-border {
          border: 1px solid rgba(242, 202, 80, 0.5);
        }
      `}</style>
    </main>
  )
}
