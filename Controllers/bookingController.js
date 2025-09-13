import Booking from '../models/Booking.js'
import Event from '../models/Event.js'
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
//1) TO CREATE A BOOKING
// export const createBooking = async (req, res)=>{

//     const { timeslot_id, bookingDate, event_id,user_id } = req.body;

//     // Check if there's an existing booking for event at the selected timeslot and date
//     const existingBooking = await Booking.findOne({event_id,user_id});

//     if (existingBooking) {
//         return res.status(400).json({status: "failed",success: "false",
//                                      message: "Cannot book at that slot, already booked"});
//     }
//     const newBooking = new Booking(req.body)
//     try{
//         const savedBooking = await newBooking.save()
//         res.status(200).json({status: "success", success:"true", 
//                                  message: "Your Booking is Booked", data: savedBooking})

//     }catch(err){
//         res.status(500).json({status: "failed", success:"false", 
//                                  message: "Failed to Book Booking"})
//     }
// }
// export const createBooking = async (req, res) => {
//     const { bookingDate, event_id, user_id, guestSize, seatNumbers } = req.body;
//     try {
//         // Check if there's an existing booking for the user at the selected event and date
//         const existingBooking = await Booking.findOne({ event_id, user_id });
//         if (existingBooking) {
//             return res.status(400).json({
//                 status: "failed",
//                 success: "false",
//                 message: "Cannot book at that event, already booked",
//             });
//         }

//         // Check if any of the requested seats are already booked for the event and date
//         const conflictingSeats = await Booking.find({
//             event_id,
//             bookingDate,
//             seatNumbers: { $in: seatNumbers },
//         });

//         if (conflictingSeats.length > 0) {
//             return res.status(400).json({
//                 status: "failed",
//                 success: "false",
//                 message: "Some of the selected seats are already booked",
//                 conflictingSeats: conflictingSeats.map(booking => booking.seatNumbers).flat(),
//             });
//         }

//         // Create a new booking
//         const newBooking = new Booking({
//             user_id,
//             event_id,
//             bookingDate,
//             guestSize,
//             seatNumbers,
//         });

//         // Save the booking
//         const savedBooking = await newBooking.save();

//         // Populate relevant details (user, event)
//         const populatedBooking = await Booking.findById(savedBooking._id)
//             .populate('user_id', 'username email')
//             .populate('event_id', 'name desc venue');

//         // Send response with detailed information
//         res.status(200).json({
//             status: "success",
//             success: "true",
//             message: "Your Booking is Booked",
//             data: populatedBooking,
//         });
//     } catch (err) {
//         res.status(500).json({
//             status: "failed",
//             success: "false",
//             message: "Failed to Book Booking",
//             error: err.message,
//         });
//     }
// };
//.........................createBooking.....................................................
// export const createBooking = async (req, res) => {
//     const { bookingDate, event_id, user_id, guestSize, seatNumbers } = req.body;

//     try {
//         // Fetch the event details to validate seats and pricing
//         const event = await Event.findById(event_id);
//         if (!event) {
//             return res.status(404).json({
//                 status: "failed",
//                 success: "false",
//                 message: "Event not found",
//             });
//         }

//         // Check if there's an existing booking for the user at the selected event and date
//         const existingBooking = await Booking.findOne({ event_id, user_id });
//         if (existingBooking) {
//             return res.status(400).json({
//                 status: "failed",
//                 success: "false",
//                 message: "Cannot book at that event, already booked",
//             });
//         }

//         // Check if any of the requested seats are already booked for the event and date
//         const conflictingSeats = await Booking.find({
//             event_id,
//             bookingDate,
//             seatNumbers: { $in: seatNumbers },
//         });

//         if (conflictingSeats.length > 0) {
//             return res.status(400).json({
//                 status: "failed",
//                 success: "false",
//                 message: "Some of the selected seats are already booked",
//                 conflictingSeats: conflictingSeats.map(booking => booking.seatNumbers).flat(),
//             });
//         }

//         // Determine the total booking price based on seat types
//         let totalPrice = 0;
//         const vipSeats = new Set(Array.from({ length: event.vipSize }, (_, i) => i + 1));

//         seatNumbers.forEach(seat => {
//             if (vipSeats.has(seat)) {
                
//                 totalPrice += event.vipprice;
//             } else {
                
//                 totalPrice += event.economyprice;
//             }
//         });

//         // Create a new booking
//         const newBooking = new Booking({
//             user_id,
//             event_id,
//             bookingDate,
//             guestSize,
//             seatNumbers,
//             totalPrice,
//         });

//         // Save the booking
//         const savedBooking = await newBooking.save();

//         // Update the available seats for the event
//         event.availableSeats = event.availableSeats.filter(seat => !seatNumbers.includes(seat));
//      const updatedEvent  = await event.save();
      
//         // Populate relevant details (user, event)
//         const populatedBooking = await Booking.findById(savedBooking._id)
//             .populate('user_id', 'username email')
//             .populate('event_id', 'name desc venue');

//         // Send response with detailed information
//         res.status(200).json({
//             status: "success",
//             success: "true",
//             message: "Your Booking is Booked",
//             data: populatedBooking,
//         });
//     } catch (err) {
//         res.status(500).json({
//             status: "failed",
//             success: "false",
//             message: "Failed to Book Booking",
//             error: err.message,
//         });
//     }
// };
//........................With QR Code..............................
import QRCode from 'qrcode'; 

// export const createBooking = async (req, res) => {
//     const { bookingDate, event_id, user_id, guestSize, seatNumbers ,totalPrice} = req.body;
//     try {
//         // Fetch the event details to validate seats and pricing
//         const event = await Event.findById(event_id);
//         if (!event) {
//             return res.status(404).json({
//                 status: "failed",
//                 success: "false",
//                 message: "Event not found",
//             });
//         }

//         // Check if there's an existing booking for the user at the selected event and date
//         const existingBooking = await Booking.findOne({ event_id, user_id });
//         if (existingBooking) {
//             return res.status(400).json({
//                 status: "failed",
//                 success: "false",
//                 message: "Cannot book at that event, already booked",
//             });
//         }

//         // Check if any of the requested seats are already booked for the event and date
//         const conflictingSeats = await Booking.find({
//             event_id,
//             bookingDate,
//             seatNumbers: { $in: seatNumbers },
//         });

//         if (conflictingSeats.length > 0) {
//             return res.status(400).json({
//                 status: "failed",
//                 success: "false",
//                 message: "Some of the selected seats are already booked",
//                 conflictingSeats: conflictingSeats.map(booking => booking.seatNumbers).flat(),
//             });
//         }

//         // Determine the total booking price based on seat types
     
//         const vipSeats = new Set(Array.from({ length: event.vipSize }, (_, i) => i + 1));

//         // seatNumbers.forEach(seat => {
//         //     if (vipSeats.has(seat)) {
//         //         totalPrice += event.vipprice;
//         //     } else {
//         //         totalPrice += event.economyprice;
//         //     }
//         // });

//         // Create a new booking
//         const newBooking = new Booking({
//             user_id,
//             event_id,
//             bookingDate,
//             guestSize,
//             seatNumbers,
//             totalPrice,
//         });

//         // Save the booking
//         const savedBooking = await newBooking.save();

//         // Update the available seats for the event
//         event.availableSeats = event.availableSeats.filter(seat => !seatNumbers.includes(seat));
//         const updatedEvent = await event.save();
      
//         // Populate relevant details (user, event)
//         const populatedBooking = await Booking.findById(savedBooking._id)
//             .populate('user_id', 'username email')
//             .populate('event_id', 'name desc venue');

//         // Generate the QR code data (use the booking ID or any relevant details)
//         const qrCodeData = JSON.stringify({
//             bookingId: savedBooking._id,
//             event: event.name,
//             user: populatedBooking.user_id.username,
//             date: bookingDate,
//             totalPrice,
//         });

//         const qrCode = await QRCode.toDataURL(qrCodeData);

//         // Send response with detailed information and QR code
//         res.status(200).json({
//             status: "success",
//             success: "true",
//             message: "Your Booking is Booked",
//             data: populatedBooking,
//             qrCode, // Include QR code as base64 URL
//         });
//     } catch (err) {
//         res.status(500).json({
//             status: "failed",
//             success: "false",
//             message: "Failed to Book Booking",
//             error: err.message,
//         });
//     }
// };

//2) TO GET BOOKING DETAILS BY ID
export const createBooking = async (req, res) => {
    const { bookingDate, event_id, user_id, guestSize, seatNumbers } = req.body;

    try {
        // Fetch the event details to validate seats and pricing
        const event = await Event.findById(event_id);
        if (!event) {
            return res.status(404).json({
                status: "failed",
                success: "false",
                message: "Event not found",
            });
        }

        // Check if there's an existing booking for the user at the selected event and date
        const existingBooking = await Booking.findOne({ event_id, user_id });
        if (existingBooking) {
            return res.status(400).json({
                status: "failed",
                success: "false",
                message: "Cannot book at that event, already booked",
            });
        }

        // Check if any of the requested seats are already booked for the event and date
        const conflictingSeats = await Booking.find({
            event_id,
            bookingDate,
            seatNumbers: { $in: seatNumbers },
        });

        if (conflictingSeats.length > 0) {
            return res.status(400).json({
                status: "failed",
                success: "false",
                message: "Some of the selected seats are already booked",
                conflictingSeats: conflictingSeats.map(booking => booking.seatNumbers).flat(),
            });
        }
        // Determine the total booking price based on seat types
        let totalPrice = 0;
        const vipSeats = new Set(Array.from({ length: event.vipSize }, (_, i) => i + 1));

        seatNumbers.forEach(seat => {
            if (vipSeats.has(seat)) {
                totalPrice += event.vipprice;
            } else {
                totalPrice += event.economyprice;
            }
        });

        // Create a new booking
        const newBooking = new Booking({
            user_id,
            event_id,
            bookingDate,
            guestSize,
            seatNumbers,
            totalPrice,
        });

        // Save the booking
        const savedBooking = await newBooking.save();

        // Update the available seats for the event
        event.availableSeats = event.availableSeats.filter(seat => !seatNumbers.includes(seat));
        const updatedEvent = await event.save();

        // Populate relevant details (user, event)
        const populatedBooking = await Booking.findById(savedBooking._id)
            .populate('user_id', 'username email')
            .populate('event_id', 'name desc venue');

        // Generate the QR code data (use the booking ID or any relevant details)
        const qrCodeData = JSON.stringify({
            bookingId: savedBooking._id,
            event: event.name,
            user: populatedBooking.user_id.username,
            date: bookingDate,
            totalPrice,
        });

        // Generate QR code as Base64
        const qrCodeBase64 = await QRCode.toDataURL(qrCodeData);

        // Upload QR code to Cloudinary using your middleware
        const qrCodeUploadResponse = await uploadOnCloudinary(qrCodeBase64, {
            folder: "event_bookings", // Optional: Specify folder
            public_id: `booking_${savedBooking._id}`, // Optional: Unique identifier
        });

        // Send response with detailed information and Cloudinary QR code URL
        res.status(200).json({
            status: "success",
            success: "true",
            message: "Your Booking is Booked",
            data: populatedBooking,
            qrCodeUrl: qrCodeUploadResponse.secure_url, // Cloudinary QR code URL
        });
    } catch (err) {
        res.status(500).json({
            status: "failed",
            success: "false",
            message: "Failed to Book Booking",
            error: err.message,
        });
    }
};
export const getBooking = async (req, res)=>{

    const _id = req.query.id

    try{
        const singleBooking = await Booking.findById(_id)
        res.status(200).json({status: "success", success:"true", 
                                 message: "Succesful", data: singleBooking})

    }catch(err){
        res.status(404).json({status: "failed", success:"false", 
                                 message: "Booking Not Found"})
    }
}
export const getUserBookings = async (req, res) => {
    const user_id = req.query.user_id;
console.log(user_id,"user_id")
    try {
        const userBookings = await Booking.find({ user_id }).populate('event_id', 'name venue');
        res.status(200).json({
            status: "success",
            success: "true",
            message: "User bookings retrieved successfully",
            data: userBookings,
        });
    } catch (err) {
        res.status(500).json({
            status: "failed",
            success: "false",
            message: "Failed to retrieve user bookings",
            error: err.message,
        });
    }
};
export const getEventBookings = async (req, res) => {
    const event_id = req.query.event_id;

    try {
        const eventBookings = await Booking.find({ event_id }).populate('user_id', 'username email');
        res.status(200).json({
            status: "success",
            success: "true",
            message: "Event bookings retrieved successfully",
            data: eventBookings,
        });
    } catch (err) {
        res.status(500).json({
            status: "failed",
            success: "false",
            message: "Failed to retrieve event bookings",
            error: err.message,
        });
    }
};

//3) TO GET All BOOKINGS DETAILS
export const getAllBookings = async (req, res)=>{

    try{
        const allBookings = await Booking.find()
        res.status(200).json({status: "success", success:"true", 
                                 message: "Succesful", count: allBookings.length, data: allBookings})

    }catch(err){
        res.status(500).json({status: "failed", success:"false", 
                                 message: "Internal Server Error"})
    }
}

//4) TO DELETE A BOOKING
export const deleteBooking = async (req, res) =>{

    const id = req.params.id

    try{
        await Booking.findByIdAndDelete(id)
        res.status(200).json({status: "success", success:"true", 
                             message: "Booking Sucessfully Deleted"})

    }catch(err){
         res.status(500).json({status: "failed", success:"false",
                             message: "Booking Cannot be Deleted. Try again"})
    }
}

//5) TO UPDATE A BOOKING
export const updateBooking = async (req, res) =>{

    const _id = req.query.id

    try{
        const updateBooking = await Booking.findByIdAndUpdate(_id, {$set: req.body}, {new: true})
        res.status(200).json({status: "success", success:"true", 
                             message: "Booking Sucessfully Updated", data: updateBooking})

    }catch(err){
         res.status(500).json({status: "failed", success:"false",
                             message: "Booking Cannot be Updated. Try again"})
    }
}