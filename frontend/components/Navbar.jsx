"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { User } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await api.post("/auth/logout", {});

      toast.success(res.data.message);
      logout();
      router.push("/");
    } catch (error) {
      toast.error("Logout failed");
      console.log(error);
    }
  };

  return (
    <nav className="w-full border-b shadow-sm bg-white print:hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/">
          <Image
            src="/logo.jpg"
            alt="logo"
            width={80}
            height={80}
            className="rounded-md"
          />
        </Link>

        <div className="flex items-center gap-4">
          {/* Dashboard */}
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="border-black mr-4 font-semibold text-black hover:bg-black hover:text-white"
            >
              Dashboard
            </Button>
          </Link>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-full p-2 border-black"
              >
                <User size={18} />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40 border-black">
              {user ? (
                <>
                  <DropdownMenuItem className="p-0">
                    <Link
                      href="/profile"
                      className="w-full px-2 py-1.5 h-full block"
                    >
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="hover:bg-red-200 cursor-pointer text-red-600 focus:bg-red-100 focus:text-red-700"
                  >
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem className="p-0">
                    <Link
                      href="/login"
                      className="w-full px-2 py-1.5 h-full block"
                    >
                      Login
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="p-0">
                    <Link
                      href="/register"
                      className="w-full px-2 py-1.5 h-full block"
                    >
                      Register
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
