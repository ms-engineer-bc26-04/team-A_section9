const getApiUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL
  }
  return process.env.NEXT_PUBLIC_API_URL
}

export async function getSchoolAdminSchool(accessToken: string) {
  const res = await fetch(`${getApiUrl()}/api/v1/school-admin/school`, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!res.ok) {
    throw new Error('園情報の取得に失敗しました')
  }

  return res.json()
}

export async function updateSchoolAdminSchool(
  accessToken: string,
  body: unknown
) {
  const res = await fetch(`${getApiUrl()}/api/v1/school-admin/school`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error('園情報の更新に失敗しました')
  }

  return res.json()
}
