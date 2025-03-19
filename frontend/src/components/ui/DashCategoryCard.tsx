import React from 'react';
import { motion } from 'framer-motion';
import { FolderOpen } from 'lucide-react';
import { Category } from '@/constant/categoryData';

interface DashCategoryCardProps {
  category: Category;
}

const DashCategoryCard: React.FC<DashCategoryCardProps> = ({ category }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="h-1 bg-emerald-500 w-full"></div>
      <div className="p-4">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <FolderOpen className="h-6 w-6 text-emerald-600" />
          </div>
        </div>
        <h3 className="text-center text-base font-bold text-slate-800">
          {category.name}
        </h3>
        <p className="text-xs text-emerald-500 text-center mt-2">
          ID: {category.id}
        </p>
      </div>
    </motion.div>
  );
};

export default DashCategoryCard; 