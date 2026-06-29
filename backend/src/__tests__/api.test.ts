import request from 'supertest'
import { afterAll, describe, expect, it } from 'vitest'
import app from '../app'
import { prisma } from '../lib/prisma'

afterAll(async () => {
  await prisma.$disconnect()
})

describe('Health API', () => {
  it('GET /health は 200 と status ok を返す', async () => {
    const response = await request(app).get('/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok' })
  })
})

describe('School API', () => {
  it('GET /api/v1/schools は園一覧を返す', async () => {
    const response = await request(app).get('/api/v1/schools')

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body.data)).toBe(true)
    expect(response.body.meta).toBeDefined()
    expect(typeof response.body.meta.count).toBe('number')
  })

  it('GET /api/v1/schools/:id は存在する園の詳細を返す', async () => {
    const schoolsResponse = await request(app).get('/api/v1/schools')
    const firstSchool = schoolsResponse.body.data[0]

    expect(firstSchool).toBeDefined()

    const response = await request(app).get(`/api/v1/schools/${firstSchool.id}`)

    expect(response.status).toBe(200)
    expect(response.body.data).toBeDefined()
    expect(response.body.data.id).toBe(String(firstSchool.id))
    expect(response.body.data.name).toBeDefined()
    expect(response.body.data.supportInfo).toBeDefined()
  })

  it('GET /api/v1/schools/:id は存在しない園IDの場合 404 を返す', async () => {
    const response = await request(app).get('/api/v1/schools/999999999')

    expect(response.status).toBe(404)
    expect(response.body.error).toBeDefined()
    expect(response.body.error.code).toBe('NOT_FOUND')
  })
})

describe('User API', () => {
  it('GET /api/v1/users/me は未認証の場合 401 を返す', async () => {
    const response = await request(app).get('/api/v1/users/me')

    expect(response.status).toBe(401)
    expect(response.body.error).toBeDefined()
    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })
})
