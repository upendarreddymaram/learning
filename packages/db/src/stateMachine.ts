import { TaskStatus } from "@orchestrator/types";

const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.CREATED]: [TaskStatus.PARSING, TaskStatus.FAILED, TaskStatus.CANCELLED],
  [TaskStatus.PARSING]: [TaskStatus.PLANNING, TaskStatus.FAILED, TaskStatus.CANCELLED],
  [TaskStatus.PLANNING]: [TaskStatus.EXECUTING, TaskStatus.FAILED, TaskStatus.CANCELLED],
  [TaskStatus.EXECUTING]: [TaskStatus.PR_CREATED, TaskStatus.FAILED, TaskStatus.CANCELLED],
  [TaskStatus.PR_CREATED]: [TaskStatus.CI_RUNNING, TaskStatus.FAILED, TaskStatus.CANCELLED],
  [TaskStatus.CI_RUNNING]: [TaskStatus.VALIDATING, TaskStatus.FAILED, TaskStatus.CANCELLED],
  [TaskStatus.VALIDATING]: [TaskStatus.WAITING_FOR_QA, TaskStatus.FAILED, TaskStatus.CANCELLED],
  [TaskStatus.WAITING_FOR_QA]: [TaskStatus.APPROVED, TaskStatus.REJECTED, TaskStatus.FAILED],
  [TaskStatus.APPROVED]: [TaskStatus.MERGED, TaskStatus.FAILED, TaskStatus.CANCELLED],
  [TaskStatus.MERGED]: [TaskStatus.DEPLOYED, TaskStatus.FAILED],
  [TaskStatus.DEPLOYED]: [],
  [TaskStatus.FAILED]: [TaskStatus.CREATED, TaskStatus.CANCELLED],
  [TaskStatus.REJECTED]: [TaskStatus.CREATED, TaskStatus.CANCELLED],
  [TaskStatus.CANCELLED]: [],
};

export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function transition(from: TaskStatus, to: TaskStatus): TaskStatus {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid state transition: ${from} → ${to}`);
  }
  return to;
}

export function getValidTransitions(from: TaskStatus): TaskStatus[] {
  return VALID_TRANSITIONS[from] ?? [];
}
