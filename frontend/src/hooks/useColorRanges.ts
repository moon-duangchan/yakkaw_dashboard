import { useState, useEffect } from "react";
import { ColorRange } from "@/constant/colorRangeData";
import { api } from "../../utils/api";
import { getErrorMessage } from "../../utils/error";

type ColorRangeApi = {
  ID?: number;
  Min: number;
  Max: number;
  Color: string;
};

const mapApiToColorRange = (colorRange: ColorRangeApi): ColorRange => ({
  ID: colorRange.ID,
  min: colorRange.Min,
  max: colorRange.Max,
  color: colorRange.Color,
});

const mapColorRangeToApi = (colorRange: ColorRange): ColorRangeApi => ({
  ID: colorRange.ID,
  Min: colorRange.min,
  Max: colorRange.max,
  Color: colorRange.color,
});

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
      const response = await api.get<ColorRangeApi[]>("/colorranges");
      const normalizedData = (response.data || []).map(mapApiToColorRange);
      setColorRanges(normalizedData);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load color ranges"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (colorRange: ColorRange) => {
    try {
      await api.post("/admin/colorranges", mapColorRangeToApi(colorRange), {
        headers: { "Content-Type": "application/json" },
      });
      await fetchColorRanges();
      setIsCreateDialogOpen(false);
      setCurrentColorRange(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to create color range"));
    }
  };

  
  const handleUpdate = async (colorRange: ColorRange) => {
    if (!colorRange || !colorRange.ID) return;
    try {
      await api.put(`/admin/colorranges/${colorRange.ID}`, mapColorRangeToApi(colorRange), {
        headers: { "Content-Type": "application/json" },
      });
      await fetchColorRanges();
      setIsEditDialogOpen(false);
      setCurrentColorRange(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update color range"));
    }
  };

  const handleDelete = async () => {
    if (!colorRangeToDelete) return;
    try {
      await api.delete(`/admin/colorranges/${colorRangeToDelete}`);
      await fetchColorRanges();
      setIsConfirmDialogOpen(false);
      setColorRangeToDelete(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to delete color range"));
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
