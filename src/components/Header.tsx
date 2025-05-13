"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";

export default function Header() {
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await userService.logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header className="flex w-full h-[120px] justify-center items-center bg-white border-b border-[#D4D4D4]">
      <div className="flex w-[1240px] h-[80px] justify-between items-center px-5">
        {/* Logo da Navbar */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/RentalIcon.png" // Caminho para o logo na pasta public
            alt="Rental Mobilistic Logo"
            width={50}
            height={50}
            className="object-contain"
            priority
          />
          <span className="text-[#EA580C] font-geist text-xl font-black">
            Rental Mobilistic
          </span>
        </Link>

        <nav className="flex items-center gap-5">
          <Link
            href="/"
            className="text-black font-geist text-base font-medium hover:text-[#EA580C] transition-colors"
          >
            Home
          </Link>
          <Link
            href="/cars"
            className="text-black font-geist text-base font-medium hover:text-[#EA580C] transition-colors"
          >
            Cars
          </Link>
          <Link
            href="#how-it-works"
            className="text-black font-geist text-base font-medium hover:text-[#EA580C] transition-colors"
          >
            How it Works
          </Link>
          <Link
            href="#about-us"
            className="text-black font-geist text-base font-medium hover:text-[#EA580C] transition-colors"
          >
            About Us
          </Link>
          {!loading && user && (
            <Link
              href="/admin/cars"
              className="text-black font-geist text-base font-medium hover:text-[#EA580C] transition-colors"
            >
              My Cars
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2.5">
          {loading ? (
            <div className="flex items-center gap-2 text-[#676773]">
              <div className="w-6 h-6 animate-pulse bg-gray-200 rounded-full"></div>
              <span>Loading...</span>
            </div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/admin/cars"
                className="flex items-center gap-2 text-black font-geist text-base font-medium hover:text-[#EA580C] transition-colors"
              >
                <Image
                  src="/Add_user_icon.png"
                  alt="User Icon"
                  width={24}
                  height={24}
                  className="object-contain"
                />
                {user.fullName || "My Dashboard"}
              </Link>
              <button
                onClick={handleLogout}
                className="flex h-[54px] px-5 items-center gap-2.5 rounded-lg bg-red-600 text-white font-geist text-base font-bold hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="flex h-[54px] px-5 items-center gap-2.5 rounded-lg bg-white text-black font-geist text-base font-bold hover:bg-gray-50 transition-colors"
              >
                <Image
                  src="/Login_Icon.png"
                  alt="Login Icon"
                  width={24}
                  height={24}
                  className="object-contain"
                />
                Login
              </Link>
              <Link
                href="/register"
                className="flex h-[54px] px-5 items-center gap-2.5 rounded-lg bg-[#EA580C] text-white font-geist text-base font-bold hover:bg-[#D45207] transition-colors"
              >
                <Image
                  src="/Add_user_icon.png"
                  alt="Register Icon"
                  width={24}
                  height={24}
                  className="object-contain"
                />
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
