import { Router } from 'express';
import { priestController } from '../controllers/priest.controller.js';

const router = Router();

router.get('/', priestController.getPriests);
router.get('/:id', priestController.getPriestById);
router.post('/register', priestController.registerPriest);
router.patch('/:id/approve', priestController.approvePriest);
router.patch('/:id/reject', priestController.rejectPriest);

export default router;
