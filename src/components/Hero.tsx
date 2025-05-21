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
          <h1 className="text-white font-geist text-5xl font-black leading-tight max-lg:text-3xl max-md:text-2xl max-sm:text-xl">
            {user ? "Register your car" : "Rent or list your car"}
          </h1>
          <p className="w-[520px] text-white font-inter text-lg font-medium max-lg:w-full max-lg:text-base max-md:text-sm max-md:w-full">
            {user 
              ? "List your vehicle for rent in a simple and secure way."
              : "Complete platform for third-party car rentals. Rent a vehicle or list yours for rent in a simple and secure way."
            }
          </p>
          <div className="flex w-[600px] h-[60px] pr-2.5 items-end gap-2.5 max-lg:w-full max-md:flex-col max-md:gap-3 max-md:h-auto max-md:pr-0">
            <button
              onClick={handleRegisterClick}
              className="text-white font-geist text-lg font-bold w-[250px] h-[60px] p-2.5 gap-2.5 rounded-lg bg-[#EA580C] max-md:w-full max-md:h-12 flex items-center justify-center cursor-pointer hover:bg-[#d46a28] transition-colors"
            >
              {user ? "Register Car" : "Register for Free"}
            </button>
            <Link
              href="/cars"
              className="text-white font-geist text-lg font-bold w-[250px] h-[60px] p-2.5 gap-2.5 rounded-lg border border-[#EA580C] bg-[#2B3344] max-md:w-full max-md:h-12 flex items-center justify-center cursor-pointer hover:bg-[#182033] hover:border-[#d46a28] transition-colors"
            >
              View Available Cars
            </Link>
          </div>
        </div>
        <div className="flex w-[650px] h-[380px] justify-center items-center rounded-[10px] bg-[#E7CEBF] max-lg:w-full max-lg:mt-10 max-md:h-48 max-md:mt-6">
          <Image
            src="/heroSectionBanner.png"
            alt="Car Rental"
            width={650}
            height={380}
            className="w-full h-full object-cover rounded-lg max-md:rounded-md"
            priority
          />
        </div>
      </div>
    </div>
  );
}
