import { Router } from 'express'
import {
  addFavorite,
  deleteFavorite,
  getFavorites,
} from '../controllers/favoriteController'
import { authenticateSupabaseUser } from '../middlewares/authMiddleware'
import { validateRequest } from '../middlewares/validateRequest'
import {
  favoriteBodySchema,
  favoriteParamsSchema,
} from '../validators/favoriteValidator'

const router = Router()

router.get('/me/favorites', authenticateSupabaseUser, getFavorites)

router.post(
  '/me/favorites',
  authenticateSupabaseUser,
  validateRequest({ body: favoriteBodySchema }),
  addFavorite
)

router.delete(
  '/me/favorites/:schoolId',
  authenticateSupabaseUser,
  validateRequest({ params: favoriteParamsSchema }),
  deleteFavorite
)

export default router
