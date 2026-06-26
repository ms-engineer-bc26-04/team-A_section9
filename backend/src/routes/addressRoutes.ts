import { Router } from 'express'
import { searchAddressByZipcode } from '../controllers/addressController'
import { validateRequest } from '../middlewares/validateRequest'
import { addressSearchQuerySchema } from '../validators/addressValidator'

const router = Router()

router.get(
  '/search',
  validateRequest({ query: addressSearchQuerySchema }),
  searchAddressByZipcode
)

export default router
