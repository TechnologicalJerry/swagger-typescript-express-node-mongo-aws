import { Schema, model, models, Document } from 'mongoose';

export interface UserAttributes {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  gender?: 'male' | 'female' | 'other' | '';
  dob?: Date;
  phone?: string;
  isActive: boolean;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  lastLoginAt?: Date | null;
}

export interface UserDocument extends UserAttributes, Document {
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    userName: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', ''],
      default: '',
    },
    dob: {
      type: Date,
    },
    phone: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        return ret;
      },
    },
  }
);

UserSchema.index({ email: 1 });
UserSchema.index({ userName: 1 });

export const User = models.User || model<UserDocument>('User', UserSchema);

