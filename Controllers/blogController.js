import Blog from "../models/Blog.js";
import User from "../models/User.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createBlog = async (req, res) => {
  try {
    const { title, content, category, authorId } = req.body;

    const file = req.file?.path; 
    let thumbnailUrl = null;

    if (!authorId) {
      return res.status(400).json({
        success: false,
        message: "Author ID is required.",
      });
    }

    // Check if the author exists
    const author = await User.findById(authorId);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author not found.",
      });
    }

    // Upload thumbnail to Cloudinary
    if (file) {
      const cloudinaryResponse = await uploadOnCloudinary(file, "blogs");

      if (cloudinaryResponse) {
        thumbnailUrl = cloudinaryResponse.secure_url;
      } else {
        return res.status(500).json({
          success: false,
          message: "Thumbnail upload to Cloudinary failed.",
        });
      }
    }

    // Create blog
    const newBlog = await Blog.create({
      title,
      content,
      category,
      author: authorId,
      thumbnail: thumbnailUrl, // null if no file
    });

    return res.status(201).json({
      success: true,
      message: "Blog created successfully.",
      data: newBlog,
    });

  } catch (error) {
    console.error("Error creating blog:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create blog.",
      error: error.message,
    });
  }
};
export const getAllBlogs = async (req, res) => {
  try {
    const { category, published } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (published !== undefined) filter.isPublished = published;

    const blogs = await Blog.find(filter)
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching blogs", error: error.message });
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate("author", "name email");

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    blog.views += 1;
    await blog.save();
  if (req.user?.id) {
      await awardPoints({
        userId: req.user.id,
        type: "READ_BLOG",
        metadata: { blogId: blog._id },
      });
    }
    res.status(200).json({
      success: true,
      data: blog,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching blog", error: error.message });
  }
};
export const updateBlog = async (req, res) => {
  try {
    const updated = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update blog", error: error.message });
  }
};
export const deleteBlog = async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete blog", error: error.message });
  }
};
export const togglePublishBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    blog.isPublished = !blog.isPublished;
    await blog.save();

    res.status(200).json({
      success: true,
      message: `Blog ${blog.isPublished ? "published" : "unpublished"} successfully`,
      data: blog,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update status", error: error.message });
  }
};
