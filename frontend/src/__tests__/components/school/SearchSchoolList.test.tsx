// src/__tests__/components/school/SearchSchoolList.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SearchSchoolList from '@/components/school/SearchSchoolList'
import { useAuth } from '@/lib/hooks/useAuth'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { getSchools } from '@/lib/api/schools'
import { useRouter } from 'next/navigation'

// next/navigation のモック（Modal内の「プランを確認する」ボタン用）
const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

// next/image のモック（fill/sizesなどNext独自propsを無視して<img>として描画）
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
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

// ファクトリを渡さない自動モックだと、実体を調べるために本物のuseAuth.tsが
// 読み込まれてしまい、内部でimportしている@/lib/supabaseが
// createBrowserClient()を即実行してエラーになるため、明示的にファクトリを渡す
vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))
vi.mock('@/lib/hooks/useFavorites', () => ({
  useFavorites: vi.fn(),
}))
vi.mock('@/lib/api/schools', () => ({
  getSchools: vi.fn(),
}))

// テスト用のダミー園データ生成ヘルパー
const mockSchool = (id: number, name: string) => ({
  id,
  name,
  imageUrl: '',
  area: '',
})

describe('SearchSchoolList', () => {
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

    render(<SearchSchoolList searchParams={{}} />)

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

    render(<SearchSchoolList searchParams={{}} />)

    expect(
      await screen.findByText(
        '園一覧の取得に失敗しました。時間をおいて再度お試しください。'
      )
    ).toBeInTheDocument()
  })

  it('検索結果が0件の場合は「見つかりませんでした」を表示する', async () => {
    ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoggedIn: false,
      isLoading: false,
      isPremium: false,
    })
    ;(getSchools as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
    })

    render(<SearchSchoolList searchParams={{}} />)

    expect(
      await screen.findByText('条件に合う園が見つかりませんでした')
    ).toBeInTheDocument()
    expect(
      screen.getByText('検索条件を変更してもう一度お試しください')
    ).toBeInTheDocument()
  })

  it('検索結果がある場合は件数とSchoolCardを表示する', async () => {
    ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoggedIn: false,
      isLoading: false,
      isPremium: false,
    })
    ;(getSchools as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockSchool(1, 'さくら保育園'), mockSchool(2, 'ひまわりこども園')],
    })

    render(<SearchSchoolList searchParams={{}} />)

    expect(await screen.findAllByTestId('school-card')).toHaveLength(2)
    expect(screen.getByText('2件の園が見つかりました')).toBeInTheDocument()
  })

  it('searchParamsを検索条件に変換してgetSchoolsに渡す', async () => {
    ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoggedIn: false,
      isLoading: false,
      isPremium: false,
    })
    ;(getSchools as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
    })

    render(
      <SearchSchoolList
        searchParams={{
          keyword: 'さくら',
          area: '横浜市',
          hasLunch: 'true',
          diaperDisposal: 'true',
          noBedding: 'true',
          noWeekdayEvents: 'true',
          noPTA: 'true',
          hasClub: 'true',
          allergySupport: 'true',
          extendedCareUsage: 'true',
        }}
      />
    )

    await waitFor(() => expect(getSchools).toHaveBeenCalled())
    expect(getSchools).toHaveBeenCalledWith({
      keyword: 'さくら',
      area: '横浜市',
      mealType: 'SCHOOL_LUNCH',
      diaperSupport: true,
      futonSupport: true,
      weekdayEventsLevel: 'LOW',
      parentAssociationLevel: 'LOW',
      lessons: true,
      allergySupport: true,
      extendedCareUsage: true,
    })
  })

  it('お気に入り追加に成功するとToastを表示する', async () => {
    ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoggedIn: true,
      isLoading: false,
      isPremium: false,
    })
    ;(getSchools as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockSchool(1, 'さくら保育園')],
    })
    addFavoriteMock.mockResolvedValue(undefined)

    render(<SearchSchoolList searchParams={{}} />)

    const toggleButton = await screen.findByText('お気に入り切替')
    fireEvent.click(toggleButton)

    expect(await screen.findByTestId('toast')).toHaveTextContent(
      'お気に入りに追加しました'
    )
    expect(addFavoriteMock).toHaveBeenCalledWith(1)
  })

  it('お気に入り解除に成功するとToastを表示する', async () => {
    ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoggedIn: true,
      isLoading: false,
      isPremium: false,
    })
    ;(getSchools as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockSchool(1, 'さくら保育園')],
    })
    isFavoritedMock.mockReturnValue(true)
    removeFavoriteMock.mockResolvedValue(undefined)

    render(<SearchSchoolList searchParams={{}} />)

    const toggleButton = await screen.findByText('お気に入り切替')
    fireEvent.click(toggleButton)

    expect(await screen.findByTestId('toast')).toHaveTextContent(
      'お気に入りを解除しました'
    )
    expect(removeFavoriteMock).toHaveBeenCalledWith(1)
  })

  it('未ログインの場合はお気に入りボタンが表示されない', async () => {
    ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoggedIn: false,
      isLoading: false,
      isPremium: false,
    })
    ;(getSchools as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockSchool(1, 'さくら保育園')],
    })

    render(<SearchSchoolList searchParams={{}} />)

    await screen.findByTestId('school-card')
    expect(screen.queryByText('お気に入り切替')).not.toBeInTheDocument()
  })

  it('上限超過エラー・非プレミアムの場合はモーダルを表示する', async () => {
    ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoggedIn: true,
      isLoading: false,
      isPremium: false,
    })
    ;(getSchools as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockSchool(1, 'さくら保育園')],
    })
    addFavoriteMock.mockRejectedValue(new Error('FAVORITE_LIMIT_EXCEEDED'))

    render(<SearchSchoolList searchParams={{}} />)

    const toggleButton = await screen.findByText('お気に入り切替')
    fireEvent.click(toggleButton)

    expect(await screen.findByTestId('modal')).toHaveTextContent(
      'お気に入りの上限に達しました'
    )
  })

  it('上限超過エラー・プレミアムの場合はエラーToastを表示する（モーダルは出さない）', async () => {
    ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoggedIn: true,
      isLoading: false,
      isPremium: true,
    })
    ;(getSchools as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockSchool(1, 'さくら保育園')],
    })
    addFavoriteMock.mockRejectedValue(new Error('FAVORITE_LIMIT_EXCEEDED'))

    render(<SearchSchoolList searchParams={{}} />)

    const toggleButton = await screen.findByText('お気に入り切替')
    fireEvent.click(toggleButton)

    expect(await screen.findByTestId('toast')).toHaveTextContent(
      'お気に入りの更新に失敗しました'
    )
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
  })

  it('上限超過以外のエラーの場合もエラーToastを表示する', async () => {
    ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoggedIn: true,
      isLoading: false,
      isPremium: false,
    })
    ;(getSchools as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockSchool(1, 'さくら保育園')],
    })
    addFavoriteMock.mockRejectedValue(new Error('UNKNOWN_ERROR'))

    render(<SearchSchoolList searchParams={{}} />)

    const toggleButton = await screen.findByText('お気に入り切替')
    fireEvent.click(toggleButton)

    expect(await screen.findByTestId('toast')).toHaveTextContent(
      'お気に入りの更新に失敗しました'
    )
  })

  it('モーダルの「プランを確認する」ボタンでプラン画面へ遷移する', async () => {
    ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoggedIn: true,
      isLoading: false,
      isPremium: false,
    })
    ;(getSchools as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockSchool(1, 'さくら保育園')],
    })
    addFavoriteMock.mockRejectedValue(new Error('FAVORITE_LIMIT_EXCEEDED'))

    render(<SearchSchoolList searchParams={{}} />)

    const toggleButton = await screen.findByText('お気に入り切替')
    fireEvent.click(toggleButton)

    const planButton = await screen.findByText('プランを確認する')
    fireEvent.click(planButton)

    expect(pushMock).toHaveBeenCalledWith('/plans')
  })
})
