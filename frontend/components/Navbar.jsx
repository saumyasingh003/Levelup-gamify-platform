"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

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
    }
  };

  return (
    <nav className="w-full sticky top-0 z-50 backdrop-blur-xl bg-white border-b border-gray-200 shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">

        {/* LOGO ONLY */}
        <Link href="/" className="group">
          <Image
            src="/logo.jpg"
            alt="logo"
            width={56}
            height={56}
            className=""
          />
        </Link>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">

          {/* Dashboard */}
          <Link href="/dashboard">
            <button className="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg border border-black text-black hover:bg-black hover:text-white transition-all duration-300 hover:scale-105 active:scale-95">
              Dashboard
            </button>
          </Link>

          {/* PROFILE INITIAL */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white font-black text-sm uppercase hover:scale-105 transition-all shadow-md">
                {user?.name?.charAt(0) || "U"}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-44 mt-2 rounded-xl border border-gray-200 shadow-xl bg-white/90 backdrop-blur-xl"
            >
              {user ? (
                <>
                  <DropdownMenuItem className="p-0">
                    <Link
                      href="/profile"
                      className="w-full px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-md"
                    >
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 cursor-pointer rounded-md"
                  >
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem className="p-0">
                    <Link
                      href="/login"
                      className="w-full px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-md"
                    >
                      Login
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="p-0">
                    <Link
                      href="/register"
                      className="w-full px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-md"
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