import "dotenv/config";
import Replicate from "replicate";
import fs from "node:fs";
import { uploadFile } from "../../src/utils/upload-file";

export const nodeGenerateImage = async (
  prompt: string,
  imageModel:
    | "google/imagen-4-fast"
    | "google/nano-banana"
    | "nvidia/sana-sprint-1.6b:038aee6907b53a5c148780983e39a50ce7cd0747b4e2642e78387f48cf36039a",
  aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "2:3" | "3:2",
  workflowId?: string,
  image_input?: string[]
): Promise<{
  url: string;
  fileName: string;
}> => {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  const input: any = {
    prompt: prompt,
  };

  if (aspectRatio) {
    input.aspect_ratio = aspectRatio;
  }

  if (image_input) {
    input.image_input = image_input;
  }

  const output = await replicate.run(imageModel, { input });
  console.log("Image output type:", typeof output, output);

  // Convert ReadableStream to Buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of output as any) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  const fileName = `image-${workflowId}-${imageModel.split("/")[1].substring(0, 4)}-${new Date().toISOString().substring(0, 10)}.png`;

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
