"use client";

import { useState, FormEvent, useEffect, useCallback } from "react";
import { Filter, Search, Loader2, X, ChevronDownIcon } from "lucide-react";
import type { CarFilters } from "@/app/cars/page";

interface SearchFiltersProps {
  onSearch: (filters: CarFilters) => void;
}

const CATEGORIES = [
  { value: "", label: "Categories" },
  { value: "Sedan", label: "Sedan" },
  { value: "SUV", label: "SUV" },
  { value: "Hatch", label: "Hatch" },
  { value: "Pickup", label: "Pickup" },
  { value: "Convertible", label: "Convertible" },
  { value: "Coupe", label: "Coupe" },
  { value: "Van", label: "Van" },
  { value: "Wagon", label: "Wagon" }
];

export default function SearchFilters({ onSearch }: SearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [transmission, setTransmission] = useState<string>("");
  const [fuel, setFuel] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    setIsSearching(true);
    try {
      let minPriceNum: number | undefined = undefined;
      let maxPriceNum: number | undefined = undefined;

      if (minPrice) {
        minPriceNum = Number(minPrice);
        if (isNaN(minPriceNum) || minPriceNum < 0) {
          alert("Please enter a valid minimum price");
          return;
        }
      }

      if (maxPrice) {
        maxPriceNum = Number(maxPrice);
        if (isNaN(maxPriceNum) || maxPriceNum < 0) {
          alert("Please enter a valid maximum price");
          return;
        }
      }

      if (minPriceNum !== undefined && maxPriceNum !== undefined && minPriceNum > maxPriceNum) {
        alert("Minimum price cannot be greater than maximum price");
        return;
      }

      const filters: CarFilters = { availability: "available" };

      if (searchTerm.trim()) {
        filters.location = searchTerm.trim();
      }

      if (selectedCategory) filters.category = selectedCategory;
      if (minPriceNum !== undefined) filters.minPrice = minPriceNum;
      if (maxPriceNum !== undefined) filters.maxPrice = maxPriceNum;
      if (transmission) filters.transmission = transmission as 'manual' | 'automatic';
      if (fuel) filters.fuel = fuel as 'gasoline' | 'diesel' | 'electric' | 'hybrid';

      await onSearch(filters);
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm, selectedCategory, minPrice, maxPrice, transmission, fuel, onSearch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [handleSearch]);

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    handleSearch();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setTransmission("");
    setFuel("");
  };

  const hasActiveFilters = searchTerm || selectedCategory || minPrice || maxPrice || transmission || fuel;

  return (
    <div className="w-full px-6 py-8">
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center w-full">
          {/* Search Input */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                {isSearching ? (
                  <Loader2 className="h-5 w-5 text-[#EA580C] animate-spin" />
                ) : (
                  <Search className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by brand, model, city or state..."
                className="text-black w-full h-12 pl-10 pr-4 rounded-lg border border-gray-200 focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] outline-none"
              />
            </div>
          </div>
          {/* Categories e Filters lado a lado no mobile */}
          <div className="flex flex-row gap-3 w-full sm:w-auto">
            {/* Category Selector */}
            <div className="relative w-full">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none text-black w-full h-10 sm:h-12 px-3 sm:px-4 pr-16 text-sm sm:text-base rounded-lg border border-gray-200 focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] outline-none"
                disabled={isSearching}
              >
                {CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {/* Ícone visual da seta */}
              <ChevronDownIcon className="pl-2 w-6 h-6 text-black absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {/* Filters Button */}
            <div className="flex-1 relative">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`w-full h-10 sm:h-12 px-3 sm:px-4 flex items-center justify-center gap-1 sm:gap-2 cursor-pointer rounded-lg border transition-colors text-sm sm:text-base whitespace-nowrap ${showFilters || hasActiveFilters
                  ? 'border-[#EA580C] bg-[#EA580C]/5 text-[#EA580C]'
                  : 'border-gray-200 hover:border-[#EA580C] text-gray-700'
                  }`}
                disabled={isSearching}
              >
                <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="inline sm:inline">
                  Filters
                </span>
                {hasActiveFilters && (
                  <span className="bg-[#EA580C] text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                    •
                  </span>
                )}
              </button>
              {/* Dropdown Menu */}
              {showFilters && (
                <>
                  {/* Backdrop for mobile */}
                  <div
                    className="fixed inset-0 bg-black/20 z-40"
                    onClick={() => setShowFilters(false)}
                  />
                  {/* Modal behavior on small screens, dropdown on desktop */}
                  <div
                    className={`
                      z-50
                      bg-white border border-gray-200 rounded-lg shadow-lg
                      mx-auto sm:mx-0
                      ${/* Modal centralizado no mobile, dropdown no desktop */""}
                      fixed sm:absolute
                      left-1/2 top-1/2 sm:top-12
                      sm:left-1/2
                      sm:-translate-x-1/2
                      ${/* Centraliza no mobile */""}
                      -translate-x-1/2 -translate-y-1/2 sm:translate-y-0
                      w-[95vw] max-w-sm sm:w-80 lg:w-96
                    `}
                  >
                    <div className="p-4 sm:p-6">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Advanced Filters</h3>
                        <button
                          type="button"
                          onClick={() => setShowFilters(false)}
                          className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                        >
                          <X className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                      {/* Filters Content */}
                      <div className="space-y-4">
                        {/* Price Range */}
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                            Price Range (per day)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={minPrice}
                              onChange={(e) => setMinPrice(e.target.value)}
                              placeholder="Min"
                              className="text-black w-1/2 h-9 sm:h-10 px-2 sm:px-3 text-sm rounded-lg border border-gray-200 focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] outline-none"
                              disabled={isSearching}
                              style={{ minWidth: 0 }}
                            />
                            <input
                              type="number"
                              value={maxPrice}
                              onChange={(e) => setMaxPrice(e.target.value)}
                              placeholder="Max"
                              className="text-black w-1/2 h-9 sm:h-10 px-2 sm:px-3 text-sm rounded-lg border border-gray-200 focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] outline-none"
                              disabled={isSearching}
                              style={{ minWidth: 0 }}
                            />
                          </div>
                        </div>
                        {/* Transmission */}
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                            Transmission
                          </label>
                          <select
                            value={transmission}
                            onChange={(e) => setTransmission(e.target.value)}
                            className="text-black w-full h-9 sm:h-10 px-2 sm:px-3 text-sm rounded-lg border border-gray-200 focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] outline-none"
                            disabled={isSearching}
                          >
                            <option value="">Any</option>
                            <option value="automatic">Automatic</option>
                            <option value="manual">Manual</option>
                          </select>
                        </div>
                        {/* Fuel Type */}
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                            Fuel Type
                          </label>
                          <select
                            value={fuel}
                            onChange={(e) => setFuel(e.target.value)}
                            className="text-black w-full h-9 sm:h-10 px-2 sm:px-3 text-sm rounded-lg border border-gray-200 focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] outline-none"
                            disabled={isSearching}
                          >
                            <option value="">Any</option>
                            <option value="gasoline">Gasoline</option>
                            <option value="diesel">Diesel</option>
                            <option value="electric">Electric</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex gap-2 sm:gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="flex-1 h-9 sm:h-10 px-3 sm:px-4 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          disabled={isSearching}
                        >
                          Clear All
                        </button>
                        <button
                          type="submit"
                          className="flex-1 h-9 sm:h-10 px-3 sm:px-4 text-sm bg-[#EA580C] text-white rounded-lg hover:bg-[#EA580C]/90 transition-colors disabled:bg-[#EA580C]/50 cursor-pointer"
                          disabled={isSearching}
                          onClick={() => setShowFilters(false)}
                        >
                          {isSearching ? (
                            <div className="flex items-center justify-center gap-1 sm:gap-2">
                              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                              <span>Applying...</span>
                            </div>
                          ) : (
                            "Apply Filters"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#EA580C]/10 text-[#EA580C] rounded-full text-sm">
                Search: {searchTerm}
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="hover:bg-[#EA580C]/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#EA580C]/10 text-[#EA580C] rounded-full text-sm">
                Category: {CATEGORIES.find(c => c.value === selectedCategory)?.label}
                <button
                  type="button"
                  onClick={() => setSelectedCategory("")}
                  className="hover:bg-[#EA580C]/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#EA580C]/10 text-[#EA580C] rounded-full text-sm">
                Price: ${minPrice || "0"} - ${maxPrice || "∞"}
                <button
                  type="button"
                  onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                  className="hover:bg-[#EA580C]/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {transmission && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#EA580C]/10 text-[#EA580C] rounded-full text-sm">
                {transmission}
                <button
                  type="button"
                  onClick={() => setTransmission("")}
                  className="hover:bg-[#EA580C]/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {fuel && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#EA580C]/10 text-[#EA580C] rounded-full text-sm">
                {fuel}
                <button
                  type="button"
                  onClick={() => setFuel("")}
                  className="hover:bg-[#EA580C]/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </form>
    </div>
  );
}