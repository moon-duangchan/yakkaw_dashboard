"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Metric = "pm25" | "pm10" | "aqi";

type Props = {
  value: Metric;
  onChange: (val: Metric) => void;
  className?: string;
};

export default function MetricToggle({ value, onChange, className }: Props) {
  const options: { key: Metric; label: string }[] = [
    { key: "pm25", label: "PM2.5" },
    { key: "pm10", label: "PM10" },
    { key: "aqi", label: "AQI" },
  ];

  return (
    <div className={cn("flex overflow-hidden rounded-md border bg-muted/30 p-1 text-sm", className)}>
      {options.map((opt) => (
        <Button
          key={opt.key}
          size="sm"
          variant={value === opt.key ? "default" : "ghost"}
          className={cn("rounded-sm px-3", value === opt.key ? "bg-primary text-primary-foreground" : "")}
          onClick={() => onChange(opt.key)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}

