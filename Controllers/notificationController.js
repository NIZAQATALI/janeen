// controllers/notificationController.js

import Notification from "../models/Notification.js";
import agenda from "../utils/agenda.js"; // Your Agenda instance


export const createUserNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const userId = req.user._id;

    if (!title || !message || !type) {
      return res.status(400).json({
        success: false,
        message: "Title, message, and type are required",
      });
    }

    // Save notification in DB
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      status: type === "urgent" ? "sent" : "scheduled",
    });

    // Handle notification type
    if (type === "urgent") {
      req.io.to(userId.toString()).emit("notification", {
        title,
        message,
        time: new Date(),
      });
    } else {
      let scheduleTime;
      switch (type) {
        case "daily":
          scheduleTime = "in 1 day";
          break;
        case "weekly":
          scheduleTime = "in 1 week";
          break;
        case "monthly":
          scheduleTime = "in 1 month";
          break;
        default:
          return res.status(400).json({
            success: false,
            message: "Invalid type. Must be daily, weekly, monthly, or urgent",
          });
      }

      await agenda.schedule(scheduleTime, "sendNotification", {
        userId,
        title,
        message,
      });
    }

    return res.status(201).json({
      success: true,
      message:
        type === "urgent"
          ? "Urgent notification sent"
          : "Notification scheduled successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Notification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send notification",
      error: error.message,
    });
  }
};

/* ------------------ GET USER NOTIFICATIONS ------------------ */
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

/* ------------------ MARK NOTIFICATION AS READ ------------------ */
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { status: "read" },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

/* ------------------ DELETE SINGLE NOTIFICATION ------------------ */
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

/* ------------------ CLEAR ALL NOTIFICATIONS ------------------ */
export const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: "All notifications cleared",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to clear notifications",
      error: error.message,
    });
  }
};