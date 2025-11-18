/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { useState, useEffect } from "react";
import { Sponsor } from "@/constant/sponsorData";
import { api } from "../../utils/api";

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
      await api.get("/me");
    } catch (err) {
      window.location.href = "/login";
    }
  };

  const fetchSponsors = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<Sponsor[]>("/sponsors");
      setSponsors(response.data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/sponsors", currentSponsor, {
        headers: { "Content-Type": "application/json" },
      });
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
      await api.put(`/admin/sponsors/${currentSponsor.id}`, currentSponsor, {
        headers: { "Content-Type": "application/json" },
      });
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
      await api.delete(`/admin/sponsors/${sponsorsToDelete}`);
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
