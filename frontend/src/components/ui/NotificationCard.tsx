/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { NotificationCardProps } from "@/constant/notificationData";

export const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Determine if message needs truncation
  const shouldTruncate = notification.message.length > 50;
  const truncatedMessage = shouldTruncate 
    ? `${notification.message.substring(0, 50)}...` 
    : notification.message;

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg overflow-hidden border border-slate-100 shadow-md hover:shadow-md transition-all duration-200 flex flex-col"
    >
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-4 border-indigo-500">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg font-medium">{notification.title}<p className="text-xs text-slate-500 mt-2">
            {new Date().toLocaleDateString()}
          </p></CardTitle>
            
          </div>
          <div className="flex gap-1">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" onClick={onEdit}>
                <Pencil size={16} />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" onClick={onDelete}>
                <Trash2 size={16} />
              </Button>
            </motion.div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 flex-grow">
          <p className="text-gray-600 break-words whitespace-normal">
            {isExpanded ? notification.message : truncatedMessage}
          </p>
          {shouldTruncate && (
            <Button 
              variant="link" 
              className="p-0 h-auto text-indigo-600 hover:text-indigo-800"
              onClick={toggleExpand}
            >
              {isExpanded ? 'Read Less' : 'Read More'}
            </Button>
          )}
        </CardContent>
        {notification.icon && (
          <CardFooter className="pt-0 pb-10">
            <div className="w-full flex justify-center">
              <motion.img 
                src={notification.icon} 
                alt={notification.title} 
                className="w-[120px] h-[100px] rounded-full border-2 border-slate-200 object-contain" 
              />
            </div>
          </CardFooter>
        )}
    </motion.div>
  );
};
