/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Newspaper } from 'lucide-react';
import { News } from '@/constant/newsData';

interface DashNewsCardProps {
  news: News;
}

const DashNewsCard: React.FC<DashNewsCardProps> = ({ news }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const truncatedDescription = news.description.length > 100 ? `${news.description.substring(0, 100)}...` : news.description;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="h-1 bg-purple-500 w-full"></div>
      <div className="p-4">
        <div className="flex items-center justify-center mb-4">
          {news.image ? (
            <img
              src={news.image}
              alt={news.title}
              className="w-24 h-16 object-contain rounded-lg border-2 border-purple-100"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
              <Newspaper className="h-8 w-8 text-purple-600" />
            </div>
          )}
        </div>
        <h3 className="text-center text-base font-bold text-slate-800 mb-2">
          {news.title}
        </h3>
        <p className="text-xs text-purple-500 text-center mb-2">
          {new Date(news.date).toLocaleDateString()}
        </p>
        <p className="text-gray-500 break-words whitespace-normal">
          {isExpanded ? news.description : truncatedDescription}
        </p>
        {news.description.length > 100 && (
          <button
            onClick={toggleExpand}
            className="text-sm text-purple-600 hover:text-purple-800 mt-2 focus:outline-none"
          >
            {isExpanded ? 'Read Less' : 'Read More'}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default DashNewsCard; 