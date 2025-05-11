"use client";

import Image from "next/image";
import Link from "next/link";

interface CarInfo {
  name: string;
  price: string;
  city: string;
  seats: string;
  availability: string;
}

export default function CarGrid() {
  const cars: CarInfo[] = Array(8).fill({
    name: "Car Name and Year",
    price: "$150/day",
    city: "City",
    seats: "Number of Seats",
    availability: "Availability",
  });

  return (
    <div className="car-grid-container px-6 pb-6">
      <div className="grid grid-cols-4 gap-[20px] w-full max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {cars.map((car, index) => (
          <div
            key={index}
            className="flex w-[320px] h-[346px] flex-col items-center gap-2.5 rounded-lg border-[0.75px] border-[#D4D4D4] bg-white mx-auto"
          >
            {/* Imagem do carro */}
            <div className="w-full h-40 bg-[#B5B2B2] rounded-t-lg" />

            {/* Cabeçalho do carro */}
            <div className="flex w-full h-[30px] px-5 justify-between items-center">
              <h3 className="text-black font-geist text-base font-bold">
                {car.name}
              </h3>
              <span className="text-[#EA580C] font-geist text-[10px] font-medium w-[60px] h-5 flex items-center justify-center rounded-[30px] bg-[#FFF7ED]">
                {car.price}
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
                  {car.city}
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
                  {car.seats}
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
                  {car.availability}
                </span>
              </div>
            </div>

            {/* Botão de detalhes */}
            <Link
              href={`/cars/${index + 1}`}
              className="w-[calc(100%-40px)] h-9 rounded bg-[#EA580C] text-white font-geist text-sm font-bold flex items-center justify-center mx-5"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
