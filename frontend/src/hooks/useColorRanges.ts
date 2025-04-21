import { useState, useEffect } from "react";
import axios from "axios";

// Define the type for the ColorRange object
interface ColorRange {
  ID: number;
  Min: number;
  Max: number;
  Color: string;
}

// Custom hook for managing color ranges
export const useColorRanges = () => {
  // State variables
  const [colorRanges, setColorRanges] = useState<ColorRange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [currentColorRangee, setCurrentColorRangee] = useState<ColorRange | null>(null);
  const [colorRangeeToDelete, setColorRangeeToDelete] = useState<number | null>(null);

  // useEffect hook to fetch data from API
  useEffect(() => {
    const fetchColorRanges = async () => {
      try {
        const response = await axios.get("http://localhost:8080/colorranges");
        
        if (Array.isArray(response.data)) {
          setColorRanges(response.data);
        } else {
          throw new Error("Expected an array of color ranges");
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(`Failed to load color ranges: ${err.message}`);
        } else {
          setError("An unknown error occurred while fetching color ranges.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchColorRanges();
  }, []);

  // Function to create a new color range
  const handleCreate = async (colorRange: ColorRange) => {
    try {
      const response = await axios.post("http://localhost:8080/colorranges", colorRange);
      setColorRanges((prev) => [...prev, response.data]);
      setIsCreateDialogOpen(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to create color range: ${err.message}`);
      } else {
        setError("An unknown error occurred while creating color range.");
      }
    }
  };

  // Function to update a color range
  const handleUpdate = async (colorRange: ColorRange) => {
    try {
      const response = await axios.put(`http://localhost:8080/colorranges/${colorRange.ID}`, colorRange);
      setColorRanges((prev) =>
        prev.map((item) => (item.ID === colorRange.ID ? response.data : item))
      );
      setIsEditDialogOpen(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to update color range: ${err.message}`);
      } else {
        setError("An unknown error occurred while updating color range.");
      }
    }
  };

// Function to delete a color range
// Function to delete a color range
const handleDelete = async () => {
  if (colorRangeeToDelete === null || colorRangeeToDelete === undefined) {
    console.error("Invalid color range ID: Cannot delete.");
    setError("Invalid color range ID: Cannot delete.");
    return;
  }
  try {
    // ใช้การลบจริงๆ (ไม่ใช่ soft delete)
    await axios.delete(`http://localhost:8080/colorranges/${colorRangeeToDelete}`, {
      data: { forceDelete: true }, // เพิ่มการตรวจสอบพิเศษหากต้องการลบจริง
    });
    setColorRanges((prev) => prev.filter((item) => item.ID !== colorRangeeToDelete));
    setIsConfirmDialogOpen(false);
  } catch (err) {
    setError("Failed to delete color range");
  }
};


  // Return everything needed for the component
  return {
    colorRanges,
    isLoading,
    error,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    currentColorRangee,
    setCurrentColorRangee,
    handleCreate,
    handleUpdate,
    handleDelete,
    setColorRangeeToDelete,
  };
};
