"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Search, Loader2, Plus } from "lucide-react";
import { useNews } from "@/hooks/useNews";
import { NewsCard } from "@/components/ui/NewsCard";
import { FormDialog } from "@/components/ui/FromNewsDialog";
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import Navbar from "@/components/ui/Navbar";

const NewsPage: React.FC = () => {
  const {
    categories,
    filteredNews,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    setNewsToDelete,
    currentNews,
    setCurrentNews,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useNews();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    exit: {
      scale: 0.96,
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading News...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-purple-50 to-indigo-50 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 max-w-7xl mx-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-purple-800">Manage News</h1>
              <p className="text-purple-600 mt-1">
                Manage News for Post, Edit and Delete
              </p>
            </div>
            <Button
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus size={16} /> Add News
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6"
          >
            <div className="rounded-xl md:col-span-6 relative shadow-lg hover:shadow-xl transition-all duration-300">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400"
                size={20}
              />
              <Input
                placeholder="Search News..."
                className="pl-10 bg-white py-5 rounded-xl focus:ring-5 transition-all duration-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>

          {error && (
            <Alert variant="destructive" className="mb-4 shadow-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <AnimatePresence>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredNews.length === 0 ? (
                <motion.div
                  variants={itemVariants}
                  className="text-center p-10 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100"
                >
                  <h3 className="text-lg font-medium text-purple-700">
                    No News found
                  </h3>
                </motion.div>
              ) : (
                filteredNews.map((newsItem) => (
                  <NewsCard
                    key={newsItem.id}
                    news={newsItem}
                    onEdit={() => {
                      setCurrentNews(newsItem);
                      setIsEditDialogOpen(true);
                    }}
                    onDelete={() => {
                      setNewsToDelete(newsItem.id);
                      setIsConfirmDialogOpen(true);
                    }}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <FormDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreate}
          news={currentNews}
          setNews={setCurrentNews}
          categories={categories} // ✅ ส่ง categories ไปยัง FormDialog
          title="Create News"
          submitButtonText="CREATE"
        />

        <FormDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleUpdate}
          news={currentNews}
          setNews={setCurrentNews}
          categories={categories}
          title="Edit News"
          submitButtonText="Update"
        />

        <ConfirmDeleteDialog
          isOpen={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
          onConfirm={handleDelete}
        />
      </div>
    </>
  );
};

export default NewsPage;
