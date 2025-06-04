"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "../components/Header";
interface SearchFilters {
  location?: string;
  startDate?: Date;
  endDate?: Date;
  carType?: string;
}
import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import FeaturedCars from "@/components/FeaturedCars";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Redirect logged in users to /cars
  useEffect(() => {
    if (!loading && user) {
      router.push('/cars');
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Don't render the home page if user is logged in (redirect is in progress)
  if (user) {
    return null;
  }
  
  const handleSearch = (filters: SearchFilters) => {
    // Constrói a URL com os parâmetros de busca
    const searchParams = new URLSearchParams();
    if (filters.location) searchParams.set('location', filters.location);
    if (filters.startDate) searchParams.set('pickupDate', filters.startDate.toString());
    if (filters.endDate) searchParams.set('returnDate', filters.endDate.toString());
    
    // Redireciona para a página de carros com os filtros
    router.push(`/cars?${searchParams.toString()}`);
  };

  return (
    <main className="bg-white text-gray-900">
      <Header />
      <Hero />
      <SearchBar onSearch={handleSearch} />
      <FeaturedCars />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </main>
  );
}