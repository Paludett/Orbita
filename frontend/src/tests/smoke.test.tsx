import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn() })),
  useParams: jest.fn(() => ({ id: "area-1" })),
  useSearchParams: jest.fn(() => ({ get: jest.fn(() => null) })),
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: Object.assign(jest.fn(), {
    success: jest.fn(),
    error: jest.fn(),
  }),
  Toaster: () => null,
}));

jest.mock("@/hooks/useAreas", () => ({
  useAreas: jest.fn(() => ({ data: [], isLoading: false, isError: false, refetch: jest.fn() })),
  useDeleteArea: jest.fn(() => ({ mutate: jest.fn() })),
}));

jest.mock("@/hooks/useTasks", () => ({
  useTasks: jest.fn(() => ({ data: [], isLoading: false })),
  useCreateTask: jest.fn(() => ({ mutate: jest.fn() })),
  useToggleTask: jest.fn(() => ({ mutate: jest.fn() })),
  useUpdateTask: jest.fn(() => ({ mutate: jest.fn() })),
  useDeleteTask: jest.fn(() => ({ mutate: jest.fn() })),
}));

jest.mock("@/hooks/useNotes", () => ({
  useNotes: jest.fn(() => ({ data: [], isLoading: false })),
  useCreateNote: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
  useDeleteNote: jest.fn(() => ({ mutate: jest.fn() })),
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(() => ({ data: null, isLoading: false })),
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/store/auth.store", () => ({
  useAuthStore: jest.fn((selector: (s: { logout: () => void }) => unknown) =>
    selector({ logout: jest.fn() })
  ),
}));

import HomePage from "@/app/page";
import AreaDetailPage from "@/app/(protected)/areas/[id]/page";
import LoginPage from "@/app/login/page";

describe("Smoke tests", () => {
  it("HomePage renders without crash", () => {
    render(<HomePage />);
    expect(screen.getByText("Orbita")).toBeInTheDocument();
  });

  it("AreaDetailPage renders without crash", () => {
    render(<AreaDetailPage />);
    // should render loading spinner or tabs
    expect(document.body).toBeTruthy();
  });

  it("LoginPage renders form", () => {
    render(<LoginPage />);
    const submitBtn = document.querySelector('button[type="submit"]');
    expect(submitBtn).toBeInTheDocument();
  });
});
