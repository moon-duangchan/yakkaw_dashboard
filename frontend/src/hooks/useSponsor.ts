/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { useState, useEffect } from "react";
import { Sponsor } from "@/constant/sponsorData";

export const useSponsors = () => {
  const [filteredSponsors, setFilteredSponsors] = useState<Sponsor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const [sponsorsToDelete, setSponsorsToDelete] = useState<string | null>(null);
  const [currentSponsor, setCurrentSponsors] = useState<Sponsor>({
    id: null,
    name: "",
    description: "",
    logo: "",
  });

  const checkAuth = async () => {
    try {
      const response = await fetch("http://localhost:8080/me", { credentials: "include" });
      if (!response.ok) throw new Error("Unauthorized");
    } catch (err) {
      window.location.href = "/login";
    }
  };

  const fetchSponsors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:8080/sponsors", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch sponsors");
      const data = await response.json();
      setSponsors(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/admin/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(currentSponsor),
      });
      if (!response.ok) throw new Error("Failed to create sponsors");
      await fetchSponsors();
      setIsCreateDialogOpen(false);
      setCurrentSponsors({ id: null, name: "", description: "", logo: "" });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSponsor.id) return;
    try {
      const response = await fetch(`http://localhost:8080/admin/sponsors/${currentSponsor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(currentSponsor),
      });
      if (!response.ok) throw new Error("Failed to update sponsors");
      await fetchSponsors();
      setIsEditDialogOpen(false);
      setCurrentSponsors({ id: null, name: "", description: "", logo: "" });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!sponsorsToDelete) return;
    try {
      const response = await fetch(`http://localhost:8080/admin/sponsors/${sponsorsToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete sponsors");
      await fetchSponsors();
      setIsConfirmDialogOpen(false);
      setSponsorsToDelete(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    checkAuth();
    fetchSponsors();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredSponsors(
        sponsors.filter((sponsor) =>
            sponsor.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredSponsors(sponsors);
    }
  }, [searchQuery, sponsors]);

  return {
    filteredSponsors,
    searchQuery,
    setSearchQuery,
    sponsors,
    isLoading,
    error,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    sponsorsToDelete,
    setSponsorsToDelete,
    currentSponsor,
    setCurrentSponsors,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
};