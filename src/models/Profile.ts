import mongoose, { model, Document, Model, Schema } from "mongoose";
import { IUser } from "./User";

export interface IProfile extends Document {
  user: IUser["_id"];
  name?: string;
  status?: string;
  website?: string;
  skills?: string[];
  social?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  experience?: object[];
}

const profileSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "user" },
  name: { type: String },
  status: { type: String, required: true },
  website: { type: String },
  skills: { type: [String] },
  social: { type: Object },
  experience: { type: [Object] },
});

const Profile: Model<any> = model("profile", profileSchema);

export default Profile;
