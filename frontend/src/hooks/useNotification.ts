/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { useState, useEffect } from "react";
import { Notification } from "@/constant/notificationData";

export const useNotifications = () => {
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [currentNotification, setCurrentNotification] = useState<Notification>({
    id: null,
    title: "",
    message: "",
    icon: "",
  });

  const checkAuth = async () => {
    try {
      const response = await fetch("http://localhost:8080/me", { credentials: "include" });
      if (!response.ok) throw new Error("Unauthorized");
    } catch (err) {
      window.location.href = "/login";
    }
  };

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:8080/notifications", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data: Notification[] = await response.json();
      setNotifications(data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(currentNotification),
      });
      if (!response.ok) throw new Error("Failed to create notification");
      await fetchNotifications();
      setIsCreateDialogOpen(false);
      setCurrentNotification({ id: null, title: "", message: "", icon: "" });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNotification.id) return;
    try {
      const response = await fetch(`http://localhost:8080/admin/notifications/${currentNotification.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(currentNotification),
      });
      if (!response.ok) throw new Error("Failed to update notification");
      await fetchNotifications();
      setIsEditDialogOpen(false);
      setCurrentNotification({ id: null, title: "", message: "", icon: "" });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!notificationToDelete) return;
    try {
      const response = await fetch(`http://localhost:8080/admin/notifications/${notificationToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete notification");
      await fetchNotifications();
      setIsConfirmDialogOpen(false);
      setNotificationToDelete(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    checkAuth();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredNotifications(
        notifications.filter((notification) =>
          notification.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredNotifications(notifications);
    }
  }, [searchQuery, notifications]);

  return {
    filteredNotifications,
    searchQuery,
    setSearchQuery,
    notifications,
    isLoading,
    error,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    notificationToDelete,
    setNotificationToDelete,
    currentNotification,
    setCurrentNotification,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
};