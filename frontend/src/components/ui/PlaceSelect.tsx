"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PlaceSelectProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  options: string[]; // full place list
  nearby?: string[]; // optional nearby quick picks
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  onUseMyLocation?: () => void;
  gettingLocation?: boolean;
  className?: string;
};

export default function PlaceSelect({
  value,
  onChange,
  onSelect,
  options,
  nearby = [],
  placeholder = "Search place",
  disabled,
  loading,
  onUseMyLocation,
  gettingLocation,
  className,
}: PlaceSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value ?? "");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setQuery(value ?? "");
  }, [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const allOptions = useMemo(() => Array.from(new Set(options.filter(Boolean))), [options]);

  // Simple ranked filter: startsWith first, then includes
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allOptions.slice(0, 30);
    const starts: string[] = [];
    const contains: string[] = [];
    for (const opt of allOptions) {
      const l = opt.toLowerCase();
      if (l.startsWith(q)) starts.push(opt);
      else if (l.includes(q)) contains.push(opt);
    }
    return [...starts, ...contains].slice(0, 30);
  }, [allOptions, query]);

  const handleSelect = (val: string) => {
    onChange(val);
    onSelect?.(val);
    setQuery(val);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Input
        placeholder={placeholder}
        value={query}
        disabled={disabled}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (!open) setOpen(true);
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            const pick = filtered[activeIndex] || query;
            handleSelect(pick);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className="w-full"
      />

      {open && (
        <div className="absolute z-20 mt-1 w-72 rounded-md border bg-background p-2 shadow">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground">{loading ? "Loading places…" : "Suggestions"}</div>
            {onUseMyLocation && (
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={onUseMyLocation} disabled={gettingLocation}>
                {gettingLocation ? "Locating…" : "Use my location"}
              </Button>
            )}
          </div>

          {nearby.length > 0 && (
            <div className="mb-2">
              <div className="mb-1 text-[11px] font-medium text-muted-foreground">Nearby</div>
              <div className="flex flex-wrap gap-1.5">
                {nearby.slice(0, 6).map((n) => (
                  <button
                    key={`nearby-${n}`}
                    className="text-[11px] px-2 py-1 rounded-md border hover:bg-muted"
                    onClick={() => handleSelect(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="max-h-64 overflow-auto rounded-md">
            {filtered.length === 0 ? (
              <div className="px-2 py-6 text-center text-xs text-muted-foreground">No matches</div>
            ) : (
              filtered.map((opt, idx) => (
                <div
                  key={opt}
                  className={cn(
                    "cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-muted",
                    idx === activeIndex && "bg-muted"
                  )}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(opt);
                  }}
                >
                  {opt}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
