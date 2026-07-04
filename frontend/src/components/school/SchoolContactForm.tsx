// 園へのお問い合わせフォーム
// src/components/school/SchoolContactForm.tsx
'use client'

type SchoolContactFormProps = {
  contactMessage: string
  isSending: boolean
  onChange: (value: string) => void
  onSubmit: () => void
}

export default function SchoolContactForm({
  contactMessage,
  isSending,
  onChange,
  onSubmit,
}: SchoolContactFormProps) {
  return (
    <section className="mt-6 bg-[#F5F5F0] rounded-xl p-4">
      <h2 className="font-bold text-base text-gray-800 mb-1">
        園へのお問い合わせ
      </h2>
      <p className="text-xs text-gray-500 mb-1">
        見学の事や入園に関するご質問など、お気軽にお問い合わせください
      </p>
      <p className="text-xs text-gray-500 mb-3">
        ご登録のメールアドレスに園側から返信があります
      </p>
      <label className="block text-sm text-gray-600 mb-1">
        お問い合わせ内容
      </label>
      <textarea
        value={contactMessage}
        onChange={(e) => onChange(e.target.value)}
        placeholder=""
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-24 resize-none mb-3"
      />
      <button
        onClick={onSubmit}
        disabled={isSending || !contactMessage.trim()}
        className="w-full bg-[#A0CD83] text-white rounded-full py-3 font-bold text-sm disabled:opacity-50"
      >
        {isSending ? '送信中...' : '送信する'}
      </button>
    </section>
  )
}
