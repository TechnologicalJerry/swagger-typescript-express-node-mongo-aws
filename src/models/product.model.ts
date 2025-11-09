import { Schema, model, models, Document, Types, Model } from 'mongoose';

export interface ProductAttributes {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  user: Types.ObjectId;
}

export interface ProductDocument extends ProductAttributes, Document {
  createdAt: Date;
  updatedAt: Date;
}

interface ProductModel extends Model<ProductDocument> {}

const ProductSchema = new Schema<ProductDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ user: 1, createdAt: -1 });

export const Product = (models.Product as ProductModel) || model<ProductDocument, ProductModel>('Product', ProductSchema);

