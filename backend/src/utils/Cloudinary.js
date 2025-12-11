import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

const uploadCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath); //Removed the locally saved file operation get failed
    // console.log("File is uploaded succesfully", response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //Removed the locally saved file operation get failed
    return null;
  }
};
export { uploadCloudinary }
