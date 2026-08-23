import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';

const router = Router();

router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);

export default router;
