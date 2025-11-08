import mongoose from 'mongoose';
import dotenv from 'dotenv';
import University from './models/University';
import User from './models/User';
import RoommatePost from './models/RoommatePost';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/unimigo';
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    // Clear existing data
    await University.deleteMany({});
    await User.deleteMany({});
    await RoommatePost.deleteMany({});
    console.log('Cleared existing data');

    // Create Universities
    const universities = await University.insertMany([
      {
        name: 'Lovely Professional University',
        domain: 'lpu.in',
        logoUrl: '',
        theme: { primaryColor: '#00B4D8', accentColor: '#FF7A00' },
        adminEmail: 'admin@lpu.in',
        subscriptionStatus: 'active',
      },
      {
        name: 'Vellore Institute of Technology',
        domain: 'vit.ac.in',
        logoUrl: '',
        theme: { primaryColor: '#1E40AF', accentColor: '#F59E0B' },
        adminEmail: 'admin@vit.ac.in',
        subscriptionStatus: 'active',
      },
      {
        name: 'Chandigarh University',
        domain: 'cu.in',
        logoUrl: '',
        theme: { primaryColor: '#7C3AED', accentColor: '#EC4899' },
        adminEmail: 'admin@cu.in',
        subscriptionStatus: 'active',
      },
    ]);
    console.log('Created universities:', universities.length);

    // Create Users for LPU
    const lpuUsers = await User.insertMany([
      {
        name: 'Rahul Kumar',
        email: 'rahul.kumar@lpu.in',
        universityId: universities[0]._id,
        department: 'Computer Science',
        year: 2,
        trustScore: 85,
        verifiedBadge: true,
        roommatePreferences: {
          budget: { min: 5000, max: 10000 },
          gender: 'male',
          cleanliness: 4,
          sleepSchedule: 'moderate',
          studyHabits: 'quiet',
          foodType: 'veg',
          smoking: false,
          pets: false,
        },
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@lpu.in',
        universityId: universities[0]._id,
        department: 'Electronics',
        year: 3,
        trustScore: 92,
        verifiedBadge: true,
        roommatePreferences: {
          budget: { min: 7000, max: 12000 },
          gender: 'female',
          cleanliness: 5,
          sleepSchedule: 'early',
          studyHabits: 'quiet',
          foodType: 'veg',
          smoking: false,
          pets: false,
        },
      },
      {
        name: 'Amit Singh',
        email: 'amit.singh@lpu.in',
        universityId: universities[0]._id,
        department: 'Mechanical',
        year: 1,
        trustScore: 70,
        verifiedBadge: true,
        roommatePreferences: {
          budget: { min: 4000, max: 8000 },
          gender: 'male',
          cleanliness: 3,
          sleepSchedule: 'late',
          studyHabits: 'flexible',
          foodType: 'non-veg',
          smoking: false,
          pets: true,
        },
      },
    ]);
    console.log('Created LPU users:', lpuUsers.length);

    // Create Roommate Posts for LPU
    const roommatePostsData = [
      {
        authorId: lpuUsers[0]._id,
        universityId: universities[0]._id,
        title: '2BHK Near Campus - Male Roommate Needed',
        description: 'Looking for a clean and studious male roommate. Flat is 1km from main campus gate. Has WiFi, washing machine, and furnished rooms.',
        rent: 8000,
        location: {
          address: 'Sector 12, Near LPU Campus, Phagwara',
          coordinates: { latitude: 31.2515, longitude: 75.7050 },
        },
        amenities: ['WiFi', 'Washing Machine', 'Furnished', 'Parking'],
        images: [],
        genderPreference: 'male',
        sharingType: '2BHK',
        available: true,
        contactInfo: { phone: '9876543210', email: 'rahul.kumar@lpu.in' },
      },
      {
        authorId: lpuUsers[1]._id,
        universityId: universities[0]._id,
        title: 'Single Room for Female - Walking Distance to Campus',
        description: 'Spacious single room available for female students. Very close to campus. Safe and secure locality. All amenities included.',
        rent: 12000,
        location: {
          address: 'Vivekananda Colony, Phagwara',
          coordinates: { latitude: 31.2560, longitude: 75.7120 },
        },
        amenities: ['WiFi', 'AC', 'Geyser', 'Security', 'Power Backup'],
        images: [],
        genderPreference: 'female',
        sharingType: 'single',
        available: true,
        contactInfo: { email: 'priya.sharma@lpu.in' },
      },
      {
        authorId: lpuUsers[2]._id,
        universityId: universities[0]._id,
        title: '3BHK Shared - Budget Friendly',
        description: 'Looking for 2 more roommates to share a 3BHK. Budget friendly option. Basic amenities. Good for first year students.',
        rent: 5000,
        location: {
          address: 'Model Town, Phagwara',
          coordinates: { latitude: 31.2480, longitude: 75.7080 },
        },
        amenities: ['WiFi', 'Cooking', 'Basic Furniture'],
        images: [],
        genderPreference: 'male',
        sharingType: '3BHK',
        available: true,
        contactInfo: { phone: '9123456789', email: 'amit.singh@lpu.in' },
      },
    ];

    const roommatePosts = await RoommatePost.insertMany(roommatePostsData);
    console.log('Created roommate posts:', roommatePosts.length);

    console.log('✅ Seed data created successfully!');
    console.log('\nSummary:');
    console.log(`Universities: ${universities.length}`);
    console.log(`Users: ${lpuUsers.length}`);
    console.log(`Roommate Posts: ${roommatePosts.length}`);
    console.log('\nTest Credentials:');
    console.log('Email: rahul.kumar@lpu.in');
    console.log('Email: priya.sharma@lpu.in');
    console.log('Email: amit.singh@lpu.in');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();