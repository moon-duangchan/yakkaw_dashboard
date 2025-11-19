"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  options: readonly string[];
  onChange: (val: string) => void;
  className?: string;
};

export default function RangeToggle({ value, options, onChange, className }: Props) {
  return (
    <div className={cn("flex overflow-hidden rounded-md border bg-muted/30 p-1 text-sm", className)}>
      {options.map((opt) => (
        <Button
          key={opt}
          size="sm"
          variant={opt === value ? "default" : "ghost"}
          className={cn("rounded-sm px-3", opt === value ? "bg-primary text-primary-foreground" : "")}
          onClick={() => onChange(opt)}
        >
          {opt}
        </Button>
      ))}
    </div>
  );
}
