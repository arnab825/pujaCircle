import { Router } from 'express';
import { addressController } from '../controllers/address.controller.js';

const router = Router();

router.get('/', addressController.getAddresses);
router.post('/', addressController.createAddress);
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.patch('/:id/default', addressController.setDefaultAddress);

export default router;
