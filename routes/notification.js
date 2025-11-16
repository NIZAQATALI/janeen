import express from "express";
import {
  createOrUpdateTemplate,
  getAllTemplates,
  getSingleTemplate,
  deleteTemplate     
} from "../Controllers/adminNotificationController.js";
import {
  setNotificationPreference,   
} from "../Controllers/notificationPrefrenceController.js";
import {
      
  getUserNotifications,          
  markAsRead,                    
  deleteNotification,           
  clearAllNotifications          
} from "../Controllers/notificationController.js";
import { verifyAdmin ,verifyJWT} from "../utils/verifyToken.js";
const router = express.Router();
router.post("/admin/template", verifyJWT,verifyAdmin, createOrUpdateTemplate);


router.get("/admin/template", verifyJWT, verifyAdmin, getAllTemplates);
router.get("/admin/template/:id", verifyJWT, verifyAdmin, getSingleTemplate);
router.delete("/admin/template/:id", verifyJWT, verifyAdmin, deleteTemplate);
router.post("/preference", verifyJWT, setNotificationPreference);

router.get("/", verifyJWT, getUserNotifications);
router.patch("/read/:id", verifyJWT, markAsRead);
router.delete("/:id", verifyJWT, deleteNotification);
router.delete("/", verifyJWT, clearAllNotifications);
export default router;
