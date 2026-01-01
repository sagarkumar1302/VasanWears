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

// Upload a base64/data URL (data:<mime>;base64,<data>) directly to S3.
export const uploadBase64ToS3 = async (dataUrl, folder = "designs") => {
  if (!dataUrl || typeof dataUrl !== "string") {
    throw new Error("Invalid dataUrl");
  }

  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid data URL format");
  }

  const mime = matches[1];
  const b64 = matches[2];
  const ext = mime.split("/").pop().split("+")[0] || "png";
  const buffer = Buffer.from(b64, "base64");

  const fileName = `${folder}/${crypto.randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: mime,
  });

  await s3.send(command);

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};
