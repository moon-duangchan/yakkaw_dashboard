import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NewsFormDialogProps } from "@/constant/newsData";

export const FormDialog: React.FC<NewsFormDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  news,
  setNews,
  categories, // ✅ รับ categories จาก props
  title,
  submitButtonText,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            placeholder="Title"
            value={news.title}
            onChange={(e) => setNews({ ...news, title: e.target.value })}
            required
          />
          <Textarea
            placeholder="Description"
            value={news.description}
            onChange={(e) => setNews({ ...news, description: e.target.value })}
            required
          />
          <Input
            placeholder="Image URL"
            value={news.image}
            onChange={(e) => setNews({ ...news, image: e.target.value })}
            required
          />
          <Input
            placeholder="News URL"
            value={news.url}
            onChange={(e) => setNews({ ...news, url: e.target.value })}
            required
          />
          {/* ✅ Dropdown สำหรับเลือก Category */}
          <select
            value={news.category_id}
            onChange={(e) => setNews({ ...news, category_id: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <DialogFooter>
            <Button type="submit" className="bg-indigo-500 hover:bg-indigo-700">
              {submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
