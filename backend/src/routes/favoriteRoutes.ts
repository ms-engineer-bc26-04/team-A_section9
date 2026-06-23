import { Router } from 'express'
import {
  addFavorite,
  deleteFavorite,
  getFavorites,
} from '../controllers/favoriteController'
import { authenticateSupabaseUser } from '../middlewares/authMiddleware'

const router = Router()

router.get('/me/favorites', authenticateSupabaseUser, getFavorites)
router.post('/me/favorites', authenticateSupabaseUser, addFavorite)
router.delete(
  '/me/favorites/:schoolId',
  authenticateSupabaseUser,
  deleteFavorite
)

export default router
