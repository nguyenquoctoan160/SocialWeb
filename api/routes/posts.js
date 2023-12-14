import express from "express";
import {
  getPosts,
  addPost,
  deletePost,
  searchPostsbyContentController,
  searchPostsbyHashtagController,
  updatePost,
  getPostByIdController,
  sharePostController,
  updateSharedPostController,
  updatePrivatePostController,
  addListPostPrivateController,
  getListPrivatePostController,
  addVideoPostController,
  getVideoFromPostController,
} from "../controllers/post.js";

const router = express.Router();
router.post("/share", sharePostController);
router.put("/share", updateSharedPostController);
router.put("/private/:postId", updatePrivatePostController);
router.post("/privatelist/:postId", addListPostPrivateController);
router.post("/private/:postId", getListPrivatePostController);
router.get("/", getPosts);
router.post("/post", addPost);
router.delete("/:postId", deletePost);
router.post("/content", searchPostsbyContentController);
router.post("/hashtag", searchPostsbyHashtagController);
router.put("/update/:postId", updatePost);
router.get("/post/:postId", getPostByIdController);
router.post("/videopost", addVideoPostController);
router.get("/videopost/:postId", getVideoFromPostController);
export default router;
