"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { carService } from "@/services/carService";
import type { Car } from "@/services/carService";

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
            Carros em Destaque
          </h2>
          <p className="text-[#676773] font-geist text-sm font-medium">
            Carregando...
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
      className="flex w-full p-2.5 flex-col items-center gap-[20px] max-lg:h-auto"
      id="featured-cars"
    >
      <div className="flex w-full h-20 px-2.5 flex-col items-center gap-2.5">
        <h2 className="text-black font-geist text-4xl font-extrabold">
          Carros em Destaque
        </h2>
        <p className="text-[#676773] font-geist text-sm font-medium">
          Confira alguns dos melhores veículos disponíveis para aluguel
        </p>
      </div>

      <div className="grid grid-cols-4 gap-[15px] w-full max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {cars.map((car) => (
          <Link
            href={`/cars/${car.id}`}
            key={car.id}
            className="flex w-[320px] h-[346px] flex-col items-center gap-2.5 rounded-lg border-[0.75px] border-[#D4D4D4] bg-white mx-auto hover:border-[#EA580C] transition-colors"
          >
            {/* Imagem do carro */}
            <div className="w-full h-40 bg-[#B5B2B2] rounded-t-lg relative overflow-hidden">
              {car.images && car.images[0] && (
                <Image
                  src={car.images[0]}
                  alt={car.name}
                  fill
                  className="object-cover"
                  sizes="320px"
                />
              )}
            </div>

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
                <span className="font-inter text-sm font-medium">
                  {car.availability === "available"
                    ? "Disponível"
                    : car.availability === "rented"
                    ? "Alugado"
                    : "Em manutenção"}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/cars"
        className="flex w-[230px] h-[54px] p-2.5 justify-center items-center gap-2.5 rounded-lg border-[0.4px] border-[#EA580C] bg-[#2B3344] text-white font-geist text-base font-bold hover:bg-[#3B4357] transition-colors"
      >
        Ver Todos os Carros
      </Link>
    </div>
  );
}
