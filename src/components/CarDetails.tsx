"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { carService } from "@/services/carService";
import { cartService } from "@/services/cartService";
import { useAuth } from "@/hooks/useAuth";
import type { Car } from "@/services/carService";
import BookingModal from "./BookingModal";

export default function CarDetails() {
  const params = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedTab, setSelectedTab] = useState<"details" | "features" | "reviews">("details");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const { user } = useAuth();

  const loadCar = React.useCallback(async () => {
    try {
      if (typeof params.id === 'string') {
        const carData = await carService.getCarById(params.id);
        
        if (carData && user && carData.availability === 'rented') {
          // Verificar se o carro está alugado pelo usuário atual
          const userRentals = await cartService.getConfirmedRentals(user.uid);
          const currentRental = userRentals.find(rental => rental.carId === carData.id);
          
          if (currentRental) {
            // Adicionar informações do aluguel ao carro
            setCar({
              ...carData,
              rentalInfo: {
                startDate: currentRental.startDate,
                endDate: currentRental.endDate,
                totalPrice: currentRental.totalPrice
              }
            });
            return;
          }
        }
        
        setCar(carData);
      }
    } catch (error) {
      console.error("Erro ao carregar carro:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id, user]);

  useEffect(() => {
    loadCar();
  }, [loadCar]);


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-[#676773]">Loading...</div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-[#676773]">Car not found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full bg-white">
      <div className="flex w-full max-w-7xl mx-auto gap-8 py-10 px-6 flex-col lg:flex-row">
        {/* Left: Main Image and Gallery */}
        <div className="flex flex-col w-full lg:w-2/3">
          <div className="relative w-full aspect-[16/10] bg-gray-200 rounded-lg overflow-hidden">
            {car.images[selectedImage] && (
              <Image
                src={car.images[selectedImage]}
                alt={`${car.name} - Image ${selectedImage + 1}`}
                fill
                className="object-cover"
                priority
              />
            )}
          </div>
          <div className="flex gap-3 mt-4">
            {car.images.map((image, index) => (
              <button
                key={index}
                className={`relative w-20 h-20 rounded overflow-hidden border-2 ${selectedImage === index ? "border-orange-500" : "border-transparent"}`}
                onClick={() => setSelectedImage(index)}
                aria-label={`Show image ${index + 1}`}
              >
                <Image
                  src={image}
                  alt={`${car.name} - Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
          {/* Tabs */}
          <div className="mt-8">
            <div className="flex gap-2 mb-4">
              {["details", "features", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab as typeof selectedTab)}
                  className={`px-5 py-2 rounded-t font-semibold text-sm border-b-2 ${
                    selectedTab === tab
                      ? "bg-white border-orange-500 text-black"
                      : "bg-gray-100 border-transparent text-gray-500"
                  }`}
                >
                  {tab === "details"
                    ? "Details"
                    : tab === "features"
                    ? "Features"
                    : "Reviews"}
                </button>
              ))}
            </div>
            <div className="rounded-b p-6 min-h-[120px]">
              {selectedTab === "details" && (
                <>
                  <div className="mb-4">
                    <h3 className="font-bold text-black text-lg mb-2">Description</h3>
                    <p className="text-gray-700">{car.description}</p>
                  </div>
                  {/* Car Specifications as cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 border rounded p-3 flex flex-col items-start">
                      <div className="flex items-center gap-2 mb-1">
                        <Image src="/CarIcon.png" alt="Category Icon" width={18} height={18} />
                        <span className="text-base font-bold text-black">Category</span>
                      </div>
                      <span className="text-sm font-medium text-black">{car.category}</span>
                    </div>
                    <div className="bg-gray-50 border rounded p-3 flex flex-col items-start">
                      <div className="flex items-center gap-2 mb-1">
                        <Image src="/OrangeSeats_icon.png" alt="Seats Icon" width={18} height={18} />
                        <span className="text-base font-bold text-black">Seats</span>
                      </div>
                      <span className="text-sm font-medium text-black">{car.seats}</span>
                    </div>
                    <div className="bg-gray-50 border rounded p-3 flex flex-col items-start">
                      <div className="flex items-center gap-2 mb-1">
                        <Image src="/TransmissionIcon.png" alt="Transmission Icon" width={18} height={18} />
                        <span className="text-base font-bold text-black">Transmission</span>
                      </div>
                      <span className="text-sm font-medium text-black">{car.transmission === "automatic" ? "Automatic" : "Manual"}</span>
                    </div>
                    <div className="bg-gray-50 border rounded p-3 flex flex-col items-start">
                      <div className="flex items-center gap-2 mb-1">
                        <Image src="/FuelIcon.png" alt="Fuel Icon" width={18} height={18} />
                        <span className="text-base font-bold text-black">Fuel</span>
                      </div>
                      <span className="text-sm font-medium text-black capitalize">{car.fuel}</span>
                    </div>
                  </div>
                </>
              )}
              {selectedTab === "features" && (
                <div>
                  <h3 className="font-bold text-black text-lg mb-4">Vehicle features</h3>
                  {car.features.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-8">
                      {car.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {/* Check icon SVG, laranja */}
                          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <path d="M5 10.5L9 14.5L15 7.5" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="text-black">{feature}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">No features listed.</span>
                  )}
                </div>
              )}
              {selectedTab === "reviews" && (
                <div className="text-gray-500">Coming soon: user reviews</div>
              )}
            </div>
          </div>
        </div>
        {/* Right: Car Info and Booking */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white border rounded-lg p-6 flex flex-col gap-4 shadow-sm">
            <h2 className="font-bold text-2xl mb-1 text-[#1A1A1A]">
              {car.name} {car.year && `(${car.year})`}
            </h2>
            <div className="flex items-center gap-2 text-[#676773] text-base mb-2">
              <Image src="/gps_icon.png" alt="Location Icon" width={16} height={16} />
              <span>{car.location.city}, {car.location.state}</span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-[#EA580C]">${car.pricePerDay}</span>
              <span className="text-[#676773] text-base">/DAY</span>
            </div>
            <div
              className={`text-xs font-semibold mb-2 ${
                car.availability === "available"
                  ? "text-[#16A34A]"
                  : car.availability === "rented"
                  ? "text-[#EA580C]"
                  : "text-[#F59E42]"
              }`}
            >
              {car.availability === "available"
                ? "Available Now"
                : car.availability === "rented"
                ? "Currently Rented"
                : "Maintenance"}
            </div>
            {/* Booking Form Placeholder */}
            <div className="bg-gray-50 rounded p-4 mb-2">
              <div className="mb-2">
                <label className="block text-xs text-[#676773] mb-1">Select Period</label>
                <input
                  type="text"
                  className="w-full border rounded px-2 py-1 text-sm text-[#1A1A1A] bg-white"
                  placeholder="dd/mm/yyyy - dd/mm/yyyy"
                  disabled
                />
              </div>
              <div className="flex flex-col gap-1 text-sm mb-2">
                <div className="flex justify-between">
                  <span className="text-[#676773]">${car.pricePerDay} x 3</span>
                  <span className="text-[#1A1A1A] font-semibold">${car.pricePerDay * 3}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#676773]">Service fee</span>
                  <span className="text-[#1A1A1A] font-semibold">$45</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-1">
                  <span className="text-[#1A1A1A]">Total</span>
                  <span className="text-[#EA580C]">${car.pricePerDay * 3 + 45}</span>
                </div>
              </div>
              <button
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded transition-colors"
                disabled={car.availability !== "available"}
                onClick={() => setIsBookingModalOpen(true)}
              >
                Request Rental
              </button>
            </div>
            {/* Owner Info Placeholder */}
            <div className="flex items-center gap-3 mt-2">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div>
                <div className="font-semibold text-sm text-black">Mark Williams</div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>⭐⭐⭐⭐☆</span>
                  <span>(230 Reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Booking Modal */}
      {isBookingModalOpen && (
        <BookingModal
          car={car}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          onBookingComplete={() => {}}
        />
      )}
    </div>
  );
}
