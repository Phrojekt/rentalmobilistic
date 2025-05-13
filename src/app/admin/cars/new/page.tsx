"use client";

import { useRouter } from "next/navigation";
import CarForm from "@/components/CarForm";
import { carService } from "@/services/carService";
import type { Car } from "@/services/carService";

export default function NewCarPage() {
  const router = useRouter();

  const handleSubmit = async (data: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>) => {
    await carService.addCar(data);
    router.push("/admin/cars");
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-black text-2xl font-bold mb-6">Adicionar Novo Carro</h1>
      <CarForm onSubmit={handleSubmit} />
    </div>
  );
}