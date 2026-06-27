import {
  BurdenLevel,
  ContactType,
  MealType,
  PrismaClient,
  SchoolType,
} from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.favorite.deleteMany()
  await prisma.reportHistory.deleteMany()
  await prisma.compareHistory.deleteMany()
  await prisma.school.deleteMany()

  await prisma.school.createMany({
    data: [
      {
        name: 'さくら保育園',
        area: '渋谷区',
        address: '東京都渋谷区さくら1-1-1',
        phoneNumber: '03-1234-0001',
        imageUrl: '/school-images/1_sakura-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        // 佐藤恵さん向け：毎日給食・おむつ園処理・布団管理・平日行事少なめ・延長利用者多め
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

        // 佐藤恵さん向け：延長保育は使いやすいが、平日行事は少し多め
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

        // 高橋美咲さん向け：アレルギー対応と園内習い事を重視
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

        // 高橋美咲さん向け：子どものケアと保護者の準備負担のバランス型
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

        // 比較用：準備は標準的、時間調整もしやすい園
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

        // 比較用：家庭で用意するものや保護者参加が比較的多い園
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
        name: '青空保育園',
        area: '渋谷区',
        address: '東京都渋谷区青空7-7-7',
        phoneNumber: '03-1234-0007',
        imageUrl: '/school-images/7_aozora-hoikuen.png',
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
        imageUrl: '/school-images/21_mse-kids-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        // 佐藤恵さん向け比較候補：延長20時・アプリ連絡・持ち物負担少なめで、復職後の生活を回しやすい園
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

        // 佐藤恵さん向け：自宅近くで通いやすいが、持ち物は標準的な園
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

        // 佐藤恵さん向け：こども園枠。活動は充実しているが、平日行事はややあり
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

        // 佐藤恵さん向け比較候補：延長20時・利用者多め・低負担で本命候補にしやすい園
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

        // 佐藤恵さん向け比較候補：教育要素あり。ただし行事・持ち物は少し増えるため比較差分を出しやすい園
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
        name: 'ガンバあおぞら保育園',
        area: '練馬区',
        address: '東京都練馬区石神井台1-7-6',
        phoneNumber: '03-1234-0026',
        imageUrl: '/school-images/26_ganba-aozora-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        // 高橋美咲さん向け比較候補：アレルギー代替食あり・園内習い事あり・負担も軽め
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
        lessons: '英語教室・リトミック',
        allergySupport: '完全除去＋園で代替食対応',
      },
      {
        name: 'どろんこ保育園',
        area: '練馬区',
        address: '東京都練馬区石神井台1-8-7',
        phoneNumber: '03-1234-0027',
        imageUrl: '/school-images/27_doronko-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        // 高橋美咲さん向け：自然・のびのび系。ケアはあるが持ち物負担はやや高め
        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.HIGH,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        mealType: MealType.SCHOOL_LUNCH,
        itemBurdenDetail: '着替え・タオル・水筒・外遊び用着替え',
        diaperSupport: '持ち帰りあり',
        futonSupport: '週末にシーツ持ち帰り',

        extendedCareHours: '18:00〜19:00',
        extendedCareUsage: '10人未満',
        weekdayEvents: '月に1回程度',
        parentAssociationFrequency: '学期に1回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.PHONE,
        lessons: '自然遊び',
        allergySupport: '個別面談あり',
      },
      {
        name: 'すなばこども園',
        area: '練馬区',
        address: '東京都練馬区上石神井2-9-8',
        phoneNumber: '03-1234-0028',
        imageUrl: '/school-images/28_sunaba-kodomoen.png',
        schoolType: SchoolType.CERTIFIED_CHILDCARE_CENTER,

        // 高橋美咲さん向け比較候補：こども園枠。園内活動は多いが平日行事もややあり
        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.MEDIUM,
        parentAssociationLevel: BurdenLevel.MEDIUM,

        mealType: MealType.SCHOOL_LUNCH,
        itemBurdenDetail: '着替え・タオル・コップ・制作用品',
        diaperSupport: '園で廃棄',
        futonSupport: 'バスタオル持参',

        extendedCareHours: '18:00〜19:30',
        extendedCareUsage: '10〜20人程度',
        weekdayEvents: '月に1回程度',
        parentAssociationFrequency: '学期に1回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.APP,
        lessons: '英語教室・音楽教室',
        allergySupport: '完全除去＋個別面談あり',
      },
      {
        name: 'そらくまこども園',
        area: '練馬区',
        address: '東京都練馬区石神井台2-10-10',
        phoneNumber: '03-1234-0029',
        imageUrl: '/school-images/29_sorakuma-kodomoen.png',
        schoolType: SchoolType.CERTIFIED_CHILDCARE_CENTER,

        // 高橋美咲さん向け比較候補：代替食対応あり・園内習い事ありで本命候補にしやすい園
        lifeBurdenLevel: BurdenLevel.LOW,
        timeBurdenLevel: BurdenLevel.LOW,
        itemBurdenLevel: BurdenLevel.LOW,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        mealType: MealType.SCHOOL_LUNCH,
        itemBurdenDetail: '着替え・タオル',
        diaperSupport: 'サブスク対応',
        futonSupport: '園で管理',

        extendedCareHours: '18:00〜19:30',
        extendedCareUsage: '10〜20人程度',
        weekdayEvents: '学期に1回程度',
        parentAssociationFrequency: '年に1回',

        contactBookType: ContactType.APP,
        absenceContactMethod: ContactType.APP,
        lessons: '英語教室・リトミック・体操教室',
        allergySupport: '完全除去＋園で代替食対応',
      },
      {
        name: 'きずなテラス保育園',
        area: '練馬区',
        address: '東京都練馬区石神井台2-11-10',
        phoneNumber: '03-1234-0030',
        imageUrl: '/school-images/30_kizuna-terrace-hoikuen.png',
        schoolType: SchoolType.NURSERY,

        // 高橋美咲さん向け：安心感はあるが、アレルギー対応は家庭持参寄りで差分を出す園
        lifeBurdenLevel: BurdenLevel.MEDIUM,
        timeBurdenLevel: BurdenLevel.MEDIUM,
        itemBurdenLevel: BurdenLevel.MEDIUM,
        weekdayEventsLevel: BurdenLevel.LOW,
        parentAssociationLevel: BurdenLevel.LOW,

        mealType: MealType.BOTH,
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
        allergySupport: '完全除去＋家庭から弁当持参',
      },
    ],
  })

  console.log('Seed data inserted successfully.')
}

main()
  .catch((error) => {
    console.error(error)
    throw error
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
