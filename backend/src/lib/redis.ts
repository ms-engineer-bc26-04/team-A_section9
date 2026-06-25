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
