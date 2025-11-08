import express from "express";
import {
  createOrUpdateTemplate,     
} from "../Controllers/adminNotificationController.js";
import {
  setNotificationPreference,   
} from "../Controllers/notificationPrefrenceController.js";
import {
  createUserNotification,        
  getUserNotifications,          
  markAsRead,                    
  deleteNotification,           
  clearAllNotifications          
} from "../Controllers/notificationController.js";
import { verifyAdmin ,verifyJWT} from "../utils/verifyToken.js";
const router = express.Router();
router.post("/admin/template", verifyJWT,verifyAdmin, createOrUpdateTemplate);
router.post("/preference", verifyJWT, setNotificationPreference);
router.post("/", verifyJWT, createUserNotification);
router.get("/", verifyJWT, getUserNotifications);
router.patch("/read/:id", verifyJWT, markAsRead);
router.delete("/:id", verifyJWT, deleteNotification);
router.delete("/", verifyJWT, clearAllNotifications);
export default router;
