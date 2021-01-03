"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = __importDefault(require("config"));
var mongoose_1 = __importDefault(require("mongoose"));
var db = config_1.default.get("mongoURI");
function connectDB() {
    mongoose_1.default.connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    });
    console.log("succesfully connected to database");
}
exports.default = connectDB;
