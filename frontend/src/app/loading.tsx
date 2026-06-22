//app/loading.tsx
//ページ遷移中に自動で表示されるローディング画面
import Loading from '@/components/common/Loading'

export default function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loading size="lg" />
    </div>
  )
}