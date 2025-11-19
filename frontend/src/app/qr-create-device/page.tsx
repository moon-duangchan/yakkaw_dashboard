"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus } from "lucide-react";
import { api } from "../../../utils/api";
import { getErrorMessage } from "../../../utils/error";

type Device = {
  dvid: string;
  address: string;
  longitude: number;
  latitude: number;
  place: string;
  models: string;
  contact_name: string;
  contact_phone: string;
  deploy_date: string; // ISO string
};

export default function QRCreateDevicePage() {
  const router = useRouter();
  const [device, setDevice] = useState<Device>({
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "longitude" || name === "latitude") {
      setDevice({ ...device, [name]: parseFloat(value) });
    } else {
      setDevice({ ...device, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/admin/devices", device, {
        headers: { "Content-Type": "application/json" },
      });
      setSuccess("Device created successfully");
      // Optional: go to device list
      // router.push('/DevicePage');
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to create device"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus size={18} /> Create Device (QR Login)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>
          )}
          {success && (
            <Alert className="mb-4"><AlertDescription>{success}</AlertDescription></Alert>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">DVID</label>
              <Input name="dvid" value={device.dvid} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <Input name="address" value={device.address} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Latitude</label>
              <Input type="number" step="any" name="latitude" value={device.latitude} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Longitude</label>
              <Input type="number" step="any" name="longitude" value={device.longitude} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Place</label>
              <Input name="place" value={device.place} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Models</label>
              <Input name="models" value={device.models} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Name</label>
              <Input name="contact_name" value={device.contact_name} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
              <Input name="contact_phone" value={device.contact_phone} onChange={handleChange} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Deploy Date</label>
              <Input
                type="datetime-local"
                name="deploy_date"
                value={new Date(device.deploy_date).toISOString().slice(0, 16)}
                onChange={(e) => setDevice({ ...device, deploy_date: new Date(e.target.value).toISOString() })}
                required
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Saving...</>) : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
