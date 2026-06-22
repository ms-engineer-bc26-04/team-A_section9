// src/components/common/EmptyState.tsx
//「お気に入りがありません」などデータが0件の時に表示するメッセージ
import Button from './Button'

type EmptyStateProps = {
  message: string
  subMessage?: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
  message,
  subMessage,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <p className="text-gray-500 font-bold">{message}</p>
      {subMessage && (
        <p className="text-gray-400 text-sm">{subMessage}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}