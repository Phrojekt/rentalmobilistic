"use client";

import { useEffect } from "react";
import Header from "@/components/Header";
import CarDetails from "@/components/CarDetails";
import Footer from "@/components/Footer";

export default function CarDetailsPage() {
  useEffect(() => {
    // Podemos adicionar verificações aqui se necessário
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1 pb-10">
        <CarDetails />
      </main>
      <Footer />
    </div>
  );
}
