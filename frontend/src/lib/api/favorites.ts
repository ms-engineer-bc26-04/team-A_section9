//バックエンドのお気に入りAPIを叩く関数群
// src/lib/api/favorites.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL

// お気に入り登録
export async function addFavorite(
  schoolId: number,
  accessToken: string
): Promise<void> {
  //TODO:お気に入り機能の実装が完了したらconsole.logは削除する
  console.log('addFavorite called', schoolId)
  console.log('Authorization:', `Bearer ${accessToken.slice(0, 20)}...`)

  const res = await fetch(`${API_URL}/api/v1/users/me/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ schoolId }),
  })
  //TODO:お気に入り機能の実装が完了したらconsole.logは削除する
  console.log('response status:', res.status)

  if (!res.ok) {
    const json = await res.json()
    //TODO:お気に入り機能の実装が完了したらconsole.logは削除する
    console.log('error response:', json)
    throw new Error(json.error?.code || 'UNKNOWN_ERROR')
  }
}

// お気に入り解除
export async function removeFavorite(
  schoolId: number,
  accessToken: string
): Promise<void> {
  const res = await fetch(`${API_URL}/api/v1/users/me/favorites/${schoolId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!res.ok) {
    const json = await res.json()
    throw new Error(json.error?.code || 'UNKNOWN_ERROR')
  }
}

// お気に入り一覧取得
export async function getFavorites(accessToken: string) {
  const res = await fetch(`${API_URL}/api/v1/users/me/favorites`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!res.ok) {
    throw new Error('お気に入り一覧の取得に失敗しました')
  }

  return res.json()
}
