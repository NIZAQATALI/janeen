import NotificationTemplate from "../models/Notificationtemplate.js";
// export const createOrUpdateTemplate = async (req, res) => {
//   try {
//     const { title, message, type } = req.body;
//     if (!title || !message || !type) {
//       return res.status(400).json({
//         success: false,
//         message: "Title, message & type are required",
//       });
//     }
//     const existing = await NotificationTemplate.findOne({ type });
//     let template;
//     if (existing) {
//       existing.title = title;
//       existing.message = message;
//       template = await existing.save();
//     } else {
//       template = await NotificationTemplate.create({ title, message, type });
//     }
//     res.status(200).json({
//       success: true,
//       message: `Template for ${type} saved successfully`,
//       data: template,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to save template",
//       error: error.message,
//     });
//   }
// };
export const createOrUpdateTemplate = async (req, res) => {
  try {
    const { title, message, type, category, stageType, stageValue } = req.body;

    if (!title || !message || !type || !category || !stageType || !stageValue) {
      return res.status(400).json({
        success: false,
        message: "All fields (title, message, type, category, stageType, stageValue) are required",
      });
    }

    const existing = await NotificationTemplate.findOne({
      category,
      type,
      stageType,
      stageValue,
    });

    let template;

    if (existing) {
      existing.title = title;
      existing.message = message;
      template = await existing.save();
    } else {
      template = await NotificationTemplate.create({
        title,
        message,
        type,
        category,
        stageType,
        stageValue,
      });
    }

    res.status(200).json({
      success: true,
      message: `Template saved for ${category} - ${type}`,
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



export const getAllTemplates = async (req, res) => {
  try {
    const templates = await NotificationTemplate.find({});
    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch templates",
      error: error.message,
    });
  }
};


export const getSingleTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await NotificationTemplate.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch template",
      error: error.message,
    });
  }
};


export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await NotificationTemplate.findByIdAndDelete(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not delete template",
      error: error.message,
    });
  }
};