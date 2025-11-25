"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Loader2,
  Eye,
  EyeOff,
  UserRound,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Wifi,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Iridescence from "@/components/Iridescence";
import { api, API_BASE_URL } from "../../../utils/api";
import { getErrorMessage } from "../../../utils/error";

type FormState = {
  username: string;
  password: string;
  rememberMe: boolean;
};

const LOGIN_TIMEOUT_MS = 10000;
const MAX_ATTEMPTS = 5;

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormState>({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isCheckingSession, setIsCheckingSession] = useState(false);

  useEffect(() => {
    const savedUsername = localStorage.getItem("rememberedUsername");
    if (savedUsername) {
      setFormData((prev) => ({
        ...prev,
        username: savedUsername,
        rememberMe: true,
      }));
    }
  }, []);

  useEffect(() => {
    const hasAccessToken =
      typeof document !== "undefined" &&
      document.cookie
        .split(";")
        .some((cookie) => cookie.trim().startsWith("access_token="));

    if (!hasAccessToken) return;

    setIsCheckingSession(true);
    api
      .get("/me")
      .then(() => router.replace("/dashboard"))
      .catch(() => setIsCheckingSession(false));
  }, [router]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
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
    setError("");

    if (!validateForm()) return;

    if (attempts >= MAX_ATTEMPTS) {
      setError("Too many login attempts. Please try again later.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post(
        "/login",
        {
          username: formData.username.trim(),
          password: formData.password,
        },
        { timeout: LOGIN_TIMEOUT_MS },
      );

      if (formData.rememberMe) {
        localStorage.setItem("rememberedUsername", formData.username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      router.replace("/dashboard");
    } catch (err: unknown) {
      setAttempts((prev) => prev + 1);
      const axiosError = axios.isAxiosError(err) ? err : null;

      if (axiosError) {
        if (axiosError.code === "ECONNABORTED") {
          setError(
            `Login timed out after ${LOGIN_TIMEOUT_MS / 1000}s. Please try again.`,
          );
        } else if (axiosError.code === "ERR_NETWORK") {
          const target = axiosError.config?.baseURL ?? API_BASE_URL;
          setError(`Cannot reach ${target}. Ensure the API is running and CORS allows this origin.`);
        } else if (axiosError.response?.status === 401) {
          setError("Invalid username or password.");
        } else if (axiosError.response?.status) {
          const apiMessage =
            (axiosError.response.data as { message?: string; error?: string })?.message ??
            (axiosError.response.data as { message?: string; error?: string })?.error;
          setError(apiMessage ?? `Login failed (HTTP ${axiosError.response.status}).`);
        } else {
          setError(getErrorMessage(err, "Network error. Please check your connection."));
        }
      } else {
        setError(getErrorMessage(err, "Unexpected error. Please try again."));
      }

      console.error("Login error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const disableForm = isSubmitting || isCheckingSession;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <Iridescence
        color={[0.8, 0.9, 1]}
        speed={0.7}
        amplitude={0.12}
        className="absolute inset-0 opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/85 to-slate-950" />

      <div className="relative max-w-5xl mx-auto px-4 py-12 md:py-16">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Image
              src="/assets/yakkaw_icon.png"
              alt="Yakkaw"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full ring-2 ring-white/10"
            />
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-300">
                Yakkaw
              </p>
              <p className="text-base text-slate-400">
                Air Quality & Device Operations
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="hidden sm:inline-flex border-white/20 text-white hover:bg-white/10"
            onClick={() => router.push("/register")}
          >
            Create account
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] items-start">
          <Card className="bg-white/10 border-white/15 backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-3">
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                <ShieldCheck className="h-7 w-7 text-emerald-300" />
                Secure sign-in
              </CardTitle>
              <CardDescription className="text-slate-200 text-base leading-relaxed">
                Authenticate with your dashboard credentials to manage devices, monitor
                notifications, and keep the Yakkaw network healthy.
              </CardDescription>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: Sparkles, label: "JWT cookie auth", tone: "border-indigo-300/60 bg-indigo-500/10" },
                  { icon: Wifi, label: "Backend: /login @ 8080", tone: "border-cyan-300/60 bg-cyan-500/10" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm text-slate-100 ${item.tone}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent className="text-slate-200 leading-relaxed">
              <p className="mb-2">
                Sessions are stored in an HttpOnly <code className="bg-white/10 px-1 py-0.5 rounded">access_token</code> cookie.
                Make sure the backend is running and reachable at <code className="bg-white/10 px-1 py-0.5 rounded">{API_BASE_URL}</code>.
              </p>
              <p>
                Need an account? Use the register link to create one, then return here to access the dashboard.
              </p>
            </CardContent>
            <CardFooter className="text-xs text-slate-400">
              Your credentials are sent over HTTPS in production; in development, the API expects
              <span className="mx-1 font-semibold text-white">http://localhost:8080</span>.
            </CardFooter>
          </Card>

          <Card className="bg-white/90 text-slate-900 shadow-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <UserRound className="h-6 w-6 text-indigo-600" />
                Welcome back
              </CardTitle>
              <CardDescription className="text-slate-600">
                Sign in with your username and password to continue.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {attempts > 0 && !error && (
                  <Alert className="border-amber-200 bg-amber-50 text-amber-800">
                    <AlertDescription>
                      Attempt {attempts}/{MAX_ATTEMPTS}. Double-check your credentials.
                    </AlertDescription>
                  </Alert>
                )}
                {isCheckingSession && (
                  <Alert className="border-blue-200 bg-blue-50 text-blue-800">
                    <AlertDescription>Checking your session...</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-700 font-medium">
                    Username
                  </Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <UserRound className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={handleInputChange}
                      autoComplete="username"
                      disabled={disableForm}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      autoComplete="current-password"
                      disabled={disableForm}
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-slate-500"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-600">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      disabled={disableForm}
                      className="accent-indigo-600"
                    />
                    <span>Remember username</span>
                  </label>
                  <span className="text-slate-400">Need help? Contact admin.</span>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11"
                  disabled={disableForm}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing you in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>Continue</span>
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>

                <p className="text-center text-sm text-slate-600">
                  Don&apos;t have an account?{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-indigo-600 hover:text-indigo-700"
                    onClick={() => router.push("/register")}
                    disabled={disableForm}
                  >
                    Create one
                  </Button>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
