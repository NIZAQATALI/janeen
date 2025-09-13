import express  from "express";
import { verifyAdmin, verifyUser,verifyToken } from "../utils/verifyToken.js";
import { createBooking, deleteBooking, getUserBookings, getEventBookings,
         getAllBookings, getBooking, updateBooking } from "../Controllers/bookingController.js";  
         import { handleStripePayment } from '../controllers/stripControllers.js';
const router = express.Router()              
router.post('/create',createBooking)
router.get('/getbooking',  getBooking)
router.get('/sessionBookingDetails', handleStripePayment.sessionBookingDetails )
router.get('/scannedQRCode', handleStripePayment.scannedQRCode )
router.get('/getuserbooking',  getUserBookings)
router.get('/geteventbooking',  getEventBookings)
router.get('/getallbookings',  getAllBookings)

router.post('/stripe', handleStripePayment.createStripeSession)
//router.post('/webhook', handleStripePayment.handleStripeWebhook)
router.put('/update' , updateBooking)
router.delete('/:id',verifyAdmin, deleteBooking)


export default router
