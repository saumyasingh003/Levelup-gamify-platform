"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Pencil, Flame, Award, Zap, Brain } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";

const Profile = () => {
  const { user: authUser, checkAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [progress, setProgress] = useState(null);

  const fetchProgress = async () => {
    try {
      const res = await axios.get(`${API_URL}/progress`, {
        withCredentials: true,
      });
      setProgress(res.data);
    } catch (error) {
      console.log("Failed to fetch progress:", error);
    }
  };

  useEffect(() => {
    if (authUser) {
      setFormData(authUser);
      fetchProgress();
    }
  }, [authUser]);

  if (!formData && authUser) {
    setFormData(authUser);
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      await api.put("/auth/update-profile", formData);
      toast.success("Profile updated!");
      await checkAuth();
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const displayUser = formData || authUser || { name: "Loading...", email: "" };

  const firstLetter = displayUser.name
    ? displayUser.name.charAt(0).toUpperCase()
    : "?";

  const stats = {
    level: progress?.level || 1,
    xp: progress?.xp || 0,
    streak: progress?.streak || 0,
    badges: progress?.badges || [],
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen px-8 py-6 bg-gray-50">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
            {firstLetter}
          </div>
          <h1 className="text-xl font-semibold mt-2">{displayUser.name}</h1>
        </div>

        {/* ================= PERSONAL INFO ================= */}
        <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Personal Information</h2>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="group relative p-2 rounded-full hover:bg-gray-100"
              >
                <Pencil size={16} />
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  Edit Profile
                </span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(authUser);
                  }}
                  className="border border-black px-4 py-1 rounded-md text-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-black text-white px-3 py-1 rounded-md text-sm hover:bg-gray-800"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputField
              label="Full Name"
              name="name"
              value={displayUser.name}
              onChange={handleChange}
              editable={isEditing}
            />
            <InputField
              label="Email"
              name="email"
              value={displayUser.email}
              editable={false}
            />
            <InputField
              label="Academic Year"
              name="year"
              value={displayUser.year}
              onChange={handleChange}
              editable={isEditing}
            />
            <InputField
              label="GitHub Profile"
              name="githubLink"
              value={displayUser.githubLink}
              onChange={handleChange}
              editable={isEditing}
            />
            <InputField
              label="LeetCode Profile"
              name="leetcodeLink"
              value={displayUser.leetcodeLink}
              onChange={handleChange}
              editable={isEditing}
            />
            <InputField
              label="LinkedIn Profile"
              name="linkedinLink"
              value={displayUser.linkedinLink}
              onChange={handleChange}
              editable={isEditing}
            />
          </div>
        </div>

        {/* ================= PROGRESS ================= */}
        <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Your Progress</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Level */}
            <div className="border border-gray-200 rounded-lg p-4 flex items-center gap-3 hover:shadow-sm transition">
              <div className="p-2 bg-black text-white rounded-md">
                <Brain size={18} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Level</p>
                <p className="text-lg font-semibold">{stats.level}</p>
              </div>
            </div>

            {/* Streak */}
            <div className="border border-gray-200 rounded-lg p-4 flex items-center gap-3 hover:shadow-sm transition">
              <div className="p-2 bg-black text-white rounded-md">
                <Flame size={18} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Streak</p>
                <p className="text-lg font-semibold">{stats.streak} days</p>
              </div>
            </div>

            {/* XP */}
            <div className="border border-gray-200 rounded-lg p-4 flex items-center gap-3 hover:shadow-sm transition">
              <div className="p-2 bg-black text-white rounded-md">
                <Zap size={18} />
              </div>
              <div>
                <p className="text-sm text-gray-500">XP Points</p>
                <p className="text-lg font-semibold">{stats.xp}</p>
              </div>
            </div>

            {/* Badges */}
            <div className="border border-gray-200 rounded-lg p-4 flex items-center gap-3 hover:shadow-sm transition">
              <div className="p-2 bg-black text-white rounded-md">
                <Award size={18} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Badges</p>
                <p className="text-lg font-semibold">{stats.badges.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

const InputField = ({ label, name, value, onChange, editable }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      name={name}
      value={value || ""}
      onChange={onChange}
      readOnly={!editable}
      className={`w-full border rounded-md px-3 py-2 text-sm ${
        !editable
          ? "bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed"
          : "bg-white border-black focus:ring-1 focus:ring-black outline-none"
      }`}
    />
  </div>
);

export default Profile;
