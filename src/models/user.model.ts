import { Schema, model, models, Document, Model } from 'mongoose';

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
        const retObj = ret as Record<string, unknown> & { [key: string]: any };
        retObj.id = retObj._id?.toString();
        delete retObj._id;
        delete retObj.__v;
        delete retObj.password;
        delete retObj.passwordResetToken;
        delete retObj.passwordResetExpires;
        return retObj;
      },
    },
  }
);

// Remove duplicate indexes since unique: true already creates indexes
// UserSchema.index({ email: 1 }); // Removed - duplicate of unique: true
// UserSchema.index({ userName: 1 }); // Removed - duplicate of unique: true

export const User: Model<UserDocument> =
  (models.User as Model<UserDocument>) || model<UserDocument>('User', UserSchema);

