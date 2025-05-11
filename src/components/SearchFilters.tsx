"use client";

import { ChevronDown, Filter } from "lucide-react";

export default function SearchFilters() {
  return (
    <div className="search-filters-container w-full p-[40px_24px] flex flex-col items-start gap-[30px] max-lg:p-[30px_20px] max-sm:p-[20px_16px]">
      <div className="search-bar-wrapper w-full h-[98px] p-2.5 flex items-center gap-2.5 max-lg:flex-wrap max-sm:h-auto">
        {/* Campo de pesquisa */}
        <div className="search-input-container flex w-[calc(100%-350px)] h-[45px] px-2.5 items-center gap-2.5 rounded-lg border border-[#E4E4E7] max-lg:w-full">
          <input
            type="text"
            placeholder="Brand, model or city"
            className="w-full h-full text-[#676773] font-inter text-sm outline-none"
          />
        </div>

        {/* Botões Category e Filters */}
        <div className="filters-container flex gap-2.5 max-sm:w-full max-sm:flex-col">
          <button className="category-button flex w-[167px] h-[45px] px-2.5 justify-between items-center rounded-lg border border-[#E4E4E7] max-sm:w-full">
            <span className="text-black font-inter text-sm">Category</span>
            <ChevronDown className="w-5 h-5" />
          </button>
          <button className="filter-button flex w-[165px] h-[45px] px-2.5 items-center gap-2.5 rounded-lg border border-[#E4E4E7] max-sm:w-full">
            <Filter className="w-5 h-5" />
            <span className="text-black font-inter text-sm">Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
}
