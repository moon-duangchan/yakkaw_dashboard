export type Category = {
    id: string | null;
    name: string;
  };
  
  export type CategoryFormDialogProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    category: Category;
    setCategory: (category: Category) => void;
    title: string;
    submitButtonText: string;
  };
  
  export type CategoryCardProps = {
    category: Category;
    onEdit: () => void;
    onDelete: () => void;
  };
  