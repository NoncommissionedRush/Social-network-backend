"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var authmiddleware_1 = __importDefault(require("../middleware/authmiddleware"));
var router = express_1.default.Router();
// @route   GET api/auth
// @desc    auth route
// @access  protected
router.get("/", authmiddleware_1.default, function (_req, res) { return res.send("auth route"); });
module.exports = router;
