"use client";

import { MapPin, Users, Calendar } from "lucide-react";
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
      <div className="car-grid grid grid-cols-4 gap-[30px] w-full max-lg:grid-cols-2 max-sm:grid-cols-1">
        {cars.map((car, index) => (
          <div
            key={index}
            className="car-card flex w-full h-[346px] p-0 px-2.5 flex-col items-center gap-2.5 rounded-lg border-[0.75px] border-[#D4D4D4] bg-white"
          >
            <div className="car-image w-full h-40 bg-[#B5B2B2]" />
            <div className="car-header flex w-full h-[30px] px-[10px_10px_10px_20px] justify-between items-center">
              <h3 className="car-title text-black font-geist text-base font-bold">
                {car.name}
              </h3>
              <span className="car-price text-[#EA580C] font-geist text-[10px] font-medium w-[60px] h-5 p-2.5 flex items-center justify-center rounded-[30px] bg-[#FFF7ED]">
                {car.price}
              </span>
            </div>
            <div className="car-details flex w-full h-[75px] px-[10px_10px_10px_20px] flex-col justify-between items-start">
              <div className="detail-item flex items-center gap-1 text-[#676773]">
                <MapPin className="w-3.5 h-3.5" />
                <span className="font-inter text-sm font-medium">
                  {car.city}
                </span>
              </div>
              <div className="detail-item flex items-center gap-1 text-[#676773]">
                <Users className="w-3.5 h-3.5" />
                <span className="font-inter text-sm font-medium">
                  {car.seats}
                </span>
              </div>
              <div className="detail-item flex items-center gap-1 text-[#676773]">
                <Calendar className="w-3.5 h-3.5" />
                <span className="font-inter text-sm font-medium">
                  {car.availability}
                </span>
              </div>
            </div>
            <Link
              href={`/cars/${index + 1}`}
              className="view-details-button w-[282px] h-9 rounded bg-[#EA580C] text-white font-geist text-sm font-bold flex items-center justify-center"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
