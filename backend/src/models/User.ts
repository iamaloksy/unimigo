import mongoose, { Schema, Document } from 'mongoose';

export interface IRoommatePreferences {
  budget?: { min: number; max: number };
  gender?: 'male' | 'female' | 'any';
  cleanliness?: number; // 1-5
  sleepSchedule?: 'early' | 'moderate' | 'late';
  studyHabits?: 'quiet' | 'moderate' | 'flexible';
  foodType?: 'veg' | 'non-veg' | 'vegan' | 'any';
  smoking?: boolean;
  pets?: boolean;
}

export interface IStudyPreferences {
  subjects?: string[];
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  studyTime?: 'morning' | 'afternoon' | 'evening' | 'night';
  learningStyle?: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  communicationStyle?: 'text' | 'voice' | 'video';
  goals?: string[];
}

export interface IUser extends Document {
  name: string;
  email: string;
  universityId: mongoose.Types.ObjectId;
  department?: string;
  year?: number;
  trustScore: number;
  verifiedBadge: boolean;
  roommatePreferences?: IRoommatePreferences;
  studyPreferences?: IStudyPreferences;
  profileImage?: string;
  firebaseUid?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    universityId: {
      type: Schema.Types.ObjectId,
      ref: 'University',
      required: true,
    },
    department: { type: String },
    year: { type: Number },
    trustScore: { type: Number, default: 50, min: 0, max: 100 },
    verifiedBadge: { type: Boolean, default: false },
    roommatePreferences: {
      budget: {
        min: { type: Number },
        max: { type: Number },
      },
      gender: { type: String, enum: ['male', 'female', 'any'] },
      cleanliness: { type: Number, min: 1, max: 5 },
      sleepSchedule: { type: String, enum: ['early', 'moderate', 'late'] },
      studyHabits: { type: String, enum: ['quiet', 'moderate', 'flexible'] },
      foodType: { type: String, enum: ['veg', 'non-veg', 'vegan', 'any'] },
      smoking: { type: Boolean },
      pets: { type: Boolean },
    },
    studyPreferences: {
      subjects: [{ type: String }],
      skillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
      studyTime: { type: String, enum: ['morning', 'afternoon', 'evening', 'night'] },
      learningStyle: { type: String, enum: ['visual', 'auditory', 'reading', 'kinesthetic'] },
      communicationStyle: { type: String, enum: ['text', 'voice', 'video'] },
      goals: [{ type: String }],
    },
    profileImage: { type: String },
    firebaseUid: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);