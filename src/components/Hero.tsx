"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function Hero() {
  const { user } = useAuth();
  const router = useRouter();

  const handleRegisterClick = () => {
    if (user) {
      router.push("/admin/cars/new");
    } else {
      router.push("/register");
    }
  };

  return (
    <div className="flex h-[540px] p-2.5 justify-center items-center gap-10 bg-[#10182B] max-lg:h-auto max-md:gap-4 max-md:py-8">
      <div className="w-[1240px] h-[380px] px-5 flex justify-between items-center max-lg:w-full max-lg:h-auto max-lg:flex-col max-md:px-2">
        <div className="flex w-[600px] h-[260px] flex-col items-start gap-8 max-lg:w-full max-lg:h-auto max-md:gap-4">
          <h1
            className="
              text-white font-geist font-black leading-tight
              text-5xl
              max-lg:text-3xl
              max-md:text-2xl
              max-sm:text-xl
              max-[400px]:text-2xl
            "
          >
            {user ? "Register your car" : "Rent or list your car"}
          </h1>
          <p
            className="
              w-[520px] text-white font-inter font-medium
              text-lg
              max-lg:w-full max-lg:text-base
              max-md:text-sm max-md:w-full
              max-sm:text-xs
            "
          >
            {user
              ? "List your vehicle for rent in a simple and secure way."
              : "Complete platform for third-party car rentals. Rent a vehicle or list yours for rent in a simple and secure way."
            }
          </p>
          {/* Mobile: show image before buttons */}
          <div className="w-full flex flex-col gap-4 md:hidden">
            <div className="flex w-full h-40 justify-center items-center rounded-[10px] bg-[#E7CEBF]">
              <Image
                src="/heroSectionBanner.png"
                alt="Car Rental"
                width={400}
                height={160}
                className="w-full h-full object-cover rounded-lg"
                priority
              />
            </div>
            <div className="flex w-full gap-2">
              <button
                onClick={handleRegisterClick}
                className="
                  text-white font-geist font-bold
                  text-base
                  w-1/2 h-10 p-2 rounded-lg bg-[#EA580C]
                  flex items-center justify-center cursor-pointer
                  hover:bg-[#d45207] transition-colors
                "
              >
                {user ? "Register Car" : "Register for Free"}
              </button>
              <Link
                href="/cars"
                className="
                  text-white font-geist font-bold
                  text-base
                  w-1/2 h-10 p-2 rounded-lg border border-[#EA580C]/10 bg-[#2B3344]
                  flex items-center justify-center cursor-pointer
                  hover:bg-[#1B202C] hover:border-[#d46a28] transition-colors
                "
              >
                View Cars
              </Link>
            </div>
          </div>
          {/* Desktop/tablet: buttons below text, image on the side */}
          <div className="hidden md:flex w-[400px] h-12 items-end gap-2">
            <button
              onClick={handleRegisterClick}
              className="
                text-white font-geist font-bold
                text-base
                w-[160px] h-12 p-2 rounded-lg bg-[#EA580C]
                flex items-center justify-center cursor-pointer
                hover:bg-[#d45207] transition-colors
              "
            >
              {user ? "Register Car" : "Register for Free"}
            </button>
            <Link
              href="/cars"
              className="
                text-white font-geist font-bold
                text-base
                w-[160px] h-12 p-2 rounded-lg border border-[#EA580C]/10 bg-[#2B3344]
                flex items-center justify-center cursor-pointer
                hover:bg-[#1B202C] hover:border-[#d46a28] transition-colors
              "
            >
              View Cars
            </Link>
          </div>
        </div>
        {/* Desktop/tablet: image on the side */}
        <div className="hidden md:flex w-[400px] h-[260px] justify-center items-center rounded-[10px] bg-[#E7CEBF]">
          <Image
            src="/heroSectionBanner.png"
            alt="Car Rental"
            width={400}
            height={260}
            className="w-full h-full object-cover rounded-lg"
            priority
          />
        </div>
      </div>
    </div>
  );
}
