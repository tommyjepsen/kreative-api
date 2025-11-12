//CRUD routes for workflows and workflow nodes

import express, { Request, Response } from "express";
import { eq, and } from "drizzle-orm";
import * as schema from "../db/schema";
import { authMiddleware, RequestWithUser } from "../middleware";
import { db } from "../db";

const router = express.Router();

// ============================================
// WORKFLOW ROUTES
// ============================================

// Create a new workflow
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as RequestWithUser).user;
    const { title } = req.body;

    if (!title) {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    const [workflow] = await db
      .insert(schema.workflows)
      .values({ title })
      .returning();

    res.status(201).json(workflow);
  } catch (error) {
    console.error("Error creating workflow:", error);
    res.status(500).json({ error: "Failed to create workflow" });
  }
});

// Get all workflows
router.get("/", async (req: Request, res: Response) => {
  try {
    // Try using select instead of query builder
    const workflows = await db.select().from(schema.workflows);

    console.log("Workflows result:", JSON.stringify(workflows, null, 2));
    res.json(workflows);
  } catch (error) {
    console.error("Error fetching workflows:", error);
    res.status(500).json({ error: "Failed to fetch workflows" });
  }
});

// Get a single workflow by ID
router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as RequestWithUser).user;
    const { id } = req.params;

    const workflow = await db.query.workflows.findFirst({
      where: eq(schema.workflows.id, id),
      with: {
        workflowNodes: true,
      },
    });

    if (!workflow) {
      res.status(404).json({ error: "Workflow not found" });
      return;
    }

    res.json(workflow);
  } catch (error) {
    console.error("Error fetching workflow:", error);
    res.status(500).json({ error: "Failed to fetch workflow" });
  }
});

// Update a workflow
router.put("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as RequestWithUser).user;
    const { id } = req.params;
    const { title } = req.body;

    if (!title) {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    const [updatedWorkflow] = await db
      .update(schema.workflows)
      .set({ title })
      .where(eq(schema.workflows.id, id))
      .returning();

    if (!updatedWorkflow) {
      res.status(404).json({ error: "Workflow not found" });
      return;
    }

    res.json(updatedWorkflow);
  } catch (error) {
    console.error("Error updating workflow:", error);
    res.status(500).json({ error: "Failed to update workflow" });
  }
});

// Delete a workflow (and all its nodes)
router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as RequestWithUser).user;
    const { id } = req.params;

    // First delete all workflow nodes
    await db
      .delete(schema.workflowNodes)
      .where(eq(schema.workflowNodes.workflowId, id));

    // Then delete the workflow
    const [deletedWorkflow] = await db
      .delete(schema.workflows)
      .where(eq(schema.workflows.id, id))
      .returning();

    if (!deletedWorkflow) {
      res.status(404).json({ error: "Workflow not found" });
      return;
    }

    res.json({
      message: "Workflow deleted successfully",
      workflow: deletedWorkflow,
    });
  } catch (error) {
    console.error("Error deleting workflow:", error);
    res.status(500).json({ error: "Failed to delete workflow" });
  }
});

// ============================================
// WORKFLOW NODE ROUTES
// ============================================

// Create a new workflow node
router.post(
  "/:workflowId/nodes",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const user = (req as RequestWithUser).user;
      const { workflowId } = req.params;
      const { title, type, data, position } = req.body;

      if (!title || !type || !data || !position) {
        res.status(400).json({
          error: "Title, type, data, and position are required",
        });
        return;
      }

      // Verify workflow exists
      const workflow = await db.query.workflows.findFirst({
        where: eq(schema.workflows.id, workflowId),
      });

      if (!workflow) {
        res.status(404).json({ error: "Workflow not found" });
        return;
      }

      const [node] = await db
        .insert(schema.workflowNodes)
        .values({
          workflowId,
          title,
          type,
          data,
          position,
        })
        .returning();

      res.status(201).json(node);
    } catch (error) {
      console.error("Error creating workflow node:", error);
      res.status(500).json({ error: "Failed to create workflow node" });
    }
  }
);

// Get all nodes for a workflow
router.get(
  "/:workflowId/nodes",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const user = (req as RequestWithUser).user;
      const { workflowId } = req.params;

      const nodes = await db.query.workflowNodes.findMany({
        where: eq(schema.workflowNodes.workflowId, workflowId),
        orderBy: (nodes, { asc }) => [asc(nodes.createdAt)],
      });

      res.json(nodes);
    } catch (error) {
      console.error("Error fetching workflow nodes:", error);
      res.status(500).json({ error: "Failed to fetch workflow nodes" });
    }
  }
);

// Get a single node by ID
router.get(
  "/:workflowId/nodes/:nodeId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const user = (req as RequestWithUser).user;
      const { workflowId, nodeId } = req.params;

      const node = await db.query.workflowNodes.findFirst({
        where: and(
          eq(schema.workflowNodes.id, nodeId),
          eq(schema.workflowNodes.workflowId, workflowId)
        ),
      });

      if (!node) {
        res.status(404).json({ error: "Workflow node not found" });
        return;
      }

      res.json(node);
    } catch (error) {
      console.error("Error fetching workflow node:", error);
      res.status(500).json({ error: "Failed to fetch workflow node" });
    }
  }
);

// Update a workflow node
router.put(
  "/:workflowId/nodes/:nodeId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const user = (req as RequestWithUser).user;
      const { workflowId, nodeId } = req.params;
      const { title, type, data, position } = req.body;

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (type !== undefined) updateData.type = type;
      if (data !== undefined) updateData.data = data;
      if (position !== undefined) updateData.position = position;

      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          error:
            "At least one field (title, type, data, or position) is required",
        });
        return;
      }

      const [updatedNode] = await db
        .update(schema.workflowNodes)
        .set(updateData)
        .where(
          and(
            eq(schema.workflowNodes.id, nodeId),
            eq(schema.workflowNodes.workflowId, workflowId)
          )
        )
        .returning();

      if (!updatedNode) {
        res.status(404).json({ error: "Workflow node not found" });
        return;
      }

      res.json(updatedNode);
    } catch (error) {
      console.error("Error updating workflow node:", error);
      res.status(500).json({ error: "Failed to update workflow node" });
    }
  }
);

// Delete a workflow node
router.delete(
  "/:workflowId/nodes/:nodeId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const user = (req as RequestWithUser).user;
      const { workflowId, nodeId } = req.params;

      const [deletedNode] = await db
        .delete(schema.workflowNodes)
        .where(
          and(
            eq(schema.workflowNodes.id, nodeId),
            eq(schema.workflowNodes.workflowId, workflowId)
          )
        )
        .returning();

      if (!deletedNode) {
        res.status(404).json({ error: "Workflow node not found" });
        return;
      }

      res.json({
        message: "Workflow node deleted successfully",
        node: deletedNode,
      });
    } catch (error) {
      console.error("Error deleting workflow node:", error);
      res.status(500).json({ error: "Failed to delete workflow node" });
    }
  }
);

// Bulk update workflow nodes (useful for saving multiple node positions at once)
router.put(
  "/:workflowId/nodes",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const user = (req as RequestWithUser).user;
      const { workflowId } = req.params;
      const { nodes } = req.body;

      if (!Array.isArray(nodes) || nodes.length === 0) {
        res.status(400).json({ error: "Nodes array is required" });
        return;
      }

      // Update each node
      const updatePromises = nodes.map((node: any) => {
        const updateData: any = {};
        if (node.title !== undefined) updateData.title = node.title;
        if (node.type !== undefined) updateData.type = node.type;
        if (node.data !== undefined) updateData.data = node.data;
        if (node.position !== undefined) updateData.position = node.position;

        return db
          .update(schema.workflowNodes)
          .set(updateData)
          .where(
            and(
              eq(schema.workflowNodes.id, node.id),
              eq(schema.workflowNodes.workflowId, workflowId)
            )
          )
          .returning();
      });

      const updatedNodes = await Promise.all(updatePromises);

      res.json(updatedNodes.flat());
    } catch (error) {
      console.error("Error bulk updating workflow nodes:", error);
      res.status(500).json({ error: "Failed to bulk update workflow nodes" });
    }
  }
);

export default router;
