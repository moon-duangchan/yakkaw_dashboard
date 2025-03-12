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
  BarChart as BarChartIcon,
  Activity
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotification";
import { useSponsors } from "@/hooks/useSponsor";
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

const DashboardPage: React.FC = () => {
  const { filteredNotifications, isLoading: loadingNotifications } = useNotifications();
  const { filteredSponsors, isLoading: loadingSponsors } = useSponsors();

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

  if (loadingNotifications || loadingSponsors) {
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

  // Calculated metrics for notifications
  const todayNotifications = filteredNotifications.length;
  const yesterdayNotifications = todayNotifications - 2; // Mock data - replace with actual calculation
  const notificationChange = todayNotifications - yesterdayNotifications;
  const notificationPercentChange = yesterdayNotifications 
    ? ((notificationChange / yesterdayNotifications) * 100).toFixed(1) 
    : "0";
  
  // Calculated metrics for sponsors
  const todaySponsors = filteredSponsors.length;
  const yesterdaySponsors = todaySponsors - 1; // Mock data - replace with actual calculation
  const sponsorChange = todaySponsors - yesterdaySponsors;
  const sponsorPercentChange = yesterdaySponsors 
    ? ((sponsorChange / yesterdaySponsors) * 100).toFixed(1) 
    : "0";

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
            {/* Notification Metrics */}
            <motion.div variants={item}>
              <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="h-1 bg-indigo-500 w-full"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    Notifications
                  </CardTitle>
                  <Bell className="h-4 w-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-3xl font-bold text-slate-800">
                        {todayNotifications}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Total notifications
                      </p>
                    </div>
                    <div className={`flex items-center text-sm ${notificationChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {notificationChange >= 0 ? (
                        <ChevronUp className="h-4 w-4 mr-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(notificationPercentChange as any)}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sponsor Metrics */}
            <motion.div variants={item}>
              <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="h-1 bg-amber-500 w-full"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    Sponsors
                  </CardTitle>
                  <Users className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-3xl font-bold text-slate-800">
                        {todaySponsors}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Total sponsors
                      </p>
                    </div>
                    <div className={`flex items-center text-sm ${sponsorChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {sponsorChange >= 0 ? (
                        <ChevronUp className="h-4 w-4 mr-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(sponsorPercentChange as any)}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Engagement Rate - Example additional stat */}
            <motion.div variants={item}>
              <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="h-1 bg-emerald-500 w-full"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    Engagement Rate
                  </CardTitle>
                  <Activity className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-3xl font-bold text-slate-800">
                        68%
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Average engagement
                      </p>
                    </div>
                    <div className="flex items-center text-sm text-emerald-500">
                      <ChevronUp className="h-4 w-4 mr-1" />
                      5.2%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Conversion Rate - Example additional stat */}
            <motion.div variants={item}>
              <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="h-1 bg-purple-500 w-full"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    Conversion Rate
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-3xl font-bold text-slate-800">
                        24%
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        From visit to action
                      </p>
                    </div>
                    <div className="flex items-center text-sm text-rose-500">
                      <ChevronDown className="h-4 w-4 mr-1" />
                      2.1%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Charts Section */}
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          >
            <motion.div variants={item}>
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-800">Notification Trends</CardTitle>
                      <CardDescription>Daily notification activity</CardDescription>
                    </div>
                    <BarChartIcon className="h-5 w-5 text-indigo-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={notificationTrends}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                        <Tooltip />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#6366F1" 
                          fillOpacity={1} 
                          fill="url(#colorCount)" 
                          name="Notifications"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="average" 
                          stroke="#8B5CF6" 
                          fillOpacity={1} 
                          fill="url(#colorAvg)" 
                          name="Average"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={item}>
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-800">Sponsor Trends</CardTitle>
                      <CardDescription>Daily sponsor activity</CardDescription>
                    </div>
                    <BarChartIcon className="h-5 w-5 text-amber-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sponsorTrends} barGap={4}>
                        <XAxis dataKey="day" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="count" 
                          fill="#F59E0B" 
                          radius={[4, 4, 0, 0]} 
                          name="Sponsors"
                        />
                        <Bar 
                          dataKey="average" 
                          fill="#D97706" 
                          radius={[4, 4, 0, 0]} 
                          name="Average"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Notifications Section */}
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="mb-8"
          >
            <motion.div variants={item}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">Recent Notifications</h2>
                <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  {filteredNotifications.length} total
                </span>
              </div>
              
              <Card className="border-none shadow-md overflow-hidden">
                {filteredNotifications.length === 0 ? (
                  <div className="p-10 flex flex-col items-center justify-center">
                    <Bell className="h-12 w-12 text-slate-300 mb-3" />
                    <h3 className="text-lg font-medium text-slate-700">No notifications yet</h3>
                    <p className="text-slate-500 text-sm text-center mt-1">
                      When you receive notifications, they will appear here
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                    {filteredNotifications.slice(0, 6).map((notification) => {
                      return(
                      <DashNotificationCard key={notification.id} notification={notification} />
)})}
                  </div>
                )}
                {filteredNotifications.length > 6 && (
                  <div className="px-6 pb-6 flex justify-center">
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                      View all notifications
                    </button>
                  </div>
                )}
              </Card>
            </motion.div>
          </motion.div>

          {/* Sponsors Section */}
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">Active Sponsors</h2>
                <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  {filteredSponsors.length} total
                </span>
              </div>
              
              <Card className="border-none shadow-md overflow-hidden">
                {filteredSponsors.length === 0 ? (
                  <div className="p-10 flex flex-col items-center justify-center">
                    <Users className="h-12 w-12 text-slate-300 mb-3" />
                    <h3 className="text-lg font-medium text-slate-700">No sponsors yet</h3>
                    <p className="text-slate-500 text-sm text-center mt-1">
                      When you add sponsors, they will appear here
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                    {filteredSponsors.map((sponsor) => (
                      <DashSponsorCard key={sponsor.id} sponsor={sponsor} />
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </motion.div>
          
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