import { useState, useEffect } from "react";
import { Device } from "@/constant/deviceData";
import { api } from "../../utils/api";
import { getErrorMessage } from "../../utils/error";

export const useDevices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const [deviceToDelete, setDeviceToDelete] = useState<number | null>(null);
  const [currentDevice, setCurrentDevice] = useState<Device | null>(null);

  const fetchDevices = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<Device[]>("/devices");
      setDevices(response.data || []);
      setError("");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to fetch devices"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (device: Device) => {
    try {
      await api.post("/admin/devices", device, {
        headers: { "Content-Type": "application/json" },
      });
      await fetchDevices();
      setIsCreateDialogOpen(false);
      setCurrentDevice(null);
      setError("");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to create device"));
    }
  };

  const handleUpdate = async (device: Device) => {
    if (!device || !device.dvid) return;
    try {
      await api.put(`/admin/devices/${device.dvid}`, device, {
        headers: { "Content-Type": "application/json" },
      });
      await fetchDevices();
      setIsEditDialogOpen(false);
      setCurrentDevice(null);
      setError("ใช้งานได้แค่เด้งมาให้ตกใจเล่น ๆ");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update device"));
    }
  };

  const handleDelete = async () => {
    if (!deviceToDelete) return;
    try {
      await api.delete(`/admin/devices/${deviceToDelete}`);
      await fetchDevices();
      setIsConfirmDialogOpen(false);
      setDeviceToDelete(null);
      setError("");
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Failed to delete device");
      setError(message);
      console.error("Delete device error:", err);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return {
    devices,
    isLoading,
    error,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    deviceToDelete,
    setDeviceToDelete,
    currentDevice,
    setCurrentDevice,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
};
