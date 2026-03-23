"use client";

import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import PublicRoute from "@/components/PublicRoute";

const Register = () => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    githubLink: "",
    leetcodeLink: "",
    linkedinLink: "",
    year: "",
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
        "https://levelup-gamify-backend.vercel.app/auth/register",
        formData,
        { withCredentials: true },
      );

      toast.success(res.data.message);

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <PublicRoute>
      <div className="min-h-screen grid md:grid-cols-2">
        {/* LEFT SIDE - FORM */}
        <div className="flex items-center justify-center px-8">
          <div className="w-full max-w-md">
            {/* Heading */}
            <h2 className="text-4xl -mt-16  font-bold text-black">
              Join LevelUp
            </h2>

            {/* Sub Heading */}
            <p className="text-gray-600 mt-2 ">
              Start your journey of learning, leveling up your skills, and
              building your future.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4  ">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
                className="w-full border border-black px-4 py-2 rounded-md focus:outline-none"
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                className="w-full border border-black px-4 py-2 rounded-md"
              />

              {/* Password with Eye Toggle */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  className="w-full border border-black px-4 py-2 rounded-md focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <input
                type="text"
                name="githubLink"
                placeholder="GitHub Profile"
                onChange={handleChange}
                className="w-full border border-black px-4 py-2 rounded-md"
              />

              <input
                type="text"
                name="leetcodeLink"
                placeholder="LeetCode Profile"
                onChange={handleChange}
                className="w-full border border-black px-4 py-2 rounded-md"
              />

              <input
                type="text"
                name="linkedinLink"
                placeholder="LinkedIn Profile"
                onChange={handleChange}
                className="w-full border border-black px-4 py-2 rounded-md"
              />

              <select
                name="year"
                onChange={handleChange}
                className="w-full border border-black px-4 py-2 rounded-md"
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>

              {/* Register Button */}
              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-900 transition"
              >
                Create Account
              </button>

              {/* Login Link */}
              <p className="text-sm text-center text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-black font-medium hover:underline"
                >
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE - IMAGE */}
        <div className="hidden md:flex items-center justify-center">
          <Image
            src="/sign up.png"
            alt="Signup"
            width={400}
            height={400}
            className="object-contain"
          />
        </div>
      </div>
    </PublicRoute>
  );
};

export default Register;
