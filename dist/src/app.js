"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var db_1 = __importDefault(require("../config/db"));
var app = express_1.default();
var PORT = process.env.port || 5000;
// connect to database
db_1.default();
app.use(express_1.default.json());
//define routes
app.use("/api/users", require("./api/users"));
app.use("/api/auth", require("./api/auth"));
app.use("/api/profile", require("./api/profile"));
app.use("/api/posts", require("./api/posts"));
app.get("/", function (req, res) {
    res.send("API running");
});
app.listen(PORT, function () {
    console.log("server running on port " + PORT);
});
