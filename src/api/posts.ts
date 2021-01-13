import express, { Request, Response } from "express";
import auth from "../middleware/authmiddleware";
import Post, { IPostDoc, IPost } from "../models/Post";
import mongoose, { Types } from "mongoose";
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
      res.status(400).send(errors.array());
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

      await post.populate({ path: "user", select: "name" }).execPopulate();

      res.send(post);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  }
);

//@route    PUT api/posts/post/:postID
//@desc     edit post
//@access   private
router.put(
  "/post/:postID",
  [auth, check("body").notEmpty().withMessage("Post body is required")],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).send(errors.array());
    }

    try {
      type WithUser<obj, key extends keyof obj> = Omit<obj, key> &
        {
          [T in key]: Exclude<obj[T], Types.ObjectId>;
        };

      const post = (await Post.findOne({
        _id: req.params.postID,
      }).populate("user", ["name"])) as WithUser<IPostDoc, "user">;

      if (!post) {
        res.status(404).send({ msg: "No post found" });
      } else {
        if (String(post.user.id) !== req.user.id) {
          res
            .status(401)
            .send({ msg: "User not authorized to edit this post" });
        } else {
          post.body = req.body.body;
          await post.save();

          res.send(post);
        }
      }
    } catch (err) {
      if (err.kind === "ObjectId") {
        return res.status(404).send({ msg: "No post found" });
      }
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

//@route    DELETE api/posts/post/:postID
//@desc     delete post by post ID
//@access   private
router.delete("/post/:postID", auth, async (req: Request, res: Response) => {
  try {
    // const post = await Post.findByIdAndDelete(req.params.postID);
    const post = await Post.findOne({
      _id: req.params.postID,
    });

    if (!post) {
      res.status(404).send({ msg: "No post found" });
    } else {
      if (String(post.user) !== req.user.id) {
        res
          .status(401)
          .send({ msg: "User not authorized to delete this post" });
      } else {
        await post.remove();

        res.send("Post deleted");
      }
    }
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send({ msg: "No post found" });
    }
    console.error(err);
    res.status(500).send("Server error");
  }
});

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
      res.status(404).send({ msg: "No post found" });
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
    const posts = await Post.find({ user: req.params.userID }).sort({
      date: -1,
    });

    if (!posts) {
      res.status(404).send({ msg: "No posts found" });
    } else {
      res.send(posts);
    }
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send({ msg: "No posts found" });
    }
    console.error(err);
    res.status(500).send("Server error");
  }
});

//@route    GET api/posts
//@desc     get all posts
//@access   public
router.get("/", async (req: Request, res: Response) => {
  try {
    const posts = await Post.find({})
      .populate("user", ["name"])
      .sort({ date: -1 });

    res.send(posts);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
