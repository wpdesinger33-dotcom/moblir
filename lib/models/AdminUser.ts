import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdminUser extends Document {
  email: string;
  passwordHash: string;
  securityAnswerHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    email:               { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash:        { type: String, required: true },
    securityAnswerHash:  { type: String, required: true },
  },
  { timestamps: true }
);

export const AdminUserModel: Model<IAdminUser> =
  mongoose.models.AdminUser ??
  mongoose.model<IAdminUser>("AdminUser", AdminUserSchema);
