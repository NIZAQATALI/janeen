//import { awardPoints } from "../utils/gamification/pointsService.js";
import  {awardPoints}  from "../utils/gamification/pointservice.js";
export const shareOnSocial = async (req, res) => {
  try {
    const userId = req.user.id;
    const { blogId, platform } = req.body;
    if (!blogId || !platform) {
      return res.status(400).json({
        success: false,
        message: "blogId and platform are required",
      });
    }

    await awardPoints({
      userId,
      type: "SHARE_SOCIAL",
      metadata: {
        blogId,
        platform, 
      },
    });

    return res.status(200).json({
      success: true,
      message: "Shared successfully and points awarded",
    });

  } catch (error) {
    console.error("Share error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process share",
    });
  }
};
