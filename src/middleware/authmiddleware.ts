import jwt from "jsonwebtoken";
import config from "config";
import { Request, Response, NextFunction } from "express";

// export interface RequestCustom extends Request {
//   user?: {
//     id: string;
//   };
// }

function auth(req: Request, res: Response, next: NextFunction) {
  interface TokenInterface {
    user: {
      id: string;
    };
  }

  const token = req.header("x-auth-token");

  if (!token) {
    res.status(401).send({ msg: "No token, authorization denied" });
  } else {
    try {
      const decodedToken = jwt.verify(token, config.get("secret"));
      req.user = (decodedToken as TokenInterface).user;
      next();
    } catch (error) {
      console.error(error.message);
      res.status(401).send({ msg: "Token not valid" });
    }
  }
}

export default auth;
