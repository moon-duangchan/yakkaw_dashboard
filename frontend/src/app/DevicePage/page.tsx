"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { useDevices } from "@/hooks/useDevices";
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import Navbar from "@/components/ui/Navbar";
import { FormDeviceDialog } from "@/components/ui/FormDeviceDialog";

const DevicePage: React.FC = () => {
  const {
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
    setDeviceToDelete,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useDevices();

  const [originalDvid, setOriginalDvid] = React.useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading Devices...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-blue-50 to-indigo-50 min-h-screen flex justify-center pt-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 w-full max-w-5xl"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-blue-800">
                Manage Devices
              </h1>
              <p className="text-blue-600 mt-1">
                Manage DVID, address, and GPS coordinates
              </p>
            </div>
            <Button
              className="bg-blue-500 hover:bg-blue-700"
              onClick={() => {
                setCurrentDevice({
                  id: 0,
                  dvid: "",
                  address: "",
                  longitude: 0,
                  latitude: 0,
                  place: "",
                  models: "",
                  contact_name: "",
                  contact_phone: "",
                  deploy_date: new Date().toISOString(),
                });
                setIsCreateDialogOpen(true);
              }}
            >
              <Plus size={16} /> Add Device
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <AnimatePresence>
            <motion.div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg bg-white shadow">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-blue-800">
                      DVID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-blue-800">
                      Address
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-blue-800">
                      Latitude
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-blue-800">
                      Longitude
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-blue-800">
                      Place
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-blue-800">
                      Models
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-blue-800">
                      Contact Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-blue-800">
                      Contact Phone
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-blue-800">
                      Deploy Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-blue-800">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {devices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="text-center p-6 text-blue-600"
                      >
                        No Devices found
                      </td>
                    </tr>
                  ) : (
                    devices.map((device, index) => (
                      <motion.tr
                        key={device.id ?? `device-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">{device.dvid}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {device.address}
                        </td>
                        <td className="px-4 py-3 text-sm">{device.latitude}</td>
                        <td className="px-4 py-3 text-sm">
                          {device.longitude}
                        </td>
                        <td className="px-4 py-3 text-sm">{device.place}</td>
                        <td className="px-4 py-3 text-sm">{device.models}</td>
                        <td className="px-4 py-3 text-sm">
                          {device.contact_name}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {device.contact_phone}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(device.deploy_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 flex gap-2">
                          <Button
                            className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs"
                            onClick={() => {
                              setCurrentDevice(device);
                              // setOriginalDvid(device.dvid); // เก็บ dvid เดิมไว้
                              setIsEditDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            className="bg-red-500 hover:bg-red-600 text-white text-xs"
                            onClick={() => {
                              if (device.ID) {
                                setDeviceToDelete(device.ID);
                                setIsConfirmDialogOpen(true);
                              } else {
                                console.error("Device DVID is undefined.");
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </motion.div>
          </AnimatePresence>

          {/* Create Dialog */}
          {isCreateDialogOpen && currentDevice && (
            <FormDeviceDialog
              isOpen={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              onSubmit={handleCreate}
              device={currentDevice}
              setDevice={setCurrentDevice}
              title="Create Device"
              submitButtonText="CREATE"
            />
          )}

          {/* Edit Dialog */}
          {isEditDialogOpen && currentDevice && (
            <FormDeviceDialog
              isOpen={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
              onSubmit={handleUpdate}
              device={currentDevice}
              setDevice={setCurrentDevice}
              title="Edit Device"
              submitButtonText="UPDATE"
            />
          )}

          {/* Delete Confirm Dialog */}
          {isConfirmDialogOpen && (
            <ConfirmDeleteDialog
              isOpen={isConfirmDialogOpen}
              onOpenChange={setIsConfirmDialogOpen}
              onConfirm={handleDelete}
            />
          )}
        </motion.div>
      </div>
    </>
  );
};

export default DevicePage;
