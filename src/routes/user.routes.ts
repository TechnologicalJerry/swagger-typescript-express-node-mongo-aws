import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateUserValidation, getUserValidation } from '../validations/user.validation';

const router = Router();

router.get('/:id', validate(getUserValidation), userController.getUserById.bind(userController));
router.put('/', authenticate, validate(updateUserValidation), userController.updateUser.bind(userController));
router.delete('/', authenticate, userController.deleteUser.bind(userController));

export default router;

