import express, { Request, Response } from "express";
import auth from "../middleware/authmiddleware";
import User from "../models/User";
import { check, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "config";

const router = express.Router();

// @route   GET api/auth
// @desc    get authenticated user data
// @access  protected
// router.get("/", auth, async (req: Request, res: Response) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password");
//     res.send(user);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send({ msg: "Server error" });
//   }
// });

// @route   POST api/auth
// @desc    login user and get token
// @access  public
router.post(
  "/",
  [
    check("email").isEmail().withMessage("please enter a valid email"),
    check("password").notEmpty().withMessage("please enter your password"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        res.status(400).send({ msg: "Invalid credentials" });
      } else {
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          res.status(400).send({ msg: "Invalid credentials" });
        }
        let payload = {
          user: {
            id: user.id,
          },
        };

        jwt.sign(
          payload,
          config.get("secret"),
          { expiresIn: 3600 },
          (err, token) => {
            if (err) {
              throw err;
            } else {
              res.send({ token });
            }
          }
        );
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send({ msg: "server error" });
    }
  }
);

module.exports = router;
