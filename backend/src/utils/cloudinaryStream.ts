import cloudinary from '../config/cloudinary';
import streamifier from 'streamifier';

export const uploadToCloudinary = (buffer: Buffer, folder: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Extracts public_id from Cloudinary URL and destroys the asset.
 * URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/file.pdf
 */
export const deleteFromCloudinary = async (fileUrl: string): Promise<void> => {
  try {
    // Regex matches /upload/v<version>/<public_id_including_folder_and_ext>
    const regex = /\/upload\/(?:v\d+\/)?([^\.]+)/;
    const match = fileUrl.match(regex);
    if (match && match[1]) {
      const publicId = match[1];
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error(`Failed to delete Cloudinary asset at ${fileUrl}`, error);
  }
};
