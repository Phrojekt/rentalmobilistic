"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Messages from "./Messages";
import { HiMenu } from "react-icons/hi";
import { FiLogIn } from "react-icons/fi";

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
              {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-end md:hidden">
                  <div className="w-4/5 max-w-xs bg-white h-full shadow-lg flex flex-col relative">
                    {/* Topo do menu: botão de fechar */}
                    <div className="flex items-center justify-end h-16 px-4 border-b">
                      <button
                        className="text-2xl text-gray-500 hover:text-[#EA580C] cursor-pointer"
                        onClick={() => setMobileMenuOpen(false)}
                        aria-label="Fechar menu"
                      >
                        ×
                      </button>
                    </div>
                    {/* Opções */}
                    <nav className="flex flex-col gap-1 px-4 mt-6">
                      <Link
                        href="/login"
                        className="block px-2 py-2 text-black font-inter text-base rounded hover:bg-gray-50 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        className="block px-4 py-3 text-white bg-[#EA580C] font-inter text-lg rounded-lg hover:bg-[#EA580C]/90 transition-colors font-bold shadow-md text-center flex items-center justify-center gap-2"
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
                  </div>
                  {/* Clique fora fecha o menu */}
                  <div
                    className="flex-1"
                    onClick={() => setMobileMenuOpen(false)}
                    tabIndex={-1}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && user && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-end md:hidden">
            <div className="w-4/5 max-w-xs bg-white h-full shadow-lg flex flex-col relative" ref={mobileMenuRef}>
              {/* Topo do menu: botão de fechar ou voltar */}
              <div className="flex items-center justify-between h-16 px-4 border-b">
                {mobileBellOpen ? (
                  <button
                    className="text-2xl text-gray-500 hover:text-[#EA580C] cursor-pointer"
                    onClick={() => setMobileBellOpen(false)}
                    aria-label="Voltar"
                  >
                    &#8592; {/* seta para a esquerda */}
                  </button>
                ) : (
                  <span />
                )}
                <button
                  className="text-2xl text-gray-500 hover:text-[#EA580C] cursor-pointer"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setMobileBellOpen(false);
                  }}
                  aria-label="Fechar menu"
                >
                  ×
                </button>
              </div>

              {/* Conteúdo do menu */}
              {!mobileBellOpen ? (
                <>
                  <div className="flex flex-col items-center mt-6 mb-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                      {user.profilePicture ? (
                        <Image
                          src={user.profilePicture}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#EA580C] text-white text-3xl font-bold">
                          {user.fullName?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <span className="mt-2 font-inter font-semibold text-black text-lg text-center">
                      {user.fullName || user.email}
                    </span>
                  </div>
                  <div className="border-t mb-2" />
                  <nav className="flex flex-col gap-1 px-4">
                    <Link
                      href="/admin/profile"
                      className="block px-2 py-2 text-black font-inter text-base rounded hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <button
                      type="button"
                      className="block text-left px-2 py-2 text-black font-inter text-base rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => setMobileBellOpen(true)}
                    >
                      Notifications
                    </button>
                    <Link
                      href="/admin/cars"
                      className="block px-2 py-2 text-black font-inter text-base rounded hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard | My Cars
                    </Link>
                    <Link
                      href="/admin/cars/new"
                      className="block px-2 py-2 text-black font-inter text-base rounded hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Register New Car
                    </Link>
                    <Link
                      href={{ pathname: "/admin/cars", query: { tab: "rented-cars" } }}
                      className="block px-2 py-2 text-black font-inter text-base rounded hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Rentals
                    </Link>
                    <div className="border-t my-2" />
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-2 py-2 text-red-600 font-inter text-base rounded hover:bg-gray-50 cursor-pointer"
                    >
                      Logout
                    </button>
                  </nav>
                </>
              ) : (
                // Tela de notificações no menu mobile
                <div className="flex-1 flex flex-col overflow-y-auto">
                  <div className="flex-1 overflow-y-auto px-2 pb-4">
                    {/* Conteúdo de notificações, sem botão bell */}
                    <Messages hideBell />
                  </div>
                </div>
              )}
            </div>
            {/* Clique fora fecha o menu */}
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
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-end md:hidden">
            <div className="w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col relative animate-slide-in">
              {/* Topo do menu: Logo menor e texto alinhado */}
              <div className="flex items-center justify-between h-16 px-4 border-b">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <Image
                    src="/RentalIcon.png"
                    alt="Rental Icon"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                  <span className="text-[#EA580C] font-geist text-base font-black tracking-tight leading-none">
                    Rental Mobilistic
                  </span>
                </Link>
                <button
                  className="text-2xl text-gray-400 hover:text-[#EA580C] transition-colors cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Fechar menu"
                >
                  ×
                </button>
              </div>
              {/* Opções */}
              <nav className="flex flex-col gap-4 px-6 py-10 flex-1">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 px-4 py-3 text-black font-inter text-lg font-bold rounded-lg hover:text-[#EA580C] hover:bg-gray-100 transition-colors shadow-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiLogIn size={20} />
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 px-4 py-3 text-white bg-[#EA580C] font-inter text-lg font-bold rounded-lg hover:bg-[#EA580C]/90 transition-colors shadow-md"
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
              {/* Rodapé opcional */}
              <div className="px-6 pb-6 mt-auto text-xs text-gray-400">
                © {new Date().getFullYear()} Rental Mobilistic
              </div>
            </div>
            {/* Clique fora fecha o menu */}
            <div
              className="flex-1"
              onClick={() => setMobileMenuOpen(false)}
              tabIndex={-1}
            />
          </div>
        )}
      </div>
    </header>
  );
}