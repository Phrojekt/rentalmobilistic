"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Messages from "./Messages";

export default function Header() {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("isLogged");
      await userService.logout();
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        desktopMenuRef.current &&
        !desktopMenuRef.current.contains(event.target as Node) &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  if (loading) {
    return (
      <header className="flex w-full h-[80px] justify-center items-center bg-white border-b border-[#D4D4D4]">
        <div className="flex w-[1240px] h-[60px] justify-between items-center px-5" />
      </header>
    );
  }

  return (
    <header className="flex w-full h-[80px] justify-center items-center bg-white border-b border-[#D4D4D4]">
      <div className="flex w-[1240px] h-[60px] justify-between items-center px-5">        <Link href="/" className="flex items-center">
          <div className="flex items-center gap-2">            <Image
              src="/RentalIcon.png"
              alt="Rental Icon"
              width={28}
              height={28}
              className="w-auto h-7"
            />
            <span className="text-[#EA580C] font-geist text-lg font-black">
              Rental Mobilistic
            </span>
          </div>
        </Link>

        <div className="flex items-center">
          {user ? (
            <div className="flex items-center">
              <div className="relative" ref={desktopMenuRef}>
                <button
                  ref={buttonRef}
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center space-x-2 text-black hover:text-[#EA580C] font-inter"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                    {user.profilePicture ? (
                      <Image
                        src={user.profilePicture}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#EA580C] text-white">
                        {user.fullName?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  <span className="font-inter font-semibold text-black">{user.fullName || user.email}</span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="px-4 py-2 font-bold text-black font-inter text-sm">
                      MY ACCOUNT
                    </div>
                    <Link
                      href="/admin/profile"
                      className="block px-4 py-2 text-black font-inter text-sm hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/admin/cars"
                      className="block px-4 py-2 text-black font-inter text-sm hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard | My Cars
                    </Link>
                    <Link
                      href="/admin/cars/new"
                      className="block px-4 py-2 text-black font-inter text-sm hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      Register New Car
                    </Link>
                    <Link
                      href={{ pathname: "/admin/cars", query: { tab: "rented-cars" } }}
                      className="block px-4 py-2 text-black font-inter text-sm hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      My Rentals
                    </Link>
                    <div className="border-t my-2" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 font-inter text-sm hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
              <div className="ml-4">
                <Messages />
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-black hover:text-[#EA580C] font-inter text-base"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-[#EA580C] text-white px-4 py-2 rounded-lg font-inter text-base hover:bg-[#EA580C]/90"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}