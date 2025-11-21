import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from '../models/Admin';
import connectDB from '../config/database';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await connectDB();

    const email = 'superadmin@unimigo.co';
    const password = 'admin123';
    const name = 'Super Admin';

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log('❌ Super admin already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = new Admin({
      email,
      password: hashedPassword,
      name,
      role: 'super-admin',
    });

    await superAdmin.save();

    console.log('✅ Super admin created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();
