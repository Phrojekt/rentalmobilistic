"use client";

import { useState } from "react";
import { Car } from "@/services/carService";
import { useAuth } from "@/hooks/useAuth";

interface CarFeature {
  id: string;
  label: string;
}

const CAR_FEATURES: CarFeature[] = [
  { id: "airConditioning", label: "Air conditioning" },
  { id: "powerSteering", label: "Power steering" },
  { id: "powerWindows", label: "Power windows" },
  { id: "powerLocks", label: "Power locks" },
  { id: "multimediaCenter", label: "Multimedia center" },
  { id: "backupCamera", label: "Backup camera" },
  { id: "parkingSensors", label: "Parking sensors" },
  { id: "airbags", label: "Airbags" },
  { id: "absBrakes", label: "ABS brakes" },
  { id: "cruiseControl", label: "Cruise control" },
  { id: "leatherSeats", label: "Leather seats" },
  { id: "sunroof", label: "Sunroof" },
  { id: "bluetooth", label: "Bluetooth" },
  { id: "gpsNavigation", label: "GPS Navigation" },
  { id: "usbPorts", label: "USB Ports" },
  { id: "heatedSeats", label: "Heated Seats" },
  { id: "childSeatCompatibility", label: "Child Seat Compatibility" },
  { id: "appleCarPlay", label: "Apple CarPlay" },
  { id: "androidAuto", label: "Android Auto" },
  { id: "wifiHotspot", label: "Wi-Fi Hotspot" }
];

interface CarFormProps {
  initialData?: Partial<Car>;
  onSubmit: (data: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export default function CarForm({ initialData, onSubmit }: CarFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Omit<Car, 'id' | 'createdAt' | 'updatedAt'>>({
    name: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    price: 0,
    pricePerDay: 0,
    mileage: 0,
    transmission: "automatic",
    fuel: "gasoline",
    seats: 5,
    description: "",
    features: [""],
    images: [""],
    location: {
      city: "",
      state: "",
      country: "Brasil"
    },
    availability: "available",
    availabilitySchedule: "always",
    instantBooking: false,
    minRentalPeriod: 1,
    maxRentalPeriod: 30,
    securityDeposit: 0,
    deliveryOptions: "pickup",
    ownerId: "",
    ...initialData
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(
    new Set(initialData?.features || [])
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, string>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayChange = (index: number, value: string, field: 'features' | 'images') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'features' | 'images') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ""]
    }));
  };

  const removeArrayItem = (index: number, field: 'features' | 'images') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures(prev => {
      const newFeatures = new Set(prev);
      if (newFeatures.has(featureId)) {
        newFeatures.delete(featureId);
      } else {
        newFeatures.add(featureId);
      }
      return newFeatures;
    });

    // Update formData with new features
    setFormData(prev => ({
      ...prev,
      features: Array.from(selectedFeatures)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit({
        ...formData,
        features: Array.from(selectedFeatures), // Use selected features from checkboxes
        ownerId: user?.uid || "",
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar o carro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-black block text-sm font-medium">Nome do Carro</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="text-black mt-1 block w-full rounded border border-gray-300 p-2"
            required
          />
        </div>

        <div>
          <label className="text-black block text-sm font-medium">Marca</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="text-black mt-1 block w-full rounded border border-gray-300 p-2"
            required
          />
        </div>

        <div>
          <label className="text-black block text-sm font-medium">Modelo</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="text-black mt-1 block w-full rounded border border-gray-300 p-2"
            required
          />
        </div>

        <div>
          <label className="text-black block text-sm font-medium">Ano</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="text-black mt-1 block w-full rounded border border-gray-300 p-2"
            required
          />
        </div>

        <div>
          <label className="text-black block text-sm font-medium">Preço do Carro</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="text-black mt-1 block w-full rounded border border-gray-300 p-2"
            required
          />
        </div>

        <div>
          <label className="text-black block text-sm font-medium">Preço por Dia</label>
          <input
            type="number"
            name="pricePerDay"
            value={formData.pricePerDay}
            onChange={handleChange}
            className="text-black mt-1 block w-full rounded border border-gray-300 p-2"
            required
          />
        </div>

        <div>
          <label className="text-black block text-sm font-medium">Quilometragem</label>
          <input
            type="number"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            className="text-black mt-1 block w-full rounded border border-gray-300 p-2"
            required
          />
        </div>

        <div>
          <label className="text-black block text-sm font-medium">Transmissão</label>
          <select
            name="transmission"
            value={formData.transmission}
            onChange={handleChange}
            className="text-black mt-1 block w-full rounded border border-gray-300 p-2"
            required
          >
            <option value="automatic">Automático</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        <div>
          <label className="text-black block text-sm font-medium">Combustível</label>
          <select
            name="fuel"
            value={formData.fuel}
            onChange={handleChange}
            className="text-black mt-1 block w-full rounded border border-gray-300 p-2"
            required
          >
            <option value="gasoline">Gasolina</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Elétrico</option>
            <option value="hybrid">Híbrido</option>
          </select>
        </div>

        <div>
          <label className="text-black block text-sm font-medium">Número de Assentos</label>
          <input
            type="number"
            name="seats"
            value={formData.seats}
            onChange={handleChange}
            className="text-black mt-1 block w-full rounded border border-gray-300 p-2"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-black block text-sm font-medium">Descrição</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="text-black mt-1 block w-full rounded border border-gray-300 p-2"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="text-black block text-sm font-medium">URLs das Imagens</label>
        {formData.images.map((image, index) => (
          <div key={index} className="flex gap-2 mt-2">
            <input
              type="url"
              value={image}
              onChange={(e) => handleArrayChange(index, e.target.value, 'images')}
              className="text-black flex-1 rounded border border-gray-300 p-2"
            />
            <button
              type="button"
              onClick={() => removeArrayItem(index, 'images')}
              className="px-2 py-1 text-red-600"
            >
              Remover
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('images')}
          className="mt-2 text-blue-600"
        >
          + Adicionar Imagem
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-black block text-sm font-medium">Cidade</label>
          <input
            type="text"
            name="location.city"
            value={formData.location.city}
            onChange={handleChange}
            className="text-black mt-1 block w-full rounded border border-gray-300 p-2"
            required
          />
        </div>

        <div>
          <label className="text-black block text-sm font-medium">Estado</label>
          <input
            type="text"
            name="location.state"
            value={formData.location.state}
            onChange={handleChange}
            className="text-black mt-1 block w-full rounded border border-gray-300 p-2"
            required
          />
        </div>

        <div>
          <label className="text-black block text-sm font-medium">Disponibilidade</label>
          <select
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            className="text-black mt-1 block w-full rounded border border-gray-300 p-2"
            required
          >
            <option value="available">Disponível</option>
            <option value="rented">Alugado</option>
            <option value="maintenance">Em Manutenção</option>
          </select>
        </div>
      </div>

      <div className="border rounded-lg p-6 space-y-6">
        <h2 className="text-black text-xl font-bold mb-4">Disponibilidade e Termos de Aluguel</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-black block text-sm font-medium mb-2">Quando o carro está disponível para aluguel?</label>
            <div className="space-y-2">
              <div>
                <input
                  type="radio"
                  id="always"
                  name="availabilitySchedule"
                  value="always"
                  checked={formData.availabilitySchedule === "always"}
                  onChange={handleChange}
                  className=" mr-2"
                />
                <label htmlFor="always" className="text-black">Sempre disponível</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="weekdays"
                  name="availabilitySchedule"
                  value="weekdays"
                  checked={formData.availabilitySchedule === "weekdays"}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="weekdays"className="text-black">Apenas dias úteis</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="weekends"
                  name="availabilitySchedule"
                  value="weekends"
                  checked={formData.availabilitySchedule === "weekends"}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="weekends"className="text-black">Apenas fins de semana</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="custom"
                  name="availabilitySchedule"
                  value="custom"
                  checked={formData.availabilitySchedule === "custom"}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="custom"className="text-black">Agenda personalizada (você definirá isso depois)</label>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 py-4 border-t border-b">
            <label htmlFor="instantBooking" className="text-black flex-grow text-sm font-medium">
              Reserva Instantânea
              <p className="text-gray-500 text-xs font-normal">Permitir que locatários reservem seu carro instantaneamente sem necessidade de aprovação.</p>
            </label>
            <div className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                id="instantBooking"
                name="instantBooking"
                checked={formData.instantBooking}
                onChange={(e) => setFormData(prev => ({ ...prev, instantBooking: e.target.checked }))}
                className="sr-only"
              />
              <div className={`block w-12 h-6 rounded-full transition-colors ${formData.instantBooking ? 'bg-[#EA580C]' : 'bg-gray-300'}`}>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.instantBooking ? 'transform translate-x-6' : ''}`}></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-black block text-sm font-medium">Período mínimo de aluguel (dias)</label>
              <input
                type="number"
                name="minRentalPeriod"
                value={formData.minRentalPeriod}
                onChange={handleChange}
                min="1"
                className="text-black mt-1 block w-full rounded border border-gray-300 p-2"
              />
            </div>
            <div>
              <label className="text-black block text-sm font-medium">Período máximo de aluguel (dias)</label>
              <input
                type="number"
                name="maxRentalPeriod"
                value={formData.maxRentalPeriod}
                onChange={handleChange}
                min={formData.minRentalPeriod}
                className="text-black mt-1 block w-full rounded border border-gray-300 p-2"
              />
            </div>
          </div>

          <div>
            <label className="text-black block text-sm font-medium">Valor do depósito de segurança (R$)</label>
            <input
              type="number"
              name="securityDeposit"
              value={formData.securityDeposit}
              onChange={handleChange}
              min="0"
              className="text-black mt-1 block w-full rounded border border-gray-300 p-2"
            />
          </div>

          <div>
            <label className="text-black block text-sm font-medium mb-2">Opções de Entrega</label>
            <div className="space-y-2">
              <div>
                <input
                  type="radio"
                  id="pickup"
                  name="deliveryOptions"
                  value="pickup"
                  checked={formData.deliveryOptions === "pickup"}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="pickup" className="text-black">Apenas retirada (locatários vêm até você)</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="delivery"
                  name="deliveryOptions"
                  value="delivery"
                  checked={formData.deliveryOptions === "delivery"}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="delivery" className="text-black">Apenas entrega (você leva até os locatários)</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="both"
                  name="deliveryOptions"
                  value="both"
                  checked={formData.deliveryOptions === "both"}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="both" className="text-black">Ambas as opções disponíveis</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Car Features Section */}
      <div className="border rounded-lg p-6">
        <h2 className="text-black text-xl font-bold mb-4">Car Features</h2>
        <p className="text-gray-600 mb-4">Select all the features that your car has. This helps renters find the right car for their needs.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {CAR_FEATURES.map(feature => (
            <div key={feature.id} className="flex items-start space-x-2">
              <input
                type="checkbox"
                id={feature.id}
                checked={selectedFeatures.has(feature.id)}
                onChange={() => handleFeatureToggle(feature.id)}
                className="mt-1"
              />
              <label htmlFor={feature.id} className="text-sm text-gray-700">
                {feature.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#EA580C] text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}