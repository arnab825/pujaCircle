import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller.js';

const router = Router();

router.get('/', bookingController.getBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/', bookingController.createBooking);
router.patch('/:id/cancel', bookingController.cancelBooking);

export default router;
