import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { logger } from '../config/logger';

const parsePositiveNumber = (value: unknown, defaultValue: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return defaultValue;
  }
  return parsed;
};

const parseNonNegativeInteger = (value: unknown, defaultValue: number): number => {
  const parsed = parsePositiveNumber(value, defaultValue);
  return Math.floor(parsed);
};

export class ProductController {
  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      const { name, description, price, stock, imageUrl } = req.body;

      const productData: any = {
        name,
        description,
        price: parsePositiveNumber(price, 0),
        imageUrl,
        userId: req.user.userId,
      };

      if (stock !== undefined) {
        productData.stock = parseNonNegativeInteger(stock, 0);
      }

      const product = await productService.createProduct(productData);

      sendSuccess(res, product.toJSON(), 'Product created successfully', 201);
    } catch (error) {
      logger.error('Create product error', error);
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;

      if (!idStr) {
        sendError(res, 'Product ID is required', 400);
        return;
      }

      const product = await productService.getProductById(idStr);
      if (!product) {
        sendError(res, 'Product not found', 404);
        return;
      }

      sendSuccess(res, product.toJSON(), 'Product retrieved successfully');
    } catch (error) {
      logger.error('Get product error', error);
      next(error);
    }
  }

  async getAllProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.max(1, parseNonNegativeInteger(req.query.limit, 10));
      const offset = parseNonNegativeInteger(req.query.offset, 0);

      const result = await productService.getAllProducts(limit, offset);

      sendSuccess(
        res,
        {
          products: result.products.map((product) => product.toJSON()),
          total: result.total,
          limit: result.limit,
          offset: result.offset,
        },
        'Products retrieved successfully'
      );
    } catch (error) {
      logger.error('Get all products error', error);
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;
      if (!idStr) {
        sendError(res, 'Product ID is required', 400);
        return;
      }

      const { name, description, price, stock, imageUrl } = req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = parsePositiveNumber(price, 0);
      if (stock !== undefined) updateData.stock = parseNonNegativeInteger(stock, 0);
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

      const product = await productService.updateProduct(
        idStr,
        updateData,
        req.user.userId
      );

      sendSuccess(res, product.toJSON(), 'Product updated successfully');
    } catch (error) {
      logger.error('Update product error', error);
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;
      if (!idStr) {
        sendError(res, 'Product ID is required', 400);
        return;
      }

      await productService.deleteProduct(idStr, req.user.userId);
      sendSuccess(res, null, 'Product deleted successfully');
    } catch (error) {
      logger.error('Delete product error', error);
      next(error);
    }
  }

  async getMyProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      const products = await productService.getProductsByUserId(req.user.userId);
      sendSuccess(
        res,
        products.map((product) => product.toJSON()),
        'Products retrieved successfully'
      );
    } catch (error) {
      logger.error('Get my products error', error);
      next(error);
    }
  }
}

export const productController = new ProductController();

