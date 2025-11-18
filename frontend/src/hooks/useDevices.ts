import { useState, useEffect } from "react";
import { Device } from "@/constant/deviceData";
import { api } from "../../utils/api";

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
    } catch (err) {
      setError((err as Error).message);
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
    } catch (err) {
      setError((err as Error).message);
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
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message);
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
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message);
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
