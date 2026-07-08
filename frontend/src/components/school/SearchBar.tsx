// src/components/school/SearchBar.tsx
//園名・住所を入力するテキストボックス（controlled）
'use client'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
}

export default function SearchBar({
  value,
  onChange,
  onSubmit,
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSubmit()
  }

  return (
    // 修正：min-w-0を追加。flexアイテムはデフォルトでmin-width:autoを持つため、
    // 指定しないとinput内のテキスト分だけ幅を要求し、親のflexコンテナからはみ出す
    <div className="flex-1 min-w-0 flex items-center gap-2 bg-white border border-gray-300 rounded-full px-3 py-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 text-primary flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="園の名前か住所で検索"
        // 修正：同じ理由でinput自体にもmin-w-0を追加
        className="flex-1 min-w-0 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
      />
    </div>
  )
}
