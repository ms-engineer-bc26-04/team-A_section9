// src/components/school/FilterPanel.tsx
//「条件で検索」の開閉パネル。毎日給食・おむつ廃棄などのチェックボックス群
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/common/Button"

const FILTER_OPTIONS = [
  { key: "hasLunch", label: "毎日給食" },
  { key: "hasClub", label: "園内習い事あり" },
  { key: "diaperDisposal", label: "おむつ破棄" },
  { key: "allergySupport", label: "アレルギー対応あり" },
  { key: "noBedding", label: "布団持参なし" },
  { key: "extendedCareUntil19", label: "延長保育の利用時間〜19時まで", full: true },
  { key: "noWeekdayEvents", label: "平日行事なし" },
  { key: "noPTA", label: "保護者会なし" },
]

type FilterPanelProps = {
  defaultFilters?: Record<string, boolean>
}

export default function FilterPanel({ defaultFilters = {} }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<Record<string, boolean>>(defaultFilters)
  const router = useRouter()

  const toggleFilter = (key: string) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, "true")
    })
    router.push(`/schools/search?${params.toString()}`)
  }

  return (
    <div className="bg-white border border-gray-300 rounded-2xl overflow-hidden">
      {/* 開閉ボタン */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full text-left px-4 py-3 text-gray-500 text-xs font-medium"
      >
        {isOpen ? "▲" : "▼"} 条件で検索
      </button>

      {/* フィルター項目 */}
      {isOpen && (
        <div className="px-4 pb-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {FILTER_OPTIONS.filter((o) => !o.full).map((option) => (
              <label
                key={option.key}
                className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={!!filters[option.key]}
                  onChange={() => toggleFilter(option.key)}
                  className="w-3.5 h-3.5 accent-primary"
                />
                {option.label}
              </label>
            ))}
          </div>

          {/* 全幅項目 */}
          {FILTER_OPTIONS.filter((o) => o.full).map((option) => (
            <label
              key={option.key}
              className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={!!filters[option.key]}
                onChange={() => toggleFilter(option.key)}
                className="w-3.5 h-3.5 accent-primary"
              />
              {option.label}
            </label>
          ))}

          <div className="flex justify-end mt-1">
            <Button variant="primary" size="sm" onClick={handleSearch}>
              検索
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}