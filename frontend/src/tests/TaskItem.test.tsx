import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import TaskItem from "@/components/tasks/TaskItem";

const TASK = {
  id: "task-1",
  title: "Estudar React",
  description: null,
  completed: false,
  due_date: null,
  order: 0,
  area_id: "area-1",
  created_at: "2026-01-01T00:00:00",
  updated_at: "2026-01-01T00:00:00",
};

const AREA_COLOR = "#3b82f6";

describe("TaskItem", () => {
  it("calls onToggle when checkbox is clicked", () => {
    const onToggle = jest.fn();
    render(
      <TaskItem
        task={TASK}
        areaColor={AREA_COLOR}
        onToggle={onToggle}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    fireEvent.click(screen.getByLabelText("Marcar como concluída"));
    expect(onToggle).toHaveBeenCalledWith("task-1");
  });

  it("renders title without line-through when not completed", () => {
    render(
      <TaskItem
        task={TASK}
        areaColor={AREA_COLOR}
        onToggle={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    const titleEl = screen.getByText("Estudar React");
    expect(titleEl).not.toHaveStyle({ textDecoration: "line-through" });
  });

  it("renders title with line-through when completed", () => {
    render(
      <TaskItem
        task={{ ...TASK, completed: true }}
        areaColor={AREA_COLOR}
        onToggle={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    const titleEl = screen.getByText("Estudar React");
    expect(titleEl).toHaveStyle({ textDecoration: "line-through" });
  });

  it("shows input when edit button is clicked", () => {
    render(
      <TaskItem
        task={TASK}
        areaColor={AREA_COLOR}
        onToggle={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    fireEvent.mouseEnter(screen.getByTestId("task-item"));
    fireEvent.click(screen.getByLabelText("Editar tarefa"));
    expect(screen.getByLabelText("Editar título da tarefa")).toBeInTheDocument();
  });

  it("calls onUpdate on Enter in edit mode", () => {
    const onUpdate = jest.fn();
    render(
      <TaskItem
        task={TASK}
        areaColor={AREA_COLOR}
        onToggle={jest.fn()}
        onUpdate={onUpdate}
        onDelete={jest.fn()}
      />
    );
    fireEvent.mouseEnter(screen.getByTestId("task-item"));
    fireEvent.click(screen.getByLabelText("Editar tarefa"));
    const input = screen.getByLabelText("Editar título da tarefa");
    fireEvent.change(input, { target: { value: "Novo título" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onUpdate).toHaveBeenCalledWith("task-1", "Novo título");
  });

  it("shows confirm on delete click and calls onDelete", () => {
    const onDelete = jest.fn();
    render(
      <TaskItem
        task={TASK}
        areaColor={AREA_COLOR}
        onToggle={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={onDelete}
      />
    );
    fireEvent.mouseEnter(screen.getByTestId("task-item"));
    fireEvent.click(screen.getByLabelText("Deletar tarefa"));
    expect(screen.getByText("Deletar?")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Confirmar deleção"));
    expect(onDelete).toHaveBeenCalledWith("task-1");
  });
});
