// 存在しないURLにアクセスした時の404画面
// app/not-found.tsx
import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="relative min-h-[calc(100vh-56px)] flex flex-col bg-[#eaf9de]">
      {/* メインコンテンツ */}
      <div className="flex flex-col items-center justify-center flex-1 gap-8 pt-10 pb-48 px-4 bg-white">
        <p className="font-bold text-gray-500 text-base text-center">
          お探しのページが見つかりませんでした。
        </p>
        <Link
          href="/"
          className="bg-primary text-white px-12 py-3 rounded-full font-extrabold text-base hover:bg-primary-dark transition-colors"
        >
          ホームへ戻る
        </Link>
      </div>

      {/* 下部イラスト */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="overflow-hidden h-[80px] relative">
          <div className="animate-scroll-x flex h-full">
            <div className="relative h-full w-[1286px] flex-shrink-0">
              <Image
                src="/images/tree.png"
                alt=""
                aria-hidden
                fill
                sizes="1286px"
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="relative h-full w-[1286px] flex-shrink-0">
              <Image
                src="/images/tree.png"
                alt=""
                aria-hidden
                fill
                sizes="1286px"
                unoptimized
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
