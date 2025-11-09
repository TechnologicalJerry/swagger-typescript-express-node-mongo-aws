import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '../validations/auth.validation';

const router = Router();

router.post('/register', validate(registerValidation), authController.register.bind(authController));

router.post('/login', validate(loginValidation), authController.login.bind(authController));

router.post('/forgot-password', validate(forgotPasswordValidation), authController.forgotPassword.bind(authController));

router.post('/reset-password', validate(resetPasswordValidation), authController.resetPassword.bind(authController));

router.get('/profile', authenticate, authController.getProfile.bind(authController));

router.post('/logout', authenticate, authController.logout.bind(authController));

export default router;

