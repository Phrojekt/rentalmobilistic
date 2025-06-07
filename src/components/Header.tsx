"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Messages from "./Messages";
import { HiMenu, HiChevronLeft } from "react-icons/hi";
import { FiLogIn } from "react-icons/fi";
import { User, Bell, Car, PlusCircle, ClipboardList, LogOut } from "lucide-react";

export default function Header() {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileBellOpen, setMobileBellOpen] = useState(false); // Novo estado
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

  // Fechar dropdown do sino ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMobileBellOpen(false);
      }
    }
    if (mobileBellOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileBellOpen]);

  if (loading) {
    return (
      <header className="flex w-full h-[80px] justify-center items-center bg-white border-b border-[#D4D4D4]">
        <div className="flex w-[1240px] h-[60px] justify-between items-center px-5" />
      </header>
    );
  }

  return (
    <header className="flex w-full h-[80px] justify-center items-center bg-white border-b border-[#D4D4D4]">
      <div className="flex w-full max-w-[1240px] h-[60px] justify-between items-center px-4 md:px-5">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div className="flex items-center gap-2">
            <Image
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

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center">
          {user ? (
            <div className="flex items-center">
              <div className="relative" ref={desktopMenuRef}>
                <button
                  ref={buttonRef}
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center space-x-2 text-black hover:text-[#EA580C] font-inter hover:bg-gray-100 cursor-pointer rounded-lg transition-colors px-2 py-1"
                >
                  <div className="relative w-8 h-8 cursor-pointer rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                    {user.profilePicture ? (
                      <Image
                        src={user.profilePicture}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full cursor-pointer h-full flex items-center justify-center bg-[#EA580C] text-white">
                        {user.fullName?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  <span className="font-inter font-semibold cursor-pointer text-black">
                    {user.fullName || user.email}
                  </span>
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
                      className="block w-full cursor-pointer rounded-b-md text-left px-4 py-2 text-red-600 font-inter text-sm hover:bg-gray-50"
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
                className="flex items-center gap-2 text-black font-inter text-base font-bold px-3 py-2 rounded-lg transition-colors hover:text-[#EA580C] hover:bg-gray-100"
              >
                <FiLogIn size={18} />
                Login
              </Link>
              <Link
                href="/register"
                className="bg-[#EA580C] text-white px-4 py-2 rounded-lg font-inter text-base font-bold flex items-center gap-2 hover:bg-[#EA580C]/90 transition-colors"
              >
                <Image
                  src="/Add_user_whiteIcon.png"
                  alt="Register"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          {user ? (
            <>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-md text-black hover:text-[#EA580C] focus:outline-none cursor-pointer"
                aria-label="Open menu"
              >
                <HiMenu size={28} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-md text-black hover:text-[#EA580C] focus:outline-none cursor-pointer"
                aria-label="Open menu"
              >
                <HiMenu size={28} />
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && user && (
          <div className="fixed inset-0 z-50 bg-black/10 flex justify-end md:hidden">
            <div className="w-4/5 max-w-xs bg-white rounded-r-2xl h-full shadow-lg flex flex-col relative" ref={mobileMenuRef}>
              {/* Menu content */}
              {!mobileBellOpen ? (
                <>
                  <div className="flex flex-col items-center mt-8 mb-4">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center">
                      {user.profilePicture ? (
                        <Image
                          src={user.profilePicture}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#EA580C] text-white text-4xl font-bold">
                          {user.fullName?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <span className="mt-3 font-inter font-bold text-black text-xl text-center">
                      {user.fullName || user.email}
                    </span>
                  </div>
                  <div className="border-t mb-2" />
                  <nav className="flex flex-col gap-2 px-6 py-4">
                    <Link
                      href="/admin/profile"
                      className="flex items-center gap-3 px-3 py-3 text-black font-inter text-base rounded-lg hover:bg-gray-200 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User size={20} className="text-[#EA580C]" />
                      My Profile
                    </Link>
                    <button
                      type="button"
                      className="flex items-center gap-3 px-3 py-3 text-black font-inter text-base rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                      onClick={() => setMobileBellOpen(true)}
                    >
                      <Bell size={20} className="text-[#EA580C]" />
                      Notifications
                    </button>
                    <Link
                      href="/admin/cars"
                      className="flex items-center gap-3 px-3 py-3 text-black font-inter text-base rounded-lg hover:bg-gray-200 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Car size={20} className="text-[#EA580C]" />
                      Dashboard | My Cars
                    </Link>
                    <Link
                      href="/admin/cars/new"
                      className="flex items-center gap-3 px-3 py-3 text-black font-inter text-base rounded-lg hover:bg-gray-200 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <PlusCircle size={20} className="text-[#EA580C]" />
                      Register New Car
                    </Link>
                    <Link
                      href={{ pathname: "/admin/cars", query: { tab: "rented-cars" } }}
                      className="flex items-center gap-3 px-3 py-3 text-black font-inter text-base rounded-lg hover:bg-gray-200 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ClipboardList size={20} className="text-[#EA580C]" />
                      My Rentals
                    </Link>
                    <div className="border-t my-4" />
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-3 w-full text-left px-3 py-3 text-red-600 font-inter text-base rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <LogOut size={20} className="text-red-600" />
                      Logout
                    </button>
                  </nav>
                </>
              ) : (
                // Notifications screen in mobile menu
                <div className="flex-1 flex flex-col overflow-y-auto">
                  {/* Back button */}
                  <button
                    className="flex items-center gap-2 px-2 py-4 text-black font-inter text-base font-semibold focus:outline-none"
                    style={{ paddingLeft: "1.5rem" }} // matches px-6 of menu
                    onClick={() => setMobileBellOpen(false)}
                  >
                    <HiChevronLeft size={24} className="text-[#EA580C]" />
                    <span>Back</span>
                  </button>
                  <div className="flex-1 overflow-y-auto px-2 pb-4">
                    {/* Notifications content, no bell button */}
                    <Messages hideBell />
                  </div>
                </div>
              )}
            </div>
            {/* Click outside closes menu */}
            <div
              className="flex-1"
              onClick={() => {
                setMobileMenuOpen(false);
                setMobileBellOpen(false);
              }}
              tabIndex={-1}
            />
          </div>
        )}

        {/* Mobile Menu Drawer (sem usuário) */}
        {mobileMenuOpen && !user && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            {/* Menu */}
            <div
              className="w-4/5 max-w-xs bg-white rounded-r-2xl h-full shadow-lg flex flex-col relative"
              ref={mobileMenuRef}
            >
              {/* Top: Logo and app name */}
              <div className="flex items-center gap-2 h-20 px-6 border-b border-gray-200">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <Image
                    src="/RentalIcon.png"
                    alt="Rental Icon"
                    width={28}
                    height={28}
                    className="w-7 h-7"
                  />
                  <span className="text-[#EA580C] font-inter text-lg font-bold tracking-tight">
                    Rental Mobilistic
                  </span>
                </Link>
              </div>
              {/* Menu options */}
              <nav className="flex flex-col gap-2 px-6 py-10 flex-1">
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-3 py-3 font-bold text-black font-inter text-base rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiLogIn size={20} className="text-[#EA580C]" />
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-3 px-3 py-3 text-white font-bold bg-[#EA580C] font-inter text-base rounded-lg hover:bg-[#d45207] transition-colors shadow-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Image
                    src="/Add_user_whiteIcon.png"
                    alt="Register"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  Register
                </Link>
              </nav>
              {/* Footer */}
              <div className="px-6 pb-6 mt-auto text-xs text-gray-400">
                © {new Date().getFullYear()} Rental Mobilistic
              </div>
            </div>
            {/* Click outside closes menu */}
            <div
              className="flex-1 w-screen"
              onClick={() => setMobileMenuOpen(false)}
              tabIndex={-1}
            />
          </div>
        )}
      </div>
    </header>
  );
}