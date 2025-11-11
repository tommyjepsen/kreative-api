//
import { GoogleGenAI, Modality } from "@google/genai";
import fs from "node:fs";
import { uploadFile } from "../../src/utils/upload-file";

export const nodeGenerateImage = async (
  prompt: string,
  workflowId: string
): Promise<{
  url: string;
  fileName: string;
}> => {
  // The client gets the API key from the environment variable `GEMINI_API_KEY`.
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: prompt,
  });

  for (const part of response?.candidates?.[0]?.content?.parts ?? []) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data ?? "";
      const buffer = Buffer.from(imageData, "base64");

      const fileName = `gemini-native-image-${new Date().toISOString()}.png`;

      uploadFile(buffer, fileName, "kreativ");

      fs.writeFileSync(fileName, buffer);
      console.log(
        "url",
        `https://pub-a49a634365054c4dacf7727ad2c91eec.r2.dev/${fileName}`
      );
      return {
        url: `https://pub-a49a634365054c4dacf7727ad2c91eec.r2.dev/${fileName}`,
        fileName,
      };
    }
  }

  throw new Error("No image generated");
};
