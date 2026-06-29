// チェックボックスアイテム（共通）
// src/components/mypage/CheckItem.tsx
type CheckItemProps = {
  label: string
  checked: boolean
  onChange: (val: boolean) => void
}

export default function CheckItem({ label, checked, onChange }: CheckItemProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-[#A0CD83]"
      />
      <span className="text-sm text-gray-600">{label}</span>
    </label>
  )
}