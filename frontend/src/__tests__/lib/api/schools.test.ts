// 園API関数群のテスト
// src/__test__/lib/api/schools.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getSchools, getSchool } from '@/lib/api/schools'

const API_URL = 'http://test-api.example.com'
const ACCESS_TOKEN = 'test-access-token'

describe('schools API', () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', API_URL)
    mockFetch = vi.fn()
    global.fetch = mockFetch as unknown as typeof fetch
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe('getSchools', () => {
    it('filtersが未指定の場合、クエリパラメータなしでリクエストする', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })

      await getSchools()

      expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/api/v1/schools?`, {
        cache: 'no-store',
        headers: {},
      })
    })

    it('指定したfiltersがすべてクエリパラメータに変換される', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })

      await getSchools({
        keyword: 'さくら',
        area: '渋谷区',
        mealType: 'SCHOOL_LUNCH',
        diaperSupport: true,
        futonSupport: false,
        weekdayEventsLevel: 'LOW',
        parentAssociationLevel: 'LOW',
        lessons: true,
        allergySupport: true,
        sort: 'recommended',
        limit: 10,
        offset: 0,
        extendedCareUsage: true,
      })

      const calledUrl = mockFetch.mock.calls[0][0] as string
      const params = new URL(calledUrl).searchParams

      expect(params.get('keyword')).toBe('さくら')
      expect(params.get('area')).toBe('渋谷区')
      expect(params.get('mealType')).toBe('SCHOOL_LUNCH')
      expect(params.get('diaperSupport')).toBe('true')
      expect(params.get('futonSupport')).toBe('false')
      expect(params.get('weekdayEventsLevel')).toBe('LOW')
      expect(params.get('parentAssociationLevel')).toBe('LOW')
      expect(params.get('lessons')).toBe('true')
      expect(params.get('allergySupport')).toBe('true')
      expect(params.get('sort')).toBe('recommended')
      expect(params.get('limit')).toBe('10')
      expect(params.get('offset')).toBe('0')
      expect(params.get('extendedCareUsage')).toBe('true')
    })

    it('accessTokenを渡すとAuthorizationヘッダーが付与される', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })

      await getSchools(undefined, ACCESS_TOKEN)

      expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/api/v1/schools?`, {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      })
    })

    it('レスポンスが失敗した場合はエラーをthrowする', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false })

      await expect(getSchools()).rejects.toThrow('園一覧の取得に失敗しました')
    })

    it('windowが存在せずINTERNAL_API_URLがある場合はそちらを優先する（サーバーサイド想定）', async () => {
      vi.stubEnv('INTERNAL_API_URL', 'http://internal-api.example.com')
      vi.stubGlobal('window', undefined)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })

      await getSchools()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://internal-api.example.com/api/v1/schools?',
        { cache: 'no-store', headers: {} }
      )
    })

    it('windowが存在せずINTERNAL_API_URLも無い場合はNEXT_PUBLIC_API_URLにフォールバックする', async () => {
      vi.stubGlobal('window', undefined)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })

      await getSchools()

      expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/api/v1/schools?`, {
        cache: 'no-store',
        headers: {},
      })
    })
  })

  describe('getSchool', () => {
    it('指定したidで園詳細を取得する', async () => {
      const mockData = { data: { id: '1', name: 'さくら保育園' } }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const result = await getSchool('1')

      expect(result).toEqual(mockData)
      expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/api/v1/schools/1`, {
        cache: 'no-store',
      })
    })

    it('レスポンスが失敗した場合はエラーをthrowする', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false })

      await expect(getSchool('1')).rejects.toThrow('園詳細の取得に失敗しました')
    })
  })
})
