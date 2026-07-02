// 比較テーブルで使うAPI値→表示ラベルの変換マップ
// src/components/compare/compareLabels.ts

export const mealTypeLabel: Record<string, string> = {
  SCHOOL_LUNCH: '毎日給食あり',
  LUNCH_BOX_REQUIRED: '弁当あり',
  LUNCH_BOX: '弁当あり',
  BOTH: '給食・弁当併用',
  MIXED: '給食・弁当併用',
}

export const diaperLabel: Record<string, string> = {
  DISPOSED_BY_SCHOOL: '園で廃棄',
  TAKE_HOME: '持ち帰り',
  SUBSCRIPTION: 'サブスク対応',
}

export const futonLabel: Record<string, string> = {
  RENTAL: 'レンタルあり',
  TAKE_HOME_WEEKLY: '毎週持ち帰り',
  MANAGED_BY_SCHOOL: '園で管理',
}

export const contactBookLabel: Record<string, string> = {
  APP: 'アプリ',
  PAPER: '手書き',
  BOTH: 'アプリ・手書き併用',
}

export const absenceContactLabel: Record<string, string> = {
  APP: 'アプリ',
  PHONE: '電話',
  BOTH: 'アプリ・電話',
}
