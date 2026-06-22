// src/components/common/ErrorMessage.tsx
//フォームの入力エラーをフィールドの下に表示するテキスト
type ErrorMessageProps = {
  message: string
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return <p className="text-red-500 text-sm mt-1">{message}</p>
}
