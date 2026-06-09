import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import NoteCard from "@/components/notes/NoteCard";

const NOTE = {
  id: "note-1",
  title: "Minha nota",
  updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
};

describe("NoteCard", () => {
  it("renders title and relative date", () => {
    render(
      <NoteCard note={NOTE} onClick={jest.fn()} onDelete={jest.fn()} />
    );
    expect(screen.getByText("Minha nota")).toBeInTheDocument();
    // Intl.RelativeTimeFormat pt-BR for ~2 days ago → "anteontem" or "há N dias"
    const cardText = screen.getByTestId("note-card").textContent ?? "";
    expect(cardText.length).toBeGreaterThan("Minha nota".length);
  });

  it("calls onClick with noteId on click", () => {
    const onClick = jest.fn();
    render(
      <NoteCard note={NOTE} onClick={onClick} onDelete={jest.fn()} />
    );
    fireEvent.click(screen.getByRole("button", { name: /abrir nota minha nota/i }));
    expect(onClick).toHaveBeenCalledWith("note-1");
  });

  it("delete button not visible without hover", () => {
    render(
      <NoteCard note={NOTE} onClick={jest.fn()} onDelete={jest.fn()} />
    );
    expect(screen.queryByLabelText("Deletar nota")).not.toBeInTheDocument();
  });

  it("delete button visible on hover", () => {
    render(
      <NoteCard note={NOTE} onClick={jest.fn()} onDelete={jest.fn()} />
    );
    fireEvent.mouseEnter(screen.getByTestId("note-card"));
    expect(screen.getByLabelText("Deletar nota")).toBeInTheDocument();
  });

  it("calls onDelete after confirm", () => {
    const onDelete = jest.fn();
    render(
      <NoteCard note={NOTE} onClick={jest.fn()} onDelete={onDelete} />
    );
    fireEvent.mouseEnter(screen.getByTestId("note-card"));
    fireEvent.click(screen.getByLabelText("Deletar nota"));
    expect(screen.getByText("Deletar?")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Confirmar deleção"));
    expect(onDelete).toHaveBeenCalledWith("note-1");
  });
});
