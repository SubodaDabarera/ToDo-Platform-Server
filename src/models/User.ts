import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  googleId: string;
  displayName: string;
  email: string;
  accessToken: string;
}

const UserSchema = new Schema<IUser>({
  googleId: { type: String, required: true },
  displayName: String,
  email: String,
  accessToken: String,
});

export default model<IUser>("User", UserSchema);
