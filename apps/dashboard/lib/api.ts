const API_URL = process.env.API_URL ?? "http://localhost:3000";

export async function fetchTasks(page = 1) {
  const res = await fetch(`${API_URL}/api/tasks?page=${page}&pageSize=50`, {
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch tasks: ${res.status}`);
  }

  return res.json();
}

export async function fetchTask(id: string) {
  const res = await fetch(`${API_URL}/api/tasks/${id}`, {
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch task: ${res.status}`);
  }

  return res.json();
}

export { API_URL };
