// ラベル変換マップのテスト
// src/__test__/components/compare/compareLabels.test.ts
import { describe, expect, it } from 'vitest'
import {
  mealTypeLabel,
  diaperLabel,
  futonLabel,
  contactBookLabel,
  absenceContactLabel,
} from '@/components/compare/compareLabels'

describe('compareLabels', () => {
  it('mealTypeLabel: 給食・弁当種別のラベルが正しい', () => {
    expect(mealTypeLabel.SCHOOL_LUNCH).toBe('毎日給食あり')
    expect(mealTypeLabel.LUNCH_BOX_REQUIRED).toBe('弁当あり')
    expect(mealTypeLabel.LUNCH_BOX).toBe('弁当あり')
    expect(mealTypeLabel.BOTH).toBe('給食・弁当併用')
    expect(mealTypeLabel.MIXED).toBe('給食・弁当併用')
  })

  it('diaperLabel: おむつ対応のラベルが正しい', () => {
    expect(diaperLabel.DISPOSED_BY_SCHOOL).toBe('園で廃棄')
    expect(diaperLabel.TAKE_HOME).toBe('持ち帰り')
    expect(diaperLabel.SUBSCRIPTION).toBe('サブスク対応')
  })

  it('futonLabel: 布団対応のラベルが正しい', () => {
    expect(futonLabel.RENTAL).toBe('レンタルあり')
    expect(futonLabel.TAKE_HOME_WEEKLY).toBe('毎週持ち帰り')
    expect(futonLabel.MANAGED_BY_SCHOOL).toBe('園で管理')
  })

  it('contactBookLabel: 連絡帳のラベルが正しい', () => {
    expect(contactBookLabel.APP).toBe('アプリ')
    expect(contactBookLabel.PAPER).toBe('手書き')
    expect(contactBookLabel.BOTH).toBe('アプリ・手書き併用')
  })

  it('absenceContactLabel: 欠席連絡方法のラベルが正しい', () => {
    expect(absenceContactLabel.APP).toBe('アプリ')
    expect(absenceContactLabel.PHONE).toBe('電話')
    expect(absenceContactLabel.BOTH).toBe('アプリ・電話')
  })
})
