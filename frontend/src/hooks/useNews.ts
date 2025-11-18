'use client'
import { useState, useEffect } from "react";
import { News, Category } from "@/constant/newsData";
import { api } from "../../utils/api";

export const useNews = () => {
  const [categories, setCategories] = useState<Category[]>([]); // ✅ เก็บรายการหมวดหมู่
  const [filteredNews, setFilteredNews] = useState<News[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const [newsToDelete, setNewsToDelete] = useState<string | null>(null);
  const [currentNews, setCurrentNews] = useState<News>({
    id: null,
    title: "",
    description: "",
    image: "",
    url: "",
    date: "",
    category_id: "",
  });

  // ✅ ฟังก์ชันดึง Categories จาก API
  const fetchCategories = async () => {
    try {
      const response = await api.get<Category[]>("/categories");
      setCategories(response.data || []);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const checkAuth = async () => {
    try {
      await api.get("/me");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      window.location.href = "/login";
    }
  };

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<News[]>("/news");
      setNews(response.data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ ฟังก์ชันสร้างข่าวใหม่
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sending News Data:", currentNews); // ✅ Debug ดูค่าข้อมูลที่ส่ง
  
    try {
      await api.post("/admin/news", {
        ...currentNews,
        category_id: Number(currentNews.category_id),
        date: currentNews.date ? currentNews.date : new Date().toISOString(),
      });
  
      await fetchNews();
      setIsCreateDialogOpen(false);
      setCurrentNews({ id: null, title: "", description: "", image: "", url: "", date: "", category_id: "" });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // ✅ ฟังก์ชันแก้ไขข่าว
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNews.id) return;
  
    try {
      await api.put(`/admin/news/${currentNews.id}`, {
        ...currentNews,
        category_id: Number(currentNews.category_id),
        date: currentNews.date ? currentNews.date : new Date().toISOString(),
      });

      await fetchNews();
      setIsEditDialogOpen(false);
      setCurrentNews({ id: null, title: "", description: "", image: "", url: "", date: "", category_id: "" });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // ✅ ฟังก์ชันลบข่าว
  const handleDelete = async () => {
    if (!newsToDelete) return;

    try {
      await api.delete(`/admin/news/${newsToDelete}`);

      await fetchNews();
      setIsConfirmDialogOpen(false);
      setNewsToDelete(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    checkAuth();
    fetchCategories(); // ✅ โหลด Categories ตอนเริ่มต้น
    fetchNews();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredNews(
        news.filter((item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredNews(news);
    }
  }, [searchQuery, news]);

  return {
    categories, // ✅ ส่ง categories ออกไปใช้ในหน้า Form
    filteredNews,
    searchQuery,
    setSearchQuery,
    news,
    isLoading,
    error,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    newsToDelete,
    setNewsToDelete,
    currentNews,
    setCurrentNews,
    handleCreate,
    handleUpdate, // ✅ เพิ่มฟังก์ชันแก้ไขข่าว
    handleDelete, // ✅ เพิ่มฟังก์ชันลบข่าว
    fetchCategories, // ✅ ให้เรียก fetchCategories ได้จากภายนอก
  };
};
