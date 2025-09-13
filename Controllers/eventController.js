import Event from '../models/Event.js'
//const {uploadOnCloudinary,deleteOnCloudinary} = require("../utils/cloudinary.js");
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import fs from 'fs';
//1) TO CREATE A NEW EVENT
// export const createNewEvent = async (req, res)=>{
//     const newEvent = Event(req.body)
//     try{
//         const savedEvent = await newEvent.save()
//         res.status(201).json({status: "success", success:"true", 
//                              message: "Event Sucessfully Created", data: savedEvent})

//     }catch(err){
//         res.status(500).json({status: "failed", success:"false",
//                              message: "Event Cannot be Created. Try again"})
//     }
// }
// export const createNewEvent = async (req, res) => {
//     const { name, venue, address, desc, price, minGuestSize, maxGuestSize, featured } = req.body;
//     let photoUrl = null;
//     const file = req.file?.path; // Assuming the photo is uploaded via `req.file` (Multer)

//     try {
//         // Upload the photo to Cloudinary if a file is provided
//         if (file) {

//             const cloudinaryResponse = await uploadOnCloudinary(req.file?.path, 'events');
//            ;
           
//             if (cloudinaryResponse) {
//                 photoUrl = cloudinaryResponse.url; // Save the Cloudinary URL
//                 console.log('Cloudinary URL:', photoUrl);
//             } else {
//                 return res.status(500).json({
//                     status: "failed",
//                     success: "false",
//                     message: "Photo upload to Cloudinary failed. Event not created."
//                 });
//             }
//         }
// c
//         // Create a new event with the Cloudinary URL (if applicable)
//         const newEvent = new Event({
//             name,
//             venue,
//             address,
//             desc,
//             price,
//             minGuestSize,
//             maxGuestSize,
//             featured,
//             photo: photoUrl // Set the photo URL
//         });
// console.log(newEvent,"............................................")
//         // Save the new event to the database
//         const savedEvent = await newEvent.save();

//         res.status(201).json({
//             status: "success",
//             success: "true",
//             message: "Event successfully created",
//             data: savedEvent
//         });

//     } catch (err) {
//         res.status(500).json({
//             status: "failed",
//             success: "false",
//             message: "Event cannot be created. Try again."
//         });
//     } 
// };
export const createNewEvent = async (req, res) => {
    const { name, venue, address, desc, vipprice, minGuestSize, maxGuestSize, featured ,vipSize,
        economySize,economyprice
        
       } = req.body;
         // Check if req.user._id exists
    if (!req.user || !req.user._id) {
        return res.status(401).json({
            status: 'failed',
            success: 'false',
            message: 'Unauthorized: User , Please log in and try again.'
        });
    }
       let user_id=req.user._id
        const eventDate = new Date(req.body.eventDate);
        const eventTime = new Date(req.body.eventTime);
        const TotalCapacity = Number(vipSize) + Number(economySize);
        console.log( typeof eventDate)
       
    const file = req.file?.path; // Multer saves the uploaded file locally
    let photoUrl = null;
    try {
        // Step 1: Upload the photo to Cloudinary if a file is provided
        if (file) {
            const cloudinaryResponse = await uploadOnCloudinary(file, 'events');

            if (cloudinaryResponse) {
                photoUrl = cloudinaryResponse.secure_url; // Use Cloudinary secure URL
                console.log('Cloudinary URL:', photoUrl);
            } else {
                return res.status(500).json({
                    status: 'failed',
                    success: 'false',
                    message: 'Photo upload to Cloudinary failed. Event not created.',
                });
            }
        }

        // Step 2: Create a new Event instance with data and Cloudinary URL
        const newEvent = new Event({
            name,
            venue,
            address,
            desc,
            vipprice,
            economyprice,
            minGuestSize,
            maxGuestSize,
            vipSize,
            economySize,
            eventDate,
            eventTime,
            user_id,
            TotalCapacity,
             // Convert to boolean
            photo: photoUrl, // Cloudinary photo URL
        });

        console.log('New Event:', newEvent);

        // Step 3: Save the event to the database
        const savedEvent = await newEvent.save();

        // Step 4: Send success response
        res.status(201).json({
            status: 'success',
            success: 'true',
            message: 'Event successfully created',
            data: savedEvent,
        });

    } catch (err) {
        console.error('Error creating event:', err);

        res.status(500).json({
            status: 'failed',
            success: 'false',
            message: 'Event cannot be created. Try again.',
            error: err.message,
        });
    } finally {
        // Step 5: Clean up the locally uploaded file if it exists
        if (file) {
            import('fs').then(fs => {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file); // Delete the file locally
                }
            });
        }
    }
};
//2) TO UPDATE A EVENT
// export const updateEvent = async (req, res) =>{

//     const id = req.query.eventId

//     try{
//         const updateEvent = await Event.findByIdAndUpdate(id, {$set: req.body}, {new: true})
//         res.status(200).json({status: "success", success:"true", 
//                              message: "Event Sucessfully Updated", data: updateEvent})

//     }catch(err){
//          res.status(500).json({status: "failed", success:"false",
//                              message: "Event Cannot be Updated. Try again"})
//     }
// }
export const updateEvent = async (req, res) => {
    console.log("...............................",req.body)
    const id = req.query.id;
    const file = req.file?.path; // Uploaded file path from Multer
    let photoUrl = null;

    try {
        // Step 1: Find the existing event
        const existingEvent = await Event.findById({_id:id});
        console.log(existingEvent,",,,,,,,,,,,,,,,,,,,,,,,,,,,,,")
        if (!existingEvent) {
            return res.status(404).json({
                status: "failed",
                success: "false",
                message: "Event not found",
            });
        }

        // Step 2: If a new file is provided, upload to Cloudinary
        if (file) {
            // // Delete the existing photo from Cloudinary if it exists
            // if (existingEvent.photo) {
            //     const publicId = existingEvent.photo.split('/').pop().split('.')[0]; // Extract public_id
            //     await deleteOnCloudinary(`events/${publicId}`);
            // }

            // Upload the new photo to Cloudinary
            const cloudinaryResponse = await uploadOnCloudinary(file, 'events');
            if (cloudinaryResponse) {
                photoUrl = cloudinaryResponse.url; // New photo URL
                console.log(photoUrl,"photo url");
            } else {
                return res.status(500).json({
                    status: "failed",
                    success: "false",
                    message: "Photo upload to Cloudinary failed. Event not updated.",
                });
            }
        }

        // Step 3: Prepare updated data (include the new photo URL if available)
        const updatedData = {
            ...req.body,
            
        };
console.log(req.body,"req.body data ");
        if (photoUrl) {
            updatedData.photo = photoUrl;
        }

        // Step 4: Update the event in the database
        const updatedEvent = await Event.findByIdAndUpdate(id, { $set: updatedData }, { new: true });

        res.status(200).json({
            status: "success",
            success: "true",
            message: "Event successfully updated",
            data: updatedEvent,
        });

    } catch (err) {
        console.error('Error updating event:', err);

        res.status(500).json({
            status: "failed",
            success: "false",
            message: "Event cannot be updated. Try again.",
        });
    } finally {
        // Step 5: Clean up the locally uploaded file
        if (file) {
            import('fs').then(fs => {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
            });
        }
    }
};

//3) TO DELETE A EVENT
export const deleteEvent = async (req, res) =>{

    const id = req.params.id

    try{
        await Event.findByIdAndDelete(id)
        res.status(200).json({status: "success", success:"true", 
                             message: "Event Sucessfully Deleted"})

    }catch(err){
         res.status(500).json({status: "failed", success:"false",
                             message: "Event Cannot be Deleted. Try again"})
    }
}

//4) TO GET A SINGLE EVENT
// export const getSingleEvent = async (req, res) =>{

//     const _id = req.query.id

//     try{
//         const singleEvent = await Event.findById(_id)
//         res.status(200).json({status: "success", success:"true", 
//                              message: "Sucessful", data: singleEvent})

//     }catch(err){
//          res.status(404).json({status: "failed", success:"false",
//                              message: "Error: Event Data Not Found."})
//     }
// }
export const getSingleEvent = async (req, res) => {
    const _id = req.query.id;

    try {
        // Fetch the event and populate the owner details
        const singleEvent = await Event.findById(_id).populate('user_id', 'username email photo'); // Replace 'username email' with the fields you want to include.

        if (!singleEvent) {
            return res.status(404).json({
                status: "failed",
                success: "false",
                message: "Error: Event Data Not Found.",
            });
        }

        // Transform the response to include 'owner' instead of 'user_id'
        const { user_id, ...eventData } = singleEvent.toObject(); // Convert Mongoose document to plain object
        const transformedEvent = {
            ...eventData,
            owner: user_id, // Rename user_id to owner
        };

        res.status(200).json({
            status: "success",
            success: "true",
            message: "Successful",
            data: transformedEvent,
        });
    } catch (err) {
        console.error('Error fetching event:', err.message);
        res.status(500).json({
            status: "failed",
            success: "false",
            message: "Internal Server Error.",
        });
    }
};


//5) TO GET ALL EVENTS
// export const getAllEvents = async (req, res) =>{

//     //for pagination
//     const page = parseInt(req.query.page)
//     //console.log(page)

//     try{
//         const allEvents = await Event.find({}).skip(page * 8).limit(8)
//         res.status(200).json({status: "success", success:"true", count: allEvents.length,
//                              message: "Sucessful", data: allEvents})

//     }catch(err){
//          res.status(404).json({status: "failed", success:"false",
//                              message: "Error: Data Not Found."})
//     }
// }
export const getAllEvents = async (req, res) => {
    // Parse page number from query or default to 0
    const page = parseInt(req.query.page) || 0;

    try {
        // Fetch events with pagination and populate owner details
        const allEvents = await Event.find({})
            .populate('user_id', 'username email') // Populate owner details
            .skip(page * 8)
            .limit(8);

        // Transform the response to include 'owner' instead of 'user_id'
        const transformedEvents = allEvents.map(event => {
            const { user_id, ...eventData } = event.toObject(); // Convert Mongoose document to plain object
            return {
                ...eventData,
                owner: user_id, // Rename user_id to owner
            };
        });

        res.status(200).json({
            status: "success",
            success: "true",
            count: transformedEvents.length,
            message: "Successful",
            data: transformedEvents,
        });
    } catch (err) {
        console.error('Error fetching all events:', err.message);
        res.status(500).json({
            status: "failed",
            success: "false",
            message: "Internal Server Error.",
        });
    }
};


//6) TO GET EVENTS BY SEARCH
// export const getEventsBySearch = async(req, res)=>{

//     const name = new RegExp(req.query.name, 'i')
//     const area = req.query.area
//     const maxGuestSize = parseInt(req.query.maxGuestSize)
// console.log(name, area, maxGuestSize)
//     try{
//         const Events = await Event.find({name, address: { $regex: area, $options: 'i' },
//                                          maxGuestSize:{$gte: maxGuestSize}})
//         res.status(200).json({status: "success", success:"true",
//                              message: "Sucessful", data: Events})

//     }catch(err){
//         res.status(404).json({status: "failed", success:"false",
//                             message: "Error: Data Not Found."})
//     }
// }
export const getEventsBySearch = async (req, res) => {
    try {
        // Dynamically build the query object
        const query = {};

        if (req.query.name) {
            query.name = { $regex: new RegExp(req.query.name, 'i') }; // Case-insensitive regex for name
        }
        if (req.query.area) {
            query.address = { $regex: req.query.area, $options: 'i' }; // Case-insensitive regex for address
        }
        if (req.query.maxGuestSize) {
            const maxGuestSize = parseInt(req.query.maxGuestSize);
            if (!isNaN(maxGuestSize)) {
                query.maxGuestSize = { $gte: maxGuestSize }; // Greater than or equal to maxGuestSize
            }
        }

        console.log("Search query:", query);

        // Perform the search based on the constructed query
        const Events = await Event.find(query);

        res.status(200).json({
            status: "success",
            success: "true",
            message: "Successful",
            data: Events,
            count: Events.length,
        });
    } catch (err) {
        console.error("Error fetching events:", err);
        res.status(500).json({
            status: "failed",
            success: "false",
            message: "Error: Unable to fetch events.",
        });
    }
};

//7) TO GET ONLY FEATURED EVENTS
export const getFeaturedEvents = async (req, res) =>{

    try{
        const FeaturedEvents = await Event.find({featured: true}).limit(8)
        res.status(200).json({status: "success", success:"true", count: FeaturedEvents.length,
                             message: "Sucessful", data: FeaturedEvents})

    }catch(err){
         res.status(404).json({status: "failed", success:"false",
                             message: "Error: Data Not Found."})
    }
}
//8) TO GET EVENTS COUNT
export const getEventsCount = async (req, res)=>{
    try{
        const EventCount = await Event.estimatedDocumentCount()
        res.status(200).json({status: "success", success:"true",
                             message: "Sucessful",data: EventCount})

    }catch(err){
        res.status(500).json({status: "failed", success:"false",
                             message: "Error: Failed to Fetch."})
    }
}
export const publishEvent = async (req, res) => {
    const { eventId } = req.body; // Admin provides the event ID to publish
    try {
        // Check if the event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                status: "failed",
                success: "false",
                message: "Event not found",
            });
        }

        // Update the event to mark it as published
        event.published = true;
        await event.save();

        res.status(200).json({
            status: "success",
            success: "true",
            message: "Event published successfully",
            data: event,
        });
    } catch (err) {
        res.status(500).json({
            status: "failed",
            success: "false",
            message: "Failed to publish event",
            error: err.message,
        });
    }
};
export const featureEvent = async (req, res) => {
    const { eventId } = req.body; // Admin provides the event ID to mark as featured

    try {
        // Check if the event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                status: "failed",
                success: "false",
                message: "Event not found",
            });
        }

        // Update the event to mark it as featured
        event.featured = true;
        await event.save();

        res.status(200).json({
            status: "success",
            success: "true",
            message: "Event marked as featured successfully",
            data: event,
        });
    } catch (err) {
        res.status(500).json({
            status: "failed",
            success: "false",
            message: "Failed to mark event as featured",
            error: err.message,
        });
    }
};

export const getEventsByTimeAndName = async (req, res) => {
    const { name, startTime } = req.query; // Accept name and startTime as query parameters
    const query = {};
    let startDate, endDate;

    // Handle "name" query (if provided)
    if (name) {
        query.name = new RegExp(name, 'i'); // Case-insensitive search for name
    }

    // Handle "startTime" query (if provided)
    if (startTime) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        switch (startTime.toLowerCase()) {
            case "today":
                startDate = new Date(today);
                endDate = new Date(today);
                endDate.setDate(today.getDate() + 1); // Next day
                break;
            case "this week":
                startDate = new Date(today);
                startDate.setDate(today.getDate() - today.getDay()); // Start of the week (Sunday)
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 7); // End of the week
                break;
            case "this month":
                startDate = new Date(today);
                startDate.setDate(1); // Start of the month
                endDate = new Date(startDate);
                endDate.setMonth(startDate.getMonth() + 1); // Start of next month
                break;
            default:
                return res.status(400).json({
                    status: "failed",
                    success: "false",
                    message: "Invalid startTime value. Use 'today', 'this week', or 'this month'."
                });
        }

        // Add time range to the query
        query.eventDate = { $gte: startDate, $lt: endDate };
    }
console.log(query,"query");
    try {
        const Events = await Event.find(query); // Fetch events matching the query
        res.status(200).json({
            status: "success",
            success: "true",
            message: "Events fetched successfully",
            data: Events
        });
    } catch (err) {
        res.status(500).json({
            status: "failed",
            success: "false",
            message: "Error: Unable to fetch events. Please try again later.",
            error: err.message
        });
    }
};





export const getUserEvents = async (req, res) => {
    try {
        // Get the user ID from the authenticated request
        const userId = req.user._id;

        // Query the database for all events created by this user
        const userEvents = await Event.find({ user_id: userId });

        // Check if the user has created any events
        if (!userEvents.length) {
            return res.status(404).json({
                status: 'failed',
                success: 'false',
                message: 'No events found for this user.',
            });
        }

        // Respond with the list of events
        res.status(200).json({
            status: 'success',
            success: 'true',
            message: 'Events retrieved successfully.',
            data: userEvents,
        });
    } catch (err) {
        console.error('Error fetching user events:', err);

        res.status(500).json({
            status: 'failed',
            success: 'false',
            message: 'Error fetching events. Try again.',
            error: err.message,
        });
    }
};
