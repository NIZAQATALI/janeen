import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  togglePublishBlog,
} from "../Controllers/blogController.js";
import {upload} from "../MiddleWares/multer.middleware.js"; 
import { verifyAdmin ,verifyJWT} from "../utils/verifyToken.js";
const router = express.Router();
router.post("/create", upload.single("thumbnail"), createBlog);
router.get("/", getAllBlogs);
router.get("/:slug", verifyJWT,getBlogBySlug);
router.put("/update/:id", updateBlog);
router.delete("/delete/:id", deleteBlog);
router.patch("/publish/:id", togglePublishBlog);

export default router;
