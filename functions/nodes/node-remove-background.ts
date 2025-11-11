import "dotenv/config";
import Replicate from "replicate";
import fs from "node:fs";
import { uploadFile } from "../../src/utils/upload-file";

export const nodeRemoveBackground = async (
  url: string,
  workflowId: string
): Promise<{
  url: string;
  fileName: string;
}> => {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  const input = {
    image: url,
    content_moderation: false,
    preserve_partial_alpha: true,
  };

  const output = await replicate.run("bria/remove-background", { input });
  console.log("rembg output type:", typeof output, output);

  // Convert ReadableStream to Buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of output as any) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  const fileName = `image-remove-bg-${new Date().toISOString()}.png`;

  // Upload to cloud storage
  await uploadFile(buffer, fileName, "kreativ");

  // Save locally for debugging
  fs.writeFileSync(fileName, buffer);

  const outputUrl = `https://pub-a49a634365054c4dacf7727ad2c91eec.r2.dev/${fileName}`;
  console.log("Removed background image URL:", outputUrl);

  return {
    url: outputUrl,
    fileName,
  };
};
