import { Document, model, Model, Schema, Types } from "mongoose";
import { IUser } from "./User";

type ID = Types.ObjectId;

export interface IComment {
  id: ID;
  user: string;
  body: string;
  likes: IUser[];
  date: Date;
}

export interface IPost {
  user: ID | IUser;
  body: string;
  likes: string[];
  comments: IComment[];
  date: Date;
}

export interface IPostDoc extends IPost, Document {}

const postSchemaFields: Record<keyof IPost, any> = {
  user: { type: Types.ObjectId, ref: "user" },
  body: { type: String, required: true },
  likes: { type: Array },
  comments: { type: Array },
  date: { type: Date },
};

const PostSchema = new Schema(postSchemaFields);

const Post: Model<IPostDoc> = model("post", PostSchema);

export default Post;
