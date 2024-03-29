import express, { Request, Response } from "express";
import auth from "../middleware/authmiddleware";
import Post, { IPostDoc, IComment } from "../models/Post";
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
      const post = (await Post.findOne({
        _id: req.params.postID,
      }).populate("user", ["name"])) as WithUser<
        IPostDoc,
        "user",
        Types.ObjectId
      >;

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

//@route    POST api/posts/like/:postID
//@desc     like a post
//@access   private
router.post("/like/:postID", auth, async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.postID);

    if (post) {
      if (post.likes.includes(req.user.id)) {
        res.status(400).send({ msg: "Post already liked" });
      } else {
        post.likes.unshift(req.user.id);
        await post.save();
        res.send(post.likes);
      }
    } else {
      res.status(404).send({ msg: "Post not found" });
    }
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send({ msg: "Post not found" });
    }
    console.error(err);
    res.status(500).send("Server error");
  }
});

//@route    PUT api/posts/like/:postID
//@desc     unlike a post
//@access   private
router.put("/unlike/:postID", auth, async (req: Request, res: Response) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.postID,
      { $pull: { likes: req.user.id } },
      { returnOriginal: false }
    );

    if (!post) {
      res.status(404).send({ msg: "Pot not found" });
    } else {
      res.send(post);
    }
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send({ msg: "Post not found" });
    }
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//@route    POST api/posts/comment/:postID
//@desc     comment on a post
//@access   private
router.post(
  "/comment/:postID",
  [auth, check("body").notEmpty().withMessage("Comment body required")],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send(errors.array());
    }
    try {
      const { body } = req.body;
      const comment: IComment = {
        id: new Types.ObjectId(),
        user: req.user.id,
        body: body,
        likes: [],
        date: new Date(),
      };

      const post = await Post.findById(req.params.postID);

      if (!post) {
        return res.status(404).send({ msg: "Post not found" });
      } else {
        post.comments.unshift(comment);

        await post.save();
      }

      res.send(post);
    } catch (err) {
      if (err.kind === "ObjectId") {
        return res.status(404).send({ msg: "Post not found" });
      }
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

//@route    DELETE api/posts/comment/:postID/:commentID
//@desc     delete comment
//@access   private
router.delete(
  "/comment/:postID/:commentID",
  auth,
  async (req: Request, res: Response) => {
    try {
      const commentID = Types.ObjectId(req.params.commentID);
      const post = await Post.findByIdAndUpdate(
        req.params.postID,
        {
          $pull: { comments: { user: req.user.id, id: commentID } },
        },
        { returnOriginal: false }
      );

      if (!post) {
        return res.status(404).send({ msg: "Post not found" });
      } else {
        res.send(post);
      }
    } catch (err) {
      if (err.kind === "ObjectId") {
        return res.status(404).send({ msg: "Post not found" });
      }
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
