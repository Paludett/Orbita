import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AreaBubble from "@/components/areas/AreaBubble";
import * as navigation from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

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

describe("AreaBubble", () => {
  it("renders area name", () => {
    render(<AreaBubble area={AREA} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText("Trabalho")).toBeInTheDocument();
  });

  it("applies area color as background", () => {
    render(<AreaBubble area={AREA} onEdit={jest.fn()} onDelete={jest.fn()} />);
    const bubble = screen.getByRole("button", { name: /abrir área trabalho/i });
    expect(bubble).toHaveStyle({ backgroundColor: "#3b82f6" });
  });

  it("navigates to /areas/[id] on bubble click", () => {
    const push = jest.fn();
    jest.spyOn(navigation, "useRouter").mockReturnValue({ push } as unknown as ReturnType<typeof navigation.useRouter>);
    render(<AreaBubble area={AREA} onEdit={jest.fn()} onDelete={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /abrir área trabalho/i }));
    expect(push).toHaveBeenCalledWith("/areas/area-1");
  });

  it("shows edit and delete buttons on hover", () => {
    render(<AreaBubble area={AREA} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.queryByLabelText("Editar área")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Deletar área")).not.toBeInTheDocument();

    fireEvent.mouseEnter(screen.getByTestId("area-bubble"));

    expect(screen.getByLabelText("Editar área")).toBeInTheDocument();
    expect(screen.getByLabelText("Deletar área")).toBeInTheDocument();
  });

  it("shows inline confirm on delete click", () => {
    render(<AreaBubble area={AREA} onEdit={jest.fn()} onDelete={jest.fn()} />);
    fireEvent.mouseEnter(screen.getByTestId("area-bubble"));
    fireEvent.click(screen.getByLabelText("Deletar área"));
    expect(screen.getByText("Deletar?")).toBeInTheDocument();
  });

  it("calls onDelete with area id on confirm", () => {
    const onDelete = jest.fn();
    render(<AreaBubble area={AREA} onEdit={jest.fn()} onDelete={onDelete} />);
    fireEvent.mouseEnter(screen.getByTestId("area-bubble"));
    fireEvent.click(screen.getByLabelText("Deletar área"));
    fireEvent.click(screen.getByLabelText("Confirmar deleção"));
    expect(onDelete).toHaveBeenCalledWith("area-1");
  });

  it("calls onEdit with area on edit click", () => {
    const onEdit = jest.fn();
    render(<AreaBubble area={AREA} onEdit={onEdit} onDelete={jest.fn()} />);
    fireEvent.mouseEnter(screen.getByTestId("area-bubble"));
    fireEvent.click(screen.getByLabelText("Editar área"));
    expect(onEdit).toHaveBeenCalledWith(AREA);
  });
});
