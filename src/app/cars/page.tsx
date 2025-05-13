"use client";

import { useState } from "react";
import Header from "@/components/Header";
import SearchFilters from "@/components/SearchFilters";
import CarGrid from "@/components/CarGrid";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";

export type CarFilters = {
  brand?: string;
  transmission?: 'manual' | 'automatic';
  fuel?: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  seats?: number;
  city?: string;
  pickupDate?: string;
  returnDate?: string;
  state?: string;
  location?: string;
  availability?: 'available' | 'rented' | 'maintenance';
};

export default function CarsPage() {
  const [filters, setFilters] = useState<CarFilters>({});

  const handleFilterChange = (newFilters: CarFilters) => {
    setFilters(prev => ({...prev, ...newFilters}));
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1">
        <div className="bg-[#F5F5F5] p-6">
          <SearchBar onSearch={handleFilterChange} />
        </div>
        <SearchFilters onFilterChange={handleFilterChange} />
        <CarGrid filters={filters} />
      </main>
      <Footer />
    </div>
  );
}
