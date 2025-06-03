"use client";

import { useRouter } from "next/navigation";
import CarForm from "@/components/CarForm";
import { carService } from "@/services/carService";
import type { Car } from "@/services/carService";
import { useState } from "react";

export default function NewCarPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setError("");
      const newCar = await carService.addCar(data);
      if (newCar) {
        router.push("/admin/cars");
      } else {
        throw new Error("Failed to register car. Please try again.");
      }
    } catch (err) {
      console.error("Error adding car:", err);
      setError(err instanceof Error ? err.message : "Failed to register car. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <CarForm onSubmit={handleSubmit} />
    </div>
  );
}