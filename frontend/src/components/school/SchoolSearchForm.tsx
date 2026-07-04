// src/components/school/SchoolSearchForm.tsx
// 検索バー＋条件検索パネルをまとめて管理し、単一の「検索」ボタンで
// キーワードと条件の両方をURLに反映するコンポーネント
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SearchBar from './SearchBar'
import FilterPanel, { FILTER_OPTIONS } from './FilterPanel'

type SchoolSearchFormProps = {
  defaultKeyword?: string
  defaultFilters?: Record<string, boolean>
}

export default function SchoolSearchForm({
  defaultKeyword = '',
  defaultFilters = {},
}: SchoolSearchFormProps) {
  const [keyword, setKeyword] = useState(defaultKeyword)
  const [filters, setFilters] =
    useState<Record<string, boolean>>(defaultFilters)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = () => {
    // 現在のURLパラメータをベースに、keyword・条件検索の両方をまとめて反映する
    const params = new URLSearchParams(searchParams.toString())

    if (keyword.trim()) {
      params.set('keyword', keyword.trim())
    } else {
      params.delete('keyword')
    }

    // フィルター項目は一旦すべて削除してから、ONのものだけ再セット
    FILTER_OPTIONS.forEach((option) => {
      params.delete(option.key)
    })
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, 'true')
    })

    router.push(`/schools/search?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <SearchBar
          value={keyword}
          onChange={setKeyword}
          onSubmit={handleSearch}
        />
        <button
          onClick={handleSearch}
          className="flex-shrink-0 bg-[#a0cd83] text-white font-bold text-sm rounded-full px-5 py-2.5 hover:bg-[#8fbb70] active:bg-[#8fbb70] transition-colors [text-shadow:0px_1px_2px_rgba(0,0,0,0.45)]"
        >
          検索
        </button>
      </div>

      <div className="w-fit mr-auto text-sm">
        <FilterPanel value={filters} onChange={setFilters} />
      </div>
    </div>
  )
}
