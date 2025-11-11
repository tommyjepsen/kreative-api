import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function uploadFile(
  obj: Buffer,
  fileName: string,
  bucket: string
) {
  const keyFormatted = `${fileName}`;

  const s3 = new S3Client({
    region: "auto", // always "auto" for R2
    endpoint: `https://21fd7b5c5877445dd1783f5e1fd75da2.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: "8b9c63276d11e04401b47807fb0c7609",
      secretAccessKey:
        "8088005e435b1cb16f150bd556a0d6d89ed8db97a0d66fd0a5253799efef6394",
    },
  });

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: keyFormatted,
    Body: obj,
    ContentType: "image/png",
  });

  try {
    await s3.send(command);
  } catch (err) {
    console.error("❌ Upload error:", err);
  }
}
