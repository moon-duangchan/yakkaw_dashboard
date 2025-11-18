"use client";

import { useState, useEffect } from "react";
import { Category } from "@/constant/categoryData";
import { api } from "../../utils/api";

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
      const response = await api.get<Category[]>("/categories");
      setCategories(response.data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/categories", currentCategory, {
        headers: { "Content-Type": "application/json" },
      });
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
      await api.put(`/admin/categories/${currentCategory.id}`, currentCategory, {
        headers: { "Content-Type": "application/json" },
      });
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
      await api.delete(`/admin/categories/${categoryToDelete}`);
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
