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
      <DialogContent className="border-purple-100">
        <DialogHeader>
          <DialogTitle className="text-purple-800">{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            placeholder="Title"
            value={news.title}
            onChange={(e) => setNews({ ...news, title: e.target.value })}
            required
            className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
          />
          <Textarea
            placeholder="Description"
            value={news.description}
            onChange={(e) => setNews({ ...news, description: e.target.value })}
            required
            className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
          />
          <Input
            placeholder="Image URL"
            value={news.image}
            onChange={(e) => setNews({ ...news, image: e.target.value })}
            required
            className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
          />
          <Input
            placeholder="News URL"
            value={news.url}
            onChange={(e) => setNews({ ...news, url: e.target.value })}
            required
            className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
          />
          {/* ✅ Dropdown สำหรับเลือก Category */}
          <select
            value={news.category_id}
            onChange={(e) => setNews({ ...news, category_id: e.target.value })}
            required
            className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <DialogFooter>
            <Button type="submit" className="bg-purple-500 hover:bg-purple-700 text-white">
              {submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
