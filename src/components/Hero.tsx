"use client";

import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="flex h-[430px] p-2.5 justify-center items-center gap-10 bg-[#10182B] max-lg:h-auto">
      <div className="w-[1240px] h-[290px] px-5 flex justify-between items-center max-lg:w-full max-lg:h-auto max-lg:flex-col">
        <div className="flex w-[600px] h-[196px] flex-col items-start gap-6 max-lg:w-full">
          <h1 className="text-white font-geist text-4xl font-black max-lg:text-3xl max-sm:text-2xl">
            Rent or list your car
          </h1>
          <p className="w-[481px] text-white font-inter text-base font-medium max-lg:w-full">
            Complete platform for third-party car rentals. Rent a vehicle or
            list yours for rent in a simple and secure way.
          </p>
          <div className="flex w-[600px] h-[54px] pr-2.5 items-end gap-2.5 max-lg:w-full">
            <Link
              href="/register"
              className="text-white font-geist text-base font-bold w-[230px] h-[54px] p-2.5 gap-2.5 rounded-lg bg-[#EA580C] max-sm:flex-1 flex items-center justify-center"
            >
              Register for Free
            </Link>
            <Link
              href="/cars"
              className="text-white font-geist text-base font-bold w-[230px] h-[54px] p-2.5 gap-2.5 rounded-lg border-[0.4px] border-[#EA580C] bg-[#2B3344] max-sm:flex-1 flex items-center justify-center"
            >
              View Available Cars
            </Link>
          </div>
        </div>
        <div className="flex w-[600px] h-[290px] justify-center items-center rounded-[10px] bg-[#E7CEBF] max-lg:w-full max-lg:mt-10">
          <Image
            src="/heroSectionBanner.png"
            alt="Car Rental"
            width={600}
            height={290}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
