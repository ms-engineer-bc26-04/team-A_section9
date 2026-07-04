import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSchoolFindMany = vi.fn()
const mockSchoolFindUnique = vi.fn()
const mockUserFindUnique = vi.fn()
const mockFavoriteFindMany = vi.fn()

vi.mock('../lib/prisma', () => ({
  prisma: {
    school: {
      findMany: mockSchoolFindMany,
      findUnique: mockSchoolFindUnique,
    },
    user: {
      findUnique: mockUserFindUnique,
    },
    favorite: {
      findMany: mockFavoriteFindMany,
    },
  },
}))

const createSchool = (overrides: Record<string, unknown> = {}) => ({
  id: 1n,
  name: 'さくら保育園',
  address: '東京都渋谷区1-1-1',
  area: '渋谷区',
  mealType: '自園調理',
  diaperSupport: '園で廃棄',
  futonSupport: '園で管理',
  extendedCareHours: '18:00〜20:00',
  extendedCareUsage: '20人以上',
  itemBurdenLevel: '少ない',
  weekdayEventsLevel: '少ない',
  parentAssociationLevel: '少ない',
  lessons: '英語',
  allergySupport: '個別対応',
  ...overrides,
})

describe('schoolService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSchools', () => {
    it('検索条件なしの場合、id昇順で園一覧を取得する', async () => {
      const { getSchools } = await import('../services/schoolService')

      const schools = [createSchool()]
      mockSchoolFindMany.mockResolvedValue(schools)

      const result = await getSchools({})

      expect(mockSchoolFindMany).toHaveBeenCalledWith({
        where: {
          AND: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
        },
        orderBy: {
          id: 'asc',
        },
      })

      expect(result).toBe(schools)
    })

    it('keywordが指定された場合、園名・住所・エリアを部分一致検索する', async () => {
      const { getSchools } = await import('../services/schoolService')

      mockSchoolFindMany.mockResolvedValue([])

      await getSchools({
        keyword: 'さくら',
      })

      expect(mockSchoolFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: expect.arrayContaining([
              {
                OR: [
                  {
                    name: {
                      contains: 'さくら',
                      mode: 'insensitive',
                    },
                  },
                  {
                    address: {
                      contains: 'さくら',
                      mode: 'insensitive',
                    },
                  },
                  {
                    area: {
                      contains: 'さくら',
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            ]),
          },
        })
      )
    })

    it('qが指定された場合、keywordと同じ検索条件として扱う', async () => {
      const { getSchools } = await import('../services/schoolService')

      mockSchoolFindMany.mockResolvedValue([])

      await getSchools({
        q: '渋谷',
      })

      expect(mockSchoolFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: expect.arrayContaining([
              {
                OR: expect.arrayContaining([
                  {
                    name: {
                      contains: '渋谷',
                      mode: 'insensitive',
                    },
                  },
                ]),
              },
            ]),
          },
        })
      )
    })

    it('各検索条件をwhere句に反映する', async () => {
      const { getSchools } = await import('../services/schoolService')

      mockSchoolFindMany.mockResolvedValue([])

      await getSchools({
        area: '渋谷区',
        mealType: '自園調理',
        diaperSupport: 'true',
        futonSupport: 'true',
        extendedCareHours: '20:00',
        extendedCareUsage: 'true',
        itemBurdenLevel: '少ない',
        weekdayEventsLevel: '少ない',
        parentAssociationLevel: '少ない',
        lessons: 'true',
        allergySupport: 'true',
      })

      expect(mockSchoolFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: expect.arrayContaining([
              {
                area: {
                  contains: '渋谷区',
                  mode: 'insensitive',
                },
              },
              {
                mealType: '自園調理',
              },
              {
                diaperSupport: '園で廃棄',
              },
              {
                futonSupport: '園で管理',
              },
              {
                extendedCareHours: {
                  contains: '20:00',
                  mode: 'insensitive',
                },
              },
              {
                extendedCareUsage: '20人以上',
              },
              {
                itemBurdenLevel: '少ない',
              },
              {
                weekdayEventsLevel: '少ない',
              },
              {
                parentAssociationLevel: '少ない',
              },
              {
                lessons: {
                  not: null,
                },
              },
              {
                allergySupport: {
                  not: null,
                },
              },
            ]),
          },
        })
      )
    })

    it('diaperSupport / futonSupport / extendedCareUsage がtrue以外の場合は部分一致検索する', async () => {
      const { getSchools } = await import('../services/schoolService')

      mockSchoolFindMany.mockResolvedValue([])

      await getSchools({
        diaperSupport: '持ち帰り',
        futonSupport: '家庭で管理',
        extendedCareUsage: '10人以上',
      })

      expect(mockSchoolFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: expect.arrayContaining([
              {
                diaperSupport: {
                  contains: '持ち帰り',
                  mode: 'insensitive',
                },
              },
              {
                futonSupport: {
                  contains: '家庭で管理',
                  mode: 'insensitive',
                },
              },
              {
                extendedCareUsage: {
                  contains: '10人以上',
                  mode: 'insensitive',
                },
              },
            ]),
          },
        })
      )
    })
  })

  describe('getRecommendedSchools', () => {
    it('ユーザーが存在しない場合、通常の園一覧をそのまま返す', async () => {
      const { getRecommendedSchools } =
        await import('../services/schoolService')

      const schools = [
        createSchool({ id: 1n, area: '渋谷区' }),
        createSchool({ id: 2n, area: '世田谷区' }),
      ]

      mockSchoolFindMany.mockResolvedValue(schools)
      mockUserFindUnique.mockResolvedValue(null)

      const result = await getRecommendedSchools({}, 'user-1')

      expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
        },
        include: {
          preference: true,
        },
      })
      expect(result).toEqual(schools)
    })

    it('ユーザーに住所・希望条件がない場合、通常の園一覧をそのまま返す', async () => {
      const { getRecommendedSchools } =
        await import('../services/schoolService')

      const schools = [
        createSchool({ id: 1n, area: '渋谷区' }),
        createSchool({ id: 2n, area: '世田谷区' }),
      ]

      mockSchoolFindMany.mockResolvedValue(schools)
      mockUserFindUnique.mockResolvedValue({
        id: 'user-1',
        address: null,
        preference: null,
      })

      const result = await getRecommendedSchools({}, 'user-1')

      expect(result).toEqual(schools)
    })

    it('ユーザー住所と園のエリアが一致する園をおすすめ順で優先する', async () => {
      const { getRecommendedSchools } =
        await import('../services/schoolService')

      const shibuyaSchool = createSchool({
        id: 2n,
        name: '渋谷保育園',
        area: '渋谷区',
      })

      const setagayaSchool = createSchool({
        id: 1n,
        name: '世田谷保育園',
        area: '世田谷区',
      })

      mockSchoolFindMany.mockResolvedValue([setagayaSchool, shibuyaSchool])
      mockUserFindUnique.mockResolvedValue({
        id: 'user-1',
        address: '東京都渋谷区1-1-1',
        preference: null,
      })

      const result = await getRecommendedSchools({}, 'user-1')

      expect(result).toEqual([shibuyaSchool, setagayaSchool])
    })

    it('希望条件との一致度が高い園をおすすめ順で優先する', async () => {
      const { getRecommendedSchools } =
        await import('../services/schoolService')

      const lowScoreSchool = createSchool({
        id: 1n,
        name: '低スコア保育園',
        area: '世田谷区',
        mealType: '外部搬入',
        itemBurdenLevel: '多い',
        diaperSupport: '持ち帰り',
        futonSupport: '家庭で管理',
        extendedCareUsage: '10人未満',
        weekdayEventsLevel: '多い',
        parentAssociationLevel: '多い',
        lessons: null,
        allergySupport: null,
      })

      const highScoreSchool = createSchool({
        id: 2n,
        name: '高スコア保育園',
        area: '渋谷区',
        mealType: '自園調理',
        itemBurdenLevel: '少ない',
        diaperSupport: '園で廃棄',
        futonSupport: '園で管理',
        extendedCareUsage: '20人以上',
        weekdayEventsLevel: '少ない',
        parentAssociationLevel: '少ない',
        lessons: '英語',
        allergySupport: '個別対応',
      })

      mockSchoolFindMany.mockResolvedValue([lowScoreSchool, highScoreSchool])
      mockUserFindUnique.mockResolvedValue({
        id: 'user-1',
        address: null,
        preference: {
          preferredMealType: '自園調理',
          preferredItemBurdenLevel: '少ない',
          preferredDiaperSupport: '園で廃棄',
          preferredFutonSupport: '園で管理',
          preferredExtendedCare: '20人以上',
          preferredLessons: true,
          preferredAllergySupport: true,
          preferredWeekdayEventsLevel: '少ない',
          preferredParentAssociationLevel: '少ない',
        },
      })

      const result = await getRecommendedSchools({}, 'user-1')

      expect(result).toEqual([highScoreSchool, lowScoreSchool])
    })

    it('おすすめスコアが同じ場合はid昇順で並べる', async () => {
      const { getRecommendedSchools } =
        await import('../services/schoolService')

      const school2 = createSchool({
        id: 2n,
        name: 'B保育園',
        area: '渋谷区',
      })

      const school1 = createSchool({
        id: 1n,
        name: 'A保育園',
        area: '渋谷区',
      })

      mockSchoolFindMany.mockResolvedValue([school2, school1])
      mockUserFindUnique.mockResolvedValue({
        id: 'user-1',
        address: '東京都渋谷区1-1-1',
        preference: null,
      })

      const result = await getRecommendedSchools({}, 'user-1')

      expect(result).toEqual([school1, school2])
    })
  })

  describe('getSchoolById', () => {
    it('指定したidの園詳細を取得する', async () => {
      const { getSchoolById } = await import('../services/schoolService')

      const school = createSchool({ id: 1n })
      mockSchoolFindUnique.mockResolvedValue(school)

      const result = await getSchoolById(1n)

      expect(mockSchoolFindUnique).toHaveBeenCalledWith({
        where: {
          id: 1n,
        },
      })
      expect(result).toBe(school)
    })
  })

  describe('getFavoritedSchoolIds', () => {
    it('お気に入り登録済みのschoolIdを文字列のSetで返す', async () => {
      const { getFavoritedSchoolIds } =
        await import('../services/schoolService')

      mockFavoriteFindMany.mockResolvedValue([
        {
          schoolId: 1n,
        },
        {
          schoolId: 3n,
        },
      ])

      const result = await getFavoritedSchoolIds('user-1', [1n, 2n, 3n])

      expect(mockFavoriteFindMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          schoolId: {
            in: [1n, 2n, 3n],
          },
        },
        select: {
          schoolId: true,
        },
      })

      expect(result).toEqual(new Set(['1', '3']))
    })
  })
})
