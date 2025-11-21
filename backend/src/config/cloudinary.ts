import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadProfileImage = async (imageBase64: string, userId: string) => {
  try {
    const result = await cloudinary.uploader.upload(imageBase64, {
      folder: 'unimigo/profiles',
      public_id: `user_${userId}`,
      overwrite: true,
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
        { effect: 'bgremoval' }, // Remove background
      ],
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export default cloudinary;
