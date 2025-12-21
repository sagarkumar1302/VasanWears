import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./s3.js";
import crypto from "crypto";

export const uploadToS3 = async (file, folder = "categories") => {
  const ext = file.originalname.split(".").pop();

  const fileName = `${folder}/${crypto.randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3.send(command);

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};
