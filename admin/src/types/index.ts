export interface University {
  _id: string;
  name: string;
  domain: string;
  logoUrl?: string;
  theme?: {
    primaryColor: string;
    accentColor: string;
  };
  adminEmail: string;
  subscriptionStatus: 'active' | 'inactive' | 'trial';
  createdAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  universityId: string | University;
  department?: string;
  year?: number;
  phone?: string;
  bio?: string;
  trustScore: number;
  verifiedBadge: boolean;
  createdAt: string;
}

export interface Post {
  _id: string;
  authorId: string;
  universityId: string;
  category: 'roommate' | 'buy-sell' | 'study-partner' | 'announcement';
  title: string;
  description: string;
  images?: string[];
  status: 'active' | 'flagged' | 'removed' | 'sold';
  createdAt: string;
}

export interface AdminUser {
  _id: string;
  email: string;
  role: 'super-admin' | 'university-admin';
  universityId?: string;
  name: string;
}

export interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalUniversities: number;
  trends?: {
    usersThisWeek: number;
    universitiesThisMonth: number;
    postsToday: number;
  };
}
