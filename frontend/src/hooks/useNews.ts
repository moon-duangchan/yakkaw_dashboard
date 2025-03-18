'use client'
import { useState, useEffect } from "react";
import { News, Category } from "@/constant/newsData";

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
      const response = await fetch("http://localhost:8080/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data || []);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch("http://localhost:8080/me", { credentials: "include" });
      if (!response.ok) throw new Error("Unauthorized");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      window.location.href = "/login";
    }
  };

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:8080/news", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch news");
      const data = await response.json();
      setNews(data || []);
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
      const response = await fetch("http://localhost:8080/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...currentNews,
          category_id: Number(currentNews.category_id), // ✅ แปลง category_id เป็น number
          date: currentNews.date ? currentNews.date : new Date().toISOString(), // ✅ ตั้งค่า date เป็นปัจจุบันถ้าว่าง
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to create news:", errorText);
        throw new Error("Failed to create news: " + errorText);
      }
  
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
      const response = await fetch(`http://localhost:8080/admin/news/${currentNews.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...currentNews,
          category_id: Number(currentNews.category_id), // ✅ แปลง category_id เป็น number
          date: currentNews.date ? currentNews.date : new Date().toISOString(), // ✅ ตั้งค่า date เป็นปัจจุบันถ้าว่าง
        }),
      });

      if (!response.ok) throw new Error("Failed to update news");

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
      const response = await fetch(`http://localhost:8080/admin/news/${newsToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete news");

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
