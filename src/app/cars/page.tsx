"use client";

import { useState } from "react";
import Header from "@/components/Header";
import SearchFilters from "@/components/SearchFilters";
import CarGrid from "@/components/CarGrid";
import Footer from "@/components/Footer";

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
  state?: string;
  location?: string; // Used for general location search (city, state, or address)
  category?: string;
  availability?: 'available' | 'rented' | 'maintenance';
  pickupDate?: string;
  returnDate?: string;
  [key: string]: string | number | undefined; // Allow dynamic keys for filter removal
};

export default function CarsPage() {
  const [filters, setFilters] = useState<CarFilters>({});

  const handleSearch = (newFilters: CarFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1">
        <SearchFilters onSearch={handleSearch} />
        <CarGrid filters={filters} />
      </main>
      <Footer />
    </div>
  );
}
