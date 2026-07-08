import { v2 as cloudinary } from "cloudinary";

export const uploadImageBuffer = (
  buffer,
  folder = "mern_estate/avatars",
  transformation = [
    { width: 512, height: 512, crop: "fill", gravity: "face" },
    { quality: "auto", fetch_format: "auto" },
  ]
) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};
