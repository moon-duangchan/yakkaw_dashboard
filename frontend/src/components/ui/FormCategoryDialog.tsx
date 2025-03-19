import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryFormDialogProps } from "@/constant/categoryData";

export const FormDialog: React.FC<CategoryFormDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  category,
  setCategory,
  title,
  submitButtonText,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="border-emerald-100">
        <DialogHeader>
          <DialogTitle className="text-emerald-800">{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            placeholder="Category Name"
            value={category.name}
            onChange={(e) => setCategory({ ...category, name: e.target.value })}
            required
            className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
          />
          <DialogFooter>
            <Button type="submit" className="bg-emerald-500 hover:bg-emerald-700 text-white">
              {submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
