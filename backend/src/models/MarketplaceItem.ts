import mongoose, { Schema, Document } from 'mongoose';

export interface IMarketplaceItem extends Document {
  sellerId: mongoose.Types.ObjectId;
  universityId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  category: 'electronics' | 'books' | 'furniture' | 'clothing' | 'sports' | 'other';
  condition: 'new' | 'like-new' | 'good' | 'fair';
  images: string[]; // base64 encoded images or URLs
  contactInfo: {
    phone?: string;
    email?: string;
  };
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MarketplaceItemSchema: Schema = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    universityId: {
      type: Schema.Types.ObjectId,
      ref: 'University',
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ['electronics', 'books', 'furniture', 'clothing', 'sports', 'other'],
      required: true,
    },
    condition: {
      type: String,
      enum: ['new', 'like-new', 'good', 'fair'],
      required: true,
    },
    images: [{ type: String }],
    contactInfo: {
      phone: { type: String },
      email: { type: String },
    },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IMarketplaceItem>('MarketplaceItem', MarketplaceItemSchema);
