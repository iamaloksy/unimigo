import mongoose, { Schema, Document } from 'mongoose';

export interface IUniversity extends Document {
  name: string;
  domain: string;
  logoUrl?: string;
  theme?: {
    primaryColor: string;
    accentColor: string;
  };
  adminEmail: string;
  subscriptionStatus: 'active' | 'inactive' | 'trial';
  subscriptionExpiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UniversitySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    domain: { type: String, required: true, unique: true },
    logoUrl: { type: String },
    theme: {
      primaryColor: { type: String, default: '#00B4D8' },
      accentColor: { type: String, default: '#FF7A00' },
    },
    adminEmail: { type: String, required: true },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'inactive', 'trial'],
      default: 'active',
    },
    subscriptionExpiryDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IUniversity>('University', UniversitySchema);