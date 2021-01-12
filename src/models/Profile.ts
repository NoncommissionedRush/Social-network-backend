import { model, Document, Model, Schema, Types } from "mongoose";
import { IUser } from "./User";

type ID = Types.ObjectId;

export interface IExperience {
  _id: ID;
  title: string;
  company: string;
  location?: string;
  from: Date;
  to?: Date;
  current?: boolean;
  description?: string;
}

export interface IProfile {
  user: ID | IUser;
  name?: string;
  status?: string;
  website?: string;
  skills?: string[];
  social?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  experience?: IExperience[];
}

export interface IProfileDoc extends IProfile, Document {}

const profileSchema: Schema = new Schema({
  user: { type: Types.ObjectId, ref: "user" },
  name: { type: String },
  status: { type: String, required: true },
  website: { type: String },
  skills: { type: [String] },
  social: { type: Object },
  experience: { type: Array },
});

const Profile: Model<IProfileDoc> = model("profile", profileSchema);

export default Profile;
