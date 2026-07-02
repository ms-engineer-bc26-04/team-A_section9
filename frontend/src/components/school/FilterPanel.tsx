// src/components/school/FilterPanel.tsx
//「条件で検索」の開閉パネル。毎日給食・おむつ廃棄などのチェックボックス群（controlled）
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export const FILTER_OPTIONS = [
  { key: 'hasLunch', label: '毎日給食' },
  { key: 'hasClub', label: '園内習い事あり' },
  { key: 'diaperDisposal', label: 'おむつ園処理あり' },
  { key: 'allergySupport', label: 'アレルギー対応あり' },
  { key: 'noBedding', label: '布団負担少なめ' },
  { key: 'noWeekdayEvents', label: '平日行事少なめ' },
  { key: 'noPTA', label: '保護者会少なめ' },
  { key: 'extendedCareUsage', label: '延長保育利用者が多い' },
]

type FilterPanelProps = {
  value: Record<string, boolean>
  onChange: (value: Record<string, boolean>) => void
}

export default function FilterPanel({ value, onChange }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleFilter = (key: string) => {
    onChange({ ...value, [key]: !value[key] })
  }

  return (
    <div className="bg-white border border-gray-300 rounded-2xl overflow-hidden">
      {/* 開閉ボタン */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full text-left px-4 py-3 text-gray-500 text-xs font-medium"
      >
        {isOpen ? '▲' : '▼'} 条件で検索
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {FILTER_OPTIONS.map((option) => (
                  <label
                    key={option.key}
                    className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={!!value[option.key]}
                      onChange={() => toggleFilter(option.key)}
                      className="w-3.5 h-3.5 accent-primary"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
