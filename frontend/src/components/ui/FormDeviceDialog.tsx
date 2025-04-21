"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Device } from "@/types";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (device: Device) => void;
  device: Device;
  setDevice: (device: Device) => void;
  title: string;
  submitButtonText: string;
  
};

export const FormDeviceDialog: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  device,
  setDevice,
  title,
  submitButtonText,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsedValue = name === "Longitude" || name === "Latitude" ? parseFloat(value) : value;
    setDevice({ ...device, [name]: parsedValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(device);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">DVID</label>
            <Input name="DVID" value={device.DVID} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <Input name="Address" value={device.Address} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Longitude</label>
            <Input
              type="number"
              name="Longitude"
              value={device.Longitude}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Latitude</label>
            <Input
              type="number"
              name="Latitude"
              value={device.Latitude}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Place</label>
            <Input name="Place" value={device.Place} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Models</label>
            <Input name="Models" value={device.Models} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Name</label>
            <Input
              name="contact_name"
              value={device.contact_name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
            <Input
              type="number"
              name="contact_phone"
              value={device.contact_phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{submitButtonText}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
