/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell} from 'lucide-react';

const DashNotificationCard = ({ notification }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const truncatedMessage = notification.message.length > 100 ? `${notification.message.substring(0, 100)}...` : notification.message;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="h-1 bg-indigo-500 w-full"></div>
      <div className="p-4">
        <div className="flex items-start mb-3">
          {notification.icon ? (
            <img
              src={notification.icon}
              alt={notification.title}
              className="w-10 h-10 object-cover rounded-full mr-3 border border-slate-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
              <Bell className="h-5 w-5 text-indigo-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-800 truncate">
              {notification.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
        <p className="text-gray-600 break-words whitespace-normal">
          {isExpanded ? notification.message : truncatedMessage}
        </p>
        {notification.message.length > 100 && (
          <button
            onClick={toggleExpand}
            className="text-sm text-indigo-600 hover:text-indigo-800 mt-2 focus:outline-none"
          >
            {isExpanded ? 'Read Less' : 'Read More'}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default DashNotificationCard;