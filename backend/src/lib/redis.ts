// Redis利用方針
// - MVPではRedis接続設定のみ実装し、園一覧APIへの本格的なキャッシュは後続対応とする
// - 主なキャッシュ対象は GET /api/v1/schools の園一覧・検索結果を想定する
// - isFavorited / favoriteCount / favoriteLimit / isPremium / matchHighlights などのユーザー固有情報はキャッシュ対象外とする
// - sort=recommended はユーザー住所・希望条件により結果が変わるため、MVPでは通常一覧・検索結果とは別扱いにする
// - Redis接続に失敗した場合でもAPI提供は継続し、DBから直接取得する方針とする

import { createClient } from 'redis'

export const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
})

redis.on('error', (error) => {
  console.error('Redis error:', error)
})

export const connectRedis = async () => {
  try {
    await redis.connect()
    console.log('Redis connected')
  } catch (error) {
    // MVPではRedisキャッシュ未接続でもAPI提供を継続する
    // 後続でRedisキャッシュを本格導入する際に、監視・再接続方針を整理する
    console.error(
      'Redis connection failed. Continue without Redis cache.',
      error
    )
  }
}
