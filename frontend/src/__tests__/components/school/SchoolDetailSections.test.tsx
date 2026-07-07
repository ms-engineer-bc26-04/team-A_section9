// src/__tests__/components/school/SchoolDetailSections.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SchoolDetailSections from '@/components/school/SchoolDetailSections'

// next/image のモック（width/heightなどNext独自propsを無視して<img>として描画）
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// 全テスト共通のベースprops。各テストでは差分だけ上書きする
const baseProps = {
  mealType: 'SCHOOL_LUNCH',
  itemBurdenLevel: 'LOW',
  itemBurdenDetail: null,
  diaperSupport: null,
  futonSupport: null,
  extendedCareHours: null,
  extendedCareUsage: '10名',
  weekdayEventsLevel: 'LOW',
  weekdayEvents: null,
  parentAssociationLevel: 'LOW',
  parentAssociationFrequency: null,
  description: null,
  supportInfo: {
    isLocked: false,
    contactBookType: null,
    absenceContactMethod: null,
    lessons: null,
    allergySupport: null,
  },
  isLoggedIn: false,
  supabaseUser: false,
  onShowRegisterModal: vi.fn(),
  onShowPremiumModal: vi.fn(),
}

describe('SchoolDetailSections', () => {
  describe('毎日の準備セクション', () => {
    it('給食・弁当のラベルを変換して表示する', () => {
      render(<SchoolDetailSections {...baseProps} mealType="LUNCH_BOX" />)
      expect(screen.getByText('弁当あり')).toBeInTheDocument()
    })

    it('マッピングにないmealTypeはそのまま表示する', () => {
      render(<SchoolDetailSections {...baseProps} mealType="UNKNOWN_TYPE" />)
      expect(screen.getByText('UNKNOWN_TYPE')).toBeInTheDocument()
    })

    it('itemBurdenDetailがある場合はそちらを優先して表示する', () => {
      render(
        <SchoolDetailSections
          {...baseProps}
          itemBurdenLevel="HIGH"
          itemBurdenDetail="お昼寝布団の持参が必要です"
        />
      )
      expect(screen.getByText('お昼寝布団の持参が必要です')).toBeInTheDocument()
      expect(screen.queryByText('多い')).not.toBeInTheDocument()
    })

    it('itemBurdenDetailがない場合はburdenLabelから変換して表示する', () => {
      render(
        <SchoolDetailSections
          {...baseProps}
          itemBurdenLevel="HIGH"
          itemBurdenDetail={null}
        />
      )
      expect(screen.getByText('多い')).toBeInTheDocument()
    })

    it('おむつ対応・布団対応は値がある場合のみ表示する', () => {
      const { rerender } = render(<SchoolDetailSections {...baseProps} />)
      expect(screen.queryByText('おむつ対応')).not.toBeInTheDocument()
      expect(screen.queryByText('布団対応')).not.toBeInTheDocument()

      rerender(
        <SchoolDetailSections
          {...baseProps}
          diaperSupport="使用済みおむつは園で処分"
          futonSupport="レンタル布団あり"
        />
      )
      expect(screen.getByText('おむつ対応')).toBeInTheDocument()
      expect(screen.getByText('使用済みおむつは園で処分')).toBeInTheDocument()
      expect(screen.getByText('布団対応')).toBeInTheDocument()
      expect(screen.getByText('レンタル布団あり')).toBeInTheDocument()
    })
  })

  describe('仕事との両立セクション', () => {
    it('延長保育の時間は値がある場合のみ表示する', () => {
      const { rerender } = render(<SchoolDetailSections {...baseProps} />)
      expect(screen.queryByText('延長保育の時間')).not.toBeInTheDocument()

      rerender(
        <SchoolDetailSections {...baseProps} extendedCareHours="19:00まで" />
      )
      expect(screen.getByText('延長保育の時間')).toBeInTheDocument()
      expect(screen.getByText('19:00まで')).toBeInTheDocument()
    })

    it('延長保育利用者は常に表示する', () => {
      render(<SchoolDetailSections {...baseProps} extendedCareUsage="10名" />)
      expect(screen.getByText('延長保育利用者')).toBeInTheDocument()
      expect(screen.getByText('10名')).toBeInTheDocument()
    })

    it('平日行事はweekdayEventsがあればそちらを優先し、なければlevelから変換する', () => {
      const { rerender } = render(
        <SchoolDetailSections
          {...baseProps}
          weekdayEventsLevel="HIGH"
          weekdayEvents="運動会・発表会など多数"
        />
      )
      expect(screen.getByText('運動会・発表会など多数')).toBeInTheDocument()

      rerender(
        <SchoolDetailSections
          {...baseProps}
          weekdayEventsLevel="HIGH"
          weekdayEvents={null}
        />
      )
      expect(screen.getByText('多い')).toBeInTheDocument()
    })

    it('保護者会はparentAssociationFrequencyがあればそちらを優先し、なければlevelから変換する', () => {
      const { rerender } = render(
        <SchoolDetailSections
          {...baseProps}
          parentAssociationLevel="MIDDLE"
          parentAssociationFrequency="年3回程度"
        />
      )
      expect(screen.getByText('年3回程度')).toBeInTheDocument()

      rerender(
        <SchoolDetailSections
          {...baseProps}
          parentAssociationLevel="MIDDLE"
          parentAssociationFrequency={null}
        />
      )
      expect(screen.getByText('普通')).toBeInTheDocument()
    })
  })

  describe('サポート情報セクション', () => {
    it('ロックされていない場合は各項目を変換して表示する', () => {
      render(
        <SchoolDetailSections
          {...baseProps}
          supportInfo={{
            isLocked: false,
            contactBookType: 'APP',
            absenceContactMethod: 'PHONE',
            lessons: '英会話・体操教室',
            allergySupport: '除去食対応あり',
          }}
        />
      )

      expect(screen.getByText('連絡帳')).toBeInTheDocument()
      expect(screen.getByText('アプリ')).toBeInTheDocument()
      expect(screen.getByText('欠席連絡方法')).toBeInTheDocument()
      expect(screen.getByText('電話')).toBeInTheDocument()
      expect(screen.getByText('英会話・体操教室')).toBeInTheDocument()
      expect(screen.getByText('除去食対応あり')).toBeInTheDocument()
    })

    it('マッピングにない値はそのまま表示する', () => {
      render(
        <SchoolDetailSections
          {...baseProps}
          supportInfo={{
            isLocked: false,
            contactBookType: 'UNKNOWN',
            absenceContactMethod: null,
            lessons: null,
            allergySupport: null,
          }}
        />
      )
      expect(screen.getByText('UNKNOWN')).toBeInTheDocument()
    })

    it('lessons・allergySupportは値がある場合のみ表示する', () => {
      render(
        <SchoolDetailSections
          {...baseProps}
          supportInfo={{
            isLocked: false,
            contactBookType: null,
            absenceContactMethod: null,
            lessons: null,
            allergySupport: null,
          }}
        />
      )
      expect(screen.queryByText('園内習い事')).not.toBeInTheDocument()
      expect(screen.queryByText('アレルギー対応')).not.toBeInTheDocument()
    })

    it('ロックされている場合はマスクされた項目名のみ表示する', () => {
      render(
        <SchoolDetailSections
          {...baseProps}
          supportInfo={{
            isLocked: true,
            contactBookType: null,
            absenceContactMethod: null,
            lessons: null,
            allergySupport: null,
          }}
        />
      )

      expect(screen.getByText('連絡帳')).toBeInTheDocument()
      expect(screen.getByText('欠席連絡方法')).toBeInTheDocument()
      expect(screen.getByText('園内習い事')).toBeInTheDocument()
      expect(screen.getByText('アレルギー対応')).toBeInTheDocument()
    })

    it('ロックされていて未登録ユーザーの場合、クリックで会員登録モーダルを表示させる', () => {
      const onShowRegisterModal = vi.fn()
      const onShowPremiumModal = vi.fn()

      render(
        <SchoolDetailSections
          {...baseProps}
          supabaseUser={false}
          onShowRegisterModal={onShowRegisterModal}
          onShowPremiumModal={onShowPremiumModal}
          supportInfo={{
            isLocked: true,
            contactBookType: null,
            absenceContactMethod: null,
            lessons: null,
            allergySupport: null,
          }}
        />
      )

      // ロックオーバーレイの唯一のボタンをクリック
      fireEvent.click(screen.getByRole('button'))

      expect(onShowRegisterModal).toHaveBeenCalledTimes(1)
      expect(onShowPremiumModal).not.toHaveBeenCalled()
    })

    it('ロックされていて登録済み（非プレミアム）ユーザーの場合、クリックでプレミアム誘導モーダルを表示させる', () => {
      const onShowRegisterModal = vi.fn()
      const onShowPremiumModal = vi.fn()

      render(
        <SchoolDetailSections
          {...baseProps}
          supabaseUser={true}
          onShowRegisterModal={onShowRegisterModal}
          onShowPremiumModal={onShowPremiumModal}
          supportInfo={{
            isLocked: true,
            contactBookType: null,
            absenceContactMethod: null,
            lessons: null,
            allergySupport: null,
          }}
        />
      )

      fireEvent.click(screen.getByRole('button'))

      expect(onShowPremiumModal).toHaveBeenCalledTimes(1)
      expect(onShowRegisterModal).not.toHaveBeenCalled()
    })
  })

  describe('園の特徴セクション', () => {
    it('descriptionがある場合はそのまま表示する', () => {
      render(
        <SchoolDetailSections
          {...baseProps}
          description="自然の中でのびのび遊べる園です"
        />
      )
      expect(
        screen.getByText('自然の中でのびのび遊べる園です')
      ).toBeInTheDocument()
    })

    it('descriptionがない場合は「情報がありません」を表示する', () => {
      render(<SchoolDetailSections {...baseProps} description={null} />)
      expect(screen.getByText('情報がありません')).toBeInTheDocument()
    })
  })
})
