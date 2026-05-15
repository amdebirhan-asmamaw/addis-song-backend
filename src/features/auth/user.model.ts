import mongoose, { Document, Schema } from "mongoose";

export interface IUser {
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDoc = Document & IUser;

const userSchema = new Schema<UserDoc>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model<UserDoc>("User", userSchema);
