"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { FormDialog } from "@/components/ui/FormCategoryDialog";
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import Navbar from "@/components/ui/Navbar";

const CategoryPage: React.FC = () => {
  const {
    categories,
    isLoading,
    error,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    setCategoryToDelete,
    currentCategory,
    setCurrentCategory,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useCategories();

  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading Categories...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-emerald-50 to-green-50 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 max-w-7xl mx-auto"
        >
          <div className="flex justify-between items-center mb-6">
           <div>
            <h1 className="text-3xl font-bold text-emerald-800">Manage Categories</h1>
            <p className="text-emerald-600 mt-1">
                Manage Categories for Post, Edit and Delete
              </p>
              </div>
            <Button
              className="bg-emerald-500 hover:bg-emerald-700"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus size={16} /> Add Category
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <AnimatePresence>
            <motion.div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categories.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="col-span-full text-center p-10 bg-white rounded-lg shadow-lg border border-green-100"
                >
                  <h3 className="text-lg font-medium text-green-700">
                    No Categories found
                  </h3>
                </motion.div>
              ) : (
                categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onEdit={() => {
                      setCurrentCategory(category);
                      setIsEditDialogOpen(true);
                    }}
                    onDelete={() => {
                      setCategoryToDelete(category.id);
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
          category={currentCategory}
          setCategory={setCurrentCategory}
          title="Create Category"
          submitButtonText="CREATE"
        />

        <FormDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleUpdate}
          category={currentCategory}
          setCategory={setCurrentCategory}
          title="Edit Category"
          submitButtonText="UPDATE"
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

export default CategoryPage;
