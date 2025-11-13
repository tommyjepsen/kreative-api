import "dotenv/config";
import express, { Request, Response } from "express";
import { authMiddleware, RequestWithUser } from "../middleware";
import { eq } from "drizzle-orm";
import { users } from "../db/user.entity";
import db from "../db";

const router = express.Router();

router.put("/update", authMiddleware, async (req: Request, res: Response) => {
  const user = (req as RequestWithUser).user;
  const email = req.body.email;
  const name = req.body.name;

  await db
    .update(users)
    .set({ email: email, name: name })
    .where(eq(users.id, user.id));
  res.json({ success: true });
});
export default router;
