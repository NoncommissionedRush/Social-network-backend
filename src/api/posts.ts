import express, { Request, Response } from "express";
import auth from "../middleware/authmiddleware";
import Post, { IPostDoc } from "../models/Post";
import { Types } from "mongoose";
import { check, validationResult } from "express-validator";
const router = express.Router();

//@route    POST api/posts
//@desc     add new post
//@access   private
router.post(
  "/",
  [auth, check("body").notEmpty().withMessage("Post body cannot be empty")],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(500).send(errors.array());
    }

    try {
      const { body } = req.body;

      let post: IPostDoc = new Post({
        user: Types.ObjectId(req.user.id),
        body: body,
        comments: [],
        likes: [],
        date: new Date(),
      });

      await post.save();

      const returnPost = await Post.findById(post.id).populate("user", [
        "name",
      ]);

      res.send(returnPost);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  }
);

//@route    GET api/posts/post/:postID
//@desc     get specific post by post ID
//@access   public
router.get("/post/:postID", async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.postID).populate("user", [
      "name",
    ]);

    if (post) {
      res.send(post);
    } else {
      res.status(400).send({ msg: "No post found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("server error");
  }
});

//@route    GET api/posts/user/:userID
//@desc     get all user posts by user ID
//@access   public
router.get("/user/:userID", async (req: Request, res: Response) => {
  try {
    const posts = await Post.find({ user: req.params.userID });

    if (!posts) {
      res.status(400).send({ msg: "No posts found" });
    } else {
      res.send(posts);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

//@route    GET api/posts
//@desc     get all posts
//@access   public
router.get("/", async (req: Request, res: Response) => {
  try {
    const posts = await Post.find({}).populate("user", ["name"]);

    res.send(posts);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
