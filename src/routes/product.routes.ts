import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createProductValidation,
  updateProductValidation,
  getProductValidation,
} from '../validations/product.validation';

const router = Router();

router.post('/', authenticate, validate(createProductValidation), productController.createProduct.bind(productController));
router.get('/', productController.getAllProducts.bind(productController));
router.get('/my-products', authenticate, productController.getMyProducts.bind(productController));
router.get('/:id', validate(getProductValidation), productController.getProductById.bind(productController));
router.put(
  '/:id',
  authenticate,
  validate([...getProductValidation, ...updateProductValidation]),
  productController.updateProduct.bind(productController)
);
router.delete(
  '/:id',
  authenticate,
  validate(getProductValidation),
  productController.deleteProduct.bind(productController)
);

export default router;

