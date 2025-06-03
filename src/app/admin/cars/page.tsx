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
import NotificationButton from "@/components/NotificationButton";

// Tipos para as tabs
type TabType = 'my-cars' | 'rented-cars';

function AdminCarsPageContent() {  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams?.get("tab") as TabType | null;

  const [cars, setCars] = useState<Car[]>([]);
  const [rentedCars, setRentedCars] = useState<Car[]>([]);  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>(tab && (tab === 'my-cars' || tab === 'rented-cars') ? tab : 'my-cars');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);const [carFilter, setCarFilter] = useState<'all' | 'active'>('all');
  const [selectedCarForAvailability, setSelectedCarForAvailability] = useState<Car | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

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
          <div className="text-[#676773]">Carregando...</div>
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
        className="border rounded-lg p-0 bg-white shadow-sm flex flex-col w-full max-w-[320px] ml-0"
      >
        {/* Banner */}
        <div className="relative h-40 bg-gray-100 rounded-t-lg overflow-hidden flex items-center justify-center">
          {car.images?.[0] ? (
            <Image
              src={car.images[0]}
              alt={car.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
          {/* Owner Profile Picture Overlay - only shown in my-cars tab */}
          {activeTab === 'my-cars' && (
            <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/50 rounded-full p-1 pr-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                {car.ownerProfilePicture ? (
                  <Image
                    src={car.ownerProfilePicture}
                    alt="Owner"
                    width={32}
                    height={32}
                    className="object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-[#EA580C] flex items-center justify-center text-white text-sm">
                    {car.ownerName?.charAt(0)?.toUpperCase() || "O"}
                  </div>
                )}
              </div>
              <span className="text-white text-sm font-medium">{car.ownerName || 'Owner'}</span>
            </div>
          )}
        </div>
        {/* Conteúdo */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Nome e localização */}
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-black font-bold text-lg">{car.name}</h2>
            {/* Disponibilidade */}
            {car.availability === "available" && (
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">Active</span>
            )}
            {car.availability === "rented" && (
              <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-full">Alugado</span>
            )}
            {car.availability === "maintenance" && (
              <span className="bg-yellow-50 text-yellow-600 text-xs font-bold px-2 py-1 rounded-full">Manutenção</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[#676773] text-sm mb-3">
            <Image src="/gps_icon.png" alt="Location Icon" width={16} height={16} />
            <span>{car.location.city}, {car.location.state}</span>
          </div>
          {/* Booking Rate */}
          <div className="flex items-center justify-between text-xs text-[#676773] mb-1">
            <span>Booking rate</span>
            <span>{bookingRate}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded mb-4">
            <div
              className="h-2 bg-[#EA580C] rounded"
              style={{ width: `${bookingRate}%` }}
            />
          </div>          {/* Ações */}
          <div className="flex items-center justify-between gap-8 mt-auto">
            {activeTab === 'my-cars' ? (
              <>
                {/* Dropdown de ações - só aparece para carros que o usuário é dono */}
                <div className="relative">
                  <button
                    className="flex items-center gap-1 px-3 py-1 border rounded bg-white text-black font-semibold hover:bg-gray-100 cursor-pointer"
                    onClick={() => setOpenMenuId(openMenuId === car.id ? null : car.id)}
                    type="button"
                  >
                    <span className="material-icons" style={{ fontSize: 18 }}>Manage</span>
                  </button>
                  {openMenuId === car.id && (
                    <div className="absolute left-0 top-10 z-10 bg-white border rounded shadow-lg min-w-[180px]">
                      <Link
                        href={`/cars/${car.id}`}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-black"
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/admin/cars/${car.id}/edit`}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-black"
                      >
                        Edit Car
                      </Link>
                      <button 
                        onClick={() => {
                          setSelectedCarForAvailability(car);
                          setOpenMenuId(null);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-black"
                      >
                        Update Availability
                      </button>
                      <Link
                        href={`/admin/cars/${car.id}/history`}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-black"
                        onClick={() => setOpenMenuId(null)}
                      >
                        View Rental History
                      </Link>
                    </div>
                  )}
                </div>
                {/* Botão remover direto - só aparece para carros que o usuário é dono */}
                <button
                  className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 font-semibold cursor-pointer"
                  onClick={() => handleDelete(car.id)}
                >
                  <span className="material-icons text-[18px] text-white">Remove</span>
                </button>
              </>
            ) : (
              // Para carros alugados, mostrar apenas um botão para ver detalhes
              <Link
                href={`/cars/${car.id}`}
                className="flex items-center gap-1 px-3 py-1 border rounded bg-white text-black font-semibold hover:bg-gray-100 cursor-pointer"
              >
                <span>View Details</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Renderiza o conteúdo da tab ativa
  const renderTabContent = () => {
    const items = activeTab === 'my-cars' ? cars : rentedCars;

    if (items.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-[#676773] mb-4">
            {activeTab === 'rented-cars'
              ? 'You have not rented any cars yet.'
              : 'You have not registered any cars yet.'}
          </p>
          <Link
            href={activeTab === 'rented-cars' ? '/cars' : '/admin/cars/new'}
            className="text-[#EA580C] hover:underline"
          >
            {activeTab === 'rented-cars'
              ? 'Click here to explore available cars'
              : 'Click here to register your first car'}
          </Link>
        </div>
      );
    }

    return (      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(car => renderCarCard(car))}
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
    <div className="container mx-auto p-6">
      {selectedCarForAvailability && (
        <UpdateAvailabilityModal
          carId={selectedCarForAvailability.id}
          currentAvailability={selectedCarForAvailability.availability}
          onClose={() => setSelectedCarForAvailability(null)}
          onUpdate={handleUpdateAvailability}
        />
      )}

      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('my-cars')}
            className={`px-4 py-2 rounded-lg font-bold ${
              activeTab === 'my-cars'
                ? 'bg-[#EA580C] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            My Cars
          </button>
          <button
            onClick={() => setActiveTab('rented-cars')}
            className={`px-4 py-2 rounded-lg font-bold ${
              activeTab === 'rented-cars'
                ? 'bg-[#EA580C] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Rental Cars
          </button>
          <NotificationButton
            onClick={() => setShowNotifications(!showNotifications)}
            isActive={showNotifications}
          />
        </div>
        <div className="flex gap-4 items-center">
          <Link
            href="/admin/cars/new"
            className="px-4 py-2 rounded-lg font-bold bg-[#EA580C] text-white hover:bg-[#D45207]"
          >
            Register New Car
          </Link>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="mb-6 p-4 border rounded-lg bg-white">
          <h2 className="text-xl font-bold text-black mb-4">Notifications</h2>
          <NotificationList />
        </div>
      )}

      {/* Content section */}
      {activeTab === 'my-cars' && (
        <div className="flex justify-between items-center mt-2 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-black">My Cars</h1>
            <p className="text-[#676773] text-base">Manage ur registered cars</p>
          </div>
          <div>
            <select
              className="border rounded px-4 py-2 text-black bg-white"
              value={carFilter}
              onChange={e => setCarFilter(e.target.value as 'all' | 'active')}
            >
              <option value="all">All cars</option>
              <option value="active">Actived Cars</option>
            </select>
          </div>
        </div>
      )}

      {/* Cards rendering */}
      {activeTab === 'my-cars' ? (
        <>
          {filteredCars.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-[#676773] mb-4">
                Você ainda não registrou nenhum carro.
              </p>
              <Link
                href="/admin/cars/new"
                className="text-[#EA580C] hover:underline"
              >
                Clique aqui para registrar seu primeiro carro
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCars.map(car => renderCarCard(car))}
            </div>
          )}
        </>
      ) : (
        renderTabContent()
      )}
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
