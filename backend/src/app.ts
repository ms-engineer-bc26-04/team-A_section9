import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { pinoHttp } from 'pino-http'
import schoolRoutes from './routes/schoolRoutes'
import userRoutes from './routes/userRoutes'
import favoriteRoutes from './routes/favoriteRoutes'
import paymentRoutes from './routes/paymentRoutes'
import addressRoutes from './routes/addressRoutes'
import schoolAdminRoutes from './routes/schoolAdminRoutes'

const app = express()

const isProduction = process.env.NODE_ENV === 'production'
const rateLimitMax = isProduction ? 100 : 1000

const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[]

app.use(helmet())
app.use(
  cors({
    origin: allowedOrigins,
  })
)

// 開発環境では React Strict Mode により API が複数回呼ばれることがあるため、
// 不要に 429 にならないよう上限を緩める
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: rateLimitMax,
  })
)

// Stripe Webhook は署名検証のため raw body を受け取る
app.use('/api/v1/payment/webhook', express.raw({ type: 'application/json' }))

app.use(express.json())

app.use(
  pinoHttp({
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  })
)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/v1/schools', schoolRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/users', favoriteRoutes)
app.use('/api/v1/payment', paymentRoutes)
app.use('/api/v1/address', addressRoutes)
app.use('/api/v1/school-admin', schoolAdminRoutes)

export default app
