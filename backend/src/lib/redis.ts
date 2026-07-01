// Redis利用方針
// - GET /api/v1/schools の匿名ユーザー向け園一覧・検索結果をキャッシュ対象とする
// - GET /api/v1/schools/:id の匿名ユーザー向け園詳細をキャッシュ対象とする
// - isFavorited / favoriteCount / favoriteLimit / isPremium / matchHighlights / supportInfoの開放状態などのユーザー固有情報はキャッシュ対象外とする
// - sort=recommended はユーザー住所・希望条件により結果が変わるため、MVPではキャッシュ対象外とする
// - GET /api/v1/schools/compare は認証・会員区分による制御があるため、キャッシュ対象追加時は別途設計する
// - Redis接続に失敗した場合でもAPI提供は継続し、DBから直接取得する方針とする

import { createClient } from 'redis'

const REDIS_ERROR_LOG_INTERVAL_MS = 60_000

export const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      // Redis停止時に短時間で再接続を連打しすぎないよう、最大5秒まで待機する
      return Math.min(retries * 500, 5_000)
    },
  },
})

let isRedisAvailable = false
let lastRedisErrorLoggedAt = 0
let hasLoggedRedisRecovered = false

const markRedisUnavailable = () => {
  isRedisAvailable = false
  hasLoggedRedisRecovered = false
}

const logRedisErrorWithThrottle = (message: string, error: unknown) => {
  const now = Date.now()

  if (now - lastRedisErrorLoggedAt < REDIS_ERROR_LOG_INTERVAL_MS) {
    return
  }

  lastRedisErrorLoggedAt = now
  console.error(message, error)
}

redis.on('error', (error) => {
  markRedisUnavailable()

  logRedisErrorWithThrottle('Redis error. Continue without Redis cache.', error)
})

redis.on('ready', () => {
  isRedisAvailable = true

  if (!hasLoggedRedisRecovered) {
    console.log('Redis connected')
    hasLoggedRedisRecovered = true
  }
})

redis.on('end', () => {
  markRedisUnavailable()
  console.warn('Redis connection closed. Continue without Redis cache.')
})

redis.on('reconnecting', () => {
  isRedisAvailable = false
})

export const connectRedis = async () => {
  try {
    if (!redis.isOpen) {
      await redis.connect()
    }

    isRedisAvailable = true

    if (!hasLoggedRedisRecovered) {
      console.log('Redis connected')
      hasLoggedRedisRecovered = true
    }
  } catch (error) {
    markRedisUnavailable()

    logRedisErrorWithThrottle(
      'Redis connection failed. Continue without Redis cache.',
      error
    )
  }
}

export const getRedisAvailable = () => isRedisAvailable && redis.isOpen
