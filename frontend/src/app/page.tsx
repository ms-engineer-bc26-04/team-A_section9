// src/app/page.tsx
//ホーム画面

// src/app/page.tsx
import Image from "next/image"
import SearchBar from "@/components/school/SearchBar"
import FilterPanel from "@/components/school/FilterPanel"
import SchoolCard from "@/components/school/SchoolCard"
import EmptyState from "@/components/common/EmptyState"
import { SchoolCardSkeleton } from "@/components/common/Skeleton"
import { getSchools } from "@/lib/api/schools"
import { Suspense } from "react"

const FEATURE_ICONS = [
  { label: "毎日給食", icon: "/images/icons/icon1.png" },
  { label: "延長保育の\n利用時間", icon: "/images/icons/icon2.png" },
  { label: "布団持参なし", icon: "/images/icons/icon3.png" },
  { label: "平日行事なし", icon: "/images/icons/icon4.png" },
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* ヒーローセクション */}
      <div
        className="relative px-4 pt-6"
        style={{
          background:
            "linear-gradient(to bottom, #ffffff 0%, #ffffff 20%, #75b64c 100%)",
        }}
      >
        <div className="max-w-2xl mx-auto">

          {/* ロゴ */}
          <div className="mb-4 flex justify-center w-full">
            <Image
              src="/images/logo2.png"
              alt="ENKATSU 〜園活を円滑に〜"
              width={300}
              height={90}
              loading="eager"
              className="object-contain"
            />
          </div>

          {/* キャッチコピー */}
          <p className="text-[#75b64c] font-bold text-base mb-4 text-center">
            復職後の生活が無理なく回る園を見つけよう
          </p>

          {/* 検索バー */}
          <div className="mb-3">
            <SearchBar />
          </div>

          {/* 条件で検索 */}
          <div className="mb-4 w-fit mr-auto text-sm">
            <FilterPanel />
          </div>

          {/* 特徴アイコンパネル */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <p className="text-gray-500 text-xs mb-3">
              ENKATSUならこんな条件で探すことができます
            </p>
            <div className="grid grid-cols-4 gap-2">
              {FEATURE_ICONS.map((icon) => (
                <div key={icon.label} className="flex flex-col items-center gap-1">
                  <div className="relative w-10 h-10">
                    <Image
                      src={icon.icon}
                      alt={icon.label}
                      fill
                      sizes="40px"
                      className="object-contain"
                    />
                  </div>
                  <p className="text-[10px] text-center text-gray-700 whitespace-pre-line leading-tight">
                    {icon.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 背景イラスト */}
        <div className="mt-4 h-20 md:h-32 relative -mx-4 w-screen">
          <Image
            src="/images/tree.png"
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            loading="eager"
            className="object-cover object-top"
          />
        </div>
      </div>

      {/* 園一覧セクション */}
      <div className="bg-white px-4 py-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          <h2 className="font-bold text-gray-800 text-base">園の一覧</h2>
          <Suspense fallback={<SchoolListSkeleton />}>
            <SchoolList />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

// 園一覧（APIと接続）
async function SchoolList() {
  let schools = []

  try {
    const result = await getSchools()
    schools = result.data ?? []
  } catch (error) {
    return (
      <div className="text-red-500 text-sm text-center py-8">
        園一覧の取得に失敗しました。時間をおいて再度お試しください。
      </div>
    )
  }

  if (schools.length === 0) {
    return (
      <EmptyState
        message="条件に合う園が見つかりませんでした"
        subMessage="検索条件を変更してもう一度お試しください"
      />
    )
  }

  return (
    <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
      {schools.map((school) => (
        <SchoolCard
          key={school.id}
          school={school}
          isLoggedIn={false}
        />
      ))}
    </div>
  )
}

// ローディング中のスケルトン
function SchoolListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <SchoolCardSkeleton key={i} />
      ))}
    </div>
  )
}