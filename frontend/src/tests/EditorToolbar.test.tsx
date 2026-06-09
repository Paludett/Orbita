import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { type Editor } from "@tiptap/react";

jest.mock("@tiptap/react", () => ({ __esModule: true }));

import EditorToolbar from "@/components/editor/EditorToolbar";

const mockRun = jest.fn();

function createProxy(): Record<string, unknown> {
  return new Proxy(
    {},
    {
      get(_, prop: string) {
        if (prop === "run") return mockRun;
        return () => createProxy();
      },
    }
  );
}

function makeMockEditor(activeMarks: string[] = []): Editor {
  return {
    chain: () => createProxy(),
    isActive: jest.fn((name: string) => activeMarks.includes(name)),
  } as unknown as Editor;
}

beforeEach(() => {
  mockRun.mockClear();
});

describe("EditorToolbar", () => {
  it("renders all formatting buttons", () => {
    render(<EditorToolbar editor={makeMockEditor()} />);
    expect(screen.getByTitle("Negrito")).toBeInTheDocument();
    expect(screen.getByTitle("Itálico")).toBeInTheDocument();
    expect(screen.getByTitle("Sublinhado")).toBeInTheDocument();
    expect(screen.getByTitle("Tachado")).toBeInTheDocument();
    expect(screen.getByTitle("Título 1")).toBeInTheDocument();
    expect(screen.getByTitle("Título 2")).toBeInTheDocument();
    expect(screen.getByTitle("Título 3")).toBeInTheDocument();
    expect(screen.getByTitle("Lista com marcadores")).toBeInTheDocument();
    expect(screen.getByTitle("Lista numerada")).toBeInTheDocument();
    expect(screen.getByTitle("Lista de tarefas")).toBeInTheDocument();
    expect(screen.getByTitle("Citação")).toBeInTheDocument();
    expect(screen.getByTitle("Código")).toBeInTheDocument();
  });

  it("clicking Bold button calls chain run", () => {
    render(<EditorToolbar editor={makeMockEditor()} />);
    fireEvent.click(screen.getByTitle("Negrito"));
    expect(mockRun).toHaveBeenCalled();
  });

  it("active button has highlight class", () => {
    render(<EditorToolbar editor={makeMockEditor(["bold"])} />);
    const boldBtn = screen.getByTitle("Negrito");
    expect(boldBtn.className).toContain("bg-[#2a3040]");
  });

  it("inactive button does not have highlight class", () => {
    render(<EditorToolbar editor={makeMockEditor()} />);
    const boldBtn = screen.getByTitle("Negrito");
    expect(boldBtn.className).not.toContain("bg-[#2a3040]");
  });

  it("buttons are disabled when editor is null", () => {
    render(<EditorToolbar editor={null} />);
    expect(screen.getByTitle("Negrito")).toBeDisabled();
    expect(screen.getByTitle("Itálico")).toBeDisabled();
  });

  it("clicking button when editor is null does not call run", () => {
    render(<EditorToolbar editor={null} />);
    fireEvent.click(screen.getByTitle("Negrito"));
    expect(mockRun).not.toHaveBeenCalled();
  });
});
