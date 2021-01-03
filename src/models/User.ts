import { model, Schema, Model, Document, Mongoose } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  date: Date;
}

const userSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const User: Model<IUser> = model("user", userSchema);

export default User;
