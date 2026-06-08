import { useAuthStore } from "@/store/auth.store";

beforeEach(() => {
  localStorage.clear();
  document.cookie = "";
  useAuthStore.setState({ token: null, isAuthenticated: false });
});

describe("auth store", () => {
  it("login() saves token to store and localStorage", () => {
    useAuthStore.getState().login("mytoken");

    expect(useAuthStore.getState().token).toBe("mytoken");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(localStorage.getItem("orbita_access_token")).toBe("mytoken");
  });

  it("logout() clears store and localStorage", () => {
    useAuthStore.getState().login("mytoken");
    useAuthStore.getState().logout();

    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(localStorage.getItem("orbita_access_token")).toBeNull();
  });
});
