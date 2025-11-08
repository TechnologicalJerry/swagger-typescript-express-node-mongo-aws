import crypto from 'crypto';
import { FilterQuery } from 'mongoose';
import { User, UserDocument, UserAttributes } from '../models/user.model';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateToken } from '../utils/jwt.util';
import { logger } from '../config/logger';
import { env } from '../config/env';

export interface RegisterUserData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  gender?: 'male' | 'female' | 'other' | '';
  dob?: Date | string;
  phone?: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  userName?: string;
  gender?: 'male' | 'female' | 'other' | '';
  dob?: Date | string;
  phone?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export type PublicUser = Omit<
  UserAttributes,
  'password' | 'passwordResetToken' | 'passwordResetExpires'
> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

const sanitiseUser = (user: UserDocument): PublicUser => {
  const json = user.toJSON() as unknown as PublicUser;
  return json;
};

const buildUserFilterByToken = (hashedToken: string): FilterQuery<UserDocument> => ({
  passwordResetToken: hashedToken,
  passwordResetExpires: { $gt: new Date() },
});

export class UserService {
  async register(data: RegisterUserData): Promise<{ user: PublicUser; token: string }> {
    try {
      const email = data.email.trim().toLowerCase();
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw Object.assign(new Error('User with this email already exists'), { statusCode: 409 });
      }

      if (data.userName) {
        const existingUserName = await User.findOne({
          userName: data.userName.trim(),
        });
        if (existingUserName) {
          throw Object.assign(new Error('Username already taken'), { statusCode: 409 });
        }
      }

      const hashedPassword = await hashPassword(data.password);

      const user = await User.create({
        email,
        password: hashedPassword,
        firstName: data.firstName?.trim(),
        lastName: data.lastName?.trim(),
        userName: data.userName?.trim(),
        gender: data.gender,
        dob: data.dob ? new Date(data.dob) : undefined,
        phone: data.phone?.trim(),
        isActive: true,
      });

      const token = generateToken({ userId: user.id, email: user.email });
      return { user: sanitiseUser(user), token };
    } catch (error) {
      logger.error('Error registering user', error);
      throw error;
    }
  }

  async login(data: LoginUserData): Promise<{ user: PublicUser; token: string }> {
    try {
      const email = data.email.trim().toLowerCase();
      const user = await User.findOne({ email });
      if (!user) {
        throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
      }

      if (!user.isActive) {
        throw Object.assign(new Error('Account is deactivated'), { statusCode: 403 });
      }

      const isPasswordValid = await comparePassword(data.password, user.password);
      if (!isPasswordValid) {
        throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
      }

      user.lastLoginAt = new Date();
      await user.save();

      const token = generateToken({ userId: user.id, email: user.email });
      return { user: sanitiseUser(user), token };
    } catch (error) {
      logger.error('Error logging in user', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<PublicUser | null> {
    try {
      const user = await User.findById(id);
      return user ? sanitiseUser(user) : null;
    } catch (error) {
      logger.error('Error getting user by ID', error);
      throw error;
    }
  }

  async updateUser(id: string, data: UpdateUserData): Promise<PublicUser> {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw Object.assign(new Error('User not found'), { statusCode: 404 });
      }

      if (data.email && data.email.trim().toLowerCase() !== user.email) {
        const existingEmail = await User.findOne({ email: data.email.trim().toLowerCase() });
        if (existingEmail) {
          throw Object.assign(new Error('Email is already in use'), { statusCode: 409 });
        }
        user.email = data.email.trim().toLowerCase();
      }

      if (data.userName && data.userName.trim() !== user.userName) {
        const existingUserName = await User.findOne({ userName: data.userName.trim() });
        if (existingUserName) {
          throw Object.assign(new Error('Username already taken'), { statusCode: 409 });
        }
        user.userName = data.userName.trim();
      }

      if (data.firstName !== undefined) user.firstName = data.firstName.trim();
      if (data.lastName !== undefined) user.lastName = data.lastName.trim();
      if (data.gender !== undefined) user.gender = data.gender;
      if (data.dob !== undefined) user.dob = data.dob ? new Date(data.dob) : undefined;
      if (data.phone !== undefined) user.phone = data.phone.trim();

      await user.save();

      return sanitiseUser(user);
    } catch (error) {
      logger.error('Error updating user', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        throw Object.assign(new Error('User not found'), { statusCode: 404 });
      }
    } catch (error) {
      logger.error('Error deleting user', error);
      throw error;
    }
  }

  async requestPasswordReset(data: ForgotPasswordData): Promise<{ resetToken: string }> {
    try {
      const email = data.email.trim().toLowerCase();
      const user = await User.findOne({ email });

      if (!user) {
        logger.warn('Password reset requested for non-existent email', { email });
        // Prevent user enumeration
        return { resetToken: '' };
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      const expires = new Date(Date.now() + env.PASSWORD_RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000);

      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = expires;
      await user.save();

      return { resetToken };
    } catch (error) {
      logger.error('Error requesting password reset', error);
      throw error;
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    try {
      const hashedToken = crypto.createHash('sha256').update(data.token).digest('hex');
      const user = await User.findOne(buildUserFilterByToken(hashedToken));

      if (!user) {
        throw Object.assign(new Error('Password reset token is invalid or has expired'), {
          statusCode: 400,
        });
      }

      user.password = await hashPassword(data.password);
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();
    } catch (error) {
      logger.error('Error resetting password', error);
      throw error;
    }
  }
}

export const userService = new UserService();

