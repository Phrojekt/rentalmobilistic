"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cartService } from "@/services/cartService";
import { carService } from "@/services/carService";
import type { Car } from "@/services/carService";

interface BookingModalProps {
  car: Car;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete?: () => void;
}

export default function BookingModal({ car, isOpen, onClose, onBookingComplete }: BookingModalProps) {
  const { user } = useAuth();  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const calculateTotalPrice = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const rentalPrice = car.pricePerDay * days;
    const serviceFee = rentalPrice * 0.1; // 10% service fee
    return rentalPrice + serviceFee;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Por favor, faça login para continuar");
      return;
    }

    if (!startDate || !endDate) {
      setError("Por favor, selecione as datas de retirada e devolução");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      setError("A data de devolução deve ser posterior à data de retirada");
      return;
    }

    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days < car.minRentalPeriod) {
      setError(`O período mínimo de aluguel é de ${car.minRentalPeriod} dias`);
      return;
    }

    if (days > car.maxRentalPeriod) {
      setError(`O período máximo de aluguel é de ${car.maxRentalPeriod} dias`);
      return;
    }

    setLoading(true);
    setError("");

    try {      const totalPrice = calculateTotalPrice();
      
      // Adiciona ao carrinho e imediatamente confirma a reserva
      const cartItem = await cartService.addToCart(user.uid, car.id, start, end, totalPrice);
      await cartService.updateCartItem(cartItem.id, { status: 'confirmed' });
      await cartService.confirmCartItems(user.uid);
        // Atualiza o status do carro para 'rented'
      await carService.updateCarAvailability(car.id, 'rented');
        setSuccess(true);
      
      // Aguarda 2 segundos antes de chamar o callback
      setTimeout(() => {
        onClose();
        if (onBookingComplete) {
          onBookingComplete();
        }
      }, 2000);
    } catch (err) {
      setError("Erro ao processar a reserva. Tente novamente.");
      console.error("Erro ao processar reserva:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">Reservar {car.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
              Reserva confirmada com sucesso! Redirecionando...
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Retirada
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="text-black w-full rounded border border-gray-300 p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Devolução
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split("T")[0]}
              className="text-black w-full rounded border border-gray-300 p-2"
              required
            />
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Valor da diária:</span>
              <span className="text-black font-medium">R$ {car.pricePerDay.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Taxa de serviço (10%):</span>
              <span className="text-black font-medium">R$ {(calculateTotalPrice() * 0.1).toLocaleString('pt-BR')}</span>
            </div>
            <div className="text-black flex justify-between font-bold">
              <span>Total:</span>
              <span>R$ {calculateTotalPrice().toLocaleString('pt-BR')}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-12 rounded font-bold text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#EA580C] hover:bg-[#D45207]"
            }`}
          >
            {loading ? "Processando..." : "Confirmar Reserva"}
          </button>
        </form>
      </div>
    </div>
  );
}
