import NotificationPreference from "../models/Notificationprefrence.js";
import User from "../models/User.js";
import { getUserStage } from "../utils/constant/userStage.js";
// export const setNotificationPreference = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { frequency, enabled = true } = req.body;

//     if (!frequency || !["daily", "weekly", "monthly", "urgent"].includes(frequency)) {
//       return res.status(400).json({
//         success: false,
//         message: "Frequency must be daily, weekly, monthly, or urgent",
//       });
//     }

//     let preference = await NotificationPreference.findOne({ userId, frequency });

//     if (preference) {
//       preference.enabled = enabled;
//       await preference.save();
//     } else {
//       preference = await NotificationPreference.create({ userId, frequency, enabled });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Preference saved successfully",
//       data: preference,
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to save preference",
//       error: error.message,
//     });
//   } 
// };
export const setNotificationPreference = async (req, res) => {
  try {
    const userId = req.user._id; // from verifyJWT
    const { frequency } = req.body;

    if (!frequency) {
      return res.status(400).json({
        success: false,
        message: "frequency (daily/weekly/monthly) is required",
      });
    }


    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get category + stage dynamically
    const stage = getUserStage(user);

    // Update or Create preference
    const updatedPref = await NotificationPreference.findOneAndUpdate(
      { userId },
      {
        frequency,
        category: stage.category,
        stageType: stage.stageType,
        stageValue: stage.stageValue,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Notification preference updated",
      data: updatedPref,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error setting preference",
      error: error.message,
    });
  }
};