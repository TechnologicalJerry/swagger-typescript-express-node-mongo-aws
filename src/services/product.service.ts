import { Types } from 'mongoose';
import { Product, ProductDocument } from '../models/product.model';
import { logger } from '../config/logger';

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  imageUrl?: string;
  userId: string;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
}

export interface PaginatedProducts {
  products: ProductDocument[];
  total: number;
  limit: number;
  offset: number;
}

const toObjectId = (id: string): Types.ObjectId => new Types.ObjectId(id);

export class ProductService {
  async createProduct(data: CreateProductData): Promise<ProductDocument> {
    try {
      const product = await Product.create({
        name: data.name.trim(),
        description: data.description?.trim(),
        price: data.price,
        stock: data.stock ?? 0,
        imageUrl: data.imageUrl?.trim(),
        user: toObjectId(data.userId),
      });

      await product.populate('user');

      return product;
    } catch (error) {
      logger.error('Error creating product', error);
      throw error;
    }
  }

  async getProductById(id: string): Promise<ProductDocument | null> {
    try {
      const product = await Product.findById(id).populate('user');
      return product;
    } catch (error) {
      logger.error('Error getting product by ID', error);
      throw error;
    }
  }

  async getAllProducts(limit = 10, offset = 0): Promise<PaginatedProducts> {
    try {
      const [products, total] = await Promise.all([
        Product.find()
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit)
          .populate('user'),
        Product.countDocuments(),
      ]);

      return { products, total, limit, offset };
    } catch (error) {
      logger.error('Error getting all products', error);
      throw error;
    }
  }

  async updateProduct(id: string, data: UpdateProductData, userId: string): Promise<ProductDocument> {
    try {
      const product = await Product.findById(id);
      if (!product) {
        throw Object.assign(new Error('Product not found'), { statusCode: 404 });
      }

      if (product.user.toString() !== userId) {
        throw Object.assign(new Error('Unauthorized: You can only update your own products'), {
          statusCode: 403,
        });
      }

      if (data.name !== undefined) product.name = data.name.trim();
      if (data.description !== undefined) product.description = data.description.trim();
      if (data.price !== undefined) product.price = data.price;
      if (data.stock !== undefined) product.stock = data.stock;
      if (data.imageUrl !== undefined) product.imageUrl = data.imageUrl.trim();

      await product.save();
      await product.populate('user');
      return product;
    } catch (error) {
      logger.error('Error updating product', error);
      throw error;
    }
  }

  async deleteProduct(id: string, userId: string): Promise<void> {
    try {
      const product = await Product.findById(id);
      if (!product) {
        throw Object.assign(new Error('Product not found'), { statusCode: 404 });
      }

      if (product.user.toString() !== userId) {
        throw Object.assign(new Error('Unauthorized: You can only delete your own products'), {
          statusCode: 403,
        });
      }

      await product.deleteOne();
    } catch (error) {
      logger.error('Error deleting product', error);
      throw error;
    }
  }

  async getProductsByUserId(userId: string): Promise<ProductDocument[]> {
    try {
      const products = await Product.find({ user: toObjectId(userId) })
        .sort({ createdAt: -1 })
        .populate('user');
      return products;
    } catch (error) {
      logger.error('Error getting products by user ID', error);
      throw error;
    }
  }
}

export const productService = new ProductService();

