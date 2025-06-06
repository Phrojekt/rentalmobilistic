import Link from "next/link";
import Image from "next/image";
import type { Car } from "@/services/carService";

interface CarCardProps {
  car: Car;
  href?: string;
}

export default function CarCard({ car, href }: CarCardProps) {
  return (
    <div className="flex w-[320px] h-[346px] flex-col items-center gap-2.5 rounded-lg border-[0.75px] border-[#D4D4D4] bg-white mx-auto transition-colors relative">
      {/* Car image */}
      <div className="w-full h-40 bg-[#B5B2B2] rounded-t-lg relative overflow-hidden">
        {car.images && car.images[0] && (
          <Image
            src={car.images[0]}
            alt={car.name}
            width={320}
            height={160}
            className="object-cover w-full h-full"
            sizes="320px"
            priority={false}
          />
        )}
      </div>

      {/* Status badge and overlay */}
      {car.availability === "rented" && (
        <>
          <div className="absolute inset-0 bg-gray-200 bg-opacity-10 backdrop-blur-[1px] rounded-lg pointer-events-none" />
          <div className="absolute top-1 right-1 flex flex-col gap-1">
            <div className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium text-center">
              Rented
            </div>
            {car.currentRental && (
              <div className="bg-white/90 text-gray-700 px-2 py-1 rounded-full text-[10px] font-medium text-center whitespace-nowrap">
                Returns {new Date(car.currentRental.endDate).toLocaleDateString("en-US")}
              </div>
            )}
          </div>
          {car.currentRental && (
            <div className="absolute bottom-2 left-2 right-2 bg-red-50 text-red-600 px-2 py-1 rounded text-xs">
              Rented until {new Date(car.currentRental.endDate).toLocaleDateString("en-US")}
            </div>
          )}
        </>
      )}

      {/* Car header */}
      <div className="flex w-full h-[30px] px-5 justify-between items-center">
        <h3 className="text-black font-geist text-base font-bold">{car.name}</h3>
        <span
          className="bg-[#FFF7ED] text-[#EA580C] font-geist text-[14px] font-medium flex items-center justify-center rounded-[30px] px-4 py-1 whitespace-nowrap text-center"
          style={{ minWidth: 80 }}
        >
          ${parseInt(car.pricePerDay.toString(), 10)}/day
        </span>
      </div>

      {/* Car details */}
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
            {car.seats} seats
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
          <span className={`font-inter text-sm font-medium ${
            car.availability === "rented"
              ? "text-red-600"
              : car.availability === "available"
              ? "text-green-600"
              : "text-yellow-600"
          }`}>
            {car.availability === "available"
              ? "Available"
              : car.availability === "rented"
              ? "Rented"
              : "Maintenance"}
          </span>
          {car.availability === "rented" && car.currentRental && (
            <span className="text-xs text-gray-500">
              Returns: {new Date(car.currentRental.endDate).toLocaleDateString("en-US")}
            </span>
          )}
        </div>
      </div>
      {/* View Details button */}
      <div className="w-full px-5 pb-4">
        {href && (
          <Link
            href={href}
            className="w-full h-[40px] bg-[#EA580C] text-white font-geist text-sm font-bold rounded-lg flex items-center justify-center hover:bg-[#d45207] transition-colors"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
}