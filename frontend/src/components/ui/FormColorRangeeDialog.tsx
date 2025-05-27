"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColorRange } from "@/constant/colorRangeData";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (colorRange: ColorRange) => void;
  colorRange: ColorRange;
  setColorRange: (colorRange: ColorRange) => void;
  title: string;
  submitButtonText: string;
  existingRanges: ColorRange[];
};

export const FormDialog: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  colorRange,
  setColorRange,
  title,
  submitButtonText,
  existingRanges,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsedValue =
      name === "min" || name === "max" ? (value ? parseFloat(value) : undefined) : value;
    setColorRange({ ...colorRange, [name]: parsedValue });
  };

  const isRangeInvalid = () => {
    const min = Number(colorRange.min);
    const max = Number(colorRange.max);

    if (isNaN(min) || isNaN(max) || colorRange.min === undefined || colorRange.max === undefined) {
      return "Min and Max must be valid numbers";
    }

    if (min > max) {
      return "Min must be less than or equal to Max";
    }

    if (!existingRanges || !Array.isArray(existingRanges) || existingRanges.length === 0) {
      return null;
    }

    const normalizedMin = parseFloat(min.toFixed(6));
    const normalizedMax = parseFloat(max.toFixed(6));

    const isDuplicateOrOverlap = existingRanges.some((range) => {
      if (colorRange.ID && range.ID && colorRange.ID === range.ID) {
        return false;
      }

      const rMin = Number(range.min);
      const rMax = Number(range.max);

      if (isNaN(rMin) || isNaN(rMax)) {
        return false;
      }

      const normalizedRMin = parseFloat(rMin.toFixed(6));
      const normalizedRMax = parseFloat(rMax.toFixed(6));

      if (normalizedMin === normalizedRMin && normalizedMax === normalizedRMax) {
        return true;
      }

      return (
        (normalizedMin >= normalizedRMin && normalizedMin <= normalizedRMax) ||
        (normalizedMax >= normalizedRMin && normalizedMax <= normalizedRMax) ||
        (normalizedRMin >= normalizedMin && normalizedRMin <= normalizedMax) ||
        (normalizedRMax >= normalizedMin && normalizedRMax <= normalizedMax)
      );
    });

    return isDuplicateOrOverlap ? "This range duplicates or overlaps an existing range" : null;
  };

  useEffect(() => {
    const errorMessage = isRangeInvalid();
    setError(errorMessage);
    console.log({
      colorRange,
      existingRanges,
      error: errorMessage,
      min: colorRange.min,
      max: colorRange.max,
    });
  }, [colorRange.min, colorRange.max, existingRanges]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errorMessage = isRangeInvalid();
    if (errorMessage) {
      setError(errorMessage);
      console.log("Submission blocked:", errorMessage);
      return;
    }
    console.log("Submitting range:", colorRange);
    onSubmit(colorRange);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Min</label>
            <Input
              type="number"
              name="min"
              value={colorRange.min ?? ""}
              onChange={handleChange}
              required
              step="0.000001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max</label>
            <Input
              type="number"
              name="max"
              value={colorRange.max ?? ""}
              onChange={handleChange}
              required
              step="0.000001"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Color</label>
            <input
              type="color"
              className="w-16 h-10 p-0 border border-gray-300 rounded"
              value={colorRange.color || "#FFFFFF"}
              onChange={(e) => setColorRange({ ...colorRange, color: e.target.value })}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!!error}>
              {submitButtonText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};