"use client";

import { useState, FormEvent, useEffect, useCallback } from "react";
import { Filter, Search, Loader2 } from "lucide-react";
import type { CarFilters } from "@/app/cars/page";

interface SearchFiltersProps {
  onSearch: (filters: CarFilters) => void;
}

const CATEGORIES = [
  { value: "", label: "All Categories" },
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

      // If there's a search term, use it as a general location search
      if (searchTerm.trim()) {
        filters.location = searchTerm.trim();
        console.log('Searching with location:', filters.location); // Debug log
      }

      // Add other filters
      if (selectedCategory) filters.category = selectedCategory;
      if (minPriceNum !== undefined) filters.minPrice = minPriceNum;
      if (maxPriceNum !== undefined) filters.maxPrice = maxPriceNum;
      if (transmission) filters.transmission = transmission as 'manual' | 'automatic';
      if (fuel) filters.fuel = fuel as 'gasoline' | 'diesel' | 'electric' | 'hybrid';

      console.log('Applying filters:', filters); // Debug log
      await onSearch(filters);
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm, selectedCategory, minPrice, maxPrice, transmission, fuel, onSearch]);

  // Effect for instant search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500); // Increased debounce time to 500ms

    return () => clearTimeout(timeoutId);
  }, [handleSearch]);

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    handleSearch();
  };

  return (
    <div className="w-full px-6 py-8">
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-6">
        {/* Search and Filters Row */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
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

          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-black w-48 h-12 px-4 rounded-lg border border-gray-200 focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] outline-none"
              disabled={isSearching}
            >
              {CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 px-4 flex items-center gap-2 rounded-lg border border-gray-200 hover:border-[#EA580C] text-gray-700"
                disabled={isSearching}
              >
                <Filter className="text-black h-5 w-5" />
                <span>Filters</span>
              </button>
              <button
                type="submit"
                className="h-12 px-6 bg-[#EA580C] text-white rounded-lg hover:bg-[#EA580C]/90 transition-colors disabled:bg-[#EA580C]/50"
                disabled={isSearching}
              >
                {isSearching ? (
                  <div className="text-black flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Searching...</span>
                  </div>
                ) : (
                  "Apply Filters"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="space-y-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    className="text-black w-full h-12 px-4 rounded-lg border border-gray-200 focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] outline-none"
                    disabled={isSearching}
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    className="text-black w-full h-12 px-4 rounded-lg border border-gray-200 focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] outline-none"
                    disabled={isSearching}
                  />
                </div>
              </div>

              {/* Transmission */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="text-black w-full h-12 px-4 rounded-lg border border-gray-200 focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] outline-none"
                  disabled={isSearching}
                >
                  <option value="">Any</option>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              {/* Fuel Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                <select
                  value={fuel}
                  onChange={(e) => setFuel(e.target.value)}
                  className="text-black w-full h-12 px-4 rounded-lg border border-gray-200 focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] outline-none"
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
          </div>
        )}
      </form>
    </div>
  );
}