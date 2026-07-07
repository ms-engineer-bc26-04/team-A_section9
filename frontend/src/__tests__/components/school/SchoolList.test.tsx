// src/__tests__/components/school/SchoolList.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SchoolList from '@/components/school/SchoolList'
import { useAuth } from '@/lib/hooks/useAuth'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { getSchools } from '@/lib/api/schools'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

// SchoolCardは本テストの対象外なので、school情報とお気に入りボタンのみ持つ簡易モックに置き換える
vi.mock('@/components/school/SchoolCard', () => ({
  default: ({
    school,
    isLoggedIn,
    onToggleFavorite,
  }: {
    school: { id: number; name: string; isFavorited: boolean }
    isLoggedIn: boolean
    onToggleFavorite: (id: number) => void
  }) => (
    <div data-testid="school-card">
      <span>{school.name}</span>
      {isLoggedIn && (
        <button onClick={() => onToggleFavorite(school.id)}>
          お気に入り切替
        </button>
      )}
    </div>
  ),
}))

vi.mock('@/components/common/EmptyState', () => ({
  default: ({
    message,
    subMessage,
  }: {
    message: string
    subMessage: string
  }) => (
    <div data-testid="empty-state">
      <p>{message}</p>
      <p>{subMessage}</p>
    </div>
  ),
}))

vi.mock('@/components/common/Toast', () => ({
  default: ({ message, onClose }: { message: string; onClose: () => void }) => (
    <div data-testid="toast" onClick={onClose}>
      {message}
    </div>
  ),
}))

vi.mock('@/components/common/Modal', () => ({
  default: ({
    isOpen,
    title,
    children,
  }: {
    isOpen: boolean
    title: string
    children: React.ReactNode
  }) =>
    isOpen ? (
      <div data-testid="modal">
        <p>{title}</p>
        {children}
      </div>
    ) : null,
}))

vi.mock('@/components/common/Button', () => ({
  default: ({
    children,
    onClick,
  }: {
    children: React.ReactNode
    onClick: () => void
  }) => <button onClick={onClick}>{children}</button>,
}))

vi.mock('@/components/common/Skeleton', () => ({
  SchoolCardSkeleton: () => <div data-testid="skeleton" />,
}))

// ファクトリを渡さない自動モックだと本物のuseAuth.tsが読み込まれてしまうため、
// 明示的にファクトリを渡して実体の読み込みを避ける
vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))
vi.mock('@/lib/hooks/useFavorites', () => ({
  useFavorites: vi.fn(),
}))
vi.mock('@/lib/api/schools', () => ({
  getSchools: vi.fn(),
}))

// supabaseクライアントはgetSession()だけモックできればよい
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}))

const mockSchool = (id: number, name: string) => ({
  id,
  name,
  imageUrl: '',
  area: '',
})

describe('SchoolList', () => {
  const isFavoritedMock = vi.fn()
  const addFavoriteMock = vi.fn()
  const removeFavoriteMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      push: pushMock,
    })
    ;(useFavorites as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isFavorited: isFavoritedMock,
      addFavorite: addFavoriteMock,
      removeFavorite: removeFavoriteMock,
    })
    isFavoritedMock.mockReturnValue(false)
    // デフォルトは未ログイン想定のレスポンス（session無し）
    ;(
      supabase.auth.getSession as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ data: { session: null } })
  })

  it('認証・データ取得中はスケルトンを表示する', () => {
    ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoggedIn: false,
      isLoading: true,
      isPremium: false,
    })
    ;(getSchools as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
    })

    render(<SchoolList />)

    expect(screen.getAllByTestId('skeleton')).toHaveLength(3)
  })

  it('取得失敗時はエラーメッセージを表示する', async () => {
    ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoggedIn: false,
      isLoading: false,
      isPremium: false,
    })
    ;(getSchools as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('network error')
    )

    render(<SchoolList />)

    expect(
      await screen.findByText(
        '園一覧の取得に失敗しました。時間をおいて再度お試しください。'
      )
    ).toBeInTheDocument()
  })

  it('検索結果が0件の場合はEmptyStateを表示する', async () => {
    ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoggedIn: false,
      isLoading: false,
      isPremium: false,
    })
    ;(getSchools as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
    })

    render(<SchoolList />)

    const emptyState = await screen.findByTestId('empty-state')
    expect(emptyState).toHaveTextContent('条件に合う園が見つかりませんでした')
    expect(emptyState).toHaveTextContent(
      '検索条件を変更してもう一度お試しください'
    )
  })

  it('未ログイン時は「園の一覧」を見出しに表示し、フィルタ・トークン無しでgetSchoolsを呼ぶ', async () => {
    ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoggedIn: false,
      isLoading: false,
      isPremium: false,
    })
    ;(getSchools as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockSchool(1, 'さくら保育園')],
    })

    render(<SchoolList />)

    expect(await screen.findByText('園の一覧')).toBeInTheDocument()
    expect(getSchools).toHaveBeenCalledWith(undefined, undefined)
    // 未ログイン時はセッション取得自体を行わない
    expect(supabase.auth.getSession).not.toHaveBeenCalled()
  })

  it('ログイン時は「おすすめの園」を見出しに表示し、sort=recommendedとアクセストークンでgetSchoolsを呼ぶ', async () => {
    ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoggedIn: true,
      isLoading: false,
      isPremium: false,
    })
    ;(
      supabase.auth.getSession as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      data: { session: { access_token: 'dummy-token' } },
    })
    ;(getSchools as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockSchool(1, 'さくら保育園')],
    })

    render(<SchoolList />)

    expect(await screen.findByText('おすすめの園')).toBeInTheDocument()
    await waitFor(() =>
      expect(getSchools).toHaveBeenCalledWith(
        { sort: 'recommended' },
        'dummy-token'
      )
    )
  })

  it('お気に入り追加に成功するとToastを表示する', async () => {
    ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoggedIn: true,
      isLoading: false,
      isPremium: false,
    })
    ;(
      supabase.auth.getSession as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      data: { session: { access_token: 'dummy-token' } },
    })
    ;(getSchools as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockSchool(1, 'さくら保育園')],
    })
    addFavoriteMock.mockResolvedValue(undefined)

    render(<SchoolList />)

    const toggleButton = await screen.findByText('お気に入り切替')
    fireEvent.click(toggleButton)

    expect(await screen.findByTestId('toast')).toHaveTextContent(
      'お気に入りに追加しました'
    )
  })

  it('上限超過エラー・非プレミアムの場合はモーダルを表示する', async () => {
    ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoggedIn: true,
      isLoading: false,
      isPremium: false,
    })
    ;(
      supabase.auth.getSession as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      data: { session: { access_token: 'dummy-token' } },
    })
    ;(getSchools as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockSchool(1, 'さくら保育園')],
    })
    addFavoriteMock.mockRejectedValue(new Error('FAVORITE_LIMIT_EXCEEDED'))

    render(<SchoolList />)

    const toggleButton = await screen.findByText('お気に入り切替')
    fireEvent.click(toggleButton)

    expect(await screen.findByTestId('modal')).toHaveTextContent(
      'お気に入りの上限に達しました'
    )
  })

  it('モーダルの「プランを確認する」ボタンでプラン画面へ遷移する', async () => {
    ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoggedIn: true,
      isLoading: false,
      isPremium: false,
    })
    ;(
      supabase.auth.getSession as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      data: { session: { access_token: 'dummy-token' } },
    })
    ;(getSchools as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockSchool(1, 'さくら保育園')],
    })
    addFavoriteMock.mockRejectedValue(new Error('FAVORITE_LIMIT_EXCEEDED'))

    render(<SchoolList />)

    const toggleButton = await screen.findByText('お気に入り切替')
    fireEvent.click(toggleButton)

    const planButton = await screen.findByText('プランを確認する')
    fireEvent.click(planButton)

    expect(pushMock).toHaveBeenCalledWith('/plans')
  })
})
