"use client";

import { useState } from "react";
import { CarFilters } from "@/app/cars/page";

interface SearchFiltersProps {
  onFilterChange: (filters: CarFilters) => void;
}

export default function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const [filters, setFilters] = useState<CarFilters>({});

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value === "" ? undefined : value
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <div className="w-full p-6 bg-white border-b border-[#D4D4D4]">
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="text-black block text-sm font-medium mb-1">Marca</label>
          <input
            type="text"
            name="brand"
            value={filters.brand || ""}
            onChange={handleChange}
            className="text-black p-2 border rounded"
            placeholder="Digite a marca"
          />
        </div>

        <div>
          <label className="text-black block text-sm font-medium mb-1">Transmissão</label>
          <select
            name="transmission"
            value={filters.transmission || ""}
            onChange={handleChange}
            className="text-black p-2 border rounded"
          >
            <option value="">Todos</option>
            <option value="automatic">Automático</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        <div>
          <label className="text-black block text-sm font-medium mb-1">Combustível</label>
          <select
            name="fuel"
            value={filters.fuel || ""}
            onChange={handleChange}
            className="text-black p-2 border rounded"
          >
            <option value="">Todos</option>
            <option value="gasoline">Gasolina</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Elétrico</option>
            <option value="hybrid">Híbrido</option>
          </select>
        </div>

        <div>
          <label className="text-black block text-sm font-medium mb-1">Preço por dia</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice || ""}
              onChange={handleChange}
              className="text-black p-2 border rounded w-24"
              placeholder="Min"
            />
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice || ""}
              onChange={handleChange}
              className="text-black p-2 border rounded w-24"
              placeholder="Max"
            />
          </div>
        </div>

        <div>
          <label className="text-black block text-sm font-medium mb-1">Ano</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="minYear"
              value={filters.minYear || ""}
              onChange={handleChange}
              className="text-black p-2 border rounded w-24"
              placeholder="Min"
            />
            <input
              type="number"
              name="maxYear"
              value={filters.maxYear || ""}
              onChange={handleChange}
              className="text-black p-2 border rounded w-24"
              placeholder="Max"
            />
          </div>
        </div>

        <div>
          <label className="text-black block text-sm font-medium mb-1">Assentos</label>
          <input
            type="number"
            name="seats"
            value={filters.seats || ""}
            onChange={handleChange}
            className="text-black p-2 border rounded w-24"
            placeholder="Nº assentos"
          />
        </div>

        <div>
          <label className="text-black block text-sm font-medium mb-1">Cidade</label>
          <input
            type="text"
            name="city"
            value={filters.city || ""}
            onChange={handleChange}
            className="text-black p-2 border rounded"
            placeholder="Digite a cidade"
          />
        </div>

        <div>
          <label className="text-black block text-sm font-medium mb-1">Estado</label>
          <input
            type="text"
            name="state"
            value={filters.state || ""}
            onChange={handleChange}
            className="text-black p-2 border rounded"
            placeholder="Digite o estado"
          />
        </div>

        <div>
          <label className="text-black block text-sm font-medium mb-1">Disponibilidade</label>
          <select
            name="availability"
            value={filters.availability || ""}
            onChange={handleChange}
            className="text-black p-2 border rounded"
          >
            <option value="">Todos</option>
            <option value="available">Disponível</option>
            <option value="rented">Alugado</option>
            <option value="maintenance">Em manutenção</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
          >
            Limpar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}
