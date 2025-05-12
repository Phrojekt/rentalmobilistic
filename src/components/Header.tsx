"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="flex w-full h-[82px] px-20 justify-between items-center border-[0.25px] border-black max-lg:px-10 max-sm:px-5">
      <div className="flex items-center">
        <svg
          width="327"
          height="58"
          viewBox="0 0 327 58"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="flex w-[327px] max-lg:w-[200px] max-sm:w-[150px] h-[58px] p-[10px] items-center gap-[10px]"
        >
          {/* SVG do logo */}
          <text
            fill="black"
            xmlSpace="preserve"
            style={{ whiteSpace: "pre" }}
            fontFamily="Geist"
            fontSize="24"
            fontWeight="900"
            letterSpacing="0em"
          >
            <tspan x="66.5063" y="37.52">
              Rental Mobilistic
            </tspan>
          </text>
        </svg>
      </div>

      {/* Navegação para telas grandes */}
      <nav className="flex w-[743px] justify-between items-center gap-[30px] max-lg:w-auto max-sm:hidden">
        {[
          { name: "Home", href: "/" },
          { name: "Cars", href: "/cars" },
          { name: "How it Works", href: "#how-it-works" },
          { name: "About Us", href: "#testimonials" },
        ].map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="text-black font-inter text-lg font-medium"
          >
            {item.name}
          </Link>
        ))}

        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="flex w-[100px] h-[38px] p-2.5 justify-center items-center gap-2.5"
          >
            <span className="text-black font-inter text-base font-black">Login</span>
          </Link>
          <Link
            href="/register"
            className="flex w-[126px] h-[38px] p-2.5 justify-center items-center gap-2.5 rounded bg-[#EA580C]"
          >
            <span className="text-white font-inter text-base font-medium">Register</span>
          </Link>
        </div>
      </nav>

      {/* Botão do menu hambúrguer para telas pequenas */}
      <button
        className="hidden max-sm:block hover:bg-gray-200 p-2 rounded transition duration-200"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          fill="none"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M4 6h16"></path>
          <path d="M4 12h16"></path>
          <path d="M4 18h16"></path>
        </svg>
      </button>

      {/* Menu dropdown para telas pequenas */}
      {isMenuOpen && (
        <div className="absolute top-[82px] left-0 w-full bg-white shadow-lg border-t border-gray-200 z-50 max-sm:flex flex-col items-start gap-4 p-5">
          {[
            { name: "Home", href: "/" },
            { name: "Cars", href: "/cars" },
            { name: "How it Works", href: "#how-it-works" },
            { name: "About Us", href: "#testimonials" },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-black font-inter text-lg font-medium w-full"
              onClick={() => setIsMenuOpen(false)} // Fecha o menu ao clicar
            >
              {item.name}
            </Link>
          ))}

          <div className="flex flex-col gap-2 w-full">
            <Link
              href="/login"
              className="flex w-full h-[38px] p-2.5 justify-center items-center gap-2.5 border border-gray-300 rounded"
              onClick={() => setIsMenuOpen(false)} // Fecha o menu ao clicar
            >
              <span className="text-black font-inter text-base font-black">Login</span>
            </Link>
            <Link
              href="/register"
              className="flex w-full h-[38px] p-2.5 justify-center items-center gap-2.5 rounded bg-[#EA580C]"
              onClick={() => setIsMenuOpen(false)} // Fecha o menu ao clicar
            >
              <span className="text-white font-inter text-base font-medium">Register</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
