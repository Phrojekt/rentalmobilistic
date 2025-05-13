"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import CarForm from "@/components/CarForm";
import { carService } from "@/services/carService";
import type { Car } from "@/services/carService";

export default function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCar = useCallback(async () => {
    try {
      const carData = await carService.getCarById(unwrappedParams.id);
      setCar(carData);
    } catch (error) {
      console.error("Erro ao carregar carro:", error);
    } finally {
      setLoading(false);
    }
  }, [unwrappedParams.id]);

  useEffect(() => {
    loadCar();
  }, [loadCar]);

  const handleSubmit = async (data: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await carService.updateCar(unwrappedParams.id, data);
      router.push('/admin/cars');
    } catch (error) {
      console.error('Erro ao atualizar carro:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Carro não encontrado</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-black text-2xl font-bold mb-6">Editar Carro</h1>
      <CarForm initialData={car} onSubmit={handleSubmit} />
    </div>
  );
}