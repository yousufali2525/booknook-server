import mongoose, { Schema } from 'mongoose';
export interface IUser {
  name: string;
  email: string;
  password?: string;
  photoUrl?: string;
  role: string;
  authProvider: string;
  createdAt?: Date;
  updatedAt?: Date;
}
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    photoUrl: { type: String, default: '' },
    role: { type: String, default: 'user' },
    authProvider: { type: String, default: 'local' }
  },
  { timestamps: true }
);
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default User;