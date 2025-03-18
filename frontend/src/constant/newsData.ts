export type News = {
    id: string | null;
    title: string;
    description: string;
    image: string;
    url: string;
    date: string;
    category_id: string;
  };  
  
  
  export type NewsCardProps = {
    news: News;
    onEdit: () => void;
    onDelete: () => void;
  };
  
  
  export type Category = {
    id: number;
    name: string;
  };

  export type NewsFormDialogProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    news: News;
    setNews: (news: News) => void;
    categories: Category[]; // ✅ เพิ่ม categories ที่จะใช้ใน Dropdown
    title: string;
    submitButtonText: string;
  };

