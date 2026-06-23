// src/components/school/SearchBar.tsx
//園名・住所を入力して検索するテキストボックス＋検索ボタン
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type SearchBarProps = {
  defaultValue?: string
}

export default function SearchBar({ defaultValue = "" }: SearchBarProps) {
  const [keyword, setKeyword] = useState(defaultValue)
  const router = useRouter()

  const handleSearch = () => {
    if (!keyword.trim()) return
    router.push(`/schools/search?keyword=${encodeURIComponent(keyword)}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch()
  }

  return (
    <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-full px-3 py-2">
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
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="園の名前か住所で検索"
        className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
      />
    </div>
  )
}