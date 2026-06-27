import { Request, Response } from 'express'

type ZipcloudResponse = {
  status: number
  message: string | null
  results:
    | {
        zipcode: string
        prefcode: string
        address1: string
        address2: string
        address3: string
        kana1: string
        kana2: string
        kana3: string
      }[]
    | null
}

export const searchAddressByZipcode = async (req: Request, res: Response) => {
  const query = res.locals.validatedQuery ?? req.query
  const zipcode = String(query.zipcode)

  try {
    const response = await fetch(
      `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`
    )

    if (!response.ok) {
      return res.status(502).json({
        message: '住所検索APIの呼び出しに失敗しました',
      })
    }

    const data = (await response.json()) as ZipcloudResponse

    if (!data.results || data.results.length === 0) {
      return res.status(404).json({
        message: '住所が見つかりません',
      })
    }

    const result = data.results[0]

    return res.json({
      data: {
        zipcode: result.zipcode,
        prefecture: result.address1,
        city: result.address2,
        town: result.address3,
        address: `${result.address1}${result.address2}${result.address3}`,
      },
    })
  } catch (error) {
    console.error('Address search error:', error)

    return res.status(500).json({
      message: '住所検索中にエラーが発生しました',
    })
  }
}
