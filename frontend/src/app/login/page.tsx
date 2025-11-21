"use client";

import { useState, useEffect, startTransition, FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2, Eye, EyeOff, User, Lock } from "lucide-react";
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import qs from "qs";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';

const LoginPage = () => {
  const router = useRouter();
  

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const LOGIN_TIMEOUT_MS = 10000; // 10 seconds

  useEffect(() => {
    const savedUsername = localStorage.getItem("rememberedUsername");
    if (savedUsername) {
      setFormData((prev) => ({
        ...prev,
        username: savedUsername,
        rememberMe: true,
      }));
    }

    const hasAccessToken =
      typeof document !== "undefined" &&
      document.cookie
        .split(";")
        .some((cookie) => cookie.trim().startsWith("access_token="));

    if (hasAccessToken) {
      // Prefetch only when auth cookie exists to avoid caching redirect responses
      router.prefetch("/dashboard");
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("Username is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    return true;
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    if (loginAttempts >= 5) {
      setError('Too many login attempts. Please try again later.');
      return;
    }
  
    setIsSubmitting(true);
    setError('');
  
    try {
      const response = await axios.post(
        `${API_BASE_URL}/login`,
        qs.stringify({
          username: formData.username.trim(),
          password: formData.password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000,
          withCredentials: true,
        }
      );

      if (formData.rememberMe) {
        localStorage.setItem("rememberedUsername", formData.username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      // ใช้ transition เพื่อลดการ block UI ตอนเปลี่ยนหน้า
      startTransition(() => {
        router.push("/dashboard");
      });
    } catch (err: any) {
  // แยกกรณี timeout vs credential ผิด
  if (err.code === "ECONNABORTED") {
    setError(`Login timed out after ${LOGIN_TIMEOUT_MS / 1000}s. Please try again.`);
  } else if (err.response?.status === 401) {
    setError("Invalid username or password.");
  } else if (err.response) {
    setError(err.response.data?.message ?? `Login failed (HTTP ${err.response.status}).`);
  } else {
    setError("Network error. Please check your connection.");
  }
  setIsSubmitting(false);
}
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/assets/background.webp')" }}
    >
      <Card className="w-[90%] sm:w-[400px] bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg rounded-xl p-6">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold">
            Login Form
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert
                variant="destructive"
                className="border border-red-300 bg-red-100 text-red-800"
              >
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="username">Enter your username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-white/70" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="pl-10 bg-white/10 text-white placeholder-white/60 border-white/30 focus:border-white focus:ring-white"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Enter your password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-white/70" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 bg-white/10 text-white placeholder-white/60 border-white/30 focus:border-white focus:ring-white"
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-white/70" />
                  ) : (
                    <Eye className="h-4 w-4 text-white/70" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-white">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="accent-white"
                />
                <Label htmlFor="rememberMe">Remember me</Label>
              </div>
            </div>
          </CardContent>

          <CardFooter className="mt-4 flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-gray-100 disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging in...
                </span>
              ) : (
                "Log In"
              )}
            </Button>

            <p className="text-sm text-white text-center">
              Don&apos;t have an account?{" "}
              <Button
                type="button"
                variant="link"
                className="px-0 text-indigo-500 hover:text-indigo-700 font-medium"
                onClick={() => router.push("/register")}
              >
                Register
              </Button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
