export enum TaskStatus {
  CREATED = "CREATED",
  PARSING = "PARSING",
  PLANNING = "PLANNING",
  EXECUTING = "EXECUTING",
  PR_CREATED = "PR_CREATED",
  CI_RUNNING = "CI_RUNNING",
  VALIDATING = "VALIDATING",
  WAITING_FOR_QA = "WAITING_FOR_QA",
  APPROVED = "APPROVED",
  MERGED = "MERGED",
  DEPLOYED = "DEPLOYED",
  FAILED = "FAILED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export const WEBHOOK_QUEUE_NAME = "webhook-processing";

export interface WebhookJobData {
  idempotencyKey: string;
  payload: ClickUpWebhookPayload;
  rawPayload: Record<string, unknown>;
  receivedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  clickupWorkspaceId: string | null;
  createdAt: Date;
}

export interface Repository {
  id: string;
  orgId: string;
  githubOwner: string;
  githubRepo: string;
  defaultBranch: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  orgId: string | null;
  clickupTaskId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  clickupUrl: string | null;
  rawPayload: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskEvent {
  id: string;
  taskId: string;
  type: string;
  payload: Record<string, unknown> | null;
  createdAt: Date;
}

export interface ClickUpWebhookPayload {
  event: string;
  task_id?: string;
  webhook_id?: string;
  history_items?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface ClickUpTaskResponse {
  id: string;
  name: string;
  description?: string;
  text_content?: string;
  url?: string;
  status?: { status: string };
  [key: string]: unknown;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TaskDetailResponse {
  task: Task;
  events: TaskEvent[];
}
