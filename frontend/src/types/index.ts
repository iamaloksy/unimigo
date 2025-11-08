export interface University {
  id: string;
  name: string;
  domain: string;
  logoUrl?: string;
  theme?: {
    primaryColor: string;
    accentColor: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  universityId: string;
  department?: string;
  year?: number;
  trustScore: number;
  verifiedBadge: boolean;
  profileImage?: string;
  roommatePreferences?: RoommatePreferences;
  studyPreferences?: StudyPreferences;
}

export interface RoommatePreferences {
  budget?: { min: number; max: number };
  gender?: 'male' | 'female' | 'any';
  cleanliness?: number;
  sleepSchedule?: 'early' | 'moderate' | 'late';
  studyHabits?: 'quiet' | 'moderate' | 'flexible';
  foodType?: 'veg' | 'non-veg' | 'vegan' | 'any';
  smoking?: boolean;
  pets?: boolean;
}

export interface StudyPreferences {
  subjects?: string[];
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  studyTime?: 'morning' | 'afternoon' | 'evening' | 'night';
  learningStyle?: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  communicationStyle?: 'text' | 'voice' | 'video';
  goals?: string[];
}

export interface RoommatePost {
  _id: string;
  authorId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    trustScore: number;
  };
  universityId: string;
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
  images: string[];
  genderPreference: 'male' | 'female' | 'any';
  sharingType: '1BHK' | '2BHK' | '3BHK' | 'shared' | 'single';
  available: boolean;
  contactInfo?: {
    phone?: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RoommateMatch {
  user: User;
  score: number;
  factors: Record<string, number>;
  preferences: RoommatePreferences;
}