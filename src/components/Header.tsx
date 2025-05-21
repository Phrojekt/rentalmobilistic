"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import { useState, useRef, useEffect } from "react";

export default function Header() {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null); // Novo ref para o botão

  const handleLogout = async () => {
    try {
      await userService.logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Fecha o menu ao clicar fora, mas ignora o botão do menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
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

  // Evita flicker: só renderiza a navbar quando loading for false
  if (loading) {
    return (
      <header className="flex w-full h-[80px] justify-center items-center bg-white border-b border-[#D4D4D4]">
        <div className="flex w-[1240px] h-[60px] justify-between items-center px-5" />
      </header>
    );
  }

  return (
    <header className="flex w-full h-[80px] justify-center items-center bg-white border-b border-[#D4D4D4]">
      <div className="flex w-[1240px] h-[60px] justify-between items-center px-5">
        {/* Logo da Navbar */}
        <Link href={user ? "/cars" : "/"} className="flex items-center gap-2">
          <Image
            src="/RentalIcon.png"
            alt="Rental Mobilistic Logo"
            width={36}
            height={36}
            className="object-contain"
            priority
          />
          <span className="text-[#EA580C] font-geist text-lg font-black">
            Rental Mobilistic
          </span>
        </Link>

        {/* Navegação */}
        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              className="flex items-center hover:cursor-pointer gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {/* Ícone arredondado */}
              <span className="w-[30px] h-[30px] rounded-full bg-[#EA580C] mr-2"></span>
              <span className="font-inter font-semibold text-black">
                {user.fullName || "User"}
              </span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-2">
                <div className="px-4 py-2 font-bold text-black font-inter text-sm select-none">
                  MY ACCOUNT
                </div>
                <Link
                  href="/admin/cars"
                  className="block px-4 py-2 text-black font-inter text-sm hover:bg-gray-50 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard | My Cars
                </Link>
                <Link
                  href="/admin/cars/new"
                  className="block px-4 py-2 text-black font-inter text-sm hover:bg-gray-50 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Register New Car
                </Link>
                <Link
                  href={{ pathname: "/admin/cars", query: { tab: "rented-cars" } }}
                  className="block px-4 py-2 text-black font-inter text-sm hover:bg-gray-50 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  My Rentals
                </Link>
                <div className="border-t my-2" />
                <button
                  onClick={handleLogout}
                  className="block cursor-pointer w-full text-left px-4 py-2 text-red-600 font-inter text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Botões normais em telas md+ */}
            <div className="hidden md:flex items-center gap-2 ml-auto">
              <Link
                href="/login"
                className="flex h-10 px-5 items-center gap-2 rounded-lg bg-white text-black font-geist text-base font-bold hover:bg-gray-50 transition-colors"
              >
                <Image
                  src="/Login_Icon.png"
                  alt="Login Icon"
                  width={26}
                  height={26}
                  className="object-contain"
                />
                Login
              </Link>
              <Link
                href="/register"
                className="flex h-9 px-4 items-center gap-2 rounded-lg bg-[#EA580C] text-white font-geist text-sm font-bold hover:bg-[#D45207] transition-colors"
              >
                <Image
                  src="/Add_user_WhiteIcon.png"
                  alt="Register Icon"
                  width={20}
                  height={20}
                  quality={100}
                  className="object-contain"
                />
                Register
              </Link>
            </div>
            {/* Hamburguer menu em telas pequenas */}
            <div className="md:hidden ml-auto flex items-center relative">
              <button
                ref={buttonRef} // <-- Adicione o ref aqui
                onClick={() => setMenuOpen((v) => !v)}
                className={`p-2 rounded hover:bg-gray-100 transition-colors z-50 cursor-pointer`}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                {menuOpen ? (
                  // Ícone X (fechar)
                  <svg
                    width="32"
                    height="32"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <line x1="6" y1="6" x2="18" y2="18" stroke="#EA580C" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="18" y1="6" x2="6" y2="18" stroke="#EA580C" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  // Ícone hamburguer
                  <svg
                    width="32"
                    height="32"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <rect y="4" width="24" height="2" rx="1" fill="#EA580C"/>
                    <rect y="11" width="24" height="2" rx="1" fill="#EA580C"/>
                    <rect y="18" width="24" height="2" rx="1" fill="#EA580C"/>
                  </svg>
                )}
              </button>
              {menuOpen && (
                <div
                  ref={menuRef}
                  className="absolute top-[60px] right-0 w-80 bg-white rounded-3xl shadow-2xl border border-gray-200 z-40 py-8 px-6 flex flex-col gap-4 animate-fade-in transition-all"
                  style={{ minWidth: 260 }}
                >
                  <Link
                    href="/login"
                    className="flex items-center gap-3 px-4 py-3 text-black font-geist text-lg font-bold rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Image
                      src="/Login_Icon.png"
                      alt="Login Icon"
                      width={26}
                      height={26}
                      className="object-contain"
                    />
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-3 px-4 py-3 text-white font-geist text-lg font-bold rounded-lg bg-[#EA580C] hover:bg-[#D45207] transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Image
                      src="/Add_user_WhiteIcon.png"
                      alt="Register Icon"
                      width={24}
                      height={24}
                      quality={100}
                      className="object-contain"
                    />
                    Register
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
