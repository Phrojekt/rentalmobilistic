"use client";

import { useState } from "react";
import Header from "../components/Header";
import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import FeaturedCars from "@/components/FeaturedCars";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  const [showAlert, setShowAlert] = useState(true);

  return (
    <main className="bg-white text-gray-900">
      {/* Alerta estilizado */}
      {showAlert && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white w-[90%] max-w-[400px] p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-bold text-yellow-700 mb-4">
              Aviso de Desenvolvimento
            </h2>
            <p className="text-sm text-gray-700">
              Este projeto ainda está em desenvolvimento, portanto, algumas
              funcionalidades e estilizações, tal como imagens, não foram
              adicionados.
            </p>
            <button
              onClick={() => setShowAlert(false)}
              className="mt-4 px-4 py-2 cursor-pointer bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <Header />
      <Hero />
      <SearchBar />
      <FeaturedCars />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </main>
  );
}