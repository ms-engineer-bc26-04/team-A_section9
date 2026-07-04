import type { Request, Response } from 'express'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const createRequest = (overrides: Partial<Request> = {}): Request =>
  ({
    query: {
      zipcode: '1500001',
    },
    ...overrides,
  }) as Request

const createResponse = () => {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
    locals: {},
  }

  res.status.mockReturnValue(res)
  res.json.mockReturnValue(res)

  return res as unknown as Response & {
    status: ReturnType<typeof vi.fn>
    json: ReturnType<typeof vi.fn>
    locals: Record<string, unknown>
  }
}

const mockFetch = (response: Partial<Response>) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
}

describe('addressController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe('searchAddressByZipcode', () => {
    it('validatedQueryがある場合はvalidatedQueryのzipcodeを使用して住所を返す', async () => {
      const { searchAddressByZipcode } =
        await import('../../controllers/addressController')

      mockFetch({
        ok: true,
        json: vi.fn().mockResolvedValue({
          status: 200,
          message: null,
          results: [
            {
              zipcode: '1500001',
              prefcode: '13',
              address1: '東京都',
              address2: '渋谷区',
              address3: '神宮前',
              kana1: 'ﾄｳｷｮｳﾄ',
              kana2: 'ｼﾌﾞﾔｸ',
              kana3: 'ｼﾞﾝｸﾞｳﾏｴ',
            },
          ],
        }),
      })

      const req = createRequest({
        query: {
          zipcode: '1111111',
        },
      })
      const res = createResponse()
      res.locals.validatedQuery = {
        zipcode: '1500001',
      }

      await searchAddressByZipcode(req, res)

      expect(fetch).toHaveBeenCalledWith(
        'https://zipcloud.ibsnet.co.jp/api/search?zipcode=1500001'
      )
      expect(res.status).not.toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith({
        data: {
          zipcode: '1500001',
          prefecture: '東京都',
          city: '渋谷区',
          town: '神宮前',
          address: '東京都渋谷区神宮前',
        },
      })
    })

    it('validatedQueryがない場合はreq.queryのzipcodeを使用する', async () => {
      const { searchAddressByZipcode } =
        await import('../../controllers/addressController')

      mockFetch({
        ok: true,
        json: vi.fn().mockResolvedValue({
          status: 200,
          message: null,
          results: [
            {
              zipcode: '2600854',
              prefcode: '12',
              address1: '千葉県',
              address2: '千葉市中央区',
              address3: '長洲',
              kana1: 'ﾁﾊﾞｹﾝ',
              kana2: 'ﾁﾊﾞｼﾁｭｳｵｳｸ',
              kana3: 'ﾅｶﾞｽﾞ',
            },
          ],
        }),
      })

      const req = createRequest({
        query: {
          zipcode: '2600854',
        },
      })
      const res = createResponse()

      await searchAddressByZipcode(req, res)

      expect(fetch).toHaveBeenCalledWith(
        'https://zipcloud.ibsnet.co.jp/api/search?zipcode=2600854'
      )
      expect(res.json).toHaveBeenCalledWith({
        data: {
          zipcode: '2600854',
          prefecture: '千葉県',
          city: '千葉市中央区',
          town: '長洲',
          address: '千葉県千葉市中央区長洲',
        },
      })
    })

    it('住所検索APIのレスポンスがokでない場合は502を返す', async () => {
      const { searchAddressByZipcode } =
        await import('../../controllers/addressController')

      mockFetch({
        ok: false,
      })

      const req = createRequest()
      const res = createResponse()

      await searchAddressByZipcode(req, res)

      expect(res.status).toHaveBeenCalledWith(502)
      expect(res.json).toHaveBeenCalledWith({
        message: '住所検索APIの呼び出しに失敗しました',
      })
    })

    it('resultsがnullの場合は404を返す', async () => {
      const { searchAddressByZipcode } =
        await import('../../controllers/addressController')

      mockFetch({
        ok: true,
        json: vi.fn().mockResolvedValue({
          status: 200,
          message: null,
          results: null,
        }),
      })

      const req = createRequest()
      const res = createResponse()

      await searchAddressByZipcode(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        message: '住所が見つかりません',
      })
    })

    it('resultsが空配列の場合は404を返す', async () => {
      const { searchAddressByZipcode } =
        await import('../../controllers/addressController')

      mockFetch({
        ok: true,
        json: vi.fn().mockResolvedValue({
          status: 200,
          message: null,
          results: [],
        }),
      })

      const req = createRequest()
      const res = createResponse()

      await searchAddressByZipcode(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        message: '住所が見つかりません',
      })
    })

    it('住所検索中に例外が発生した場合は500を返す', async () => {
      const { searchAddressByZipcode } =
        await import('../../controllers/addressController')

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined)

      const error = new Error('FETCH_ERROR')
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error))

      const req = createRequest()
      const res = createResponse()

      await searchAddressByZipcode(req, res)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Address search error:',
        error
      )
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        message: '住所検索中にエラーが発生しました',
      })
    })
  })
})
