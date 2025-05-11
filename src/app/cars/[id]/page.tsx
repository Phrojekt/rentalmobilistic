"use client";

import Header from "@/components/Header";
import CarDetails from "@/components/CarDetails";
import Footer from "@/components/Footer";

export default function CarDetailsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1">
        <CarDetails />
      </main>
      <Footer />
    </div>
  );
}
