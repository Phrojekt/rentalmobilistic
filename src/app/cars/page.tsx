"use client";

import Header from "@/components/Header";
import SearchFilters from "@/components/SearchFilters";
import CarGrid from "@/components/CarGrid";
import Footer from "@/components/Footer";

export default function CarsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1">
        <SearchFilters />
        <CarGrid />
      </main>
      <Footer />
    </div>
  );
}
