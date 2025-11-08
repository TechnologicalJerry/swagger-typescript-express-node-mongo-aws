import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { logger } from '../config/logger';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        email,
        password,
        confirmPassword,
        firstName,
        lastName,
        userName,
        gender,
        dob,
        phone,
      } = req.body;

      if (password !== confirmPassword) {
        sendError(res, 'Passwords do not match', 400);
        return;
      }

      const result = await userService.register({
        email,
        password,
        firstName,
        lastName,
        userName,
        gender,
        dob,
        phone,
      });

      sendSuccess(res, { user: result.user, token: result.token }, 'User registered successfully', 201);
    } catch (error) {
      logger.error('Register error', error);
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await userService.login({ email, password });

      sendSuccess(res, { user: result.user, token: result.token }, 'Login successful');
    } catch (error) {
      logger.error('Login error', error);
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      const user = await userService.getUserById(req.user.userId);
      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }

      sendSuccess(res, user, 'Profile retrieved successfully');
    } catch (error) {
      logger.error('Get profile error', error);
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      const { resetToken } = await userService.requestPasswordReset({ email });

      const responseData =
        resetToken.length > 0
          ? {
              resetToken,
              message: 'Use the provided token to reset the password.',
            }
          : {
              message: 'If an account exists for the provided email, a reset token has been generated.',
            };

      sendSuccess(res, responseData, 'Password reset requested');
    } catch (error) {
      logger.error('Forgot password error', error);
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        sendError(res, 'Passwords do not match', 400);
        return;
      }

      await userService.resetPassword({ token, password });

      sendSuccess(res, null, 'Password reset successfully');
    } catch (error) {
      logger.error('Reset password error', error);
      next(error);
    }
  }
}

export const authController = new AuthController();

