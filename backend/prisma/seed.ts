import {
  BurdenLevel,
  ContactType,
  MealType,
  PrismaClient,
  SchoolType,
} from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.schoolAdmin.deleteMany()

  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['school-admin@example.com'],
      },
    },
  })

  await prisma.schoolInquiry.deleteMany()
  await prisma.schoolVisitReservation.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.reportHistory.deleteMany()
  await prisma.compareHistory.deleteMany()
  await prisma.school.deleteMany()

  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"schools"', 'id'), 1, false)`
  )

  await prisma.school.createMany({
    data: [
      {
        name: 'さくら保育園',
        area: '渋谷区',
        address: '東京都渋谷区さくら1-1-1',
        phoneNumber: '03-1234-0001',
        imageUrl: '/school-images/1_sakura-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        mealType: MealType.SCHOOL_LUNCH,
        itemBurdenDetail: '着替え・タオル・おむつ',
        diaperSupport: '園で廃棄',
        futonSupport: '園で管理',

        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '20人以上',
        weekdayEvents: 'なし',
        parentAssociationFrequency: '年に1回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.APP,
        lessons: '体操教室',
        allergySupport: '個別相談可',
      },
      {
        name: 'みらいこども園',
        area: '新宿区',
        address: '東京都新宿区みらい2-2-2',
        phoneNumber: '03-1234-0002',
        imageUrl: '/school-images/2_mirai-kodomoen.png',
        schoolType: SchoolType.CERTIFIED_CHILDCARE_CENTER,

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.LOW,

        mealType: MealType.SCHOOL_LUNCH,
        itemBurdenDetail: '着替え・タオル',
        diaperSupport: 'サブスク対応',
        futonSupport: '園で管理',

        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '20人以上',
        weekdayEvents: '月に1回程度',
        parentAssociationFrequency: '年に1回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.APP,
        lessons: '英語教室・体操教室・プログラミング',
        allergySupport: '個別対応あり',
      },
      {
        name: 'すみれこども園',
        area: '世田谷区',
        address: '東京都世田谷区すみれ3-3-3',
        phoneNumber: '03-1234-0003',
        imageUrl: '/school-images/3_sumire-kodomoen.png',
        schoolType: SchoolType.CERTIFIED_CHILDCARE_CENTER,

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        mealType: MealType.SCHOOL_LUNCH,
        itemBurdenDetail: '着替え・タオル・コップ',
        diaperSupport: '園で廃棄',
        futonSupport: '週末にシーツ持ち帰り',

        extendedCareHours: '18:00〜19:30',
        extendedCareUsage: '10〜20人程度',
        weekdayEvents: '学期に1回程度',
        parentAssociationFrequency: '学期に1回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.APP,
        lessons: '英語教室・リトミック',
        allergySupport: '完全除去＋園で代替食対応',
      },
      {
        name: 'こもれび保育園',
        area: '杉並区',
        address: '東京都杉並区こもれび4-4-4',
        phoneNumber: '03-1234-0004',
        imageUrl: '/school-images/4_komorebi-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.LOW,

        mealType: MealType.SCHOOL_LUNCH,
        itemBurdenDetail: '着替え・タオル・水筒',
        diaperSupport: '園で廃棄',
        futonSupport: 'バスタオル持参',

        extendedCareHours: '18:00〜19:00',
        extendedCareUsage: '10人未満',
        weekdayEvents: '月に1回程度',
        parentAssociationFrequency: '年に1回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.APP,
        lessons: 'リトミック',
        allergySupport: '完全除去＋個別面談あり',
      },
      {
        name: 'ひだまり保育園',
        area: '目黒区',
        address: '東京都目黒区ひだまり5-5-5',
        phoneNumber: '03-1234-0005',
        imageUrl: '/school-images/5_hidamari-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        mealType: MealType.BOTH,
        itemBurdenDetail: '着替え・タオル・コップ・お昼寝用シーツ',
        diaperSupport: '園で廃棄',
        futonSupport: '週末にシーツ持ち帰り',

        extendedCareHours: '18:00〜19:30',
        extendedCareUsage: '10〜20人程度',
        weekdayEvents: 'なし',
        parentAssociationFrequency: '学期に1回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.PHONE,
        lessons: '英語教室',
        allergySupport: '除去食対応あり',
      },
      {
        name: 'にじ保育園',
        area: '世田谷区',
        address: '東京都世田谷区にじ6-6-6',
        phoneNumber: '03-1234-0006',
        imageUrl: '/school-images/6_niji-hoikuen.png',
        schoolType: SchoolType.NURSERY,

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
      },
      {
        name: 'さわやか保育園',
        area: '渋谷区',
        address: '東京都渋谷区さわやか7-7-7',
        phoneNumber: '03-1234-0007',
        imageUrl: '/school-images/7_sawayaka-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        mealType: MealType.SCHOOL_LUNCH,
        itemBurdenDetail: '着替え・タオル・水筒',
        diaperSupport: '園で廃棄',
        futonSupport: '園で管理',

        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '20人以上',
        weekdayEvents: 'なし',
        parentAssociationFrequency: '年に1回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.APP,
        lessons: '英語教室・体操教室',
        allergySupport: '個別相談可',
      },
      {
        name: 'つばめ保育園',
        area: '新宿区',
        address: '東京都新宿区つばめ8-8-8',
        phoneNumber: '03-1234-0008',
        imageUrl: '/school-images/8_tsubame-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        mealType: MealType.BOTH,
        itemBurdenDetail: '着替え・タオル・コップ',
        diaperSupport: '園で廃棄',
        futonSupport: '週末にシーツ持ち帰り',

        extendedCareHours: '18:00〜19:30',
        extendedCareUsage: '10〜20人程度',
        weekdayEvents: '月に1回程度',
        parentAssociationFrequency: '学期に1回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.PHONE,
        lessons: 'リトミック',
        allergySupport: '除去食対応あり',
      },
      {
        name: 'はなまるこども園',
        area: '世田谷区',
        address: '東京都世田谷区はなまる9-9-9',
        phoneNumber: '03-1234-0009',
        imageUrl: '/school-images/9_hanamaru-kodomoen.png',
        schoolType: SchoolType.CERTIFIED_CHILDCARE_CENTER,

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        mealType: MealType.SCHOOL_LUNCH,
        itemBurdenDetail: '着替え・タオル',
        diaperSupport: 'サブスク対応',
        futonSupport: '園で管理',

        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '20人以上',
        weekdayEvents: '学期に1回程度',
        parentAssociationFrequency: '年に2回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.APP,
        lessons: '英語教室・プログラミング',
        allergySupport: '完全除去＋代替食対応',
      },
      {
        name: '森のこ保育園',
        area: '杉並区',
        address: '東京都杉並区森のこ10-10-10',
        phoneNumber: '03-1234-0010',
        imageUrl: '/school-images/10_morinoko-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.HIGH,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.HIGH,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        mealType: MealType.SCHOOL_LUNCH,
        itemBurdenDetail: '着替え・タオル・水筒・制作用品',
        diaperSupport: '園で廃棄',
        futonSupport: 'バスタオル持参',

        extendedCareHours: '18:00〜19:00',
        extendedCareUsage: '10人未満',
        weekdayEvents: '月に2回程度',
        parentAssociationFrequency: '学期に1回',

        contactBookType: ContactType.PAPER,
        absenceContactMethod: ContactType.PHONE,
        lessons: null,
        allergySupport: '個別相談可',
      },
      {
        name: 'めぐみ保育園',
        area: '目黒区',
        address: '東京都目黒区めぐみ11-11-11',
        phoneNumber: '03-1234-0011',
        imageUrl: '/school-images/11_megumi-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.LOW,

        mealType: MealType.SCHOOL_LUNCH,
        itemBurdenDetail: '着替え・タオル・コップ',
        diaperSupport: '園で廃棄',
        futonSupport: '園で管理',

        extendedCareHours: '18:00〜19:30',
        extendedCareUsage: '10〜20人程度',
        weekdayEvents: '月に1回程度',
        parentAssociationFrequency: '年に1回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.APP,
        lessons: '英語教室・音楽教室',
        allergySupport: '除去食対応あり',
      },
      {
        name: 'あおば保育園',
        area: '品川区',
        address: '東京都品川区あおば12-12-12',
        phoneNumber: '03-1234-0012',
        imageUrl: '/school-images/12_aoba-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        mealType: MealType.BOTH,
        itemBurdenDetail: '着替え・タオル・お昼寝用シーツ',
        diaperSupport: '園で廃棄',
        futonSupport: '週末にシーツ持ち帰り',

        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '20人以上',
        weekdayEvents: 'なし',
        parentAssociationFrequency: '学期に1回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.APP,
        lessons: '体操教室',
        allergySupport: '個別対応あり',
      },
      {
        name: 'ゆめの木こども園',
        area: '品川区',
        address: '東京都品川区ゆめの木13-13-13',
        phoneNumber: '03-1234-0013',
        imageUrl: '/school-images/13_yumenoki-kodomoen.png',
        schoolType: SchoolType.CERTIFIED_CHILDCARE_CENTER,

        lifeBurdenLevel: BurdenLevel.HIGH,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.HIGH,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
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
      },
      {
        name: 'ほしぞら保育園',
        area: '中野区',
        address: '東京都中野区ほしぞら14-14-14',
        phoneNumber: '03-1234-0014',
        imageUrl: '/school-images/14_hoshizora-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        mealType: MealType.SCHOOL_LUNCH,
        itemBurdenDetail: '着替え・タオル',
        diaperSupport: 'サブスク対応',
        futonSupport: '園で管理',

        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '20人以上',
        weekdayEvents: 'なし',
        parentAssociationFrequency: '年に1回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.APP,
        lessons: '英語教室・リトミック',
        allergySupport: '個別相談可',
      },
      {
        name: 'こぐま保育園',
        area: '中野区',
        address: '東京都中野区こぐま15-15-15',
        phoneNumber: '03-1234-0015',
        imageUrl: '/school-images/15_koguma-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        mealType: MealType.BOTH,
        itemBurdenDetail: '着替え・タオル・コップ・水筒',
        diaperSupport: '園で廃棄',
        futonSupport: '週末にシーツ持ち帰り',

        extendedCareHours: '18:00〜19:30',
        extendedCareUsage: '10〜20人程度',
        weekdayEvents: '月に1回程度',
        parentAssociationFrequency: '学期に1回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.PHONE,
        lessons: '体操教室',
        allergySupport: '除去食対応あり',
      },
      {
        name: 'おひさま保育園',
        area: '練馬区',
        address: '東京都練馬区おひさま16-16-16',
        phoneNumber: '03-1234-0016',
        imageUrl: '/school-images/16_ohisama-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.LOW,

        mealType: MealType.SCHOOL_LUNCH,
        itemBurdenDetail: '着替え・タオル・水筒',
        diaperSupport: '園で廃棄',
        futonSupport: 'バスタオル持参',

        extendedCareHours: '18:00〜19:00',
        extendedCareUsage: '10人未満',
        weekdayEvents: '月に1回程度',
        parentAssociationFrequency: '年に2回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.APP,
        lessons: 'リトミック・英語教室',
        allergySupport: '個別面談あり',
      },
      {
        name: 'たんぽぽこども園',
        area: '練馬区',
        address: '東京都練馬区たんぽぽ17-17-17',
        phoneNumber: '03-1234-0017',
        imageUrl: '/school-images/17_tanpopo-kodomoen.png',
        schoolType: SchoolType.CERTIFIED_CHILDCARE_CENTER,

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        mealType: MealType.SCHOOL_LUNCH,
        itemBurdenDetail: '着替え・タオル・コップ',
        diaperSupport: '園で廃棄',
        futonSupport: '園で管理',

        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '20人以上',
        weekdayEvents: '学期に1回程度',
        parentAssociationFrequency: '学期に1回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.APP,
        lessons: '英語教室・体操教室・音楽教室',
        allergySupport: '完全除去＋代替食対応',
      },
      {
        name: 'つくし保育園',
        area: '大田区',
        address: '東京都大田区つくし18-18-18',
        phoneNumber: '03-1234-0018',
        imageUrl: '/school-images/18_tsukushi-hoikuen.png',
        schoolType: SchoolType.NURSERY,

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
      },
      {
        name: 'わかば保育園',
        area: '大田区',
        address: '東京都大田区わかば19-19-19',
        phoneNumber: '03-1234-0019',
        imageUrl: '/school-images/19_wakaba-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        mealType: MealType.SCHOOL_LUNCH,
        itemBurdenDetail: '着替え・タオル',
        diaperSupport: 'サブスク対応',
        futonSupport: '園で管理',

        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '20人以上',
        weekdayEvents: 'なし',
        parentAssociationFrequency: '年に1回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.APP,
        lessons: '英語教室・プログラミング',
        allergySupport: '個別対応あり',
      },
      {
        name: 'みどりの丘保育園',
        area: '板橋区',
        address: '東京都板橋区みどりの丘20-20-20',
        phoneNumber: '03-1234-0020',
        imageUrl: '/school-images/20_midorinooka-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.LOW,

        mealType: MealType.SCHOOL_LUNCH,
        itemBurdenDetail: '着替え・タオル・水筒',
        diaperSupport: '園で廃棄',
        futonSupport: 'バスタオル持参',

        extendedCareHours: '18:00〜19:30',
        extendedCareUsage: '10〜20人程度',
        weekdayEvents: '月に1回程度',
        parentAssociationFrequency: '年に2回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.APP,
        lessons: null,
        allergySupport: '除去食対応あり',
      },
      {
        name: 'ミズイーキッズ保育園',
        area: '江東区',
        address: '東京都江東区豊洲1-2-1',
        phoneNumber: '03-1234-0021',
        imageUrl: '/school-images/21_msekids-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        mealType: MealType.SCHOOL_LUNCH,
        itemBurdenDetail: '着替え・タオル',
        diaperSupport: 'サブスク対応',
        futonSupport: '園で管理',

        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '20人以上',
        weekdayEvents: 'なし',
        parentAssociationFrequency: '年に1回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.APP,
        lessons: '英語教室・プログラミング',
        allergySupport: '個別対応あり',
      },
      {
        name: 'ひよっこ保育園',
        area: '江東区',
        address: '東京都江東区豊洲1-3-2',
        phoneNumber: '03-1234-0022',
        imageUrl: '/school-images/22_hiyokko-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        mealType: MealType.SCHOOL_LUNCH,
        itemBurdenDetail: '着替え・タオル・コップ',
        diaperSupport: '園で廃棄',
        futonSupport: '週末にシーツ持ち帰り',

        extendedCareHours: '18:00〜19:30',
        extendedCareUsage: '10〜20人程度',
        weekdayEvents: 'なし',
        parentAssociationFrequency: '年に1回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.APP,
        lessons: 'リトミック',
        allergySupport: '除去食対応あり',
      },
      {
        name: 'すくすくこども園',
        area: '江東区',
        address: '東京都江東区豊洲2-4-3',
        phoneNumber: '03-1234-0023',
        imageUrl: '/school-images/23_sukusuku-kodomoen.png',
        schoolType: SchoolType.CERTIFIED_CHILDCARE_CENTER,

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        mealType: MealType.BOTH,
        itemBurdenDetail: '着替え・タオル・コップ・水筒',
        diaperSupport: '園で廃棄',
        futonSupport: '週末にシーツ持ち帰り',

        extendedCareHours: '18:00〜19:30',
        extendedCareUsage: '10〜20人程度',
        weekdayEvents: '月に1回程度',
        parentAssociationFrequency: '学期に1回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.PHONE,
        lessons: '英語教室・体操教室',
        allergySupport: '個別相談可',
      },
      {
        name: 'かがやき保育園',
        area: '江東区',
        address: '東京都江東区東雲1-5-4',
        phoneNumber: '03-1234-0024',
        imageUrl: '/school-images/24_kagayaki-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        mealType: MealType.SCHOOL_LUNCH,
        itemBurdenDetail: '着替え・タオル',
        diaperSupport: '園で廃棄',
        futonSupport: '園で管理',

        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '20人以上',
        weekdayEvents: 'なし',
        parentAssociationFrequency: '年に1回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.APP,
        lessons: '体操教室',
        allergySupport: '個別対応あり',
      },
      {
        name: 'まなびの森保育園',
        area: '江東区',
        address: '東京都江東区東雲1-6-5',
        phoneNumber: '03-1234-0025',
        imageUrl: '/school-images/25_manabinomori-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.LOW,

        mealType: MealType.SCHOOL_LUNCH,
        itemBurdenDetail: '着替え・タオル・水筒・制作用品',
        diaperSupport: '園で廃棄',
        futonSupport: 'バスタオル持参',

        extendedCareHours: '18:00〜20:00',
        extendedCareUsage: '10〜20人程度',
        weekdayEvents: '月に1回程度',
        parentAssociationFrequency: '年に1回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.APP,
        lessons: '英語教室・プログラミング',
        allergySupport: '個別相談可',
      },
      {
        name: 'あおぞら保育園',
        area: '練馬区',
        address: '東京都練馬区石神井台1-7-6',
        phoneNumber: '03-1234-0026',
        imageUrl: '/school-images/26_aozora-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.LOW,

        mealType: MealType.SCHOOL_LUNCH,
        itemBurdenDetail: '着替え・タオル・水筒・食事用エプロン',
        diaperSupport: '園で廃棄',
        futonSupport: '週末持ち帰り',

        extendedCareHours: '18:00〜19:30',
        extendedCareUsage: '10〜15人程度',
        weekdayEvents: '月に1回程度',
        parentAssociationFrequency: '年に1回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.APP,
        lessons: '英語教室・リトミック',
        allergySupport: '除去食対応あり。代替食は内容により家庭持参',
      },
      {
        name: 'どろんこ保育園',
        area: '練馬区',
        address: '東京都練馬区石神井台1-8-7',
        phoneNumber: '03-1234-0027',
        imageUrl: '/school-images/27_doronko-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        lifeBurdenLevel: BurdenLevel.HIGH,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.HIGH,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        mealType: MealType.SCHOOL_LUNCH,
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
      },
      {
        name: 'すなばこども園',
        area: '練馬区',
        address: '東京都練馬区上石神井2-9-8',
        phoneNumber: '03-1234-0028',
        imageUrl: '/school-images/28_sunaba-kodomoen.png',
        schoolType: SchoolType.CERTIFIED_CHILDCARE_CENTER,

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        mealType: MealType.SCHOOL_LUNCH,
        itemBurdenDetail: '着替え・タオル・水筒・午睡用シーツ',
        diaperSupport: '園で廃棄',
        futonSupport: 'シーツのみ週末持ち帰り',

        extendedCareHours: '18:00〜19:30',
        extendedCareUsage: '10人程度',
        weekdayEvents: 'ほぼなし',
        parentAssociationFrequency: '学期に1回程度',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.APP,
        lessons: 'リトミック・造形あそび',
        allergySupport: '除去食対応あり。代替食は一部家庭持参',
      },
      {
        name: 'そらのこ保育園',
        area: '練馬区',
        address: '東京都練馬区石神井台2-10-10',
        phoneNumber: '03-1234-0029',
        imageUrl: '/school-images/29_soranoko-hoikuen.png',
        schoolType: SchoolType.NURSERY,

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

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.APP,
        lessons: '英語教室・リトミック・体操教室',
        allergySupport: '完全除去食対応。園で代替食対応あり',
      },
      {
        name: 'きずなテラス保育園',
        area: '練馬区',
        address: '東京都練馬区石神井台2-11-10',
        phoneNumber: '03-1234-0030',
        imageUrl: '/school-images/30_kizuna-terrace-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        mealType: MealType.SCHOOL_LUNCH,
        itemBurdenDetail: '着替え・タオル・水筒・午睡用シーツ',
        diaperSupport: '園で廃棄',
        futonSupport: 'シーツのみ週末持ち帰り',

        extendedCareHours: '18:00〜19:00',
        extendedCareUsage: '5〜10人程度',
        weekdayEvents: '月に1〜2回程度',
        parentAssociationFrequency: '学期に1回程度',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.APP,
        lessons: '体操教室・音楽あそび',
        allergySupport: '個別面談のうえ除去食対応',
      },
    ],
  })

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
