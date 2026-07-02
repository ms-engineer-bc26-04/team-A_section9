// テキストを狙った位置でだけ改行できるようにするヘルパー群
// break-keep クラスと組み合わせて使う（CompareSchoolHeader.tsx / CompareRow.tsx）
// src/components/compare/breakUtils.tsx

// 「・」の直後に改行ポイント(<wbr>)を挿入する（例：「アプリ・電話」）
export function renderWithBreaks(text: string) {
  const parts = text.split('・')
  return parts.flatMap((part, i) =>
    i < parts.length - 1 ? [part, '・', <wbr key={`wbr-${i}`} />] : [part]
  )
}

// 指定したキーワードの直前に改行ポイント(<wbr>)を挿入する
// （例：keywords=['保育園','こども園'] のとき「たんぽぽ第二保育園」→「たんぽぽ第二」＋<wbr>＋「保育園」）
// 複数のキーワードのうち、テキスト中で最初に見つかったものだけを対象にする
export function renderWithBreakBeforeKeyword(text: string, keywords: string[]) {
  for (const keyword of keywords) {
    const index = text.indexOf(keyword)
    // 先頭一致（index === 0）は改行ポイントを作る意味がないので対象外
    if (index > 0) {
      return [
        text.slice(0, index),
        <wbr key="wbr-keyword" />,
        text.slice(index),
      ]
    }
  }
  return [text]
}
