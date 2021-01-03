"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var router = express_1.default.Router();
//@route    GET api/profile
//@desc     profile route
//@access   public
router.get('/', function (_req, res) { return res.send('profile route'); });
module.exports = router;
