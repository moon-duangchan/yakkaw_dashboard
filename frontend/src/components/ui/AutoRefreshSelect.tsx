"use client";

type Props = {
  value: number;
  onChange: (val: number) => void;
  className?: string;
};

export default function AutoRefreshSelect({ value, onChange, className }: Props) {
  return (
    <div className={className ? className : "flex items-center gap-1 text-xs"}>
      <span>Auto-refresh</span>
      <select
        className="border rounded px-1 py-0.5 text-xs"
        value={String(value)}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        <option value="0">Off</option>
        <option value="60000">1m</option>
        <option value="300000">5m</option>
        <option value="900000">15m</option>
      </select>
    </div>
  );
}

