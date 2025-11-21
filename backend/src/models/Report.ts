import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  reportedBy: mongoose.Types.ObjectId;
  reportedUser?: mongoose.Types.ObjectId;
  reportedPost?: mongoose.Types.ObjectId;
  universityId: mongoose.Types.ObjectId;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
}

const ReportSchema = new Schema({
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedUser: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reportedPost: {
    type: Schema.Types.ObjectId,
    ref: 'RoommatePost'
  },
  universityId: {
    type: Schema.Types.ObjectId,
    ref: 'University',
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: ['spam', 'inappropriate behavior', 'harassment', 'fake profile', 'scam', 'other']
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'dismissed'],
    default: 'pending'
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Index for faster queries
ReportSchema.index({ universityId: 1, status: 1, createdAt: -1 });

export default mongoose.model<IReport>('Report', ReportSchema);
