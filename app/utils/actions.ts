'use server'

import { auth } from "@clerk/nextjs/server"
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createClient } from "@/utils/supabase/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const generateFileName = (bytes = 32) => {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return [...array].map(b => b.toString(16).padStart(2, "0")).join("");
}

const acceptedFiles = [
  "application/pdf", "image/png", "image/jpg", "image/jpeg"
]

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!
  }
})

export async function getSignedURL(type: string, size: number, name: string) {
  const { userId } = await auth();
  if (!userId) {
    return { failure: "User is not autheticated" }
  }

  if (!acceptedFiles.includes(type)) {
    return { failure: "File type is not allowed. Ensure file is of type (pdf , png , jpg , jpeg)" }
  }

  if (size > MAX_FILE_SIZE) {
    return { failure: `File size exceedes limit of ${MAX_FILE_SIZE}` }
  }

  const key = `${userId}/${generateFileName()}`;
  const putObjcommand = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    ContentType: type,
    ContentLength: size,
    Metadata: {
      userId
    }
  })

  const signedUrl = await getSignedUrl(s3, putObjcommand, {
    expiresIn: 120,
  })

  await createDBRecord(key, type, name);

  return {
    success: {
      url: signedUrl
    }
  }
}

export async function getDownloadUrl(file_key: string) {
  const supabse = await createClient();
  const { userId } = await auth();
  if (!userId) {
    return { failure: "User is not autheticated" }
  }


  const { data: file, error } = await supabse.from('files').select('*').eq('file_key', file_key).maybeSingle();
  if (error) {
    return { failure: "Unable to fetch file from db" }
  }

  if (file.user_id !== userId) {
    return { failure: "Forbidden" }
  }

  const getCommand = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: file.file_key!,
  })

  const signedUrl = await getSignedUrl(s3, getCommand, {
    expiresIn: 120
  });

  return {
    success: {
      url: signedUrl,
      type: file.file_type.split('/')[1]
    }
  }
}

export async function createDBRecord(key: string, file_type: string, name: string) {
  const supabse = await createClient();
  const { userId } = await auth();
  if (!userId) {
    return { failure: "User is not autheticated" }
  }

  const { error } = await supabse.from('files').insert({
    user_id: userId,
    file_key: key,
    file_type,
    name,
  })

  if (error) {
    console.log(error);
    return { failure: "Error occured while creating record" }
  }

  return { success: "record created" }
}
