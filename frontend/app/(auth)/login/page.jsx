"use client";

import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import PublicRoute from "@/components/PublicRoute";

const Login = () => {
  const router = useRouter();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/auth/login",
        formData,
        { withCredentials: true },
      );

      login(res.data.user);
      toast.success(res.data.message);

      setTimeout(() => {
        router.push("/home");
      }, 1200);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <PublicRoute>
      <div className="min-h-screen grid md:grid-cols-2">
        {/* LEFT SIDE FORM */}
        <div className="flex items-center justify-center px-8">
          <div className="w-full max-w-md">
            <h2 className="text-4xl font-bold -mt-20 text-black">
              Welcome Back
            </h2>

            <p className="text-gray-600 mt-2 mb-6">
              Continue your journey and keep leveling up
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                className="w-full border border-black px-4 py-2 rounded-md"
              />

              {/* Password Field with Eye Toggle */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  className="w-full border border-black px-4 py-2 rounded-md"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-900 transition"
              >
                Login
              </button>

              <p className="text-sm text-center text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-black font-medium hover:underline"
                >
                  Register
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div className="hidden md:flex items-center justify-center">
          <Image
            src="/login.png"
            alt="login"
            width={300}
            height={300}
            className="object-contain"
          />
        </div>
      </div>
    </PublicRoute>
  );
};

export default Login;
