import { useState, useEffect } from "react";
import { Device } from "@/constant/deviceData";
import axios from "axios";

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
      const response = await fetch("http://localhost:8080/devices");
      if (!response.ok) throw new Error("อ้าย ๆ มันโหลดบ่ด้าย");
      const data = await response.json();
      setDevices(data || []);
      setError("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (device: Device) => {
    try {
      const response = await fetch("http://localhost:8080/admin/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(device),
      });
      if (!response.ok) throw new Error("Failed to create device");
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
      await axios.put(
        `http://localhost:8080/admin/devices/${device.dvid}`,
        device,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
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
      await axios.delete(`http://localhost:8080/admin/devices/${deviceToDelete}`, {
        withCredentials: true,
      });
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
