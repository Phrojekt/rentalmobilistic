"use client";

import { useState } from "react";
import CarImageGallery from "./CarImageGallery";
import CarSpecifications from "./CarSpecifications";

export default function CarDetails() {
  const [selectedTab, setSelectedTab] = useState<
    "details" | "features" | "reviews"
  >("details");

  return (
    <div className="flex flex-col items-center w-full bg-white">
      <div className="flex w-full p-[40px_40px_0px] gap-5 flex-wrap max-lg:p-[30px_30px_0px] max-sm:p-[20px_20px_0px]">
        <div className="w-[910px] h-[620px] rounded-lg bg-[#DDD] max-lg:w-full max-sm:h-[300px]" />

        <div className="flex w-[430px] h-auto p-[30px_40px] flex-col items-start gap-[18px] rounded-lg border-[0.65px] border-[#676773] max-lg:w-full max-sm:p-5">
          <div className="flex h-[54px] flex-col items-start gap-2.5 w-full">
            <h1 className="text-black font-geist text-xl font-black">
              Car Name and Year
            </h1>
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-[#676773]"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M7.09738 2C7.77636 1.99983 8.44873 2.11955 9.07606 2.35233C9.70339 2.5851 10.2734 2.92635 10.7535 3.3566C11.2336 3.78685 11.6144 4.29766 11.8742 4.85984C12.1339 5.42201 12.2675 6.02455 12.2673 6.63301C12.264 7.74573 11.8125 8.81997 10.9959 9.65821C10.973 9.68141 10.9541 9.70745 10.9395 9.73553L8.18913 12.5313C8.13382 12.5879 8.10229 12.66 8.1 12.7352V12.6412L7.11093 13.6311L6.13898 12.6425V12.7435C6.13888 12.6654 6.10721 12.59 6.04985 12.5313L3.50908 9.97517H3.50766C3.49553 9.95472 3.48912 9.9381 3.44918 9.90296C2.96755 9.47509 2.58514 8.96606 2.32397 8.40519C2.0628 7.84431 1.92804 7.24268 1.92743 6.63493C1.92725 6.02647 2.06084 5.42393 2.32059 4.86175C2.58034 4.29957 2.96115 3.78877 3.44126 3.35852C3.92137 2.92827 4.49138 2.58701 5.11871 2.35424C5.74604 2.12147 6.4184 2.00175 7.09738 2.00192V2Z" />
              </svg>
              <span className="text-[#676773] font-inter text-sm">City</span>
            </div>
          </div>

          <div className="flex h-[26px] justify-between items-center w-full">
            <div className="flex items-baseline gap-1">
              <span className="text-black font-geist text-xl">$150</span>
              <span className="text-[#676773] font-geist text-sm">/DAY</span>
            </div>
            <div className="text-[#EA580C] font-geist text-xs font-bold w-[86px] h-5 flex items-center justify-center rounded-[30px] bg-[#FFF7ED]">
              Available Now
            </div>
          </div>

          <div className="flex flex-col gap-2.5 w-full">
            <label className="text-black font-inter text-sm font-bold">
              Select Period
            </label>
            <div className="flex w-full h-[30px] px-2.5 items-center gap-2.5 rounded border-[0.75px] border-[#676773]">
              <svg
                className="w-4 h-4 text-[#EA580C]"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M12 2H4C2.89543 2 2 2.89543 2 4V12C2 13.1046 2.89543 14 4 14H12C13.1046 14 14 13.1046 14 12V4C14 2.89543 13.1046 2 12 2ZM4 12V6H12V12H4Z" />
              </svg>
              <span className="text-black font-inter text-sm">
                22/04/2025 - 27/04/2025
              </span>
            </div>
          </div>

          <div className="flex w-full p-2.5 flex-col gap-1 bg-[#F8FAFC]">
            <div className="flex justify-between items-center">
              <span className="text-black font-inter text-sm">$150 x 3</span>
              <span className="text-black font-inter text-sm">$450</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black font-inter text-sm">Service fee</span>
              <span className="text-black font-inter text-sm">$45</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-black">
              <span className="text-black font-inter text-sm font-bold">
                Total
              </span>
              <span className="text-black font-inter text-sm font-bold">
                $495
              </span>
            </div>
          </div>

          <button className="w-full h-9 flex items-center justify-center rounded bg-[#EA580C] text-white font-geist text-sm font-bold">
            Request Rental
          </button>

          <div className="flex items-start gap-2.5 w-full">
            <div className="w-10 h-10 rounded-full bg-[#676773]" />
            <div className="flex flex-col gap-1">
              <span className="text-black font-geist text-base font-semibold">
                Mark Williams
              </span>
              <div className="flex items-center gap-0.5">
                <div className="flex">
                  {Array(5)
                    .fill(null)
                    .map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-[#EA580C]"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M8 1L10.1649 5.83688L15 6.24797L11.18 9.51312L12.4731 14.5L8 11.8369L3.52693 14.5L4.82 9.51312L1 6.24797L5.83508 5.83688L8 1Z" />
                      </svg>
                    ))}
                </div>
                <span className="text-black font-inter text-xs">
                  (20 Reviews)
                </span>
              </div>
            </div>
          </div>
        </div>

        <CarImageGallery />

        <div className="flex w-full flex-col gap-5">
          <div className="flex w-[392px] h-[41px] px-1 justify-between items-center rounded bg-[#DDD] max-sm:w-full">
            {["details", "features", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab as typeof selectedTab)}
                className={`w-[90px] h-6 rounded text-sm font-semibold ${
                  selectedTab === tab
                    ? "bg-white text-black"
                    : "bg-transparent text-[#676767]"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {selectedTab === "details" && <CarSpecifications />}
        </div>
      </div>
    </div>
  );
}
