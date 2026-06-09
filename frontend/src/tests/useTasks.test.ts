import MockAdapter from "axios-mock-adapter";
import api from "@/lib/api";
import { taskService } from "@/services/task.service";

const mock = new MockAdapter(api);

const AREA_ID = "area-1";
const TASK_ID = "task-1";

const TASK = {
  id: TASK_ID,
  title: "Estudar React",
  description: null,
  completed: false,
  due_date: null,
  order: 0,
  area_id: AREA_ID,
  created_at: "2026-01-01T00:00:00",
  updated_at: "2026-01-01T00:00:00",
};

afterEach(() => mock.reset());

describe("taskService.getAll", () => {
  it("fetches tasks for the correct areaId", async () => {
    mock.onGet(`/areas/${AREA_ID}/tasks`).reply(200, [TASK]);
    const res = await taskService.getAll(AREA_ID);
    expect(res.data).toEqual([TASK]);
  });
});

describe("taskService.create", () => {
  it("posts and returns created task", async () => {
    const dto = { title: "Nova tarefa", order: 0 };
    mock.onPost(`/areas/${AREA_ID}/tasks`).reply(201, { ...TASK, ...dto });
    const res = await taskService.create(AREA_ID, dto);
    expect(res.data.title).toBe("Nova tarefa");
  });
});

describe("taskService.toggle", () => {
  it("patches toggle and returns updated task", async () => {
    mock
      .onPatch(`/areas/${AREA_ID}/tasks/${TASK_ID}/toggle`)
      .reply(200, { ...TASK, completed: true });
    const res = await taskService.toggle(AREA_ID, TASK_ID);
    expect(res.data.completed).toBe(true);
  });
});

describe("taskService.update", () => {
  it("patches and returns updated task", async () => {
    mock
      .onPatch(`/areas/${AREA_ID}/tasks/${TASK_ID}`)
      .reply(200, { ...TASK, title: "Editado" });
    const res = await taskService.update(AREA_ID, TASK_ID, { title: "Editado" });
    expect(res.data.title).toBe("Editado");
  });
});

describe("taskService.delete", () => {
  it("deletes task and returns 204", async () => {
    mock.onDelete(`/areas/${AREA_ID}/tasks/${TASK_ID}`).reply(204);
    const res = await taskService.delete(AREA_ID, TASK_ID);
    expect(res.status).toBe(204);
  });
});
