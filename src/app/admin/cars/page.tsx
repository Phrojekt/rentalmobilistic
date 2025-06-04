"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { carService } from "@/services/carService";
import { cartService } from "@/services/cartService";
import type { Car } from "@/services/carService";
import Link from "next/link";
import Image from "next/image";
import UpdateAvailabilityModal from "@/components/UpdateAvailabilityModal";
import NotificationList from "@/components/NotificationList";

// Tipos para as tabs
type TabType = 'my-cars' | 'rented-cars' | 'notifications';

function AdminCarsPageContent() {  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams?.get("tab") as TabType | null;

  const [cars, setCars] = useState<Car[]>([]);
  const [rentedCars, setRentedCars] = useState<Car[]>([]);  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>(tab && (tab === 'my-cars' || tab === 'rented-cars') ? tab : 'my-cars');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);const [carFilter, setCarFilter] = useState<'all' | 'active'>('all');
  const [selectedCarForAvailability, setSelectedCarForAvailability] = useState<Car | null>(null);

  // Função para carregar os carros
  const loadUserCars = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Carregar carros do usuário
      const userCars = await carService.getCarsByOwner(user.uid);
      setCars(userCars);

      // Carregar aluguéis confirmados (excluindo carros que o usuário é dono e aluguéis cancelados)
      const userRentals = await cartService.getConfirmedRentals(user.uid);
      const activeRentals = userRentals.filter(rental => rental.status === 'confirmed');      // Mantém track dos carros já processados
      const processedCarIds = new Set();
      
      const rentedCarDetails = await Promise.all(
        activeRentals.map(async rental => {
          // Se já processamos este carro, pula
          if (processedCarIds.has(rental.carId)) {
            return null;
          }
          
          const car = await carService.getCarById(rental.carId);
          // Não incluir carros que o usuário é dono ou que não estão mais alugados
          if (!car || car.ownerId === user.uid || car.availability !== 'rented') {
            return null;
          }

          // Marca o carro como processado
          processedCarIds.add(rental.carId);
          
          const status: 'active' | 'cancelled' | 'completed' = 
            rental.status === 'confirmed' ? 'active' : 
            rental.status === 'cancelled' ? 'cancelled' : 
            'completed';
          
          return {
            ...car,
            rentalId: rental.id,
            rentalInfo: {
              startDate: rental.startDate,
              endDate: rental.endDate,
              totalPrice: rental.totalPrice,
              status
            }
          };
        })
      );

      // Filtra carros nulos e garante que só apareçam carros ativamente alugados
      const validRentedCars = rentedCarDetails.filter((car): car is NonNullable<typeof car> => 
        car !== null && car.availability === 'rented'
      );

      setRentedCars(validRentedCars);
    } catch (error) {
      console.error("Erro ao carregar carros:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Efeito para carregar os carros quando o componente montar
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    loadUserCars();
  }, [user, authLoading, router, loadUserCars]);

  // Handler para atualização de disponibilidade
  const handleUpdateAvailability = () => {
    loadUserCars();
  };

  // Handler para deletar carro
  const handleDelete = async (carId: string) => {
    if (!user) return;
    if (window.confirm("Tem certeza que deseja excluir este carro?")) {
      try {
        await carService.deleteCar(carId);
        setCars(cars.filter(car => car.id !== carId));
      } catch (error) {
        console.error("Erro ao excluir carro:", error);
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-black">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Renderiza um carro individual
  const renderCarCard = (car: Car & { rentalId?: string }) => {
    let bookingRate = 0;
    if (car.rentalInfo) {
      const start = new Date(car.rentalInfo.startDate);
      const end = new Date(car.rentalInfo.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      bookingRate = Math.min(100, Math.round((days / 30) * 100));
    }

    return (
      <div
        key={activeTab === 'my-cars' ? car.id : `${car.id}-${car.rentalId || ''}`}
        className="border rounded-lg p-0 bg-white shadow-sm flex flex-col w-full min-h-[300px] sm:min-h-[300px] md:min-h-[320px] xl:min-h-[340px]"
      >
        {/* Banner - responsive height */}
        <div className="relative h-32 sm:h-40 bg-gray-100 rounded-t-lg overflow-hidden flex items-center justify-center">
          {car.images?.[0] ? (
            <Image
              src={car.images[0]}
              alt={car.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
          {/* Owner Profile Picture Overlay - responsive */}
          {activeTab === 'my-cars' && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 sm:gap-2 bg-black/50 rounded-full p-1 pr-2 sm:pr-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 rounded-full overflow-hidden border-2 border-white bg-white flex items-center justify-center">
                {car.ownerProfilePicture ? (
                  <Image
                    src={car.ownerProfilePicture}
                    alt="Owner"
                    width={32}
                    height={32}
                    className="object-cover w-full h-full rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-[#EA580C] flex items-center justify-center rounded-full">
                    <span className="text-white text-xs sm:text-sm font-bold">
                      {car.ownerName?.charAt(0)?.toUpperCase() || "O"}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-white text-xs sm:text-sm font-medium hidden sm:inline">
                {car.ownerName || 'Owner'}
              </span>
            </div>
          )}
        </div>
        
        {/* Content - responsive padding and text sizes */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col">
          {/* Name and availability */}
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-black font-bold text-base sm:text-lg truncate">{car.name}</h2>
            {/* Status badges - responsive */}
            {car.availability === "available" && (
              <span className="bg-green-100 text-green-700 text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                Active
              </span>
            )}
            {car.availability === "rented" && (
              <span className="bg-red-50 text-red-600 text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                Rented
              </span>
            )}
            {car.availability === "maintenance" && (
              <span className="bg-yellow-50 text-yellow-600 text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                Maintenance
              </span>
            )}
          </div>
          
          {/* Location - responsive */}
          <div className="flex items-center gap-1 sm:gap-2 text-[#676773] text-xs sm:text-sm mb-2 sm:mb-3">
            <Image src="/gps_icon.png" alt="Location Icon" width={14} height={14} className="sm:w-4 sm:h-4" />
            <span className="truncate">{car.location.city}, {car.location.state}</span>
          </div>
          
          {/* Booking Rate - responsive */}
          <div className="flex items-center justify-between text-xs text-[#676773] mb-1">
            <span>Booking rate</span>
            <span>{bookingRate}%</span>
          </div>
          <div className="w-full h-1.5 sm:h-2 bg-gray-200 rounded mb-3 sm:mb-4">
            <div
              className="h-1.5 sm:h-2 bg-[#EA580C] rounded"
              style={{ width: `${bookingRate}%` }}
            />
          </div>
          
          {/* Actions - responsive buttons */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 mt-auto">
            {activeTab === 'my-cars' ? (
              <>
                {/* Manage dropdown - responsive */}
                <div className="relative flex-1 min-w-0">
                  <button
                    className="w-full flex items-center justify-center gap-1 px-2 sm:px-3 py-2 sm:py-1.5 border rounded bg-white text-black font-semibold hover:bg-gray-100 cursor-pointer text-xs sm:text-sm min-w-0"
                    onClick={() => setOpenMenuId(openMenuId === car.id ? null : car.id)}
                    type="button"
                  >
                    <span className="truncate">Manage</span>
                  </button>
                  {openMenuId === car.id && (
                    <div className="absolute left-0 top-10 sm:top-10 z-10 bg-white border rounded shadow-lg min-w-[140px] sm:min-w-[180px]">
                      <Link
                        href={`/cars/${car.id}`}
                        className="block w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-100 text-black text-xs sm:text-sm"
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/admin/cars/${car.id}/edit`}
                        className="block w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-100 text-black text-xs sm:text-sm"
                      >
                        Edit Car
                      </Link>
                      <button 
                        onClick={() => {
                          setSelectedCarForAvailability(car);
                          setOpenMenuId(null);
                        }}
                        className="block w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-100 text-black text-xs sm:text-sm"
                      >
                        Update Availability
                      </button>
                      <Link
                        href={`/admin/cars/${car.id}/history`}
                        className="block w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-100 text-black text-xs sm:text-sm"
                        onClick={() => setOpenMenuId(null)}
                      >
                        View History
                      </Link>
                    </div>
                  )}
                </div>
                
                {/* Remove button - responsive */}
                <button
                  className="flex-1 flex items-center justify-center gap-1 px-2 sm:px-3 py-2 sm:py-1.5 bg-red-600 text-white rounded hover:bg-red-700 font-semibold cursor-pointer text-xs sm:text-sm min-w-0"
                  onClick={() => handleDelete(car.id)}
                >
                  <span className="truncate">Remove</span>
                </button>
              </>
            ) : (
              // View details for rented cars - responsive
              <Link
                href={`/cars/${car.id}`}
                className="w-full flex items-center justify-center gap-1 px-2 sm:px-3 py-2 sm:py-1.5 border rounded bg-white text-black font-semibold hover:bg-gray-100 cursor-pointer text-xs sm:text-sm min-w-0"
              >
                <span className="truncate">View Details</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Filtragem dos carros conforme o filtro selecionado
  const filteredCars = cars.filter(car => {
    if (carFilter === 'all') return true;
    if (carFilter === 'active') return car.availability === 'available';
    return true;
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      {selectedCarForAvailability && (
        <UpdateAvailabilityModal
          carId={selectedCarForAvailability.id}
          currentAvailability={selectedCarForAvailability.availability}
          onClose={() => setSelectedCarForAvailability(null)}
          onUpdate={handleUpdateAvailability}
        />
      )}

      {/* Header with tabs and actions - responsive */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('my-cars')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-bold text-sm sm:text-base cursor-pointer ${
              activeTab === 'my-cars'
                ? 'bg-[#EA580C] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            My Cars
          </button>
          <button
            onClick={() => setActiveTab('rented-cars')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-bold text-sm sm:text-base cursor-pointer ${
              activeTab === 'rented-cars'
                ? 'bg-[#EA580C] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Rental Cars
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-bold text-sm sm:text-base cursor-pointer transition ${
              activeTab === 'notifications'
                ? 'bg-[#EA580C] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Notifications
          </button>
        </div>
        
        {/* Register button - responsive */}
        <div className="flex gap-2 sm:gap-4 items-center w-full sm:w-auto">
          <Link
            href="/admin/cars/new"
            className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg font-bold bg-[#EA580C] text-white hover:bg-[#D45207] text-center text-sm sm:text-base"
          >
            <span className="hidden sm:inline">Register New Car</span>
            <span className="sm:hidden">+ New Car</span>
          </Link>
        </div>
      </div>

      {/* Notifications Panel as a tab */}
      {activeTab === 'notifications' && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 border rounded-lg bg-white">
          <h2 className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4">Notifications</h2>
          <NotificationList />
        </div>
      )}

      {/* My Cars header section - responsive */}
      {activeTab === 'my-cars' && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mt-2 mb-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold text-black">My Cars</h1>
            <p className="text-[#676773] text-sm sm:text-base">Manage your registered cars</p>
          </div>
          <div className="w-full sm:w-auto">
            <select
              className="w-full sm:w-auto border rounded px-3 sm:px-4 py-2 text-black bg-white text-sm sm:text-base"
              value={carFilter}
              onChange={e => setCarFilter(e.target.value as 'all' | 'active')}
            >
              <option value="all">All Cars</option>
              <option value="active">Active Cars</option>
            </select>
          </div>
        </div>
      )}

      {/* Cards rendering - responsive grid */}
      {activeTab === 'my-cars' ? (
        <>
          {filteredCars.length === 0 ? (
            <div className="text-center py-8 sm:py-10">
              <p className="text-[#676773] mb-4 text-sm sm:text-base">
                You haven&apos;t registered any cars yet.
              </p>
              <Link
                href="/admin/cars/new"
                className="text-[#EA580C] hover:underline text-sm sm:text-base"
              >
                Click here to register your first car
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredCars.map(car => (
                <React.Fragment key={car.id}>
                  {renderCarCard(car)}
                </React.Fragment>
              ))}
            </div>
          )}
        </>
      ) : activeTab === 'rented-cars' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {rentedCars.map(car => (
            <React.Fragment key={`${car.id}-${car.rentalId || ''}`}>
              {renderCarCard(car)}
            </React.Fragment>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function AdminCarsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminCarsPageContent />
    </Suspense>
  );
}
