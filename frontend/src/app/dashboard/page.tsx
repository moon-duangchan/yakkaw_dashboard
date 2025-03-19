"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Bell, 
  Users, 
  Loader2, 
  TrendingUp, 
  Calendar, 
  ChevronUp, 
  ChevronDown,
  BarChartIcon,
  Activity,
  Newspaper,
  FolderOpen,
  Gift
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotification";
import { useSponsors } from "@/hooks/useSponsor";
import { useNews } from "@/hooks/useNews";
import { useCategories } from "@/hooks/useCategories";
import Navbar from "@/components/ui/Navbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Legend
} from "recharts";
import DashNotificationCard from "@/components/ui/DashNotificationCard";
import DashSponsorCard from "@/components/ui/DashSponsorsCard";
import DashNewsCard from "@/components/ui/DashNewsCard";
import DashCategoryCard from "@/components/ui/DashCategoryCard";

const DashboardPage: React.FC = () => {
  const { filteredNotifications, isLoading: loadingNotifications } = useNotifications();
  const { filteredSponsors, isLoading: loadingSponsors } = useSponsors();
  const { filteredNews, isLoading: loadingNews } = useNews();
  const { categories, isLoading: loadingCategories } = useCategories();

  // Mock data for the charts (replace with real data from your API)
  const notificationTrends = [
    { day: "Mon", count: 12, average: 10 },
    { day: "Tue", count: 19, average: 12 },
    { day: "Wed", count: 8, average: 9 },
    { day: "Thu", count: 15, average: 11 },
    { day: "Fri", count: 10, average: 10 },
    { day: "Sat", count: 5, average: 6 },
    { day: "Sun", count: 7, average: 7 },
  ];

  const sponsorTrends = [
    { day: "Mon", count: 3, average: 2 },
    { day: "Tue", count: 7, average: 4 },
    { day: "Wed", count: 2, average: 3 },
    { day: "Thu", count: 5, average: 4 },
    { day: "Fri", count: 4, average: 3 },
    { day: "Sat", count: 1, average: 2 },
    { day: "Sun", count: 6, average: 3 },
  ];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loadingNotifications || loadingSponsors || loadingNews || loadingCategories) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center">
          <Loader2 className="animate-spin h-12 w-12 text-indigo-600 mb-4" />
          <p className="text-lg font-medium text-slate-700">Loading dashboard...</p>
          <p className="text-sm text-slate-500">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  // Calculated metrics
  const todayNotifications = filteredNotifications.length;
  const todaySponsors = filteredSponsors.length;
  const todayNews = filteredNews.length;
  const totalCategories = categories.length;

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-slate-50 to-slate-100 min-h-screen p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-slate-600 mt-1">
                Welcome back! Here's your activity overview
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-2 bg-white py-2 px-4 rounded-lg shadow-sm">
              <Calendar className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-medium text-slate-600">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* Notification Stats */}
            <motion.div variants={item}>
              <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="h-1 bg-blue-500 w-full"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    Notifications
                  </CardTitle>
                  <Bell className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{todayNotifications}</div>
                  <p className="text-xs text-slate-500 mt-1">Total notifications</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sponsor Stats */}
            <motion.div variants={item}>
              <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="h-1 bg-amber-500 w-full"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    Sponsors
                  </CardTitle>
                  <Gift className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{todaySponsors}</div>
                  <p className="text-xs text-slate-500 mt-1">Total sponsors</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* News Stats */}
            <motion.div variants={item}>
              <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="h-1 bg-purple-500 w-full"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    News
                  </CardTitle>
                  <Newspaper className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{todayNews}</div>
                  <p className="text-xs text-slate-500 mt-1">Total news items</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Categories Stats */}
            <motion.div variants={item}>
              <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="h-1 bg-emerald-500 w-full"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    Categories
                  </CardTitle>
                  <FolderOpen className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{totalCategories}</div>
                  <p className="text-xs text-slate-500 mt-1">Total categories</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Notifications Section */}
            <motion.div variants={container} initial="hidden" animate="show">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">Recent Notifications</h2>
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {filteredNotifications.length} total
                </span>
              </div>
              <Card className="border-none shadow-md">
                <CardContent className="p-4">
                  {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Bell className="h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-slate-500">No notifications yet</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {filteredNotifications.slice(0, 3).map((notification) => (
                        <DashNotificationCard key={notification.id} notification={notification} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Sponsors Section */}
            <motion.div variants={container} initial="hidden" animate="show">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">Active Sponsors</h2>
                <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  {filteredSponsors.length} total
                </span>
              </div>
              <Card className="border-none shadow-md">
                <CardContent className="p-4">
                  {filteredSponsors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Users className="h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-slate-500">No sponsors yet</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {filteredSponsors.slice(0, 3).map((sponsor) => (
                        <DashSponsorCard key={sponsor.id} sponsor={sponsor} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* News Section */}
            <motion.div variants={container} initial="hidden" animate="show">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">Latest News</h2>
                <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                  {filteredNews.length} total
                </span>
              </div>
              <Card className="border-none shadow-md">
                <CardContent className="p-4">
                  {filteredNews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Newspaper className="h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-slate-500">No news yet</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {filteredNews.slice(0, 3).map((news) => (
                        <DashNewsCard key={news.id} news={news} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Categories Section */}
            <motion.div variants={container} initial="hidden" animate="show">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">Categories</h2>
                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  {categories.length} total
                </span>
              </div>
              <Card className="border-none shadow-md">
                <CardContent className="p-4">
                  {categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <FolderOpen className="h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-slate-500">No categories yet</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {categories.slice(0, 3).map((category) => (
                        <DashCategoryCard key={category.id} category={category} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 text-center text-sm text-slate-500"
          >
            <p>© {new Date().getFullYear()} Yakkaw. All rights reserved.</p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default DashboardPage;