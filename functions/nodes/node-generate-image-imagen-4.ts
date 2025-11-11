import "dotenv/config";
import Replicate from "replicate";
import fs from "node:fs";
import { uploadFile } from "../../src/utils/upload-file";

export const nodeGenerateImageImagen4 = async (
  prompt: string,
  workflowId: string
): Promise<{
  url: string;
  fileName: string;
}> => {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  const input = {
    prompt: prompt,
    aspect_ratio: "16:9",
  };

  const output = await replicate.run("google/imagen-4-fast", { input });
  console.log("imagen-4 output type:", typeof output, output);

  // Convert ReadableStream to Buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of output as any) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  const fileName = `imagen-4-image-${new Date().toISOString()}.png`;

  // Upload to cloud storage
  await uploadFile(buffer, fileName, "kreativ");

  // Save locally for debugging
  fs.writeFileSync(fileName, buffer);

  const outputUrl = `https://pub-a49a634365054c4dacf7727ad2c91eec.r2.dev/${fileName}`;
  console.log("Imagen 4 image URL:", outputUrl);

  return {
    url: outputUrl,
    fileName,
  };
};
