//import stripe from 'stripe';
import QRCode from 'qrcode';
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import PDFDocument from 'pdfkit';
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
//const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

export const handleStripePayment = {
    /**
     * Create a Stripe payment session. 
     */
    createStripeSession: async (req, res) => {
        const { user_id, event_id, bookingDate, guestSize, seatNumbers, totalPrice } = req.body;

        try {
            const event = await Event.findById(event_id);
            if (!event) {
                return res.status(404).json({ message: "Event not found" });
            }

            // Check if any requested seats are already reserved
            const alreadyReservedSeats = seatNumbers.filter(seat => event.reservedSeats.includes(seat));
            if (alreadyReservedSeats.length > 0) {
                return res.status(400).json({
                    message: "Some of the selected seats are already reserved",
                    alreadyReservedSeats,
                });
            }

            // Create a Stripe session with booking details
            const session = await stripeClient.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: `Booking for ${event.name}`,
                                description: `Venue: ${event.venue}, Seats Numbers: ${seatNumbers.join(',')}`,
                            },
                            unit_amount: totalPrice * 100, // Amount in cents
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                // success_url: `${process.env.BASE_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
                // cancel_url: `${process.env.BASE_URL}/booking/cancel`,
                    success_url: `http://localhost:5173/wallet?session_id={CHECKOUT_SESSION_ID}`,
                 cancel_url: `https://www.google.co.uk/`,
                metadata: {
                    user_id,
                    event_id,
                    bookingDate,
                    guestSize,
                    seatNumbers: JSON.stringify(seatNumbers),
                    totalPrice,
                },
            });

            res.status(200).json({ stripeUrl: session.url });
        } catch (error) {
            console.error('Error creating Stripe session for booking:', error);
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    },

    /** 
     * Handle Stripe webhook for payment completion.
     */
    handleStripeWebhook: async (req, res) => {
        const sig = req.headers['stripe-signature'];
        let stripeEvent;

        try {
            stripeEvent = stripeClient.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (stripeEvent.type === 'checkout.session.completed') {
            const session = stripeEvent.data.object;

            if (session.payment_status === 'paid' && session.status === 'complete') {
                const {
                    user_id,
                    event_id,
                    bookingDate,
                    guestSize,
                    seatNumbers,
                    totalPrice,
                } = session.metadata;

                try {
                    // Fetch the event
                    // const event = await Event.findById(event_id);
                    // if (!event) {
                    //     console.error('Event not found during booking creation.');
                    //     return res.status(404).json({ message: "Event not found" });
                    // }

                    // const seats = JSON.parse(seatNumbers);

                    // // Verify seat availability again to ensure no conflicts
                    // const unavailableSeats = seats.filter(seat => !event.availableSeats.includes(seat));
                    // if (unavailableSeats.length > 0) {
                    //     console.error('Seats became unavailable during payment.');
                    //     return res.status(400).json({ message: "Some of the selected seats are unavailable ,Seats became unavailable during payment.", unavailableSeats });
                    // }

                    // // Update available seats
                    // event.availableSeats = event.availableSeats.filter(seat => !seats.includes(seat));
                    // await event.save();
  // Fetch the event
  const event = await Event.findById(event_id);
  if (!event) {
      console.error('Event not found during booking creation.');
      return res.status(404).json({ message: "Event not found" });
  }

  const seats = JSON.parse(seatNumbers);

  // Check if any seats are already reserved
  const alreadyReservedSeats = seats.filter(seat => event.reservedSeats.includes(seat));
  if (alreadyReservedSeats.length > 0) {
      console.error('Some of the selected seats are already reserved.');
      return res.status(400).json({
          message: "Some of the selected seats are already reserved",
          alreadyReservedSeats,
      });
  }

  // Add new reserved seats to the event
  event.reservedSeats.push(...seats);
  await event.save();

                    // // Generate QR code
                    // const qrCodeData = JSON.stringify({
                    //     bookingId: session.id,
                    //     event: event.name,
                    //     user: user_id,
                    //     date: bookingDate,
                    //     totalPrice,
                    //     seatNumbers,
                    //     Address: event.address,
                    //     Venue: event.venue
                    // });
  // Generate a JWT token for the QR code
  const tokenPayload = {
    bookingId: session.id,
    eventId: event._id,
    userId: user_id,
    organizerId: event.user_id, // Event organizer's ID
};

// const token = jwt.sign(tokenPayload, process.env.JWT_SECRET_KEY, {
//     expiresIn: Math.floor(new Date(event.eventDate).getTime() / 1000) - Math.floor(Date.now() / 1000), // Expires at event date
// });
const eventDateTime = new Date(event.eventDate).getTime(); 
const tokenExpiryTime = Math.floor((eventDateTime + 24 * 60 * 60 * 1000) / 1000); // Add 24 hours, convert to seconds

const token = jwt.sign(tokenPayload, process.env.JWT_SECRET_KEY, {
    expiresIn: tokenExpiryTime - Math.floor(Date.now() / 1000), // Time until 24 hours after event date
});
// Generate QR code data
const qrCodeData = JSON.stringify({
    eventName: event.name,
    Address: event.address,
    Venue: event.venue,
    seatNumbers,
    Total_Payments:totalPrice,
    bookingId: session.id,
    

});

const qrCodeBase64 = await QRCode.toDataURL(qrCodeData);

// Upload QR code to Cloudinary
const qrCodeUploadResponse = await uploadOnCloudinary(qrCodeBase64, {
    folder: "event_bookings",
    public_id: `booking_${session.id}`,
});
                    // Create the booking in the database
                    const newBooking = new Booking({
                        user_id,
                        event_id,
                        bookingDate,
                        guestSize,
                        seatNumbers: seats,
                        totalPrice,
                        qrCodeToken: token, 
                        qrCodeScanStatus: false,
                        qrCodeUrl: qrCodeUploadResponse.secure_url,
                        paymentStatus: 'paid',
                        paymentDetails: {
                            paymentIntentId: session.payment_intent,
                            sessionStorageId: session.id,
                            paymentMethod: session.payment_method_types[0],
                        },
                    });

                    await newBooking.save();

                    console.log(`Booking ${newBooking._id} created successfully after payment.`);
                } catch (error) {
                    console.error('Error creating booking after payment:', error);
                    return res.status(500).json({ message: 'Error creating booking after payment' });
                }
            }
        }

        res.status(200).json({ received: true });
    },
    // sessionBookingDetails:
    // async (req, res) => {
    //    const { session_id } = req.query;
   
    //    if (!session_id) {
    //        return res.status(400).json({ message: "Session ID is required" });
    //    }
    //    try {
    //        // Find the booking by the Stripe session_id (paymentIntentId)
    //        const booking = await Booking.findOne({ "paymentDetails.sessionStorageId": session_id });
   
    //        if (!booking) {
    //            return res.status(404).json({ message: "Booking not found" });
    //        }
   
    //        // Return the booking details
    //        res.status(200).json({
    //            bookingId: booking._id,
    //            event_id: booking.event_id,
    //            user_id: booking.user_id,
    //            bookingDate: booking.bookingDate,
    //            guestSize: booking.guestSize,
    //            seatNumbers: booking.seatNumbers,
    //            totalPrice: booking.totalPrice,
    //            qrCodeUrl: booking.qrCodeUrl,
    //            paymentStatus: booking.paymentStatus,
    //        });
    //    } catch (error) {
    //        console.error('Error fetching booking details:', error);
    //        res.status(500).json({ message: "Internal server error", error: error.message });
    //    }
    // },



// sessionBookingDetails: async (req, res) => {
//     const { session_id } = req.query;

//     if (!session_id) {
//         return res.status(400).json({ message: "Session ID is required" });
//     }
//     try {
//         // Find the booking by the Stripe session_id (paymentIntentId)
//         const booking = await Booking.findOne({ "paymentDetails.sessionStorageId": session_id });

//         if (!booking) {
//             return res.status(404).json({ message: "Booking not found" });
//         }
//         let eventId=booking.event_id
//         let userId=booking.user_id
//         const event = await Event.findOne({ _id:eventId  });
//         const user = await User.findOne({ _id:userId  });
//         // Generate the PDF
//         const doc = new PDFDocument();
//         const filePath = `booking-${booking._id}.pdf`;
//         const writeStream = fs.createWriteStream(filePath);

//         doc.pipe(writeStream);

//         // Add content to the PDF
//         doc.fontSize(18).text('Booking Details', { align: 'center' });
//         doc.moveDown();
//         doc.fontSize(12).text(`Booking ID: ${booking._id}`);
//         doc.text(`Event Name: ${event.name}`);
//         doc.text(`User Name: ${user.username}`);
//         doc.text(`Booking Date: ${new Date(booking.bookingDate).toLocaleString()}`);
//         doc.text(` Book Seats: ${booking.guestSize}`);
//         doc.text(`Seat Numbers: ${booking.seatNumbers.join(', ')}`);
//         doc.text(`Total Price: $${booking.totalPrice}`);
//         doc.text(`Payment Status: ${booking.paymentStatus}`);

//         // Generate QR Code
//         const qrCodeDataURL = await QRCode.toDataURL(booking.qrCodeUrl || 'No QR code available');
//         const qrCodeImage = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
//         doc.image(qrCodeImage, { fit: [150, 150], align: 'center' });

//         doc.end();

//         writeStream.on('finish', () => {
//             // Send the PDF as a response
//             res.setHeader('Content-Type', 'application/pdf');
//             res.setHeader('Content-Disposition', `attachment; filename=${filePath}`);
//             res.sendFile(filePath, { root: '.' }, (err) => {
//                 if (err) {
//                     console.error('Error sending PDF:', err);
//                 }
//                 // Cleanup the generated file
//                 fs.unlinkSync(filePath);
//             });
//         });

//     } catch (error) {
//         console.error('Error fetching booking details:', error);
//         res.status(500).json({ message: "Internal server error", error: error.message });
//     }
// },

sessionBookingDetails: async (req, res) => {
    const { session_id } = req.query;

    if (!session_id) {
        return res.status(400).json({ message: "Session ID is required" });
    }
    try {
        // Find the booking by the Stripe session_id (paymentIntentId)
        const booking = await Booking.findOne({ "paymentDetails.sessionStorageId": session_id });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const event = await Event.findOne({ _id: booking.event_id });
        const user = await User.findOne({ _id: booking.user_id });

        // Generate the PDF
        const doc = new PDFDocument({ margin: 50 });
        const filePath = `booking-${booking._id}.pdf`;
        const writeStream = fs.createWriteStream(filePath);

        doc.pipe(writeStream);

        // Header Section
        doc.rect(0, 0, doc.page.width, 80).fill('#2C3E50'); // Dark Blue Header
        doc.fillColor('#ECF0F1').fontSize(26).text('Event Booking Confirmation', 50, 30, { align: 'center' });

        // Sub-header
        doc.moveDown(2).fillColor('#34495E').fontSize(18).text('Booking Summary', 50, 100, { align: 'left', underline: true });

        // Booking Information
        doc.moveDown(1);
        doc.fillColor('black').fontSize(14).text(`Booking ID:`, { continued: true }).font('Helvetica-Bold').text(` ${booking._id}`);
        doc.font('Helvetica').text(`Event Name:`, { continued: true }).font('Helvetica-Bold').text(` ${event.name}`);
        doc.font('Helvetica').text(`User Name:`, { continued: true }).font('Helvetica-Bold').text(` ${user.username}`);
        doc.font('Helvetica').text(`Booking Date:`, { continued: true }).font('Helvetica-Bold').text(` ${new Date(booking.bookingDate).toLocaleString()}`);
        doc.font('Helvetica').text(`Booked Seats:`, { continued: true }).font('Helvetica-Bold').text(` ${booking.guestSize}`);
        doc.font('Helvetica').text(`Seat Numbers:`, { continued: true }).font('Helvetica-Bold').text(` ${booking.seatNumbers.join(', ')}`);
        doc.font('Helvetica').text(`Total Price:`, { continued: true }).font('Helvetica-Bold').text(` $${booking.totalPrice}`);
        doc.font('Helvetica').text(`Payment Status:`, { continued: true }).font('Helvetica-Bold').text(` ${booking.paymentStatus}`);

        // Divider
        doc.moveDown(1).strokeColor('#BDC3C7').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();

        // QR Code Section
        doc.moveDown(2).fillColor('#34495E').fontSize(18).text('Scan Your QR Code', { align: 'left', underline: true });
        const qrCodeDataURL = await QRCode.toDataURL(booking.qrCodeUrl || 'No QR code available');
        const qrCodeImage = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
        doc.image(qrCodeImage, 50, doc.y + 20, { fit: [150, 150], align: 'center' });
        doc.moveDown(12);

        // Note Section
       // doc.rect(50, doc.y-10, 500, 100).fill('#F39C12').stroke('#E67E22').lineWidth(2).stroke();
        doc.fillColor('black').fontSize(12).text(
            'Important Note:\nPlease bring this document to the event and present the QR code at the entrance. ' +
            'Your booking details and QR code are unique to you. Keep this document safe.',
            50,
            doc.y - 0,
            { width: 480, align: 'justify' }
        );

        // Footer
        doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill('#2C3E50');
        doc.fillColor('#ECF0F1').fontSize(10).text(
            'Thank you for booking with us! For inquiries, contact support@example.com',
            50,
            doc.page.height - 40,
            { align: 'center' }
        );

        doc.end();

        writeStream.on('finish', () => {
            // Send the PDF as a response
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${filePath}`);
            res.sendFile(filePath, { root: '.' }, (err) => {
                if (err) {
                    console.error('Error sending PDF:', err);
                }
                // Cleanup the generated file
                fs.unlinkSync(filePath);
            });
        });

    } catch (error) {
        console.error('Error fetching booking details:', error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
},
    scannedQRCode:async (req, res) => {
        const { bookingId } = req.body; // Extract only the booking ID from the request
    
        try {
            // Fetch the booking
            const booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ message: "Booking not found" });
            }
    
            // Verify the token stored in the booking record
            const decoded = jwt.verify(booking.qrCodeToken, process.env.JWT_SECRET_KEY);
    
            // Fetch the related event to validate organizer ID
            const event = await Event.findById(booking.event_id);
            if (!event || event.organizerId !== decoded.organizerId) {
                return res.status(403).json({ message: "Unauthorized access to scan QR code" });
            }
    
            // Check if the QR code has already been scanned
            if (booking.qrCodeScanStatus) {
                return res.status(400).json({ message: "QR code has already been scanned" });
            }
    
            // Mark the QR code as scanned
            booking.qrCodeScanStatus = true;
            await booking.save();
    
            res.status(200).json({ message: "QR code scanned successfully" });
        } catch (error) {
            console.error('QR code validation error:', error);
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(400).json({ message: "Invalid or expired QR code" });
            }
            res.status(500).json({ message: "Internal server error" });
        }
    }  
};
