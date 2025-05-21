"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { carService } from "@/services/carService";
import type { Car } from "@/services/carService";
import type { CarFilters } from "@/app/cars/page";
import CarCard from "./CarCard";

interface CarGridProps {
  filters?: CarFilters;
}

export default function CarGrid({ filters = {} }: CarGridProps) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCars = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await carService.getCars(filters);
      setCars(result.cars);
    } catch (error) {
      console.error("Erro ao carregar carros:", error);
      setError("Não foi possível carregar os carros. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  if (loading) {
    return (
      <div className="car-grid-container px-6 pb-6">
        <div className="grid grid-cols-4 gap-[20px] w-full max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="flex w-[320px] h-[346px] flex-col items-center gap-2.5 rounded-lg border-[0.75px] border-[#D4D4D4] bg-white mx-auto animate-pulse"
            >
              <div className="w-full h-40 bg-gray-200 rounded-t-lg" />
              <div className="w-full px-5 py-3 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-[#676773]">Nenhum carro encontrado com os filtros selecionados</div>
      </div>
    );
  }

  return (
    <div className="car-grid-container px-6 pb-6">
      <div className="grid grid-cols-4 gap-[20px] w-full max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} href={`/cars/${car.id}`} />
        ))}
      </div>
    </div>
  );
}
