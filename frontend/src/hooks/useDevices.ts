import { useState, useEffect } from "react";
import axios from "axios";
import { Device } from "@/types"; // สมมุติว่ามี type นี้

export const useDevices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [currentDevice, setCurrentDevice] = useState<Device | null>(null); // ✅ สำคัญ
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<number | null>(null);

  const fetchDevices = async () => {
    try {
      const res = await axios.get("http://localhost:8080/devices");
      setDevices(res.data);
    } catch (err) {
      setError("Failed to fetch devices.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleCreate = async (device: Device) => {
    await axios.post("http://localhost:8080/devices", device);
    fetchDevices();
  };

  const handleUpdate = async (device: Device) => {
    await axios.put(`http://localhost:8080/devices/${device.dvid}`, device);
    fetchDevices();
  };

  const handleDelete = async () => {
    if (!deviceToDelete) {
      console.error("No device selected for deletion. deviceToDelete:", deviceToDelete);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/devices/${deviceToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete the device.");
      }

      // Refresh the devices list after deletion
      await fetchDevices();
      setIsConfirmDialogOpen(false);
    } catch (error) {
      console.error("Error deleting device:", error);
      alert("Failed to delete the device. Please try again.");
    }
  };
  
  // console.log(devices);

  return {
    devices,
    isLoading,
    error,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    currentDevice,
    setCurrentDevice, 
    handleCreate,
    handleUpdate,
    handleDelete,
    deviceToDelete,
    setDeviceToDelete,
  };
};
