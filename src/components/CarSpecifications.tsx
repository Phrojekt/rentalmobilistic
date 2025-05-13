"use client";

import Image from "next/image";
import type { Car } from "@/services/carService";

interface CarSpecificationsProps {
  car: Car;
}

export default function CarSpecifications({ car }: CarSpecificationsProps) {
  const specifications = [
    { 
      icon: "/CarIcon.png",
      label: "Marca", 
      value: car.brand 
    },
    { 
      icon: "/CarIcon.png",
      label: "Modelo", 
      value: car.model 
    },
    { 
      icon: "/NumberofSeats_icon.png",
      label: "Assentos", 
      value: `${car.seats} lugares` 
    },
    { 
      icon: "/CarIcon.png",
      label: "Transmissão", 
      value: car.transmission === 'automatic' ? 'Automático' : 'Manual' 
    },
    { 
      icon: "/RentalIcon.png",
      label: "Combustível", 
      value: car.fuel === 'gasoline' ? 'Gasolina' 
        : car.fuel === 'diesel' ? 'Diesel'
        : car.fuel === 'electric' ? 'Elétrico'
        : 'Híbrido' 
    },
    { 
      icon: "/RentalIcon.png",
      label: "Quilometragem", 
      value: `${car.mileage.toLocaleString('pt-BR')} km` 
    },
    { 
      icon: "/window.svg",
      label: "Ano", 
      value: car.year.toString() 
    },
    { 
      icon: "/RentalIcon.png",
      label: "Valor do carro", 
      value: `R$ ${car.price.toLocaleString('pt-BR')}` 
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-black font-inter text-xl font-semibold">
        Descrição
      </h2>
      <p className="text-[#676773] font-inter text-sm font-semibold max-w-[1241px]">
        {car.description}
      </p>

      <div className="flex flex-wrap gap-5 w-full max-lg:gap-2.5">
        {specifications.map((spec) => (
          <div
            key={spec.label}
            className="flex w-[299px] h-[84px] p-2.5 flex-col gap-2.5 bg-[#F8FAFC] max-sm:w-full"
          >
            <div className="flex items-center gap-2">
              <Image
                src={spec.icon}
                alt={`${spec.label} Icon`}
                width={14}
                height={14}
                className="object-contain"
              />
              <span className="text-black font-inter text-sm font-medium">
                {spec.label}
              </span>
            </div>
            <span className="text-[#676773] font-inter text-sm pl-6">
              {spec.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
