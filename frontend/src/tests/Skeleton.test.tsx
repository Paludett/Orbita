import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SkeletonCircle, SkeletonText, SkeletonCard, SkeletonBubble, SkeletonTaskLine } from "@/components/ui/Skeleton";

describe("SkeletonCircle", () => {
  it("renders with default size 96", () => {
    const { container } = render(<SkeletonCircle />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveStyle({ width: "96px", height: "96px" });
  });

  it("renders with custom size", () => {
    const { container } = render(<SkeletonCircle size={64} />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveStyle({ width: "64px", height: "64px" });
  });

  it("has rounded-full class", () => {
    const { container } = render(<SkeletonCircle />);
    expect(container.firstChild).toHaveClass("rounded-full");
  });
});

describe("SkeletonText", () => {
  it("renders 1 line by default", () => {
    const { container } = render(<SkeletonText />);
    const lines = container.querySelectorAll(".h-3");
    expect(lines).toHaveLength(1);
  });

  it("renders N lines as specified", () => {
    const { container } = render(<SkeletonText lines={4} />);
    const lines = container.querySelectorAll(".h-3");
    expect(lines).toHaveLength(4);
  });

  it("last line is narrower when multiple lines", () => {
    const { container } = render(<SkeletonText lines={3} />);
    const lines = container.querySelectorAll(".h-3");
    const last = lines[2] as HTMLElement;
    expect(last).toHaveStyle({ width: "60%" });
  });
});

describe("SkeletonCard", () => {
  it("renders two skeleton lines inside a card", () => {
    const { container } = render(<SkeletonCard />);
    const lines = container.querySelectorAll(".rounded");
    expect(lines.length).toBeGreaterThanOrEqual(2);
  });
});

describe("SkeletonBubble", () => {
  it("renders circle and label skeleton", () => {
    const { container } = render(<SkeletonBubble />);
    expect(container.querySelectorAll(".rounded-full").length).toBeGreaterThanOrEqual(1);
  });
});

describe("SkeletonTaskLine", () => {
  it("renders", () => {
    const { container } = render(<SkeletonTaskLine />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
