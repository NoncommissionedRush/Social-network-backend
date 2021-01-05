import express, { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import User, { IUser } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "config";
const router = express.Router();

// @route   POST api/users
// @desc    register user and get token
// @access  public
router.post(
  "/",
  [
    check("name").notEmpty().withMessage("please enter a name"),
    check("email").isEmail().withMessage("please provide a valid email"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("password must be at least 6 characters")
      .matches(/\d.*\d/)
      .withMessage("must contain at least two numbers"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let { name, email, password } = req.body;

    try {
      let user: IUser | null = await User.findOne({ email });

      if (user) {
        // if the user exist send status and error message with same structure as above
        return res
          .status(400)
          .json({ errors: [{ msg: "User with this email already exists" }] });
      } else {
        // if no user then create a new instance of User
        user = new User({
          name,
          email,
          password,
        });
      }

      const salt = await bcrypt.genSalt(10); // generate salt with bcrypt
      user.password = await bcrypt.hash(password, salt); // hash the password
      await user.save(); // save user object to the database

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
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
