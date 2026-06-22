// src/components/common/Button.tsx
//アプリ全体で使う共通ボタン。緑・オレンジ・グレーなどvariantで切り替える
type ButtonProps = {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  isLoading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

const variantStyles = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary:
    'bg-white text-primary border border-primary hover:bg-primary-light',
  accent: 'bg-accent text-white hover:opacity-90',
  ghost: 'bg-gray-200 text-gray-400 cursor-not-allowed',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  onClick,
  type = 'button',
  className = '',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        rounded-full font-bold transition-all duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          処理中...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
