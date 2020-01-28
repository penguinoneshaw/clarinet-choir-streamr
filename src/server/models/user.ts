import { model, Schema, Document } from 'mongoose';
import bCrypt from 'bcryptjs';

const userSchema = new Schema({
  username: { type: String, index: true },
  password: String,
  admin: Boolean
});

export interface UserType extends Document {
  username: string;
  password: string;
  admin: boolean;
}

export const isValidPassword = (user: UserType, password: string): boolean => {
  return bCrypt.compareSync(password, user.password);
};

export const hashPassword = (password: string): string => {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10));
};

export const User = model<UserType>('User', userSchema);
