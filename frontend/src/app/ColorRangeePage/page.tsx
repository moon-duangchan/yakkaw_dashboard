"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { useColorRanges } from "@/hooks/useColorRanges";
import { FormDialog } from "@/components/ui/FormColorRangeeDialog";
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import Navbar from "@/components/ui/Navbar";

const ColorRangePage: React.FC = () => {
  const {
    colorRanges,
    isLoading,
    error,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    setColorRangeToDelete,
    currentColorRange,
    setCurrentColorRange,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useColorRanges();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading Color Ranges...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-emerald-50 to-green-50 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 max-w-7xl mx-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-emerald-800">Manage Color Ranges</h1>
              <p className="text-emerald-600 mt-1">
                Manage color ranges for min, max, and color values
              </p>
            </div>
            <Button
              className="bg-emerald-500 hover:bg-emerald-700"
              onClick={() => {
                // ✅ เซ็ต default object ตอนกด Add
                setIsCreateDialogOpen(true);
                setCurrentColorRange({ min: 0, max: 0, color: "#00ff00" });
              }}
            >
              <Plus size={16} /> Add Color Range
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <AnimatePresence>
            <motion.div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {colorRanges.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="col-span-full text-center p-10 bg-white rounded-lg shadow-lg border border-green-100"
                >
                  <h3 className="text-lg font-medium text-green-700">
                    No Color Ranges found
                  </h3>
                </motion.div>
              ) : (
                colorRanges.map((colorRange, index) => (
                  <motion.div
                    key={
                      colorRange.ID
                        ? `color-range-${colorRange.ID}`
                        : `color-range-fallback-${index}`
                    }
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-6 bg-white rounded-lg shadow-lg border border-green-100 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-green-700">
                        Color Range #{colorRange.ID ?? "N/A"}
                      </h4>
                      <div
                        className="w-8 h-8 rounded-full border border-gray-200"
                        style={{ backgroundColor: colorRange.color }}
                      />
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Min Value:</span>
                        <span className="font-medium">{colorRange.min}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Max Value:</span>
                        <span className="font-medium">{colorRange.max}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Color:</span>
                        <span className="font-medium">{colorRange.color}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                        onClick={() => {
                          setCurrentColorRange(colorRange);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                        onClick={() => {
                          if (colorRange.ID !== undefined && colorRange.ID !== null) {
                            setColorRangeToDelete(colorRange.ID);
                            setIsConfirmDialogOpen(true);
                          } else {
                            console.error("Invalid color range ID: Cannot delete.");
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>

          {/* ✅ Dialog สำหรับ Create */}
          {isCreateDialogOpen && currentColorRange && (
            <FormDialog
              isOpen={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              onSubmit={handleCreate}
              colorRange={currentColorRange}
              setColorRange={setCurrentColorRange}
              title="Create Color Range"
              submitButtonText="CREATE"
              existingRanges={colorRanges}
            />
          )}
          {/* ✅ Dialog สำหรับ Edit */}
          {isEditDialogOpen && currentColorRange && (
            <FormDialog
              isOpen={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
              onSubmit={handleUpdate}
              colorRange={currentColorRange}
              setColorRange={setCurrentColorRange}
              title="Edit Color Range"
              submitButtonText="UPDATE"
              existingRanges={colorRanges}
            />
          )}

          {/* Confirm Delete Dialog */}
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

export default ColorRangePage;
