"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var config_1 = __importDefault(require("config"));
// export interface RequestCustom extends Request {
//   user?: {
//     id: string;
//   };
// }
function auth(req, res, next) {
    var token = req.header("x-auth-token");
    if (!token) {
        res.status(401).send({ msg: "No token, authorization denied" });
    }
    else {
        try {
            var decodedToken = jsonwebtoken_1.default.verify(token, config_1.default.get("secret"));
            res.user = decodedToken.user;
            next();
        }
        catch (error) {
            console.error(error.message);
            res.status(401).send({ msg: "Token not valid" });
        }
    }
}
exports.default = auth;
