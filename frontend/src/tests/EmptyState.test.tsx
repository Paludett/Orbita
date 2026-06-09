import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Sparkles } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

describe("EmptyState", () => {
  it("renders icon, title, and description", () => {
    render(
      <EmptyState
        icon={Sparkles}
        title="Crie sua primeira área"
        description="Organize sua vida em esferas de foco."
      />
    );
    expect(screen.getByText("Crie sua primeira área")).toBeInTheDocument();
    expect(screen.getByText("Organize sua vida em esferas de foco.")).toBeInTheDocument();
  });

  it("does not render action button when action is omitted", () => {
    render(
      <EmptyState
        icon={Sparkles}
        title="Título"
        description="Descrição"
      />
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders action button and calls callback on click", () => {
    const onClick = jest.fn();
    render(
      <EmptyState
        icon={Sparkles}
        title="Título"
        description="Descrição"
        action={{ label: "Criar área", onClick }}
      />
    );
    const btn = screen.getByRole("button", { name: "Criar área" });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
