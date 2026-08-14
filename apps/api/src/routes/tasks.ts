import { Router, type Request, type Response } from "express";
import { listTasks, getTaskById, createTaskFromDevPayload } from "../services/taskService.js";

export const tasksRouter = Router();

tasksRouter.get("/", async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize ?? "20"), 10)));
    const result = await listTasks(page, pageSize);
    res.json(result);
  } catch (err) {
    console.error("List tasks error:", err);
    res.status(500).json({ error: "Failed to list tasks" });
  }
});

tasksRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const result = await getTaskById(id);
    if (!result) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.json(result);
  } catch (err) {
    console.error("Get task error:", err);
    res.status(500).json({ error: "Failed to get task" });
  }
});

/** Dev-only endpoint to seed tasks without ClickUp webhook */
tasksRouter.post("/dev/seed", async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === "production") {
    res.status(403).json({ error: "Not available in production" });
    return;
  }

  try {
    const task = await createTaskFromDevPayload(req.body);
    res.status(201).json({ task });
  } catch (err) {
    console.error("Seed task error:", err);
    res.status(500).json({ error: "Failed to seed task" });
  }
});
