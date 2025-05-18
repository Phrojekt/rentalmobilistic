"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { carService } from "@/services/carService";
import { cartService } from "@/services/cartService";
import type { Car } from "@/services/carService";
import Link from "next/link";
import Image from "next/image";

// Tipos para as tabs
type TabType = 'my-cars' | 'rented-cars';

export default function AdminCarsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  const [cars, setCars] = useState<Car[]>([]);
  const [rentedCars, setRentedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>(tab as TabType || 'my-cars');
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
  const renderCarCard = (car: Car, isRentedTab: boolean = false) => (
    <div
      key={car.id}
      className="border rounded-lg p-4 hover:border-[#EA580C] transition-colors"
    >
      <div className="relative h-48 mb-4 bg-gray-200 rounded-lg overflow-hidden">
        {car.images[0] && (
          <Image
            src={car.images[0]}
            alt={car.name}
            fill
            className="object-cover"
          />
        )}
      </div>
      <h2 className="text-black font-bold mb-2">{car.name}</h2>
      <p className="text-[#676773] mb-2">
        {car.location.city}, {car.location.state}
      </p>      <div className="flex flex-col gap-2">
        <p className="text-[#EA580C] font-bold">
          R$ {car.pricePerDay.toLocaleString('pt-BR')}/day
        </p>
        {car.availability === 'rented' && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full text-center">
              Alugado
            </span>
            {isRentedTab && car.rentalInfo && (
              <>
                <span className="text-xs text-gray-600">
                  Início: {new Date(car.rentalInfo.startDate).toLocaleDateString('pt-BR')}
                </span>
                <span className="text-xs text-gray-600">
                  Devolução: {new Date(car.rentalInfo.endDate).toLocaleDateString('pt-BR')}
                </span>
                <span className="text-xs font-semibold text-green-600">
                  Total: R$ {car.rentalInfo.totalPrice.toLocaleString('pt-BR')}
                </span>
              </>
            )}
          </div>
        )}
        {car.availability === 'maintenance' && (
          <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-center">
            Em Manutenção
          </span>
        )}
      </div>
      <div className="flex justify-between items-center mt-4">
        {isRentedTab ? (
          <Link
            href={`/cars/${car.id}`}
            className="text-blue-600 hover:underline w-full text-center"
          >
            Ver Detalhes
          </Link>
        ) : (
          <>
            <Link
              href={`/admin/cars/${car.id}/edit`}
              className="text-blue-600 hover:underline"
            >
              Editar
            </Link>
            <button
              onClick={() => handleDelete(car.id)}
              className="text-red-600 hover:underline"
            >
              Excluir
            </button>
          </>
        )}
      </div>
    </div>
  );

  // Renderiza o conteúdo da tab ativa
  const renderTabContent = () => {
    const items = activeTab === 'my-cars' ? cars : rentedCars;
    const isRentedTab = activeTab === 'rented-cars';

    if (items.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-[#676773] mb-4">
            {isRentedTab
              ? 'Você ainda não alugou nenhum carro.'
              : 'Você ainda não cadastrou nenhum carro.'}
          </p>
          <Link
            href={isRentedTab ? '/cars' : '/admin/cars/new'}
            className="text-[#EA580C] hover:underline"
          >
            {isRentedTab
              ? 'Clique aqui para explorar carros disponíveis'
              : 'Clique aqui para cadastrar seu primeiro carro'}
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(car => renderCarCard(car, isRentedTab))}
      </div>
    );
  };

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
          {activeTab === 'my-cars' && (
            <Link
              href="/admin/cars/new"
              className="bg-[#EA580C] text-white px-4 py-2 rounded-lg hover:bg-[#D45207] transition-colors"
            >
              Adicionar Novo Carro
            </Link>
          )}
        </div>
        
        {renderTabContent()}
      </div>
    </div>
  );
}