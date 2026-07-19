import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";

const textSizes = [
  { size: "default", targetClasses: ["h-11", "min-w-11"] },
  { size: "xs", targetClasses: ["h-11", "min-w-11"] },
  { size: "sm", targetClasses: ["h-11", "min-w-11"] },
  { size: "lg", targetClasses: ["h-12", "min-w-12"] },
] as const;

const iconSizes = [
  { size: "icon", targetClass: "size-11" },
  { size: "icon-xs", targetClass: "size-11" },
  { size: "icon-sm", targetClass: "size-11" },
  { size: "icon-lg", targetClass: "size-12" },
] as const;

it.each(textSizes)(
  "gives the $size text button at least a 44 by 44 hit target",
  ({ size, targetClasses }) => {
    render(<Button size={size}>Button {size}</Button>);

    expect(screen.getByRole("button", { name: `Button ${size}` })).toHaveClass(
      ...targetClasses,
    );
  },
);

it.each(iconSizes)(
  "gives the $size icon button at least a 44 by 44 hit target",
  ({ size, targetClass }) => {
    render(
      <Button aria-label={`Icon ${size}`} size={size}>
        <svg aria-hidden="true" />
      </Button>,
    );

    expect(screen.getByRole("button", { name: `Icon ${size}` })).toHaveClass(
      targetClass,
    );
  },
);

it("gives the Sheet close button the accessible icon-sm hit target", () => {
  render(
    <Sheet open>
      <SheetContent>
        <SheetTitle>Navigation</SheetTitle>
        <SheetDescription>Portfolio destinations</SheetDescription>
      </SheetContent>
    </Sheet>,
  );

  expect(screen.getByRole("button", { name: "Close" })).toHaveClass("size-11");
});
