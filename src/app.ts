import express, { Application, Request, Response } from "express";
import connectDB from "./config/db";
import config from "config";

const app: Application = express();

const PORT = process.env.port || 5000;

// connect to database
connectDB();
process.env["NODE_CONFIG_DIR"] = __dirname + "/config/";

app.use(express.json());

//define routes
app.use("/api/users", require("./api/users"));
app.use("/api/auth", require("./api/auth"));
app.use("/api/profile", require("./api/profile"));
app.use("/api/posts", require("./api/posts"));

app.get("/", (req: Request, res: Response) => {
  res.send(`API running`);
});

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
