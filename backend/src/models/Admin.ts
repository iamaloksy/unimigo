import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  email: string;
  password: string;
  name: string;
  role: 'super-admin' | 'university-admin';
  universityId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const AdminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['super-admin', 'university-admin'], required: true },
  universityId: { type: Schema.Types.ObjectId, ref: 'University' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IAdmin>('Admin', AdminSchema);
