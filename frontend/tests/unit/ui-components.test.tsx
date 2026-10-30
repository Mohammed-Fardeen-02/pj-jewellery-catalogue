import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

describe("UI Components", () => {
  it("renders Button with children and handles disabled state", () => {
    const { getByRole } = render(<Button disabled>Acquire Piece</Button>);
    const button = getByRole("button", { name: /acquire piece/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it("renders Badge with custom variants", () => {
    const { getByText } = render(<Badge variant="gold">Bespoke</Badge>);
    const badge = getByText("Bespoke");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-[#F7F1E8]");
  });

  it("renders Input and applies error border class when error prop is set", () => {
    const { getByPlaceholderText } = render(<Input placeholder="Enter SKU" error />);
    const input = getByPlaceholderText("Enter SKU");
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass("border-rose-500");
  });

  it("renders Skeleton with pulse animation class", () => {
    const { container } = render(<Skeleton className="h-6 w-24" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("bg-[#F0EAE2]");
  });
});
