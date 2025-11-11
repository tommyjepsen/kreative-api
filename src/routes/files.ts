//CRUD Project

import express, { Request, Response } from "express";
import * as schema from "../db/schema";
import { db } from "../db";
import { authMiddleware, RequestWithUser } from "../middleware";
import { and, asc, desc, eq, inArray, count, like } from "drizzle-orm";
import { scrapeWebsite } from "../utils/scrape-website";
import { sanitizeUrl } from "../utils/sanitize-url";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
const router = express.Router();
import { Readable } from "stream";

router.get(
  "/download/:promptRunId",
  authMiddleware,
  async (req: Request, res: Response) => {
    const user = (req as RequestWithUser).user;
    const promptRunId = req.params.promptRunId;

    const promptRunState = await db.query.promptRunStateTable.findFirst({
      where: and(
        eq(schema.promptRunStateTable.id, promptRunId),
        eq(schema.promptRunStateTable.projectId, user.projectSelectedId)
      ),
    });

    if (!promptRunState) {
      res.status(404).json({ error: "Prompt run state not found" });
      return;
    }

    const s3 = new S3Client({
      region: "auto", // always "auto" for R2
      endpoint: `https://21fd7b5c5877445dd1783f5e1fd75da2.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: "fd8f3a0df7af68274dfff8e7cb3dedf9",
        secretAccessKey:
          "c721c2c01c0d17d05a271e0cd54501480059176f613f088677feaf20dbe1d75e",
      },
    });

    const keyFormatted = `response--${promptRunState.model}--${
      promptRunState.id
    }.json`;

    const command = new GetObjectCommand({
      Bucket:
        promptRunState.type === "list"
          ? "ai8-positioning-files"
          : "ai8-sentiment-files",
      Key: keyFormatted,
    });

    const response = await s3.send(command);
    const stream = response.Body as Readable;

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${promptRunState.id}-${promptRunState.model}.json"`
    );
    stream.pipe(res);
  }
);

export default router;
