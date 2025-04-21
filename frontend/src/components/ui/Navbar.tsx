"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, Bell, Settings, LogOut, Home, Gift, Users, Newspaper, FolderOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// Function to get cookie value
const getCookie = (name: string) => {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
};

const Navbar = () => {
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Fetch username from cookie
    const storedUsername = getCookie("username") || "Admin";
    setUsername(storedUsername);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:8080/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Logout failed");
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const NavLinks = () => (
    <>
      {[
        { href: "/notifications", icon: Bell, label: "Notifications" },
        { href: "/sponsor", icon: Gift, label: "Sponsor" },
        { href: "/news", icon: Newspaper, label: "News" },
        { href: "/categories", icon: FolderOpen, label: "Categories" },
        { href: "/ColorRangeePage", icon: FolderOpen, label: "ColorRange" },
        { href: "/DevicePage", icon: FolderOpen, label: "DevicePage" },


      ].map((link, index) => (
        <Link key={index} href={link.href}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100"
          >
            <link.icon className="h-5 w-5 mr-2.5 text-slate-500" />
            {link.label}
          </motion.div>
        </Link>
      ))}
    </>
  );

  const NavLinksMobile = () => (
    <>
      {[
        { href: "/dashboard", icon: Home, label: "Dashboard" },
        { href: "/notifications", icon: Bell, label: "Notifications" },
        { href: "/sponsor", icon: Gift, label: "Sponsor" },
        { href: "/news", icon: Newspaper, label: "News" },
        { href: "/categories", icon: FolderOpen, label: "Categories" },
      ].map((link, index) => (
        <Link key={index} href={link.href}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center px-4 py-2.5 my-1 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
          >
            <link.icon className="h-5 w-5 mr-2.5 text-slate-500" />
            <span>{link.label}</span>
          </motion.div>
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70 shadow-lg">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex h-16 items-center justify-between md:justify-around">
          {/* Logo section */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <motion.img
                src="/assets/yakkaw_icon.png"
                alt="LOGO"
                className="h-full rounded-full object-contain"
                width={100}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <NavLinks />
          </nav>

          {/* Right section: Notifications, User Menu */}
          <div className="flex items-center space-x-4">
            {/* User Menu - Hidden on mobile, visible on desktop */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                      <AvatarImage src="/placeholder-avatar.jpg" alt={username} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        {username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder-avatar.jpg" alt={username} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        {username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{username}</p>
                      <p className="text-xs text-muted-foreground">
                        admin@yakkaw.com
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="p-2 grid gap-1">
                    <DropdownMenuItem className="cursor-pointer">
                      <Users className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader className="text-left">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex items-center justify-center -mb-5">
                    <motion.img
                      src="/assets/yakkaw_icon.png"
                      alt="LOGO"
                      className="h-full rounded-full object-contain"
                      width={140}
                    />
                  </div>
                </SheetHeader>
                <div className="py-4">
                  <div className="space-y-1">
                    <NavLinksMobile />
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-auto">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder-avatar.jpg" alt={username} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                      {username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1">
                    <p className="text-sm font-medium">{username}</p>
                    <p className="text-xs text-muted-foreground">
                      admin@yakkaw.com
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;