// src/app/schools/[id]/page.tsx
type Props = {
  params: Promise<{ id: string }>
}

export default async function SchoolDetailPage({ params }: Props) {
  const { id } = await params

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="font-bold text-lg">園詳細画面（ID: {id}）</h1>
    </div>
  )
}