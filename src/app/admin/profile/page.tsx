"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import ProfileForm from "@/components/ProfileForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{
    fullName: string;
    email: string;
    profilePicture?: string;
  } | null>(null);

  useEffect(() => {
    async function loadUserData() {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const data = await userService.getUserById(user.uid);
        if (data) {
          setUserData({
            fullName: data.fullName,
            email: user.email || "",
            profilePicture: data.profilePicture,
          });
        } else {
          console.error("No user data found");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex flex-1 justify-center items-center p-10 max-sm:p-5">
          <div className="flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || !userData) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex flex-1 justify-center items-center p-10 max-sm:p-5">
          <div className="text-center text-gray-600">Please log in to view your profile.</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex flex-1 justify-center items-center p-10 max-sm:p-5">
        <ProfileForm initialData={userData} />
      </main>
      <Footer />
    </div>
  );
}
