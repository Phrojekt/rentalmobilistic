"use client";

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
  pickupDate?: string;
  returnDate?: string;
  state?: string;
  location?: string;
  availability?: 'available' | 'rented' | 'maintenance';
};

export default function CarsPage() {

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1">
        <SearchFilters />
        <CarGrid  />
      </main>
      <Footer />
    </div>
  );
}
