import {
  BurdenLevel,
  ContactType,
  MealType,
  PrismaClient,
  SchoolType,
} from '@prisma/client'

const prisma = new PrismaClient()

type SchoolSeed = {
  id: number
  name: string
  area: string
  address: string
  phoneNumber?: string
  imageUrl?: string
  schoolType?: SchoolType

  lifeBurdenLevel?: BurdenLevel
  timeBurdenLevel?: BurdenLevel
  itemBurdenLevel?: BurdenLevel
  weekdayEventsLevel?: BurdenLevel
  parentAssociationLevel?: BurdenLevel

  mealType?: MealType
  itemBurdenDetail?: string
  diaperSupport?: string
  futonSupport?: string

  extendedCareHours?: string
  extendedCareUsage?: string
  weekdayEvents?: string
  parentAssociationFrequency?: string

  contactBookType?: ContactType
  absenceContactMethod?: ContactType
  lessons?: string | null
  allergySupport?: string | null
}

const school = (data: SchoolSeed) => ({
  id: BigInt(data.id),
  name: data.name,
  area: data.area,
  address: data.address,
  phoneNumber:
    data.phoneNumber ?? `03-1234-${String(data.id).padStart(4, '0')}`,
  imageUrl:
    data.imageUrl ??
    `/school-images/${data.id}_${data.name
      .replace(/[・ー\s]/g, '-')
      .toLowerCase()}.png`,
  schoolType: data.schoolType ?? SchoolType.NURSERY,

  lifeBurdenLevel: data.lifeBurdenLevel ?? BurdenLevel.MEDIUM,
  timeBurdenLevel: data.timeBurdenLevel ?? BurdenLevel.MEDIUM,
  itemBurdenLevel: data.itemBurdenLevel ?? BurdenLevel.MEDIUM,
  weekdayEventsLevel: data.weekdayEventsLevel ?? BurdenLevel.MEDIUM,
  parentAssociationLevel: data.parentAssociationLevel ?? BurdenLevel.MEDIUM,

  mealType: data.mealType ?? MealType.SCHOOL_LUNCH,
  itemBurdenDetail: data.itemBurdenDetail ?? '着替え・タオル・コップ',
  diaperSupport: data.diaperSupport ?? '園で廃棄',
  futonSupport: data.futonSupport ?? '週末にシーツ持ち帰り',

  extendedCareHours: data.extendedCareHours ?? '18:00〜19:30',
  extendedCareUsage: data.extendedCareUsage ?? '10〜20人程度',
  weekdayEvents: data.weekdayEvents ?? '月に1回程度',
  parentAssociationFrequency: data.parentAssociationFrequency ?? '年に1回',

  contactBookType: data.contactBookType ?? ContactType.APP,
  absenceContactMethod: data.absenceContactMethod ?? ContactType.APP,
  lessons: data.lessons === undefined ? 'リトミック' : data.lessons,
  allergySupport:
    data.allergySupport === undefined ? '個別相談可' : data.allergySupport,
})

async function main() {
  await prisma.schoolAdmin.deleteMany()
  await prisma.schoolInquiry.deleteMany()
  await prisma.schoolVisitReservation.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.reportHistory.deleteMany()
  await prisma.compareHistory.deleteMany()

  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['school-admin@example.com'],
      },
    },
  })

  await prisma.school.deleteMany()

  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"schools"', 'id'), 1, false)`
  )

  await prisma.school.createMany({
    data: [
      // 高橋美咲さん：比較対象1位・問い合わせ対象園
      school({
        id: 1,
        name: 'さくら保育園',
        area: '練馬区',
        address: '東京都練馬区石神井台1-1-1',
        imageUrl: '/school-images/1_sakura-hoikuen.png',

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        mealType: MealType.SCHOOL_LUNCH,
        itemBurdenDetail: '着替え・タオルのみ',
        diaperSupport: 'サブスク対応・園で廃棄',
        futonSupport: '園で管理',

        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '15〜20人程度',
        weekdayEvents: 'ほぼなし',
        parentAssociationFrequency: '年に1回',

        lessons: '英語教室・リトミック・体操教室',
        allergySupport:
          '完全除去食対応。園で代替食対応あり。必要に応じて栄養士との個別面談あり',
      }),

      school({
        id: 2,
        name: 'みらいこども園',
        area: '新宿区',
        address: '東京都新宿区みらい2-2-2',
        imageUrl: '/school-images/2_mirai-kodomoen.png',
        schoolType: SchoolType.CERTIFIED_CHILDCARE_CENTER,

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオル',
        diaperSupport: 'サブスク対応',
        futonSupport: '園で管理',
        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '20人以上',
        weekdayEvents: '月に1回程度',
        lessons: '英語教室・体操教室・プログラミング',
        allergySupport: '個別対応あり',
      }),

      school({
        id: 3,
        name: 'すみれこども園',
        area: '世田谷区',
        address: '東京都世田谷区すみれ3-3-3',
        imageUrl: '/school-images/3_sumire-kodomoen.png',
        schoolType: SchoolType.CERTIFIED_CHILDCARE_CENTER,

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        itemBurdenDetail: '着替え・タオル・コップ',
        diaperSupport: '園で廃棄',
        futonSupport: '週末にシーツ持ち帰り',
        extendedCareHours: '18:00〜19:30',
        weekdayEvents: '学期に1回程度',
        parentAssociationFrequency: '学期に1回',
        lessons: '英語教室・リトミック',
        allergySupport: '完全除去＋園で代替食対応',
      }),

      school({
        id: 4,
        name: 'こもれび保育園',
        area: '杉並区',
        address: '東京都杉並区こもれび4-4-4',
        imageUrl: '/school-images/4_komorebi-hoikuen.png',

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオル・水筒',
        futonSupport: 'バスタオル持参',
        extendedCareHours: '18:00〜19:00',
        extendedCareUsage: '10人未満',
        weekdayEvents: '月に1回程度',
        lessons: 'リトミック',
        allergySupport: '完全除去＋個別面談あり',
      }),

      school({
        id: 5,
        name: 'ひだまり保育園',
        area: '目黒区',
        address: '東京都目黒区ひだまり5-5-5',
        imageUrl: '/school-images/5_hidamari-hoikuen.png',

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        mealType: MealType.BOTH,
        itemBurdenDetail: '着替え・タオル・コップ・お昼寝用シーツ',
        futonSupport: '週末にシーツ持ち帰り',
        extendedCareHours: '18:00〜19:30',
        weekdayEvents: 'なし',
        parentAssociationFrequency: '学期に1回',
        absenceContactMethod: ContactType.PHONE,
        lessons: '英語教室',
        allergySupport: '除去食対応あり',
      }),

      school({
        id: 6,
        name: 'にじ保育園',
        area: '世田谷区',
        address: '東京都世田谷区にじ6-6-6',
        imageUrl: '/school-images/6_niji-hoikuen.png',

        lifeBurdenLevel: BurdenLevel.HIGH,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.HIGH,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.HIGH,

        mealType: MealType.LUNCH_BOX,
        itemBurdenDetail: '弁当・着替え・タオル・おむつ・制作用品',
        diaperSupport: '持ち帰りあり',
        futonSupport: '敷布団・掛布団持参',
        extendedCareHours: '18:00〜19:00',
        extendedCareUsage: '10人未満',
        weekdayEvents: '月に1回程度',
        parentAssociationFrequency: '月に1回',
        contactBookType: ContactType.PAPER,
        absenceContactMethod: ContactType.PHONE,
        lessons: null,
        allergySupport: '完全除去＋家庭から弁当持参',
      }),

      school({
        id: 7,
        name: 'さわやか保育園',
        area: '渋谷区',
        address: '東京都渋谷区さわやか7-7-7',
        imageUrl: '/school-images/7_sawayaka-hoikuen.png',

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオル・水筒',
        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '20人以上',
        weekdayEvents: 'なし',
        lessons: '英語教室・体操教室',
        allergySupport: '個別相談可',
      }),

      school({
        id: 8,
        name: 'つばめ保育園',
        area: '新宿区',
        address: '東京都新宿区つばめ8-8-8',
        imageUrl: '/school-images/8_tsubame-hoikuen.png',

        mealType: MealType.BOTH,
        itemBurdenDetail: '着替え・タオル・コップ',
        futonSupport: '週末にシーツ持ち帰り',
        extendedCareHours: '18:00〜19:30',
        weekdayEvents: '月に1回程度',
        parentAssociationFrequency: '学期に1回',
        absenceContactMethod: ContactType.PHONE,
        lessons: 'リトミック',
        allergySupport: '除去食対応あり',
      }),

      school({
        id: 9,
        name: 'はなまるこども園',
        area: '世田谷区',
        address: '東京都世田谷区はなまる9-9-9',
        imageUrl: '/school-images/9_hanamaru-kodomoen.png',
        schoolType: SchoolType.CERTIFIED_CHILDCARE_CENTER,

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオル',
        diaperSupport: 'サブスク対応',
        futonSupport: '園で管理',
        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '20人以上',
        weekdayEvents: '学期に1回程度',
        parentAssociationFrequency: '年に2回',
        lessons: '英語教室・プログラミング',
        allergySupport: '完全除去＋代替食対応',
      }),

      school({
        id: 10,
        name: '森のこ保育園',
        area: '杉並区',
        address: '東京都杉並区森のこ10-10-10',
        imageUrl: '/school-images/10_morinoko-hoikuen.png',

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.HIGH,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.HIGH,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        itemBurdenDetail: '着替え・タオル・水筒・制作用品',
        futonSupport: 'バスタオル持参',
        extendedCareHours: '18:00〜19:00',
        extendedCareUsage: '10人未満',
        weekdayEvents: '月に2回程度',
        parentAssociationFrequency: '学期に1回',
        contactBookType: ContactType.PAPER,
        absenceContactMethod: ContactType.PHONE,
        lessons: null,
        allergySupport: '個別相談可',
      }),

      school({
        id: 11,
        name: 'めぐみ保育園',
        area: '目黒区',
        address: '東京都目黒区めぐみ11-11-11',
        imageUrl: '/school-images/11_megumi-hoikuen.png',

        lifeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオル・コップ',
        futonSupport: '園で管理',
        extendedCareHours: '18:00〜19:30',
        weekdayEvents: '月に1回程度',
        lessons: '英語教室・音楽教室',
        allergySupport: '除去食対応あり',
      }),

      school({
        id: 12,
        name: 'あおば保育園',
        area: '品川区',
        address: '東京都品川区あおば12-12-12',
        imageUrl: '/school-images/12_aoba-hoikuen.png',

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        mealType: MealType.BOTH,
        itemBurdenDetail: '着替え・タオル・お昼寝用シーツ',
        futonSupport: '週末にシーツ持ち帰り',
        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '20人以上',
        weekdayEvents: 'なし',
        parentAssociationFrequency: '学期に1回',
        lessons: '体操教室',
        allergySupport: '個別対応あり',
      }),

      school({
        id: 13,
        name: 'ゆめの木こども園',
        area: '品川区',
        address: '東京都品川区ゆめの木13-13-13',
        imageUrl: '/school-images/13_yumenoki-kodomoen.png',
        schoolType: SchoolType.CERTIFIED_CHILDCARE_CENTER,

        lifeBurdenLevel: BurdenLevel.HIGH,
        itemBurdenLevel: BurdenLevel.HIGH,
        parentAssociationLevel: BurdenLevel.HIGH,

        mealType: MealType.LUNCH_BOX,
        itemBurdenDetail: '弁当・着替え・タオル・制作用品',
        diaperSupport: '持ち帰りあり',
        futonSupport: '敷布団・掛布団持参',
        extendedCareHours: '18:00〜19:00',
        extendedCareUsage: '10人未満',
        weekdayEvents: '月に1回程度',
        parentAssociationFrequency: '月に1回',
        contactBookType: ContactType.PAPER,
        absenceContactMethod: ContactType.PHONE,
        lessons: null,
        allergySupport: '家庭から弁当持参',
      }),

      school({
        id: 14,
        name: 'ほしぞら保育園',
        area: '中野区',
        address: '東京都中野区ほしぞら14-14-14',
        imageUrl: '/school-images/14_hoshizora-hoikuen.png',

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオル',
        diaperSupport: 'サブスク対応',
        futonSupport: '園で管理',
        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '20人以上',
        weekdayEvents: 'なし',
        lessons: '英語教室・リトミック',
      }),

      school({
        id: 15,
        name: 'こぐま保育園',
        area: '中野区',
        address: '東京都中野区こぐま15-15-15',
        imageUrl: '/school-images/15_koguma-hoikuen.png',

        mealType: MealType.BOTH,
        itemBurdenDetail: '着替え・タオル・コップ・水筒',
        futonSupport: '週末にシーツ持ち帰り',
        extendedCareHours: '18:00〜19:30',
        weekdayEvents: '月に1回程度',
        parentAssociationFrequency: '学期に1回',
        absenceContactMethod: ContactType.PHONE,
        lessons: '体操教室',
        allergySupport: '除去食対応あり',
      }),

      school({
        id: 16,
        name: 'おひさま保育園',
        area: '練馬区',
        address: '東京都練馬区おひさま16-16-16',
        imageUrl: '/school-images/16_ohisama-hoikuen.png',

        lifeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオル・水筒',
        futonSupport: 'バスタオル持参',
        extendedCareHours: '18:00〜19:00',
        extendedCareUsage: '10人未満',
        weekdayEvents: '月に1回程度',
        parentAssociationFrequency: '年に2回',
        lessons: 'リトミック・英語教室',
        allergySupport: '個別面談あり',
      }),

      school({
        id: 17,
        name: 'たんぽぽこども園',
        area: '練馬区',
        address: '東京都練馬区たんぽぽ17-17-17',
        imageUrl: '/school-images/17_tanpopo-kodomoen.png',
        schoolType: SchoolType.CERTIFIED_CHILDCARE_CENTER,

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        itemBurdenDetail: '着替え・タオル・コップ',
        futonSupport: '園で管理',
        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '20人以上',
        weekdayEvents: '学期に1回程度',
        parentAssociationFrequency: '学期に1回',
        lessons: '英語教室・体操教室・音楽教室',
        allergySupport: '完全除去＋代替食対応',
      }),

      school({
        id: 18,
        name: 'つくし保育園',
        area: '大田区',
        address: '東京都大田区つくし18-18-18',
        imageUrl: '/school-images/18_tsukushi-hoikuen.png',

        lifeBurdenLevel: BurdenLevel.HIGH,
        timeBurdenLevel: BurdenLevel.HIGH,
        itemBurdenLevel: BurdenLevel.HIGH,
        weekdayEventsLevel: BurdenLevel.HIGH,
        parentAssociationLevel: BurdenLevel.HIGH,

        mealType: MealType.LUNCH_BOX,
        itemBurdenDetail: '弁当・着替え・タオル・おむつ・布団',
        diaperSupport: '持ち帰りあり',
        futonSupport: '敷布団・掛布団持参',
        extendedCareHours: '18:00〜19:00',
        extendedCareUsage: '10人未満',
        weekdayEvents: '月に2回程度',
        parentAssociationFrequency: '月に1回',
        contactBookType: ContactType.PAPER,
        absenceContactMethod: ContactType.PHONE,
        lessons: null,
        allergySupport: null,
      }),

      school({
        id: 19,
        name: 'わかば保育園',
        area: '大田区',
        address: '東京都大田区わかば19-19-19',
        imageUrl: '/school-images/19_wakaba-hoikuen.png',

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオル',
        diaperSupport: 'サブスク対応',
        futonSupport: '園で管理',
        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '20人以上',
        weekdayEvents: 'なし',
        lessons: '英語教室・プログラミング',
        allergySupport: '個別対応あり',
      }),

      school({
        id: 20,
        name: 'みどりの丘保育園',
        area: '板橋区',
        address: '東京都板橋区みどりの丘20-20-20',
        imageUrl: '/school-images/20_midorinooka-hoikuen.png',

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオル・水筒',
        futonSupport: 'バスタオル持参',
        extendedCareHours: '18:00〜19:30',
        weekdayEvents: '月に1回程度',
        parentAssociationFrequency: '年に2回',
        lessons: null,
        allergySupport: '除去食対応あり',
      }),

      // 佐藤恵さん：比較対象2位
      school({
        id: 21,
        name: 'ミズイーキッズ保育園',
        area: '江東区',
        address: '東京都江東区豊洲1-2-1',
        imageUrl: '/school-images/21_msekids-hoikuen.png',

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオル',
        diaperSupport: 'サブスク対応',
        futonSupport: '園で管理',
        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '20人以上',
        weekdayEvents: 'なし',
        lessons: '英語教室・プログラミング',
        allergySupport: '個別対応あり',
      }),

      school({
        id: 22,
        name: 'ひよっこ保育園',
        area: '江東区',
        address: '東京都江東区豊洲1-3-2',
        imageUrl: '/school-images/22_hiyokko-hoikuen.png',

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオル・コップ',
        futonSupport: '週末にシーツ持ち帰り',
        extendedCareHours: '18:00〜19:30',
        weekdayEvents: 'なし',
        lessons: 'リトミック',
        allergySupport: '除去食対応あり',
      }),

      school({
        id: 23,
        name: 'すくすくこども園',
        area: '江東区',
        address: '東京都江東区豊洲2-4-3',
        imageUrl: '/school-images/23_sukusuku-kodomoen.png',
        schoolType: SchoolType.CERTIFIED_CHILDCARE_CENTER,

        mealType: MealType.BOTH,
        itemBurdenDetail: '着替え・タオル・コップ・水筒',
        futonSupport: '週末にシーツ持ち帰り',
        extendedCareHours: '18:00〜19:30',
        weekdayEvents: '月に1回程度',
        parentAssociationFrequency: '学期に1回',
        absenceContactMethod: ContactType.PHONE,
        lessons: '英語教室・体操教室',
        allergySupport: '個別相談可',
      }),

      // 佐藤恵さん：比較対象1位
      school({
        id: 24,
        name: 'かがやき保育園',
        area: '江東区',
        address: '東京都江東区東雲1-5-4',
        imageUrl: '/school-images/24_kagayaki-hoikuen.png',

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオル',
        futonSupport: '園で管理',
        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '20人以上',
        weekdayEvents: 'なし',
        lessons: '体操教室',
        allergySupport: '個別対応あり',
      }),

      // 佐藤恵さん：比較対象3位
      school({
        id: 25,
        name: 'まなびの森保育園',
        area: '江東区',
        address: '東京都江東区東雲1-6-5',
        imageUrl: '/school-images/25_manabinomori-hoikuen.png',

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオル・水筒・制作用品',
        futonSupport: 'バスタオル持参',
        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '10〜20人程度',
        weekdayEvents: '月に1回程度',
        lessons: '英語教室・プログラミング',
      }),

      // 高橋美咲さん：比較対象3位
      school({
        id: 26,
        name: 'あおぞら保育園',
        area: '練馬区',
        address: '東京都練馬区石神井台1-7-6',
        imageUrl: '/school-images/26_aozora-hoikuen.png',

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオル・水筒・食事用エプロン',
        futonSupport: '週末持ち帰り',
        extendedCareHours: '18:00〜19:30',
        extendedCareUsage: '10〜15人程度',
        weekdayEvents: '月に1回程度',
        lessons: '英語教室・リトミック',
        allergySupport: '除去食対応あり。代替食は内容により家庭持参',
      }),

      school({
        id: 27,
        name: 'どろんこ保育園',
        area: '練馬区',
        address: '東京都練馬区石神井台1-8-7',
        imageUrl: '/school-images/27_doronko-hoikuen.png',

        lifeBurdenLevel: BurdenLevel.HIGH,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.HIGH,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        itemBurdenDetail: '着替え多め・タオル・水筒・外遊び用衣類',
        diaperSupport: '持ち帰り',
        futonSupport: '週末持ち帰り',
        extendedCareHours: '18:00〜19:00',
        extendedCareUsage: '5〜10人程度',
        weekdayEvents: '月に1回程度',
        parentAssociationFrequency: '学期に1回程度',
        contactBookType: ContactType.PAPER,
        absenceContactMethod: ContactType.PHONE,
        lessons: '自然あそび・体操あそび',
        allergySupport: '個別相談可。内容により家庭持参',
      }),

      // 高橋美咲さん：比較対象2位
      school({
        id: 28,
        name: 'すなばこども園',
        area: '練馬区',
        address: '東京都練馬区上石神井2-9-8',
        imageUrl: '/school-images/28_sunaba-kodomoen.png',
        schoolType: SchoolType.CERTIFIED_CHILDCARE_CENTER,

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        itemBurdenDetail: '着替え・タオル・水筒・午睡用シーツ',
        futonSupport: 'シーツのみ週末持ち帰り',
        extendedCareHours: '18:00〜19:30',
        extendedCareUsage: '10人程度',
        weekdayEvents: 'ほぼなし',
        parentAssociationFrequency: '学期に1回程度',
        lessons: 'リトミック・造形あそび',
        allergySupport: '除去食対応あり。代替食は一部家庭持参',
      }),

      school({
        id: 29,
        name: 'そらのこ保育園',
        area: '練馬区',
        address: '東京都練馬区石神井台2-10-10',
        imageUrl: '/school-images/29_soranoko-hoikuen.png',

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオルのみ',
        diaperSupport: 'サブスク対応・園で廃棄',
        futonSupport: '園で管理',
        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '15〜20人程度',
        weekdayEvents: 'ほぼなし',
        lessons: '英語教室・リトミック・体操教室',
        allergySupport: '完全除去食対応。園で代替食対応あり',
      }),

      school({
        id: 30,
        name: 'きずなテラス保育園',
        area: '練馬区',
        address: '東京都練馬区石神井台2-11-10',
        imageUrl: '/school-images/30_kizuna-terrace-hoikuen.png',

        itemBurdenDetail: '着替え・タオル・水筒・午睡用シーツ',
        futonSupport: 'シーツのみ週末持ち帰り',
        extendedCareHours: '18:00〜19:00',
        extendedCareUsage: '5〜10人程度',
        weekdayEvents: '月に1〜2回程度',
        parentAssociationFrequency: '学期に1回程度',
        lessons: '体操教室・音楽あそび',
        allergySupport: '個別面談のうえ除去食対応',
      }),

      school({
        id: 31,
        name: 'ルミナスキッズ保育園',
        area: '江東区',
        address: '東京都江東区豊洲3-2-6',

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオルのみ',
        diaperSupport: 'サブスク対応・園で廃棄',
        futonSupport: '園で管理',
        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '20人以上',
        weekdayEvents: 'ほぼなし',
        lessons: '英語教室・体操教室',
        allergySupport: '除去食対応あり',
      }),

      school({
        id: 32,
        name: 'みずべのこども園',
        area: '江東区',
        address: '東京都江東区豊洲5-1-7',
        schoolType: SchoolType.CERTIFIED_CHILDCARE_CENTER,

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオル・コップ',
        diaperSupport: '園で廃棄',
        futonSupport: '園で管理',
        extendedCareHours: '18:00〜19:30',
        extendedCareUsage: '10〜20人程度',
        weekdayEvents: '年に数回程度',
        lessons: 'リトミック・音楽あそび',
        allergySupport: '個別相談可',
      }),

      school({
        id: 33,
        name: 'つむぎ保育室',
        area: '江東区',
        address: '東京都江東区東雲2-3-8',

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        itemBurdenDetail: '着替え・タオルのみ',
        diaperSupport: '園で廃棄',
        futonSupport: '園で管理',
        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '15〜20人程度',
        weekdayEvents: 'ほぼなし',
        parentAssociationFrequency: '学期に1回',
        lessons: '体操教室',
        allergySupport: '除去食対応あり',
      }),

      school({
        id: 34,
        name: 'そよかぜテラス保育園',
        area: '江東区',
        address: '東京都江東区有明1-6-2',

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオル・水筒',
        diaperSupport: '園で廃棄',
        futonSupport: '園で管理',
        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '10〜20人程度',
        weekdayEvents: '年に数回程度',
        lessons: '英語あそび',
        allergySupport: '個別相談可',
      }),

      school({
        id: 35,
        name: 'あしたばナーサリー',
        area: '江東区',
        address: '東京都江東区枝川2-9-4',

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオル・コップ',
        diaperSupport: '園で廃棄',
        futonSupport: '園で管理',
        extendedCareHours: '18:00〜19:30',
        weekdayEvents: 'ほぼなし',
        lessons: 'リトミック',
        allergySupport: '除去食対応あり',
      }),

      school({
        id: 36,
        name: 'みなとキッズガーデン',
        area: '江東区',
        address: '東京都江東区辰巳1-4-7',

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオルのみ',
        diaperSupport: 'サブスク対応・園で廃棄',
        futonSupport: '園で管理',
        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '20人以上',
        weekdayEvents: '月に1回程度',
        lessons: '体操教室・プログラミングあそび',
        allergySupport: '除去食対応あり',
      }),

      school({
        id: 37,
        name: 'ぽっぽの森保育園',
        area: '江東区',
        address: '東京都江東区木場5-2-9',

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオル・コップ',
        diaperSupport: '園で廃棄',
        futonSupport: '園で管理',
        extendedCareHours: '18:00〜20:00',
        weekdayEvents: '年に数回程度',
        lessons: '音楽あそび',
        allergySupport: '個別相談可',
      }),

      school({
        id: 38,
        name: 'なないろテラス保育園',
        area: '江東区',
        address: '東京都江東区東陽4-10-3',

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオル・水筒',
        diaperSupport: 'サブスク対応',
        futonSupport: 'シーツのみ週末持ち帰り',
        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '20人以上',
        weekdayEvents: 'ほぼなし',
        parentAssociationFrequency: 'なし',
        lessons: '英語教室・リトミック',
        allergySupport: '除去食対応あり',
      }),

      school({
        id: 39,
        name: 'はるのき保育園',
        area: '江東区',
        address: '東京都江東区南砂2-7-6',

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        itemBurdenDetail: '着替え・タオル・コップ',
        futonSupport: '園で管理',
        extendedCareHours: '18:00〜19:30',
        weekdayEvents: '年に数回程度',
        parentAssociationFrequency: '学期に1回',
        lessons: '体操教室',
        allergySupport: '個別相談可',
      }),

      school({
        id: 40,
        name: 'わかばの家保育園',
        area: '江東区',
        address: '東京都江東区清澄3-5-4',

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオル・水筒・午睡用シーツ',
        futonSupport: 'シーツのみ週末持ち帰り',
        extendedCareHours: '18:00〜19:00',
        extendedCareUsage: '5〜10人程度',
        weekdayEvents: '月に1回程度',
        lessons: 'リトミック・造形あそび',
        allergySupport: '除去食対応あり',
      }),

      school({
        id: 41,
        name: 'ひだまりの庭こども園',
        area: '練馬区',
        address: '東京都練馬区上石神井1-11-3',
        schoolType: SchoolType.CERTIFIED_CHILDCARE_CENTER,

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        itemBurdenDetail: '着替え・タオル・コップ',
        futonSupport: '園で管理',
        extendedCareHours: '18:00〜19:00',
        extendedCareUsage: '5〜10人程度',
        weekdayEvents: '月に1回程度',
        parentAssociationFrequency: '学期に1回',
        lessons: '英語教室・造形あそび',
        allergySupport: '除去食対応あり',
      }),

      school({
        id: 42,
        name: 'こぐまナーサリー',
        area: '練馬区',
        address: '東京都練馬区石神井町4-4-8',

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオルのみ',
        futonSupport: '園で管理',
        extendedCareHours: '18:00〜19:30',
        weekdayEvents: '年に数回程度',
        lessons: 'リトミック・英語あそび',
        allergySupport: '完全除去食対応。代替食は園で提供',
      }),

      school({
        id: 43,
        name: 'りすの森保育園',
        area: '練馬区',
        address: '東京都練馬区石神井台3-4-9',

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオル・水筒',
        futonSupport: '園で管理',
        extendedCareHours: '18:00〜19:30',
        weekdayEvents: '年に数回程度',
        lessons: '英語教室・リトミック',
        allergySupport: '除去食対応あり',
      }),

      school({
        id: 44,
        name: 'メープルキッズ保育園',
        area: '練馬区',
        address: '東京都練馬区上石神井3-5-1',

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオルのみ',
        diaperSupport: 'サブスク対応',
        futonSupport: '園で管理',
        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '15〜20人程度',
        weekdayEvents: '月に1回程度',
        lessons: '英語教室・体操教室',
      }),

      school({
        id: 45,
        name: '木かげ保育園',
        area: '練馬区',
        address: '東京都練馬区関町南2-10-4',

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオル・コップ',
        futonSupport: '園で管理',
        extendedCareHours: '18:00〜19:00',
        extendedCareUsage: '5〜10人程度',
        weekdayEvents: '月に1回程度',
        lessons: '造形あそび',
        allergySupport: '除去食対応あり',
      }),

      school({
        id: 46,
        name: 'めばえこども園',
        area: '練馬区',
        address: '東京都練馬区大泉学園町2-12-6',
        schoolType: SchoolType.CERTIFIED_CHILDCARE_CENTER,

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        itemBurdenDetail: '着替え・タオル・午睡用シーツ',
        futonSupport: 'シーツのみ週末持ち帰り',
        extendedCareHours: '18:00〜20:00',
        weekdayEvents: '月に1回程度',
        parentAssociationFrequency: '学期に1回',
        lessons: '音楽あそび・体操教室',
        allergySupport: '個別面談のうえ除去食対応',
      }),

      school({
        id: 47,
        name: 'リアン保育園',
        area: '練馬区',
        address: '東京都練馬区南大泉5-7-3',

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        itemBurdenDetail: '着替え・タオルのみ',
        futonSupport: '園で管理',
        extendedCareHours: '18:00〜19:30',
        weekdayEvents: '年に数回程度',
        parentAssociationFrequency: '学期に1回',
        lessons: 'リトミック・英語あそび',
        allergySupport: '完全除去食対応。代替食は園で提供',
      }),

      school({
        id: 48,
        name: 'きのみ保育園',
        area: '板橋区',
        address: '東京都板橋区きのみ2-12-5',

        itemBurdenDetail: '着替え・タオル・水筒・午睡用シーツ',
        futonSupport: 'シーツのみ週末持ち帰り',
        extendedCareHours: '18:00〜19:00',
        extendedCareUsage: '5〜10人程度',
        weekdayEvents: '月に1〜2回程度',
        parentAssociationFrequency: '学期に1回程度',
        lessons: '体操教室・音楽あそび',
        allergySupport: '個別面談のうえ除去食対応',
      }),

      school({
        id: 49,
        name: '中野ひなた保育園',
        area: '中野区',
        address: '東京都中野区中野3-9-8',

        itemBurdenDetail: '着替え・タオル・コップ・水筒',
        futonSupport: 'シーツのみ週末持ち帰り',
        extendedCareHours: '18:00〜19:30',
        weekdayEvents: '月に1回程度',
        parentAssociationFrequency: '学期に1回',
        lessons: 'リトミック・体操教室',
        allergySupport: '個別相談可',
      }),

      school({
        id: 50,
        name: 'シーサイド保育園',
        area: '品川区',
        address: '東京都品川区東品川4-12-6',

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        itemBurdenDetail: '着替え・タオルのみ',
        futonSupport: '園で管理',
        extendedCareHours: '18:00〜19:30',
        weekdayEvents: '年に数回程度',
        lessons: '英語教室',
        allergySupport: '除去食対応あり',
      }),
    ],
  })

  await prisma.$executeRawUnsafe(`
    SELECT setval(pg_get_serial_sequence('"schools"', 'id'), (SELECT MAX(id) FROM "schools"));
  `)

  const schoolAdminUser = await prisma.user.upsert({
    where: { email: 'school-admin@example.com' },
    update: {},
    create: {
      email: 'school-admin@example.com',
      name: '園管理者テスト',
    },
  })

  await prisma.schoolAdmin.upsert({
    where: {
      userId: schoolAdminUser.id,
    },
    update: {
      schoolId: 1n,
    },
    create: {
      userId: schoolAdminUser.id,
      schoolId: 1n,
    },
  })

  console.log('Seed data inserted successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
