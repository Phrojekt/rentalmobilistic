"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { carService } from "@/services/carService";
import type { Car } from "@/services/carService";
import type { CarFilters } from "@/app/cars/page";

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
          <Link
            href={`/cars/${car.id}`}
            key={car.id}
            className="flex w-[320px] h-[346px] flex-col items-center gap-2.5 rounded-lg border-[0.75px] border-[#D4D4D4] bg-white mx-auto hover:border-[#EA580C] transition-colors relative"
          >
            {/* Imagem do carro */}
            <div className="w-full h-40 bg-[#B5B2B2] rounded-t-lg relative overflow-hidden">
              {car.images[0] && (
                <Image
                  src={car.images[0]}
                  alt={car.name}
                  fill
                  className="object-cover"
                  sizes="320px"
                  priority={false}
                />
              )}
            </div>

            {/* Badge de status e overlay */}
            {car.availability === 'rented' && (
              <>
                <div className="absolute inset-0 bg-gray-200 bg-opacity-10 backdrop-blur-[1px] rounded-lg pointer-events-none" />
                <div className="absolute top-1 right-1 flex flex-col gap-1">
                  <div className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium text-center">
                    Já Alugado
                  </div>
                  {car.currentRental && (
                    <div className="bg-white/90 text-gray-700 px-2 py-1 rounded-full text-[10px] font-medium text-center whitespace-nowrap">
                      Retorna {new Date(car.currentRental.endDate).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
                {car.currentRental && (
                  <div className="absolute bottom-2 left-2 right-2 bg-red-50 text-red-600 px-2 py-1 rounded text-xs">
                    Alugado até {new Date(car.currentRental.endDate).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </>
            )}

            {/* Cabeçalho do carro */}
            <div className="flex w-full h-[30px] px-5 justify-between items-center">
              <h3 className="text-black font-geist text-base font-bold">
                {car.name}
              </h3>
              <span className="text-[#EA580C] font-geist text-[10px] font-medium w-[60px] h-5 flex items-center justify-center rounded-[30px] bg-[#FFF7ED]">
                R$ {car.pricePerDay.toLocaleString('pt-BR')}/dia
              </span>
            </div>

            {/* Detalhes do carro */}
            <div className="flex w-full h-[75px] px-5 flex-col justify-between items-start">
              <div className="flex items-center gap-2 text-[#676773]">
                <Image
                  src="/gps_icon.png"
                  alt="City Icon"
                  width={14}
                  height={14}
                  className="object-contain"
                />
                <span className="font-inter text-sm font-medium">
                  {car.location.city}, {car.location.state}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#676773]">
                <Image
                  src="/NumberofSeats_icon.png"
                  alt="Seats Icon"
                  width={14}
                  height={14}
                  className="object-contain"
                />
                <span className="font-inter text-sm font-medium">
                  {car.seats} assentos
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#676773]">
                <Image
                  src="/Availability_icon.png"
                  alt="Availability Icon"
                  width={14}
                  height={14}
                  className="object-contain"
                />
                <div className="flex flex-col">
                <span className={`font-inter text-sm font-medium ${
                  car.availability === "rented" ? "text-red-600" : 
                  car.availability === "available" ? "text-green-600" : 
                  "text-yellow-600"
                }`}>
                  {car.availability === "available"
                    ? "Disponível"
                    : car.availability === "rented"
                    ? "Já Alugado"
                    : "Em manutenção"}
                </span>
                {car.availability === "rented" && car.currentRental && (
                  <span className="text-xs text-gray-500">
                    Retorna em: {new Date(car.currentRental.endDate).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
