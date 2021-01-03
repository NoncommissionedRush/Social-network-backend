import express, { Request, Response } from "express";
import auth from "../middleware/authmiddleware";
import Profile, { IProfile } from "../models/Profile";
import { check, validationResult } from "express-validator";
const router = express.Router();

//@route    GET api/profile/me
//@desc     get user profile
//@access   protected
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

//@route    POST api/profile
//@desc     create or update user profile
//@access   protected
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

      const profileFields: any = { user: req.user.id };

      if (status) profileFields.status = status;
      if (website) profileFields.website = website;
      if (skills)
        profileFields.skills = skills
          .split(",")
          .map((skill: string) => skill.trim());
      if (social) profileFields.social = social;

      let profile = await Profile.findOne({
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
    const profiles = await Profile.find().populate("user");
    res.send(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

module.exports = router;
