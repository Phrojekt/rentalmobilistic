"use client";

import { useEffect, useState, useCallback } from "react";
import { carService } from "@/services/carService";
import CarCard from "./CarCard";
import type { Car } from "@/services/carService";
import type { CarFilters } from "@/app/cars/page";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

interface CarGridProps {
  filters?: CarFilters;
}

export default function CarGrid({ filters }: CarGridProps) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  const loadCars = useCallback(async (isLoadingMore = false) => {
    try {
      setLoading(true);
      const result = await carService.getCars({
        limit: 12,
        availability: "available",
        ...(isLoadingMore && lastDoc ? { startAfter: lastDoc } : {}),
        ...filters,
      });

      if (isLoadingMore) {
        setCars(prev => [...prev, ...result.cars]);
      } else {
        setCars(result.cars);
      }

      setLastDoc(result.lastDoc || undefined);
      setHasMore(result.cars.length === 12);
    } catch (error) {
      console.error("Error loading cars:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, lastDoc]);

  useEffect(() => {
    // Reset pagination when filters change
    setLastDoc(undefined);
    loadCars();
  }, [filters, loadCars]);

  const loadMore = () => {
    if (!loading && hasMore) {
      loadCars(true);
    }
  };

  if (loading && !cars.length) {
    return (
      <div className="flex justify-center items-center w-full h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#EA580C]"></div>
      </div>
    );
  }

  if (!loading && !cars.length) {
    return (
      <div className="flex justify-center items-center w-full h-64">
        <span className="font-bold text-black text-lg text-center w-full">
          No cars found.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-6 py-8">
      <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} href={`/cars/${car.id}`} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            disabled={loading}
            className={`
              px-6 py-2 rounded-lg text-white font-semibold
              ${loading ? 'bg-[#EA580C]/70' : 'bg-[#EA580C] hover:bg-[#EA580C]/90'}
            `}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Loading...
              </div>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
