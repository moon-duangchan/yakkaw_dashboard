"use client";

type Props = {
  items: string[];
  onRemove: (item: string) => void;
  onClear: () => void;
  onExport: () => void;
};

export default function CompareChips({ items, onRemove, onClear, onExport }: Props) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      {items.map((p) => (
        <button
          key={p}
          className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
          onClick={() => onRemove(p)}
          title="Remove from compare"
        >
          {p} ×
        </button>
      ))}
      {items.length > 0 && (
        <button className="text-xs px-2 py-1 rounded border hover:bg-muted" onClick={onClear}>
          Clear compare
        </button>
      )}
      <button className="ml-auto text-xs px-2 py-1 rounded border hover:bg-muted" onClick={onExport}>
        Export CSV
      </button>
    </div>
  );
}

