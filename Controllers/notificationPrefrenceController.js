import NotificationPreference from "../models/Notificationprefrence.js";
export const setNotificationPreference = async (req, res) => {
  try {
    const userId = req.user._id;
    const { frequency, enabled = true } = req.body;

    if (!frequency || !["daily", "weekly", "monthly", "urgent"].includes(frequency)) {
      return res.status(400).json({
        success: false,
        message: "Frequency must be daily, weekly, monthly, or urgent",
      });
    }

    let preference = await NotificationPreference.findOne({ userId, frequency });

    if (preference) {
      preference.enabled = enabled;
      await preference.save();
    } else {
      preference = await NotificationPreference.create({ userId, frequency, enabled });
    }

    res.status(200).json({
      success: true,
      message: "Preference saved successfully",
      data: preference,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save preference",
      error: error.message,
    });
  } 
};
