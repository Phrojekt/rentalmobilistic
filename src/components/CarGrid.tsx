"use client";

import { useEffect, useState } from "react";
import { carService } from "@/services/carService";
import CarCard from "./CarCard";
import type { Car } from "@/services/carService";

export default function CarGrid() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCars() {
      setLoading(true);
      try {
        const result = await carService.getCars({ limit: 12 });
        setCars(result.cars || []);
      } finally {
        setLoading(false);
      }
    }
    fetchCars();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!cars.length)
    return (
      <div className="flex justify-center items-center w-full h-64">
        <span className="font-bold text-black text-lg text-center w-full">
          No cars found.
        </span>
      </div>
    );

  return (
    <div className="grid grid-cols-4 gap-4">
      {cars
        .filter((car) => car.availability !== "rented")
        .map((car) => (
          <CarCard key={car.id} car={car} href={`/cars/${car.id}`} />
        ))}
    </div>
  );
}
