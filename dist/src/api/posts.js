"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var router = express_1.default.Router();
//@route    GET api/posts
//@desc     posts route
//@access   public
router.get('/', function (_req, res) { return res.send('posts route'); });
module.exports = router;
