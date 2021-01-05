import express, { Request, Response } from "express";
import auth from "../middleware/authmiddleware";
import Profile, { IProfile } from "../models/Profile";
import { check, validationResult } from "express-validator";
import User from "../models/User";
import mongoose, { Schema } from "mongoose";
const router = express.Router();

//@route    POST api/profile
//@desc     create or update user profile
//@access   private
router.post(
  "/",
  [auth, check("status").notEmpty().withMessage("status is required")],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    try {
      const { status, website, skills, social } = req.body;

      const profileFields: Partial<IProfile> = { user: req.user.id };

      if (status) profileFields.status = status;
      if (website) profileFields.website = website;
      if (skills)
        profileFields.skills = skills
          .split(",")
          .map((skill: string) => skill.trim());
      if (social) profileFields.social = social;

      let profile: IProfile = await Profile.findOne({
        user: req.user.id,
      }).populate("user", ["name"]);

      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.send(profile);
      } else {
        profile = new Profile(profileFields);
        await profile.save();
        return res.send(profile);
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

//@route    GET api/profile
//@desc     get all profiles
//@access   public
router.get("/", async (req: Request, res: Response) => {
  try {
    const profiles: Array<IProfile> = await Profile.find().populate("user");
    res.send(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//@route    GET api/profile/user/userID
//@desc     get user profile
//@access   public
router.get("/user/:userID", async (req: Request, res: Response) => {
  try {
    const user = await Profile.findOne({
      user: req.params.userID,
    }).populate("user", ["name"]);

    if (!user) {
      res.status(400).send({ msg: "profile not found" });
    } else {
      res.send(user);
    }
  } catch (err) {
    console.error(err);
    if (err.kind === "ObjectId") {
      res.send({ msg: "profile not found" });
    }
    res.status(500).send("Server error");
  }
});

//@route    GET api/profile/me
//@desc     get user profile
//@access   private
router.get("/me", auth, async (req: Request, res: Response) => {
  try {
    const user = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name"]);

    if (user) {
      res.send(user);
    } else {
      res.status(400).send({ msg: "this user does not have a profile" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

//@route    DELETE api/profile/me
//@desc     delete user profile
//@access   private
router.delete("/me", auth, async (req: Request, res: Response) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      res.status(400).send({ msg: "Profile not found" });
    } else {
      await Profile.findOneAndDelete({ user: req.user.id });
    }
    await User.findOneAndDelete({ _id: req.user.id });

    res.send({ msg: "User deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//@route    PUT api/profile/experience
//@desc     get user profile
//@access   private
router.put(
  "/experience",
  [
    auth,
    (check("title").notEmpty().withMessage("Title is required"),
    check("company").notEmpty().withMessage("Company is required"),
    check("from").notEmpty().withMessage("From date is required")),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(res);

    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    interface Experience extends mongoose.Document {
      _id: Schema.Types.ObjectId;
      title: string;
      company: string;
      location: string;
      from: Date;
      to: Date;
      current: boolean;
      description: string;
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    }: Experience = req.body;

    const newExp = {
      _id: new mongoose.Types.ObjectId(),
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile: IProfile = await Profile.findOne({ user: req.user.id });

      profile.experience?.unshift(newExp);

      await profile.save();

      res.send(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
