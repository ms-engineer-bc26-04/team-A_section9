// プロフィール編集フォーム（お名前・住所）
// src/components/mypage/ProfileForm.tsx
type ProfileFormProps = {
  userName: string
  postalCode: string
  address: string
  errors: {
    userName?: string
    postalCode?: string
    address?: string
  }
  onChangeName: (value: string) => void
  onChangePostalCode: (value: string) => void
  onChangeAddress: (value: string) => void
}

export default function ProfileForm({
  userName,
  postalCode,
  address,
  errors,
  onChangeName,
  onChangePostalCode,
  onChangeAddress,
}: ProfileFormProps) {
  return (
    <>
      {/* お名前 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          お名前
          <span className="text-red-500 text-xs ml-1">※必須</span>
        </label>
        <input
          type="text"
          placeholder="例) 園活 みずえ"
          value={userName}
          onChange={(e) => onChangeName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
        />
        {errors.userName && (
          <p className="text-red-500 text-xs mt-1">{errors.userName}</p>
        )}
      </div>

      {/* お住いのエリア */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          お住いのエリア
          <span className="text-red-500 text-xs ml-1">※必須</span>
        </label>
        <input
          type="text"
          placeholder="郵便番号："
          value={postalCode}
          onChange={(e) => onChangePostalCode(e.target.value)}
          maxLength={7}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm mb-2"
        />
        {errors.postalCode && (
          <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>
        )}
        <input
          type="text"
          placeholder="住所"
          value={address}
          onChange={(e) => onChangeAddress(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
        />
        {errors.address && (
          <p className="text-red-500 text-xs mt-1">{errors.address}</p>
        )}
      </div>
    </>
  )
}