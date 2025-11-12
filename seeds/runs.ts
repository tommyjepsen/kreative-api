import "dotenv/config";
import db from "../src/db";
import * as schema from "../src/db/schema";
import { randomUUID } from "crypto";

async function main() {
  // Generate IDs
  const workflowId = randomUUID();
  const promptNodeId = randomUUID();
  const generateImageNodeId = randomUUID();
  const removeBackgroundNodeId = randomUUID();

  // Insert workflow
  await db.insert(schema.workflows).values({
    id: workflowId,
    cloudflareWorkflowId: randomUUID(),
    title: "Sample Workflow",
  });

  console.log("Workflow created:", workflowId);

  // Insert workflow nodes
  await db.insert(schema.workflowNodes).values([
    {
      id: promptNodeId,
      workflowId: workflowId,
      title: "Prompt",
      type: "prompt",
      data: {
        prompt: "Image of a car on a road",
      },
      position: 0,
    },
    {
      id: generateImageNodeId,
      workflowId: workflowId,
      title: "Generate Image",
      type: "generate-image",
      inputWorkflowNodeId: promptNodeId,
      data: {
        imageModel:
          "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
        aspectRatio: "16:9",
      },
      position: 1,
    },
    {
      id: removeBackgroundNodeId,
      workflowId: workflowId,
      title: "Remove Background",
      type: "remove-background",
      inputWorkflowNodeId: generateImageNodeId,
      position: 2,
    },
  ]);

  console.log("Workflow nodes created successfully!");
}

main();
