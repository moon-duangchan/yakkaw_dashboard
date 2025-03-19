import React from "react";
import { motion } from "framer-motion";
import {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { CategoryCardProps } from "@/constant/categoryData";

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onEdit, onDelete }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg overflow-hidden border border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-4 border-emerald-500">
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg font-medium text-emerald-800">{category.name}</CardTitle>
        </div>
        <div className="flex gap-1">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" onClick={onEdit} className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50">
              <Pencil size={16} />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50">
              <Trash2 size={16} />
            </Button>
          </motion.div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-grow">
        <p className="text-sm text-emerald-700 mb-2 break-words whitespace-normal">
          Category ID: {category.id}
        </p>
      </CardContent>
    </motion.div>
  );
};
