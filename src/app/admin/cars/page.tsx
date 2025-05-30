"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { carService } from "@/services/carService";
import { cartService } from "@/services/cartService";
import type { Car } from "@/services/carService";
import Link from "next/link";
import Image from "next/image";

// Tipos para as tabs
type TabType = 'my-cars' | 'rented-cars';

function AdminCarsPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  const [cars, setCars] = useState<Car[]>([]);
  const [rentedCars, setRentedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>(tab as TabType || 'my-cars');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [carFilter, setCarFilter] = useState<'all' | 'active' | 'pending'>('all');

  useEffect(() => {
    async function loadUserCars() {
      if (authLoading) return; // Aguarda o carregamento da autenticação

      if (!user) {
        router.replace("/login"); // Usa replace ao invés de push para evitar voltar ao dashboard
        return;
      }

      try {
        setLoading(true);
        // Carregar carros que o usuário cadastrou
        const userCars = await carService.getCarsByOwner(user.uid);
        setCars(userCars);        // Carregar carros que o usuário alugou através do cartService
        const userRentals = await cartService.getConfirmedRentals(user.uid);
          // Mapear os carros com suas informações de aluguel
        const rentedCarDetails = await Promise.all(
          userRentals.map(async rental => {
            const car = await carService.getCarById(rental.carId);
            if (car) {
              return {
                ...car,
                rentalInfo: {
                  startDate: rental.startDate,
                  endDate: rental.endDate,
                  totalPrice: rental.totalPrice
                }
              } as Car; // Garantir que o tipo está correto
            }
            return null;
          })
        );
        // Filtragem com type guard explícito
        const validRentedCars = rentedCarDetails.filter(
          (car): car is NonNullable<typeof car> => car !== null
        );
        setRentedCars(validRentedCars);
      } catch (error) {
        console.error("Erro ao carregar carros:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUserCars();
  }, [user, authLoading, router]);

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

  // Se não está carregando e não tem usuário, não renderiza nada (redirecionamento já foi feito)
  if (!user) return null;

  // Renderiza um carro individual
  const renderCarCard = (car: Car) => {
    // Simulação de dados para demo

    // Booking Rate: dias alugados / dias totais do mês (exemplo)
    let bookingRate = 0;
    if (car.rentalInfo) {
      const start = new Date(car.rentalInfo.startDate);
      const end = new Date(car.rentalInfo.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      bookingRate = Math.min(100, Math.round((days / 30) * 100));
    }

    return (
      <div
        key={car.id}
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
          </div>
          {/* Ações */}
          <div className="flex items-center justify-between gap-8 mt-auto">
            {/* Dropdown de ações */}
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
                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-black">Update Availability</button>
                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-black">View Rental History</button>
                </div>
              )}
            </div>
            {/* Botão remover direto */}
            <button
              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 font-semibold cursor-pointer"
              onClick={() => handleDelete(car.id)}
            >
              <span className="material-icons text-[18px] text-white">Remove</span>
            </button>
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

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
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
          </div>
        </div>

        {/* Bloco de título, subtítulo e dropdown apenas para My Cars */}
        {activeTab === 'my-cars' && (
          <div className="flex justify-between items-center mt-2 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-black">My Cars</h1>
              <p className="text-[#676773] text-base">Manage your registered cars</p>
            </div>
            <div>
              <select
                className="border rounded px-4 py-2 text-black bg-white"
                value={carFilter}
                onChange={e => setCarFilter(e.target.value as 'all' | 'active' | 'pending')}
              >
                <option value="all">All Cars</option>
                <option value="active">Active Cars</option>
                <option value="pending">Pending Approval</option>
              </select>
            </div>
          </div>
        )}

        {/* Cards rendering with applied filter */}
        {activeTab === 'my-cars'
          ? (
            <>
              {filteredCars.length === 0
                ? (
                  <div className="text-center py-10">
                    <p className="text-[#676773] mb-4">
                      You have not registered any cars yet.
                    </p>
                    <Link
                      href="/admin/cars/new"
                      className="text-[#EA580C] hover:underline"
                    >
                      Click here to register your first car
                    </Link>
                  </div>
                )
                : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCars.map(car => renderCarCard(car))}
                  </div>
                )
              }
            </>
          )
          : renderTabContent()
        }
      </div>
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