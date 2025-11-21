import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  siteName: string;
  siteUrl: string;
  supportEmail: string;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  enableNotifications: boolean;
  maintenanceMode: boolean;
  maxUploadSize: number;
  sessionTimeout: number;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>({
  siteName: { type: String, default: 'UNIMIGO' },
  siteUrl: { type: String, default: 'https://unimigo.co' },
  supportEmail: { type: String, default: 'support@unimigo.co' },
  allowRegistration: { type: Boolean, default: true },
  requireEmailVerification: { type: Boolean, default: true },
  enableNotifications: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false },
  maxUploadSize: { type: Number, default: 10 },
  sessionTimeout: { type: Number, default: 7 },
}, { timestamps: true });

export default mongoose.model<ISettings>('Settings', SettingsSchema);
