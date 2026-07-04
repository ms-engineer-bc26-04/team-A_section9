import { afterEach, describe, expect, it, vi } from 'vitest'

type RedisEvent = 'error' | 'ready' | 'end' | 'reconnecting'

type MockRedisClient = {
  isOpen: boolean
  connect: ReturnType<typeof vi.fn>
  on: ReturnType<typeof vi.fn>
}

const loadRedisModule = async () => {
  vi.resetModules()

  const eventHandlers: Partial<Record<RedisEvent, (error?: unknown) => void>> =
    {}

  const mockRedisClient: MockRedisClient = {
    isOpen: false,
    connect: vi.fn(),
    on: vi.fn((event: RedisEvent, handler: (error?: unknown) => void) => {
      eventHandlers[event] = handler
      return mockRedisClient
    }),
  }

  const mockCreateClient = vi.fn(() => mockRedisClient)

  vi.doMock('redis', () => ({
    createClient: mockCreateClient,
  }))

  const redisModule = await import('../../lib/redis')

  return {
    ...redisModule,
    eventHandlers,
    mockCreateClient,
    mockRedisClient,
  }
}

describe('redis', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    vi.doUnmock('redis')
    delete process.env.REDIS_URL
  })

  it('REDIS_URLを使ってRedis clientを作成する', async () => {
    process.env.REDIS_URL = 'redis://test-redis:6379'

    const { mockCreateClient } = await loadRedisModule()

    expect(mockCreateClient).toHaveBeenCalledWith({
      url: 'redis://test-redis:6379',
      socket: {
        reconnectStrategy: expect.any(Function),
      },
    })
  })

  it('REDIS_URLがない場合はlocalhostのRedis URLを使う', async () => {
    const { mockCreateClient } = await loadRedisModule()

    expect(mockCreateClient).toHaveBeenCalledWith({
      url: 'redis://localhost:6379',
      socket: {
        reconnectStrategy: expect.any(Function),
      },
    })
  })

  it('reconnectStrategyは最大5秒まで待機する', async () => {
    const { mockCreateClient } = await loadRedisModule()

    const options = mockCreateClient.mock.calls[0][0]
    const reconnectStrategy = options.socket.reconnectStrategy

    expect(reconnectStrategy(1)).toBe(500)
    expect(reconnectStrategy(3)).toBe(1500)
    expect(reconnectStrategy(20)).toBe(5000)
  })

  it('Redisイベントハンドラーを登録する', async () => {
    const { mockRedisClient } = await loadRedisModule()

    expect(mockRedisClient.on).toHaveBeenCalledWith(
      'error',
      expect.any(Function)
    )
    expect(mockRedisClient.on).toHaveBeenCalledWith(
      'ready',
      expect.any(Function)
    )
    expect(mockRedisClient.on).toHaveBeenCalledWith('end', expect.any(Function))
    expect(mockRedisClient.on).toHaveBeenCalledWith(
      'reconnecting',
      expect.any(Function)
    )
  })

  it('初期状態ではRedis利用不可を返す', async () => {
    const { getRedisAvailable } = await loadRedisModule()

    expect(getRedisAvailable()).toBe(false)
  })

  it('readyイベントでRedis利用可能になり、接続ログを1回だけ出す', async () => {
    const { eventHandlers, getRedisAvailable, mockRedisClient } =
      await loadRedisModule()

    const consoleLogSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined)

    mockRedisClient.isOpen = true

    eventHandlers.ready?.()
    eventHandlers.ready?.()

    expect(getRedisAvailable()).toBe(true)
    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    expect(consoleLogSpy).toHaveBeenCalledWith('Redis connected')
  })

  it('errorイベントでRedis利用不可にし、エラーログを出す', async () => {
    const { eventHandlers, getRedisAvailable, mockRedisClient } =
      await loadRedisModule()

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    vi.spyOn(Date, 'now').mockReturnValue(61_000)

    mockRedisClient.isOpen = true
    eventHandlers.ready?.()

    const error = new Error('REDIS_ERROR')
    eventHandlers.error?.(error)

    expect(getRedisAvailable()).toBe(false)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Redis error. Continue without Redis cache.',
      error
    )
  })

  it('Redisエラーログは短時間に連続出力しない', async () => {
    const { eventHandlers } = await loadRedisModule()

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    const dateNowSpy = vi.spyOn(Date, 'now')

    const firstError = new Error('FIRST_ERROR')
    const secondError = new Error('SECOND_ERROR')
    const thirdError = new Error('THIRD_ERROR')

    dateNowSpy.mockReturnValue(61_000)
    eventHandlers.error?.(firstError)

    dateNowSpy.mockReturnValue(62_000)
    eventHandlers.error?.(secondError)

    dateNowSpy.mockReturnValue(122_000)
    eventHandlers.error?.(thirdError)

    expect(consoleErrorSpy).toHaveBeenCalledTimes(2)
    expect(consoleErrorSpy).toHaveBeenNthCalledWith(
      1,
      'Redis error. Continue without Redis cache.',
      firstError
    )
    expect(consoleErrorSpy).toHaveBeenNthCalledWith(
      2,
      'Redis error. Continue without Redis cache.',
      thirdError
    )
  })

  it('endイベントでRedis利用不可にし、警告ログを出す', async () => {
    const { eventHandlers, getRedisAvailable, mockRedisClient } =
      await loadRedisModule()

    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined)

    mockRedisClient.isOpen = true
    eventHandlers.ready?.()

    eventHandlers.end?.()

    expect(getRedisAvailable()).toBe(false)
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Redis connection closed. Continue without Redis cache.'
    )
  })

  it('reconnectingイベントでRedis利用不可にする', async () => {
    const { eventHandlers, getRedisAvailable, mockRedisClient } =
      await loadRedisModule()

    mockRedisClient.isOpen = true
    eventHandlers.ready?.()

    eventHandlers.reconnecting?.()

    expect(getRedisAvailable()).toBe(false)
  })

  it('connectRedisはRedisが未接続の場合にconnectを呼び、利用可能にする', async () => {
    const { connectRedis, getRedisAvailable, mockRedisClient } =
      await loadRedisModule()

    const consoleLogSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined)

    mockRedisClient.connect.mockImplementation(async () => {
      mockRedisClient.isOpen = true
    })

    await connectRedis()

    expect(mockRedisClient.connect).toHaveBeenCalledTimes(1)
    expect(getRedisAvailable()).toBe(true)
    expect(consoleLogSpy).toHaveBeenCalledWith('Redis connected')
  })

  it('connectRedisはRedisが接続済みの場合connectを呼ばず、利用可能にする', async () => {
    const { connectRedis, getRedisAvailable, mockRedisClient } =
      await loadRedisModule()

    const consoleLogSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined)

    mockRedisClient.isOpen = true

    await connectRedis()

    expect(mockRedisClient.connect).not.toHaveBeenCalled()
    expect(getRedisAvailable()).toBe(true)
    expect(consoleLogSpy).toHaveBeenCalledWith('Redis connected')
  })

  it('connectRedisで接続に失敗した場合はRedis利用不可にし、エラーログを出す', async () => {
    const { connectRedis, getRedisAvailable, mockRedisClient } =
      await loadRedisModule()

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    vi.spyOn(Date, 'now').mockReturnValue(61_000)

    const error = new Error('CONNECT_ERROR')
    mockRedisClient.connect.mockRejectedValue(error)

    await connectRedis()

    expect(getRedisAvailable()).toBe(false)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Redis connection failed. Continue without Redis cache.',
      error
    )
  })
})
