import { nodeGenerateImage } from "./nodes/node-generate-image";
import { nodeRemoveBackground } from "./nodes/node-remove-background";
import fs from "node:fs";

const runnableWorkflow = async (workflow: any) => {
  const node = workflow.nodes[0];
  for (const node of workflow.nodes) {
    if (node.type === "generate-image") {
      const { url, fileName } = await nodeGenerateImage(
        node.prompt.prompt,
        node.imageModel,
        node.aspectRatio,
        workflow.id
      );
    }
    if (node.type === "remove-background") {
      const { url, fileName } = await nodeRemoveBackground(
        node.image_input.url,
        workflow.id
      );
    }
  }
  // const { url, fileName } = await nodeGenerateImage(
  //   node.prompt.prompt,
  //   node.imageModel,
  //   node.aspectRatio,
  //   workflow.id
  // );
  // const removeBackground = await nodeRemoveBackground(url, workflow.id);
  return { msg: "Workflow completed" };
};

runnableWorkflow({
  nodes: [
    {
      id: "node-1",
      type: "generate-image",
      imageModel: "google/imagen-4-fast",
      aspectRatio: "16:9",
      image_input: [],
      prompt: {
        prompt: "A car driving on a road",
      },
    },
    {
      type: "remove-background",
      id: "node-2",
      image_input: {
        url: "https://pub-a49a634365054c4dacf7727ad2c91eec.r2.dev/image-123-imagen-4-fast-2025-11-11.png",
      },
    },
  ],
  id: "123",
});
