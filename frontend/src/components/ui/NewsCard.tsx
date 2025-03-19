import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { NewsCardProps } from "@/constant/newsData";

export const NewsCard: React.FC<NewsCardProps> = ({ news, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  // ตัดคำอธิบายถ้าความยาวเกิน 50 ตัวอักษร
  const shouldTruncate = news.description.length > 50;
  const truncatedDescription = shouldTruncate
    ? `${news.description.substring(0, 50)}...`
    : news.description;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg overflow-hidden border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-4 border-purple-500">
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg font-medium text-purple-800">
            {news.title}
            <p className="text-xs text-purple-500 mt-2">
              {new Date(news.date).toLocaleDateString()}
            </p>
          </CardTitle>
        </div>
        <div className="flex gap-1">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" onClick={onEdit} className="text-purple-600 hover:text-purple-800 hover:bg-purple-50">
              <Pencil size={16} />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-purple-600 hover:text-purple-800 hover:bg-purple-50">
              <Trash2 size={16} />
            </Button>
          </motion.div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-grow">
        <p className="text-sm text-purple-700 mb-2 break-words whitespace-normal">
          {isExpanded ? news.description : truncatedDescription}
        </p>
        {shouldTruncate && (
          <Button
            variant="link"
            className="p-0 h-auto text-purple-600 hover:text-purple-800"
            onClick={toggleExpand}
          >
            {isExpanded ? "Read Less" : "Read More"}
          </Button>
        )}
      </CardContent>
      {news.image && (
        <CardFooter className="pt-0 pb-10">
          <div className="w-full flex justify-center mt-3">
            <motion.img
              src={news.image}
              alt={news.title}
              className="w-[200px] h-[100px] rounded-md border-2 border-purple-200 object-contain shadow-md hover:shadow-lg transition-all duration-300"
            />
          </div>
        </CardFooter>
      )}
    </motion.div>
  );
};
