export type ColorRange = {
  ID?: number; // gorm.Model ID (optional for new, present for existing)
  min: number;
  max: number;
  color: string;
};

export type ColorRangeFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (colorRange: ColorRange) => void;
  colorRange: ColorRange;
  setColorRange: (colorRange: ColorRange) => void;
  title: string;
  submitButtonText: string;
  existingRanges: ColorRange[];
};

export type ColorRangeCardProps = {
  colorRange: ColorRange;
  onEdit: () => void;
  onDelete: () => void;
};