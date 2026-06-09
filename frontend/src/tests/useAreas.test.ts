import MockAdapter from "axios-mock-adapter";
import api from "@/lib/api";
import { areaService } from "@/services/area.service";

const mock = new MockAdapter(api);

const AREA = {
  id: "area-1",
  name: "Trabalho",
  color: "#3b82f6",
  icon: "Briefcase",
  order: 0,
  user_id: "user-1",
  created_at: "2026-01-01T00:00:00",
  updated_at: "2026-01-01T00:00:00",
};

afterEach(() => {
  mock.reset();
});

describe("areaService.getAll", () => {
  it("returns list of areas", async () => {
    mock.onGet("/areas").reply(200, [AREA]);
    const res = await areaService.getAll();
    expect(res.data).toEqual([AREA]);
  });
});

describe("areaService.create", () => {
  it("posts and returns created area", async () => {
    const dto = { name: "Saúde", color: "#22c55e", icon: "Heart" };
    mock.onPost("/areas").reply(201, { ...AREA, ...dto });
    const res = await areaService.create(dto);
    expect(res.data.name).toBe("Saúde");
  });
});

describe("areaService.update", () => {
  it("patches and returns updated area", async () => {
    mock.onPatch("/areas/area-1").reply(200, { ...AREA, name: "Editado" });
    const res = await areaService.update("area-1", { name: "Editado" });
    expect(res.data.name).toBe("Editado");
  });
});

describe("areaService.delete", () => {
  it("deletes area and returns 204", async () => {
    mock.onDelete("/areas/area-1").reply(204);
    const res = await areaService.delete("area-1");
    expect(res.status).toBe(204);
  });
});
