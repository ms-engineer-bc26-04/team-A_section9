// 比較テーブルのセクション見出し（アイコン＋ラベル）
// src/components/compare/SectionHeader.tsx
import Image from 'next/image'

type SectionHeaderProps = {
  icon: string
  label: string
}

export default function SectionHeader({ icon, label }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="relative w-8 h-8 flex-shrink-0">
        <Image
          src={icon}
          alt={label}
          fill
          sizes="32px"
          className="object-contain"
        />
      </div>
      <p className="font-medium text-gray-800 text-base">{label}</p>
    </div>
  )
}
