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
      <CarForm onSubmit={handleSubmit} />
    </div>
  );
}