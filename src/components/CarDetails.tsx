"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import CarSpecifications from "./CarSpecifications";
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

  const handleBookingComplete = React.useCallback(async () => {
    setIsBookingModalOpen(false);
    await loadCar(); // Recarrega os dados do carro para atualizar o status
  }, [loadCar]);

  const handleCancelRental = async () => {
    if (!user || !car) return;

    if (!window.confirm("Tem certeza que deseja cancelar este aluguel?")) return;

    try {
      // Get user's confirmed rentals
      const userRentals = await cartService.getConfirmedRentals(user.uid);
      const currentRental = userRentals.find(rental => rental.carId === car.id);

      if (!currentRental) {
        console.error("Rental not found");
        return;
      }

      // Update rental status to cancelled
      await cartService.updateCartItem(currentRental.id, { status: 'cancelled' });

      // Update car availability to available
      await carService.updateCarAvailability(car.id, 'available');

      // Reload car data
      await loadCar();
    } catch (error) {
      console.error("Erro ao cancelar aluguel:", error);
      alert("Erro ao cancelar aluguel. Por favor, tente novamente.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-[#676773]">Carregando...</div>
      </div>
    );
  }

  // Componente para informações do aluguel
  const RentalInfo = () => {
    if (!car?.rentalInfo || !user) return null;

    return (
      <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
        <h3 className="text-lg font-bold text-orange-700 mb-3">Seu Aluguel</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Data de Início:</span>
            <span className="text-black font-medium">{new Date(car.rentalInfo.startDate).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Data de Devolução:</span>
            <span className="text-black font-medium">{new Date(car.rentalInfo.endDate).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold text-orange-700 pt-2 border-t border-orange-200">
            <span>Valor Total:</span>
            <span>R$ {car.rentalInfo.totalPrice.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>
    );
  };

  if (!car) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-[#676773]">Carro não encontrado</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full bg-white">
      <div className="flex w-full p-[40px_40px_0px] gap-5 flex-wrap max-lg:p-[30px_30px_0px] max-sm:p-[20px_20px_0px]">
        {/* Imagem principal do carro */}
        <div className="w-[910px] h-[620px] rounded-lg bg-[#DDD] max-lg:w-full max-sm:h-[300px] relative overflow-hidden">
          {car.images[selectedImage] && (
            <Image
              src={car.images[selectedImage]}
              alt={`${car.name} - Imagem ${selectedImage + 1}`}
              fill
              className="object-cover"
              priority
            />
          )}
        </div>

        {/* Informações do carro */}
        <div className="flex w-[430px] h-auto p-[30px_40px] flex-col items-start gap-[18px] rounded-lg border-[0.65px] border-[#676773] max-lg:w-full max-sm:p-5">
          <div className="flex h-[54px] flex-col items-start gap-2.5 w-full">
            <h1 className="text-black font-geist text-xl font-black">
              {car.name}
            </h1>
            <div className="flex items-center gap-2 text-[#676773]">
              <Image
                src="/gps_icon.png"
                alt="Location Icon"
                width={14}
                height={14}
                className="object-contain"
              />
              <span className="font-inter text-sm">
                {car.location.city}, {car.location.state}
              </span>
            </div>
          </div>

          <div className="flex h-[26px] justify-between items-center w-full">
            <div className="flex items-baseline gap-1">
              <span className="text-black font-geist text-xl">
                R$ {car.pricePerDay.toLocaleString('pt-BR')}
              </span>
              <span className="text-[#676773] font-geist text-sm">/DIA</span>
            </div>
            <div className={`font-geist text-xs font-bold h-5 px-3 flex items-center justify-center rounded-[30px] ${
              car.availability === 'available' 
                ? 'bg-[#FFF7ED] text-[#EA580C]' 
                : car.availability === 'rented'
                ? 'bg-[#FFE4E4] text-red-600'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {car.availability === 'available' 
                ? 'Disponível' 
                : car.availability === 'rented' 
                ? 'Alugado' 
                : 'Em Manutenção'}
            </div>
          </div>

          {car.availability === 'rented' && car?.rentalInfo && user && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-red-600 text-sm mb-3">
                Este carro já está alugado no momento.
              </div>
              
              {/* Informações do aluguel atual */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Data de Início:</span>
                  <span className="text-black font-medium">
                    {new Date(car.rentalInfo.startDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data de Devolução:</span>
                  <span className="text-black font-medium">
                    {new Date(car.rentalInfo.endDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-red-700 pt-2 border-t border-red-200">
                  <span>Valor Total:</span>
                  <span>R$ {car.rentalInfo.totalPrice.toLocaleString('pt-BR')}</span>
                </div>

                {/* Botão de Cancelar */}
                <button 
                  onClick={() => handleCancelRental()}  
                  className="mt-3 w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
                >
                  Cancelar Aluguel
                </button>
              </div>
            </div>
          )}

          {/* Especificações básicas */}
          <div className="flex flex-col gap-2.5 w-full">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src="/CarIcon.png"
                  alt="Transmission Icon"
                  width={14}
                  height={14}
                  className="object-contain"
                />
                <span className="text-[#676773] font-inter text-sm">
                  {car.transmission === 'automatic' ? 'Automático' : 'Manual'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/NumberofSeats_icon.png"
                  alt="Seats Icon"
                  width={14}
                  height={14}
                  className="object-contain"
                />
                <span className="text-[#676773] font-inter text-sm">
                  {car.seats} assentos
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src="/RentalIcon.png"
                  alt="Fuel Icon"
                  width={14}
                  height={14}
                  className="object-contain"
                />
                <span className="text-[#676773] font-inter text-sm">
                  {car.fuel === 'gasoline' ? 'Gasolina' 
                    : car.fuel === 'diesel' ? 'Diesel'
                    : car.fuel === 'electric' ? 'Elétrico'
                    : 'Híbrido'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/window.svg"
                  alt="Year Icon"
                  width={14}
                  height={14}
                  className="object-contain"
                />
                <span className="text-[#676773] font-inter text-sm">
                  {car.year}
                </span>
              </div>
            </div>
          </div>

          {/* Botão de alugar */}
          <button 
            className={`w-full h-9 flex items-center justify-center rounded font-geist text-sm font-bold ${
              car.availability === 'available'
                ? 'bg-[#EA580C] text-white hover:bg-[#D45207] transition-colors'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
            disabled={car.availability !== 'available'}
            onClick={() => setIsBookingModalOpen(true)}
          >
            {car.availability === 'available' ? 'Solicitar Aluguel' : 'Indisponível'}
          </button>
          
          {isBookingModalOpen && (
            <BookingModal 
              car={car} 
              isOpen={isBookingModalOpen}
              onClose={() => setIsBookingModalOpen(false)}
              onBookingComplete={handleBookingComplete}
            />
          )}
        </div>

        {/* Galeria de imagens */}
        <div className="flex w-full gap-2.5 overflow-x-auto py-2">
          {car.images.map((image, index) => (
            <div
              key={index}
              className={`w-[100px] h-[104px] flex-shrink-0 rounded relative overflow-hidden cursor-pointer ${
                selectedImage === index ? 'border-2 border-[#EA580C]' : ''
              }`}
              onClick={() => setSelectedImage(index)}
            >
              <Image
                src={image}
                alt={`${car.name} - Imagem ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* Abas de detalhes */}
        <div className="flex w-full flex-col gap-5">
          <div className="flex w-[392px] h-[41px] px-1 justify-between items-center rounded bg-[#DDD] max-sm:w-full">
            {["details", "features", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab as typeof selectedTab)}
                className={`w-[90px] h-6 rounded text-sm font-semibold ${
                  selectedTab === tab
                    ? "bg-white text-black"
                    : "bg-transparent text-[#676767]"
                }`}
              >
                {tab === 'details' ? 'Detalhes'
                  : tab === 'features' ? 'Características'
                  : 'Avaliações'}
              </button>
            ))}
          </div>

          {selectedTab === "details" && (
            <>
              <CarSpecifications car={car} />
              <RentalInfo />
            </>
          )}
          {selectedTab === "features" && (
            <div className="flex flex-wrap gap-4">
              {car.features.map((feature, index) => (
                <div key={index} className="bg-[#F8FAFC] text-black p-3 rounded">
                  {feature}
                </div>
              ))}
            </div>
          )}
          {selectedTab === "reviews" && (
            <div className="text-[#676773] p-4 bg-[#F8FAFC] rounded">
              Em breve: avaliações dos usuários
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
