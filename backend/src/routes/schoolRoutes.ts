import { Router } from 'express'
import {
  getSchoolByIdController,
  getSchoolsController,
} from '../controllers/schoolController'

const router = Router()

router.get('/', getSchoolsController)
router.get('/:id', getSchoolByIdController)

export default router
