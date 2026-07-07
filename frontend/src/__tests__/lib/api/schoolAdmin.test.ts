// 園管理者API関数群のテスト
// src/__test__/lib/api/schoolAdmin.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getSchoolAdminMe,
  getSchoolAdminSchool,
  updateSchoolAdminSchool,
} from '@/lib/api/schoolAdmin'

const API_URL = 'http://test-api.example.com'
const ACCESS_TOKEN = 'test-access-token'

describe('schoolAdmin API', () => {
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

  describe('getSchoolAdminMe', () => {
    it('Authorizationヘッダー付きでリクエストし、成功時はJSONを返す', async () => {
      const mockData = {
        data: { id: '1', school: { id: '1', name: 'さくら保育園' } },
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const result = await getSchoolAdminMe(ACCESS_TOKEN)

      expect(result).toEqual(mockData)
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/api/v1/school-admin/me`,
        {
          cache: 'no-store',
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
        }
      )
    })

    it('失敗時はエラーをthrowする', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false })

      await expect(getSchoolAdminMe(ACCESS_TOKEN)).rejects.toThrow(
        '園管理者情報の取得に失敗しました'
      )
    })

    it('windowが存在せずINTERNAL_API_URLがある場合はそちらを優先する（サーバーサイド想定）', async () => {
      vi.stubEnv('INTERNAL_API_URL', 'http://internal-api.example.com')
      vi.stubGlobal('window', undefined)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: {} }),
      })

      await getSchoolAdminMe(ACCESS_TOKEN)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://internal-api.example.com/api/v1/school-admin/me',
        {
          cache: 'no-store',
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
        }
      )
    })
  })

  describe('getSchoolAdminSchool', () => {
    it('Authorizationヘッダー付きでリクエストし、成功時はJSONを返す', async () => {
      const mockData = {
        data: { id: '1', name: 'さくら保育園', contactPerson: '山田 花子' },
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const result = await getSchoolAdminSchool(ACCESS_TOKEN)

      expect(result).toEqual(mockData)
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/api/v1/school-admin/school`,
        {
          cache: 'no-store',
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
        }
      )
    })

    it('失敗時はエラーをthrowする', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false })

      await expect(getSchoolAdminSchool(ACCESS_TOKEN)).rejects.toThrow(
        '園情報の取得に失敗しました'
      )
    })
  })

  describe('updateSchoolAdminSchool', () => {
    it('PATCHでbodyをJSON化して送信し、成功時はJSONを返す', async () => {
      const requestBody = { name: 'さくら保育園', contactPerson: '山田 花子' }
      const mockData = { data: requestBody }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const result = await updateSchoolAdminSchool(ACCESS_TOKEN, requestBody)

      expect(result).toEqual(mockData)
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/api/v1/school-admin/school`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
          body: JSON.stringify(requestBody),
        }
      )
    })

    it('失敗時はエラーをthrowする', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false })

      await expect(updateSchoolAdminSchool(ACCESS_TOKEN, {})).rejects.toThrow(
        '園情報の更新に失敗しました'
      )
    })
  })
})
