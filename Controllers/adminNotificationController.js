import NotificationTemplate from "../models/Notificationtemplate.js";
export const createOrUpdateTemplate = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    if (!title || !message || !type) {
      return res.status(400).json({
        success: false,
        message: "Title, message & type are required",
      });
    }
    const existing = await NotificationTemplate.findOne({ type });
    let template;
    if (existing) {
      existing.title = title;
      existing.message = message;
      template = await existing.save();
    } else {
      template = await NotificationTemplate.create({ title, message, type });
    }
    res.status(200).json({
      success: true,
      message: `Template for ${type} saved successfully`,
      data: template,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save template",
      error: error.message,
    });
  }
};
