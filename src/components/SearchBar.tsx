"use client";

import { useState, FormEvent } from "react";

interface SearchFilters {
  location?: string;
  startDate?: Date;
  endDate?: Date;
  carType?: string;
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [location, setLocation] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSearching(true);
    
    const filters: SearchFilters = {
      location: location || undefined,
    };
    
    try {
      await onSearch(filters);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex w-full pt-[50px] pb-0 px-2.5 justify-center items-start gap-2.5 bg-white max-lg:h-auto">
      <div className="flex w-[900px] min-h-0 p-2.5 flex-col items-center gap-5 rounded-b-lg bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25),1px_8px_4px_0px_rgba(0,0,0,0.18)] max-lg:w-full" style={{ paddingBottom: 20 }}>
        <h2 className="text-black font-geist text-2xl font-bold mt-6">
          Find the ideal car for you
        </h2>
        <form
          onSubmit={handleSubmit}
          className="flex flex-row w-full gap-3 sm:gap-4 max-md:flex-col"
        >
          <div className="relative flex-1 w-full pr-3 max-md:pr-0 flex items-center">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Search by brand, city or state..."
              className="text-black w-full h-[48px] p-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm transition-all"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
              </div>
            )}
          </div>
          <div className="flex items-center max-md:w-full">
            <button
              type="submit"
              disabled={isSearching}
              className={`
                flex w-[180px] h-[48px] justify-center items-center gap-2 rounded-lg
                bg-[#EA580C] text-white text-lg font-bold font-geist
                transition-colors
                hover:bg-[#d45207] cursor-pointer active:bg-[#d64d08]
                disabled:bg-[#d64d08] disabled:cursor-not-allowed
                max-md:w-full max-md:mt-1
              `}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2"
              >
                <path
                  d="M15.7881 14.7881L11.8539 10.8539M11.8539 10.8539C13.0179 9.68989 13.7145 8.13649 13.7145 6.50726C13.7145 4.87803 13.0179 3.32463 11.8539 2.16065C10.6899 0.996669 9.13649 0.300049 7.50726 0.300049C5.87803 0.300049 4.32463 0.996669 3.16065 2.16065C1.99667 3.32463 1.30005 4.87803 1.30005 6.50726C1.30005 8.13649 1.99667 9.68989 3.16065 10.8539C4.32463 12.0179 5.87803 12.7145 7.50726 12.7145C9.13649 12.7145 10.6899 12.0179 11.8539 10.8539ZM11.8539 10.8539L15.7881 14.7881"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSearching ? 'Buscando...' : 'Search'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
