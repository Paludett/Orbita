import MockAdapter from "axios-mock-adapter";
import { loginUser, registerUser } from "@/services/auth.service";
import api from "@/lib/api";

const mock = new MockAdapter(api);

afterEach(() => {
  mock.reset();
  localStorage.clear();
  document.cookie = "";
});

describe("loginUser", () => {
  it("200 → returns access_token", async () => {
    mock.onPost("/auth/login").reply(200, { access_token: "tok123" });
    const result = await loginUser("a@b.com", "Password1");
    expect(result.access_token).toBe("tok123");
  });

  it("401 → throws 'Credenciais inválidas'", async () => {
    mock.onPost("/auth/login").reply(401, { detail: "Unauthorized" });
    await expect(loginUser("a@b.com", "wrong")).rejects.toThrow(
      "Credenciais inválidas"
    );
  });

  it("422 → extracts detail[0].msg", async () => {
    mock.onPost("/auth/login").reply(422, {
      detail: [{ loc: ["body", "email"], msg: "value is not a valid email", type: "value_error" }],
    });
    await expect(loginUser("bad", "Password1")).rejects.toThrow(
      "value is not a valid email"
    );
  });

  it("500 → throws 'Erro inesperado, tente novamente'", async () => {
    mock.onPost("/auth/login").reply(500);
    await expect(loginUser("a@b.com", "Password1")).rejects.toThrow(
      "Erro inesperado, tente novamente"
    );
  });
});

describe("registerUser", () => {
  it("201 → returns user object", async () => {
    const user = { id: "uuid1", email: "a@b.com", created_at: "2026-01-01" };
    mock.onPost("/auth/register").reply(201, user);
    const result = await registerUser("a@b.com", "Password1");
    expect(result).toEqual(user);
  });

  it("409 → throws 'E-mail já cadastrado'", async () => {
    mock.onPost("/auth/register").reply(409, { detail: "Email already registered" });
    await expect(registerUser("a@b.com", "Password1")).rejects.toThrow(
      "E-mail já cadastrado"
    );
  });
});
