"use client";

import { ComponentProps } from "react";
import { Chip } from "@heroui/react";

type ChipColor = ComponentProps<typeof Chip>["color"];
type ChipVariant = ComponentProps<typeof Chip>["variant"];

interface BadgePillProps {
  value: boolean | null | undefined;
  trueLabel?: string;
  falseLabel?: string;
  trueColor?: ChipColor;
  falseColor?: ChipColor;
  variant?: ChipVariant;
  className?: string;
}

export default function BadgePill({
  value,
  trueLabel = "Active",
  falseLabel = "Not Active",
  trueColor = "accent",
  falseColor = "default",
  variant = "soft",
  className,
}: BadgePillProps) {
  const isPositive = Boolean(value);
  const label = isPositive ? trueLabel : falseLabel;
  const color = isPositive ? trueColor : falseColor;

  return (
    <Chip
      variant={variant}
      color={color}
      className={className}
    >
      {label}
    </Chip>
  );
}

