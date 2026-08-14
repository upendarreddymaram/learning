import { eq, desc, count } from "drizzle-orm";
import { ClickUpClient } from "@orchestrator/clients";
import { TaskStatus, type ClickUpWebhookPayload, type Task } from "@orchestrator/types";
import { getEnv } from "@orchestrator/config";
import { getDb, schema } from "./index.js";
import { canTransition } from "./stateMachine.js";

const { tasks, events } = schema;

export async function upsertTaskFromWebhook(
  payload: ClickUpWebhookPayload,
  rawPayload: Record<string, unknown>,
): Promise<{ task: Task; isNew: boolean }> {
  const db = getDb();
  const clickupTaskId = payload.task_id;

  if (!clickupTaskId) {
    throw new Error("Webhook payload missing task_id");
  }

  const env = getEnv();
  let title = `ClickUp Task ${clickupTaskId}`;
  let description: string | null = null;
  let clickupUrl: string | null = null;
  let enrichedPayload = rawPayload;

  if (env.CLICKUP_API_TOKEN) {
    try {
      const client = new ClickUpClient(env.CLICKUP_API_TOKEN);
      const taskDetails = await client.getTask(clickupTaskId);
      title = taskDetails.name ?? title;
      description = taskDetails.description ?? taskDetails.text_content ?? null;
      clickupUrl = taskDetails.url ?? null;
      enrichedPayload = { ...rawPayload, taskDetails };
    } catch (err) {
      console.warn("Could not fetch ClickUp task details:", err);
    }
  }

  const existing = await db
    .select()
    .from(tasks)
    .where(eq(tasks.clickupTaskId, clickupTaskId))
    .limit(1);

  const now = new Date();
  let taskRow: typeof tasks.$inferSelect;
  let isNew = false;

  if (existing.length > 0) {
    const [updated] = await db
      .update(tasks)
      .set({
        title,
        description,
        clickupUrl,
        rawPayload: enrichedPayload,
        updatedAt: now,
      })
      .where(eq(tasks.id, existing[0].id))
      .returning();
    taskRow = updated;
  } else {
    const [created] = await db
      .insert(tasks)
      .values({
        clickupTaskId,
        title,
        description,
        status: TaskStatus.CREATED,
        clickupUrl,
        rawPayload: enrichedPayload,
      })
      .returning();
    taskRow = created;
    isNew = true;
  }

  await db.insert(events).values({
    taskId: taskRow.id,
    type: `webhook.${payload.event ?? "unknown"}`,
    payload: rawPayload,
  });

  return { task: mapTaskRow(taskRow), isNew };
}

export async function transitionTaskStatus(
  taskId: string,
  toStatus: TaskStatus,
  eventPayload?: Record<string, unknown>,
): Promise<Task> {
  const db = getDb();
  const rows = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);

  if (rows.length === 0) {
    throw new Error(`Task not found: ${taskId}`);
  }

  const current = rows[0].status as TaskStatus;

  if (!canTransition(current, toStatus)) {
    throw new Error(`Invalid state transition: ${current} → ${toStatus}`);
  }

  const [updated] = await db
    .update(tasks)
    .set({ status: toStatus, updatedAt: new Date() })
    .where(eq(tasks.id, taskId))
    .returning();

  await db.insert(events).values({
    taskId,
    type: "state.transition",
    payload: {
      from: current,
      to: toStatus,
      ...eventPayload,
    },
  });

  return mapTaskRow(updated);
}

export async function processWebhookWithStateMachine(
  payload: ClickUpWebhookPayload,
  rawPayload: Record<string, unknown>,
): Promise<Task> {
  const { task, isNew } = await upsertTaskFromWebhook(payload, rawPayload);
  const currentStatus = task.status;

  if (isNew || currentStatus === TaskStatus.CREATED) {
    return transitionTaskStatus(task.id, TaskStatus.PARSING, {
      trigger: "webhook",
      event: payload.event,
    });
  }

  if (currentStatus === TaskStatus.PARSING) {
    return task;
  }

  if (canTransition(currentStatus, TaskStatus.PARSING)) {
    return transitionTaskStatus(task.id, TaskStatus.PARSING, {
      trigger: "webhook_update",
      event: payload.event,
    });
  }

  return task;
}

export async function listTasks(page = 1, pageSize = 20) {
  const db = getDb();
  const offset = (page - 1) * pageSize;

  const [taskRows, totalResult] = await Promise.all([
    db
      .select()
      .from(tasks)
      .orderBy(desc(tasks.createdAt))
      .limit(pageSize)
      .offset(offset),
    db.select({ count: count() }).from(tasks),
  ]);

  return {
    tasks: taskRows.map(mapTaskRow),
    total: totalResult[0]?.count ?? 0,
    page,
    pageSize,
  };
}

export async function getTaskById(id: string) {
  const db = getDb();
  const taskRows = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);

  if (taskRows.length === 0) {
    return null;
  }

  const eventRows = await db
    .select()
    .from(events)
    .where(eq(events.taskId, id))
    .orderBy(desc(events.createdAt));

  return {
    task: mapTaskRow(taskRows[0]),
    events: eventRows.map(mapEventRow),
  };
}

export async function createTaskFromDevPayload(body: {
  clickupTaskId: string;
  title: string;
  description?: string;
  clickupUrl?: string;
}) {
  const db = getDb();
  const existing = await db
    .select()
    .from(tasks)
    .where(eq(tasks.clickupTaskId, body.clickupTaskId))
    .limit(1);

  if (existing.length > 0) {
    return mapTaskRow(existing[0]);
  }

  const [created] = await db
    .insert(tasks)
    .values({
      clickupTaskId: body.clickupTaskId,
      title: body.title,
      description: body.description ?? null,
      clickupUrl: body.clickupUrl ?? null,
      status: TaskStatus.CREATED,
      rawPayload: body,
    })
    .returning();

  await db.insert(events).values({
    taskId: created.id,
    type: "dev.manual_create",
    payload: body,
  });

  const task = mapTaskRow(created);
  return transitionTaskStatus(task.id, TaskStatus.PARSING, { trigger: "dev_seed" });
}

function mapTaskRow(row: typeof tasks.$inferSelect): Task {
  return {
    id: row.id,
    orgId: row.orgId,
    clickupTaskId: row.clickupTaskId,
    title: row.title,
    description: row.description,
    status: row.status as TaskStatus,
    clickupUrl: row.clickupUrl,
    rawPayload: row.rawPayload as Record<string, unknown> | null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapEventRow(row: typeof events.$inferSelect) {
  return {
    id: row.id,
    taskId: row.taskId,
    type: row.type,
    payload: row.payload as Record<string, unknown> | null,
    createdAt: row.createdAt,
  };
}
