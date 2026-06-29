import app from './app'
import { connectRedis } from './lib/redis'

const PORT = process.env.PORT || 4000

connectRedis()

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
