import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { pinoHttp } from 'pino-http'
import { connectRedis } from './lib/redis'
import schoolRoutes from './routes/schoolRoutes'

const app = express()
const PORT = process.env.PORT || 4000

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))
app.use(express.json())
app.use(pinoHttp())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/v1/schools', schoolRoutes)

connectRedis()

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app