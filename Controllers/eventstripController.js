import Stripe from 'stripe';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from 'fs';

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

export const handleEventStripePayment = {
    /**
     * Create a Stripe payment session for event creation.
     */
    createStripeSession: async (req, res) => {
    console.log(req.body,'req.body')
        const {
            name,
            venue,
            address,
            desc,
           category,
            vipprice,
            economyprice,
            economySize,
            vipSize,
            featured,
           currency,
            ticket,
            subscriptionPlan
        } = req.body;

        const organizer_id = req.user._id; 
        const file = req.file?.path; 

        try {
            // Validate organizer
            const organizer = await User.findById(organizer_id);
            if (!organizer) {
                return res.status(404).json({ message: "Organizer not found" });
            }
   // Determine the price based on the subscription plan
   let price = 0;
   console.log(subscriptionPlan,"subscriptionPlan")
   if (subscriptionPlan === "Simple") {
       price = 100;
   } else if (subscriptionPlan === "Standard") {
       price = 200;
   } else if (subscriptionPlan === "Premium") {
       price = 300;
   } else {
       return res.status(400).json({ message: "Invalid subscription plan" });
   }
          
            let photoUrl = null;
            if (file) {
                const cloudinaryResponse = await uploadOnCloudinary(file, 'events');
                if (cloudinaryResponse) {
                    photoUrl = cloudinaryResponse.secure_url;
                } else {
                    throw new Error('Cloudinary upload failed.');
                }
            }

         
            const eventDetails = {
                name,
                venue,
        organizer_id ,

                address,
                subscriptionPlan,
                desc,
                price,
                vipprice,
                economyprice,
                category,
                vipSize,
                economySize,
                TotalCapacity: Number(vipSize) + Number(economySize),
                photo: photoUrl,
            category,


            };

     
            const session = await stripeClient.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: `subscriptionPlan: ${eventDetails.subscriptionPlan}`,
                                description: `  Your Event Name: ${eventDetails.name},Venue: ${eventDetails.venue}, Price: $${eventDetails.price}`,
                            },
                            unit_amount: eventDetails.price * 100, // Amount in cents
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `http://localhost:5173/event/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `http://localhost:5173/event/cancel`,
                metadata: {
                    organizer_id,
                    eventDetails: JSON.stringify(eventDetails),
                },
            });

            // Clean up the local file if it exists
            if (file && fs.existsSync(file)) {
                fs.unlinkSync(file);
            }

            res.status(200).json({ stripeUrl: session.url });
        } catch (error) {
            console.error('Error creating Stripe session for event:', error);

            // Clean up the local file in case of error
            if (file && fs.existsSync(file)) {
                fs.unlinkSync(file);
            }

            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    },

    /**
     * Handle Stripe webhook for event payment completion.
     */
    handleStripeWebhook: async (req, res) => {
        const sig = req.headers['stripe-signature'];
        let stripeEvent;
    
        try {
            // Verify the webhook signature
            stripeEvent = stripeClient.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET_EVENT);
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).json({ error: `Webhook Error: ${err.message}` });
        }
    
        // Handle the checkout session completion event
        if (stripeEvent.type === 'checkout.session.completed') {
            const session = stripeEvent.data.object;
    
            if (session.payment_status === 'paid') {
                const { organizer_id, eventDetails } = session.metadata;
    console.log(eventDetails,"eventDetails",organizer_id,"organizor id")
                try {
                    // Parse the event details metadata
                    const parsedEventDetails = JSON.parse(eventDetails);
                    console.log(parsedEventDetails,"eventDetails")
                    // Validate necessary fields before saving
                    if (!parsedEventDetails.organizer_id || !parsedEventDetails.name || !parsedEventDetails.venue) {
                        console.error('Missing required event details.');
                        return res.status(400).json({ error: 'Missing required event details.' });
                    }
    
                    // Create the event in the database
                    const newEvent = new Event({
                        user_id: parsedEventDetails.organizer_id,
                        name: parsedEventDetails.name,
                        venue: parsedEventDetails.venue,
                        address: parsedEventDetails.address,
                        desc: parsedEventDetails.desc,
                        price: parsedEventDetails.price,
                        vipprice: parsedEventDetails.vipprice,
                        economyprice: parsedEventDetails.economyprice,
                        vipSize: parsedEventDetails.vipSize,
                        economySize: parsedEventDetails.economySize,
                        TotalCapacity: parsedEventDetails.TotalCapacity,
                        category: parsedEventDetails.category,
                        featured: parsedEventDetails.featured,
                        photo: parsedEventDetails.photo,
                        subscriptionPlan: parsedEventDetails.subscriptionPlan, // Save the subscription plan
                        paymentStatus: 'paid',
                        paymentDetails: {
                            paymentIntentId: session.payment_intent,
                            sessionStorageId: session.id,
                            paymentMethod: session.payment_method_types ? session.payment_method_types[0] : 'unknown',
                        },
                    });
    
                    await newEvent.save();
    
                    console.log(`Event ${newEvent._id} created successfully after payment.`);
                } catch (error) {
                    console.error('Error creating event after payment:', error);
                    return res.status(500).json({ message: 'Error creating event after payment' });
                }
            } else {
                console.warn('Payment status is not "paid". Ignoring this event.');
            }
        } else {
            console.log(`Unhandled event type: ${stripeEvent.type}`);
        }
    
        res.status(200).json({ received: true });
    },
    

    /**
     * Fetch event details post-payment using session ID.
     */
    sessionEventDetails: async (req, res) => {
        const { session_id } = req.query;

        if (!session_id) {
            return res.status(400).json({ message: "Session ID is required" });
        }

        try {
            const event = await Event.findOne({ "paymentDetails.sessionStorageId": session_id });

            if (!event) {
                return res.status(404).json({ message: "Event not found" });
            }

            res.status(200).json({
                eventId: event._id,
                name: event.name,
                venue: event.venue,
                address: event.address,
                desc: event.desc,
                price: event.price,
                minGuestSize: event.minGuestSize,
                maxGuestSize: event.maxGuestSize,
                featured: event.featured,
                photo: event.photo,
                paymentStatus: event.paymentStatus,
            });
        } catch (error) {
            console.error('Error fetching event details:', error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },
};
