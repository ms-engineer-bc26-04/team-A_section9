//ハートアイコンのボタン。押すとお気に入り登録・解除する
// src/components/school/FavoriteButton.tsx
'use client'

type FavoriteButtonProps = {
  schoolId: number
  isFavorited: boolean
  onToggle?: (schoolId: number) => void
}

export default function FavoriteButton({
  schoolId,
  isFavorited,
  onToggle,
}: FavoriteButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggle?.(schoolId)
  }

  return (
    <button
      onClick={handleClick}
      aria-label={isFavorited ? 'お気に入り解除' : 'お気に入り登録'}
      className="w-8 h-8 flex items-center justify-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isFavorited ? '#8BC34A' : 'none'}
        stroke={isFavorited ? '#8BC34A' : '#ccc'}
        strokeWidth={2}
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  )
}