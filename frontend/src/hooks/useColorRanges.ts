import { useState, useEffect } from "react";
import { api } from "../../utils/api";

interface ColorRange {
  ID: number;
  Min: number;
  Max: number;
  Color: string;
}

export const useColorRanges = () => {
  const [colorRanges, setColorRanges] = useState<ColorRange[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const [colorRangeToDelete, setColorRangeToDelete] = useState<number | null>(null);
  const [currentColorRange, setCurrentColorRange] = useState<ColorRange | null>(null);


  const fetchColorRanges = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<ColorRange[]>("/colorranges");
      setColorRanges(response.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (colorRange: ColorRange) => {
    try {
      await api.post("/admin/colorranges", colorRange, {
        headers: { "Content-Type": "application/json" },
      });
      await fetchColorRanges();
      setIsCreateDialogOpen(false);
      setCurrentColorRange(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  
  const handleUpdate = async (e: React.FormEvent) => {
   
    if (!currentColorRange || !currentColorRange.ID) return;
    try {
      await api.put(`/admin/colorranges/${currentColorRange.ID}`, currentColorRange, {
        headers: { "Content-Type": "application/json" },
      });
      await fetchColorRanges();
      setIsEditDialogOpen(false);
      setCurrentColorRange(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  const handleDelete = async () => {
    if (!colorRangeToDelete) return;
    try {
      await api.delete(`/admin/colorranges/${colorRangeToDelete}`);
      await fetchColorRanges();
      setIsConfirmDialogOpen(false);
      setColorRangeToDelete(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchColorRanges();
  }, []);

  return {
    colorRanges,
    isLoading,
    error,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    colorRangeToDelete,
    setColorRangeToDelete,
    currentColorRange,
    setCurrentColorRange,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
};
