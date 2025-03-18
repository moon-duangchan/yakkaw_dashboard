"use client";

import { useState, useEffect } from "react";
import { Category } from "@/constant/categoryData";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<Category>({
    id: null,
    name: "",
  });

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:8080/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(currentCategory),
      });

      if (!response.ok) throw new Error("Failed to create category");

      await fetchCategories();
      setIsCreateDialogOpen(false);
      setCurrentCategory({ id: null, name: "" });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCategory.id) return;
    try {
      const response = await fetch(`http://localhost:8080/admin/categories/${currentCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(currentCategory),
      });

      if (!response.ok) throw new Error("Failed to update category");

      await fetchCategories();
      setIsEditDialogOpen(false);
      setCurrentCategory({ id: null, name: "" });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      const response = await fetch(`http://localhost:8080/admin/categories/${categoryToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete category");

      await fetchCategories();
      setIsConfirmDialogOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    isLoading,
    error,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    categoryToDelete,
    setCategoryToDelete,
    currentCategory,
    setCurrentCategory,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
};
