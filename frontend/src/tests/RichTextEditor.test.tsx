import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useEditor } from "@tiptap/react";
import CharacterCount from "@tiptap/extension-character-count";

jest.mock("@tiptap/react", () => ({
  __esModule: true,
  useEditor: jest.fn(),
  EditorContent: () => <div data-testid="editor-content" />,
}));

jest.mock("@tiptap/starter-kit", () => ({
  __esModule: true,
  default: { configure: jest.fn(() => ({})) },
}));
jest.mock("@tiptap/extension-underline", () => ({
  __esModule: true,
  default: {},
}));
jest.mock("@tiptap/extension-placeholder", () => ({
  __esModule: true,
  default: { configure: jest.fn(() => ({})) },
}));
jest.mock("@tiptap/extension-task-list", () => ({
  __esModule: true,
  default: {},
}));
jest.mock("@tiptap/extension-task-item", () => ({
  __esModule: true,
  default: { configure: jest.fn(() => ({})) },
}));
jest.mock("@tiptap/extension-character-count", () => ({
  __esModule: true,
  default: { configure: jest.fn(() => ({})) },
}));

jest.mock("@/components/editor/EditorToolbar", () => ({
  __esModule: true,
  default: ({ editor }: { editor: unknown }) => (
    <div data-testid="editor-toolbar" data-has-editor={String(!!editor)} />
  ),
}));

const mockUseEditor = useEditor as jest.Mock;

type OnUpdateFn = (props: { editor: { getHTML: () => string } }) => void;

function makeMockEditor(charCount = 0) {
  return {
    commands: { setContent: jest.fn() },
    setEditable: jest.fn(),
    storage: { characterCount: { characters: () => charCount } },
    getHTML: jest.fn(() => "<p></p>"),
    isActive: jest.fn(() => false),
    chain: jest.fn(),
  };
}

let capturedOnUpdate: OnUpdateFn | undefined;

beforeEach(() => {
  capturedOnUpdate = undefined;
  const mockEditor = makeMockEditor();
  mockUseEditor.mockImplementation((options: { onUpdate?: OnUpdateFn }) => {
    capturedOnUpdate = options?.onUpdate;
    return mockEditor;
  });
});

import RichTextEditor from "@/components/editor/RichTextEditor";

describe("RichTextEditor", () => {
  it("renders toolbar and editor content by default", () => {
    render(<RichTextEditor content="<p>hello</p>" onChange={jest.fn()} />);
    expect(screen.getByTestId("editor-toolbar")).toBeInTheDocument();
    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
  });

  it("initializes useEditor with provided content", () => {
    render(<RichTextEditor content="<p>initial</p>" onChange={jest.fn()} />);
    expect(mockUseEditor).toHaveBeenCalledWith(
      expect.objectContaining({ content: "<p>initial</p>" }),
      []
    );
  });

  it("does not show toolbar when editable=false", () => {
    render(
      <RichTextEditor content="" onChange={jest.fn()} editable={false} />
    );
    expect(screen.queryByTestId("editor-toolbar")).not.toBeInTheDocument();
  });

  it("does not show toolbar when showToolbar=false", () => {
    render(
      <RichTextEditor content="" onChange={jest.fn()} showToolbar={false} />
    );
    expect(screen.queryByTestId("editor-toolbar")).not.toBeInTheDocument();
  });

  it("onChange called when onUpdate fires with new content", () => {
    const onChange = jest.fn();
    render(<RichTextEditor content="<p>old</p>" onChange={onChange} />);

    act(() => {
      capturedOnUpdate?.({ editor: { getHTML: () => "<p>new content</p>" } });
    });

    expect(onChange).toHaveBeenCalledWith("<p>new content</p>");
  });

  it("onChange not called when content is identical to last emitted", () => {
    const onChange = jest.fn();
    render(<RichTextEditor content="<p>same</p>" onChange={onChange} />);

    act(() => {
      capturedOnUpdate?.({ editor: { getHTML: () => "<p>same</p>" } });
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows character count", () => {
    const mockEditor = makeMockEditor(42);
    mockUseEditor.mockImplementation((options: { onUpdate?: OnUpdateFn }) => {
      capturedOnUpdate = options?.onUpdate;
      return mockEditor;
    });
    render(
      <RichTextEditor content="" onChange={jest.fn()} characterLimit={200} />
    );
    expect(screen.getByText("42/200")).toBeInTheDocument();
  });

  it("character count turns red when above 90% of limit", () => {
    const mockEditor = makeMockEditor(95);
    mockUseEditor.mockImplementation((options: { onUpdate?: OnUpdateFn }) => {
      capturedOnUpdate = options?.onUpdate;
      return mockEditor;
    });
    render(
      <RichTextEditor content="" onChange={jest.fn()} characterLimit={100} />
    );
    const counter = screen.getByText("95/100");
    expect(counter.className).toContain("text-red-400");
  });

  it("configures CharacterCount with provided limit", () => {
    const configureMock = jest.mocked(CharacterCount.configure);
    configureMock.mockClear();
    render(
      <RichTextEditor content="" onChange={jest.fn()} characterLimit={500} />
    );
    expect(configureMock).toHaveBeenCalledWith({ limit: 500 });
  });
});
