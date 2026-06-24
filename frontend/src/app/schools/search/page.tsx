// /schools/search の検索結果画面
// src/app/schools/search/page.tsx
import SearchBar from '@/components/school/SearchBar'
import FilterPanel from '@/components/school/FilterPanel'
import SearchSchoolList from '@/components/school/SearchSchoolList'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams

  return (
    <div className="flex flex-col min-h-screen">
      {/* 検索フォームセクション */}
      <div className="bg-white px-4 pt-4 pb-4 border-b border-gray-100">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          <SearchBar
            defaultValue={
              typeof params.keyword === 'string' ? params.keyword : ''
            }
          />
          <FilterPanel
            defaultFilters={{
              hasLunch: params.hasLunch === 'true',
              diaperDisposal: params.diaperDisposal === 'true',
              noBedding: params.noBedding === 'true',
              extendedCareUntil19: params.extendedCareUntil19 === 'true',
              noWeekdayEvents: params.noWeekdayEvents === 'true',
              noPTA: params.noPTA === 'true',
              hasClub: params.hasClub === 'true',
              allergySupport: params.allergySupport === 'true',
            }}
          />
        </div>
      </div>

      {/* 検索結果セクション */}
      <div className="bg-white px-4 py-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          <SearchSchoolList searchParams={params} />
        </div>
      </div>
    </div>
  )
}
