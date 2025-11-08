import mongoose, { Schema, Document } from 'mongoose';

export interface IRoommatePost extends Document {
  authorId: mongoose.Types.ObjectId;
  universityId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  rent: number;
  location: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  amenities: string[];
  images: string[]; // base64 encoded images
  genderPreference: 'male' | 'female' | 'any';
  sharingType: '1BHK' | '2BHK' | '3BHK' | 'shared' | 'single';
  available: boolean;
  contactInfo?: {
    phone?: string;
    email?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RoommatePostSchema: Schema = new Schema(
  {
    authorId: {
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
    rent: { type: Number, required: true },
    location: {
      address: { type: String, required: true },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
    },
    amenities: [{ type: String }],
    images: [{ type: String }],
    genderPreference: {
      type: String,
      enum: ['male', 'female', 'any'],
      default: 'any',
    },
    sharingType: {
      type: String,
      enum: ['1BHK', '2BHK', '3BHK', 'shared', 'single'],
      required: true,
    },
    available: { type: Boolean, default: true },
    contactInfo: {
      phone: { type: String },
      email: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IRoommatePost>('RoommatePost', RoommatePostSchema);