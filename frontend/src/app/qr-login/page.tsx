"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, QrCode } from "lucide-react";

const FRONTEND_REDIRECT = "http://localhost:3000/qr-create-device";

export default function QRLoginPage() {
  const [qrUrl, setQrUrl] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const generateQR = async () => {
    try {
      setLoading(true);
      setError("");
      setQrUrl("");
      setExpiresAt("");

      const res = await axios.post(
        "http://localhost:8080/admin/qr/generate",
        {},
        {
          params: { redirect: FRONTEND_REDIRECT },
          withCredentials: true,
        }
      );
      const { url, expires_at } = res.data || {};
      setQrUrl(url);
      setExpiresAt(expires_at);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Failed to generate QR");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateQR();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Use a public QR image service to render the URL as QR code (no extra deps)
  const qrImgSrc = qrUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrUrl)}&size=240x240`
    : "";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode size={20} />
            Scan to Login (5 minutes)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col items-center gap-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-60 w-full">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
              </div>
            ) : qrUrl ? (
              <>
                <img
                  src={qrImgSrc}
                  alt="QR code for login"
                  className="border rounded-md p-2 bg-white"
                />
                <p className="text-sm text-gray-500">Expires at: {new Date(expiresAt).toLocaleString()}</p>
                <p className="text-xs text-gray-400 break-all text-center">{qrUrl}</p>
              </>
            ) : (
              <p className="text-sm text-gray-600">No QR yet</p>
            )}
          </div>

          <div className="flex justify-center">
            <Button onClick={generateQR} disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Regenerate QR"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

