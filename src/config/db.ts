process.env["NODE_CONFIG_DIR"] = __dirname;
import config from "config";
import mongoose from "mongoose";

const db: string = config.get("mongoURI");

function connectDB() {
  mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
  console.log("succesfully connected to database");
}

export default connectDB;
