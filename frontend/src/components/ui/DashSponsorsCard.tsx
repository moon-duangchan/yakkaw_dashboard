/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { Sponsor } from '@/constant/sponsorData';

type DashSponsorCardProps = {
  sponsor: Sponsor;
};

const DashSponsorCard: React.FC<DashSponsorCardProps> = ({ sponsor }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const truncatedDescription = sponsor.description.length > 100 ? `${sponsor.description.substring(0, 100)}...` : sponsor.description;

  return (
    <motion.div
      key={sponsor.id}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="h-1 bg-amber-500 w-full"></div>
      <div className="p-4">
        <div className="flex items-center justify-center mb-4">
          {sponsor.logo ? (
            <img
              src={sponsor.logo}
              alt={sponsor.name}
              className="w-24 h-16 object-contain rounded-full border-2 border-amber-100"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
              <Users className="h-8 w-8 text-amber-600" />
            </div>
          )}
        </div>
        <h3 className="text-center text-base font-bold text-slate-800">
          {sponsor.name}
        </h3>
        <p className="text-gray-500 break-words whitespace-normal">
          {isExpanded ? sponsor.description : truncatedDescription}
        </p>
        {sponsor.description.length > 100 && (
          <button
            onClick={toggleExpand}
            className="text-sm text-amber-600 hover:text-amber-800 mt-2 focus:outline-none"
          >
            {isExpanded ? 'Read Less' : 'Read More'}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default DashSponsorCard;
