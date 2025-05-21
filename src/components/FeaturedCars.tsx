"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { carService } from "@/services/carService";
import type { Car } from "@/services/carService";
import CarCard from "./CarCard";

export default function FeaturedCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCars = async () => {
      try {
        const result = await carService.getFeaturedCars(4);
        console.log('Carros em destaque carregados:', result); // Debug
        setCars(result);
      } catch (error) {
        console.error("Erro ao carregar carros em destaque:", error);
        setError("Não foi possível carregar os carros em destaque");
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, []);

  if (loading) {
    return (
      <div className="flex w-full p-2.5 flex-col items-center gap-[20px]">
        <div className="flex w-full h-20 px-2.5 flex-col items-center gap-2.5">
          <h2 className="text-black font-geist text-4xl font-extrabold">
            Featured Cars
          </h2>
          <p className="text-[#676773] font-geist text-sm font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-full p-2.5 flex-col items-center gap-[20px]">
        <div className="flex w-full h-20 px-2.5 flex-col items-center gap-2.5">
          <p className="text-red-500 font-geist text-sm font-medium">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // Se não houver carros, não mostra a seção
  if (!cars || cars.length === 0) {
    return null;
  }

  return (
    <div
      className="flex w-full p-2.5 flex-col items-center gap-[40px] max-lg:h-auto py-16"
      id="featured-cars"
    >
      <div className="flex w-full h-20 px-2.5 flex-col items-center gap-4">
        <h2 className="text-black font-geist font-extrabold text-3xl text-center whitespace-nowrap max-sm:text-2xl" style={{ width: "100%" }}>
          Featured Cars
        </h2>
        <p className="text-[#676773] font-geist text-md font-medium text-center">
          Check out some of the best vehicles available for rent
        </p>
      </div>

      <div className="grid grid-cols-4 gap-[15px] w-full max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} href={`/cars/${car.id}`} />
        ))}
      </div>

      <Link
        href="/cars"
        className="flex w-[230px] h-[54px] mt-8 justify-center items-center gap-2.5 rounded-lg border border-black text-black hover:bg-[#EA580C] hover:text-white font-geist text-base font-bold hover:cursor-pointer transition-colors"
      >
        View all cars
      </Link>
    </div>
  );
}
