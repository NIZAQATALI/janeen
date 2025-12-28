import Badge from "../models/Badge.js";


export const createBadge = async (req, res) => {
  try {
    const { name, description, iconUrl, points } = req.body;
    if (!name || !description || !iconUrl || points === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const badge = await Badge.create({ name, description, iconUrl:iconUrl, points:points });
    return res.status(201).json(badge);
  } catch (error) {
    console.error("Error creating badge:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get all badges
export const getBadges = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const badges = await Badge.find()
      .skip(parseInt(offset))
      .limit(parseInt(limit));
    return res.json(badges);
  } catch (error) {
    console.error("Error fetching badges:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get single badge
export const getBadgeById = async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id);
    if (!badge) {
      return res.status(404).json({ message: "Badge not found" });
    }
    return res.json(badge);
  } catch (error) {
    console.error("Error fetching badge:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update badge
export const updateBadge = async (req, res) => {
  try {
    const { name, description, iconUrl, points } = req.body;
    const badge = await Badge.findById(req.params.id);
    if (!badge) {
      return res.status(404).json({ message: "Badge not found" });
    }

    badge.name = name ?? badge.name;
    badge.description = description ?? badge.description;
    badge.iconUrl = iconUrl ?? badge.iconUrl;
    badge.points = points ?? badge.points;

    const updatedBadge = await badge.save();
    return res.json(updatedBadge);
  } catch (error) {
    console.error("Error updating badge:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete badge
export const deleteBadge = async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id);
    if (!badge) {
      return res.status(404).json({ message: "Badge not found" });
    }
    await badge.remove();
    return res.json({ message: "Badge deleted successfully" });
  } catch (error) {
    console.error("Error deleting badge:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
