// Redis利用方針
// - GET /api/v1/schools の匿名ユーザー向け園一覧・検索結果をキャッシュ対象とする
// - isFavorited / favoriteCount / favoriteLimit / isPremium / matchHighlights などのユーザー固有情報はキャッシュ対象外とする
// - sort=recommended はユーザー住所・希望条件により結果が変わるため、MVPではキャッシュ対象外とする
// - Redis接続に失敗した場合でもAPI提供は継続し、DBから直接取得する方針とする

import { createClient } from 'redis'

export const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
})

let isRedisAvailable = false

redis.on('error', (error) => {
  isRedisAvailable = false
  console.error('Redis error:', error)
})

export const connectRedis = async () => {
  try {
    if (!redis.isOpen) {
      await redis.connect()
    }

    isRedisAvailable = true
    console.log('Redis connected')
  } catch (error) {
    isRedisAvailable = false
    console.error(
      'Redis connection failed. Continue without Redis cache.',
      error
    )
  }
}

export const getRedisAvailable = () => isRedisAvailable && redis.isOpen
