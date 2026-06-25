import { Router } from 'express'
import { searchAddressByZipcode } from '../controllers/addressController'

const router = Router()

router.get('/search', searchAddressByZipcode)

export default router
