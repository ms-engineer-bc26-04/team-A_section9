// src/components/common/Loading.tsx
//ボタン内のスピナーなど小さい単位のローディング表示
type LoadingProps = {
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-4',
  lg: 'w-12 h-12 border-4',
}

export default function Loading({ size = 'md' }: LoadingProps) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`
          ${sizeStyles[size]}
          border-primary border-t-transparent
          rounded-full animate-spin
        `}
      />
    </div>
  )
}