"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { cartService } from "@/services/cartService";
import { carService } from "@/services/carService";
import type { Car } from "@/services/carService";
import Image from "next/image";

interface RentalHistory {
  userId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  userName?: string;
  userEmail?: string;
}

export default function RentalHistoryPage() {
  const params = useParams();
  const carId = params.id as string;
  const [rentalHistory, setRentalHistory] = useState<RentalHistory[]>([]);
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRentalHistory = async () => {      try {
        setLoading(true);
        // Carregar informações do carro
        const carData = await carService.getCarById(carId);
        if (!carData) {
          throw new Error("Car not found");
        }
        setCar(carData);

        // Carregar histórico de aluguéis
        const history = await cartService.getCarRentalHistory(carId);
        setRentalHistory(history.map(rental => ({
          ...rental,
          startDate: new Date(rental.startDate),
          endDate: new Date(rental.endDate)
        })));
      } catch (error) {
        console.error("Error loading rental history:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRentalHistory();
  }, [carId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-black">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-[#676773] hover:text-[#EA580C] transition-colors"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M15 18L9 12L15 6" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <span>Back to Cars</span>
        </button>
      </div>

      {/* Car Info Header */}
      {car && (
        <div className="mb-8">
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden">
              <Image
                src={car.images?.[0] || "/placeholder.png"}
                alt={car.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black mb-2">{car.name}</h1>
              <div className="flex items-center gap-2 text-[#676773]">
                <Image src="/gps_icon.png" alt="Location" width={16} height={16} />
                <span>{car.location.city}, {car.location.state}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rental History */}
      <div>
        <h2 className="text-xl font-bold text-black mb-4">Rental History</h2>
        {rentalHistory.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-[#676773]">This car hasn&apos;t been rented yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {rentalHistory.map((rental, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg border shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-black">
                      {rental.userName || "Anonymous User"}
                    </h3>
                    {rental.userEmail && (
                      <p className="text-sm text-[#676773]">{rental.userEmail}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#EA580C]">
                      ${rental.totalPrice}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#676773]">Start Date</p>
                    <p className="font-medium text-black">
                      {new Date(rental.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#676773]">End Date</p>
                    <p className="font-medium text-black">
                      {new Date(rental.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
