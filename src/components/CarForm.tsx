"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Car } from "@/services/carService";
import { useAuth } from "@/hooks/useAuth";
import { Switch } from "@headlessui/react";

const CAR_FEATURES = [
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

const carFormSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  brand: z.string().min(2, "Marca obrigatória"),
  model: z.string().min(2, "Modelo obrigatório"),
  year: z.coerce.number().min(1900, "Ano inválido"),
  price: z.coerce.number().min(1, "Preço obrigatório"),
  pricePerDay: z.coerce.number().min(1, "Preço por dia obrigatório"),
  mileage: z.coerce.number().min(0, "Quilometragem obrigatória"),
  category: z.string().min(2, "Categoria obrigatória"),
  transmission: z.enum(["automatic", "manual"]),
  fuel: z.enum(["gasoline", "diesel", "electric", "hybrid"]),
  seats: z.coerce.number().min(1, "Assentos obrigatórios"),
  description: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
  images: z.array(z.string().url("URL inválida")).min(1, "Adicione pelo menos uma imagem"),
  locationCity: z.string().min(2, "Cidade obrigatória"),
  availability: z.enum(["available", "rented", "maintenance"]),
  availabilitySchedule: z.enum(["always", "weekdays", "weekends", "custom"]),
  instantBooking: z.boolean(),
  minRentalPeriod: z.coerce.number().min(1, "Período mínimo obrigatório"),
  maxRentalPeriod: z.coerce.number().min(1, "Período máximo obrigatório"),
  securityDeposit: z.coerce.number().min(0, "Depósito obrigatório"),
  deliveryOptions: z.enum(["pickup", "delivery", "both"]),
  features: z.array(z.string()).min(1, "Selecione pelo menos uma característica"),
});

type CarFormType = z.infer<typeof carFormSchema>;

interface CarFormProps {
  initialData?: Partial<Car>;
  onSubmit: (data: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const TABS = [
  { key: "basic-info", label: "Details" },
  { key: "features", label: "Features" },
  { key: "availability", label: "Availability" },
  { key: "photos", label: "Photos" },
  { key: "preview", label: "Preview" },
];

export default function CarForm({ initialData, onSubmit }: CarFormProps) {
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic-info");

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    watch,
  } = useForm<CarFormType>({
    defaultValues: {
      name: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      price: 0,
      pricePerDay: 0,
      mileage: 0,
      category: "",
      transmission: "automatic",
      fuel: "gasoline",
      seats: 5,
      description: "",
      images: [""],
      locationCity: "",
      availability: "available",
      availabilitySchedule: "always",
      instantBooking: false,
      minRentalPeriod: 1,
      maxRentalPeriod: 30,
      securityDeposit: 0,
      deliveryOptions: "pickup",
      features: [],
      ...initialData,
    },
  });

  const images = watch("images");
  const features = watch("features");

  const addImage = () => setValue("images", [...images, ""]);
  const removeImage = (idx: number) =>
    setValue(
      "images",
      images.filter((_img: string, i: number) => i !== idx)
    );
  const updateImage = (idx: number, value: string) =>
    setValue(
      "images",
      images.map((img: string, i: number) => (i === idx ? value : img))
    );

  async function submitHandler(data: CarFormType) {
    setError("");
    setLoading(true);
    try {
      await onSubmit({
        ...data,
        location: {
          city: data.locationCity,
          country: "Brasil",
        },
        ownerId: user?.uid || "",
      } as unknown as Omit<Car, "id" | "createdAt" | "updatedAt">);
    } catch (err: any) {
      setError(err?.message || "Erro ao salvar o carro");
    } finally {
      setLoading(false);
    }
  }

  function nextTab() {
    const idx = TABS.findIndex(t => t.key === activeTab);
    if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].key);
  }
  function prevTab() {
    const idx = TABS.findIndex(t => t.key === activeTab);
    if (idx > 0) setActiveTab(TABS[idx - 1].key);
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl text-black font-bold">Register Your Car For Rental</h1>
        <p className="mt-2 text-gray-600">
          Fill out the details below to list your car on our platform and start earning
        </p>
      </div>
      {/* Container cinza apenas para as abas */}
      <div className="flex justify-center">
        <div className="bg-gray-100 rounded-lg px-2 md:px-6 py-4 mb-0 relative w-full max-w-6xl overflow-x-auto">
          <div className="flex-nowrap flex justify-around md:justify-between gap-2 md:gap-4 relative z-10 min-w-[400px]">
            {TABS.map(tab => (
              <button
                type="button"
                key={tab.key}
                className={
                  `whitespace-nowrap px-6 py-2 font-bold text-black transition-colors
                  ${activeTab === tab.key
                    ? "bg-white text-[#EA580C] shadow z-20"
                    : "bg-transparent text-black border border-transparent"}
                  hover:cursor-pointer`
                }
                style={activeTab === tab.key ? { position: "relative", top: "0px" } : {}}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Formulário fora do container cinza */}
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-6 px-2 md:px-6 pt-6 max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Basic Info */}
        {activeTab === "basic-info" && (
          <div className="space-y-6 border border-black rounded-lg p-6 bg-white">
            <h2 className="text-black text-xl font-bold mb-4">Car Details</h2>
            {/* Brand - Model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-black block text-sm font-medium">Brand</label>
                <input {...register("brand")} className="text-black mt-1 block w-full rounded border border-gray-300 p-2" />
                {errors.brand && <span className="text-red-600 text-xs">{errors.brand.message}</span>}
              </div>
              <div>
                <label className="text-black block text-sm font-medium">Model</label>
                <input {...register("model")} className="text-black mt-1 block w-full rounded border border-gray-300 p-2" />
                {errors.model && <span className="text-red-600 text-xs">{errors.model.message}</span>}
              </div>
            </div>
            {/* Year - Price per Day */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-black block text-sm font-medium">Year</label>
                <input type="number" {...register("year")} className="text-black mt-1 block w-full rounded border border-gray-300 p-2" />
                {errors.year && <span className="text-red-600 text-xs">{errors.year.message}</span>}
              </div>
              <div>
                <label className="text-black block text-sm font-medium">Price per Day</label>
                <input type="number" {...register("pricePerDay")} className="text-black mt-1 block w-full rounded border border-gray-300 p-2" />
                {errors.pricePerDay && <span className="text-red-600 text-xs">{errors.pricePerDay.message}</span>}
              </div>
            </div>
            {/* Location */}
            <div>
              <label className="text-black block text-sm font-medium">Location</label>
              <input
                {...register("locationCity")}
                placeholder="City"
                className="text-black mt-1 block w-full rounded border border-gray-300 p-2"
              />
              {errors.locationCity && (
                <span className="text-red-600 text-xs">
                  {errors.locationCity.message}
                </span>
              )}
            </div>
            {/* Category - Transmission - Fuel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-black block text-sm font-medium">Category</label>
                <select {...register("category")} className="text-black mt-1 block w-full rounded border border-gray-300 p-2">
                  <option value="">Select</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatch">Hatch</option>
                  <option value="Pickup">Pickup</option>
                  <option value="Convertible">Convertible</option>
                  <option value="Coupe">Coupe</option>
                  <option value="Van">Van</option>
                  <option value="Wagon">Wagon</option>
                </select>
                {errors.category && <span className="text-red-600 text-xs">{errors.category.message}</span>}
              </div>
              <div>
                <label className="text-black block text-sm font-medium">Transmission</label>
                <select {...register("transmission")} className="text-black mt-1 block w-full rounded border border-gray-300 p-2">
                  <option value="">Select</option>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
                {errors.transmission && <span className="text-red-600 text-xs">{errors.transmission.message}</span>}
              </div>
              <div>
                <label className="text-black block text-sm font-medium">Fuel</label>
                <select {...register("fuel")} className="text-black mt-1 block w-full rounded border border-gray-300 p-2">
                  <option value="">Select</option>
                  <option value="gasoline">Gasoline</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                {errors.fuel && <span className="text-red-600 text-xs">{errors.fuel.message}</span>}
              </div>
            </div>
            {/* Number of Seats */}
            <div>
              <label className="text-black block text-sm font-medium">Number of Seats</label>
              <input type="number" {...register("seats")} className="text-black mt-1 block w-full rounded border border-gray-300 p-2" />
              {errors.seats && <span className="text-red-600 text-xs">{errors.seats.message}</span>}
            </div>
            {/* Description */}
            <div>
              <label className="text-black block text-sm font-medium">Description</label>
              <textarea {...register("description")} className="text-black mt-1 block w-full rounded border border-gray-300 p-2" rows={4} />
              {errors.description && <span className="text-red-600 text-xs">{errors.description.message}</span>}
            </div>
            <div className="flex justify-between">
              {TABS.findIndex(tab => tab.key === activeTab) > 0 ? (
                <button
                  type="button"
                  onClick={prevTab}
                  className="px-4 py-2 rounded border border-black text-black font-bold text-center  hover:bg-black hover:text-white hover:cursor-pointer"
                >
                  Back to {TABS[TABS.findIndex(tab => tab.key === activeTab) - 1].label}
                </button>
              ) : <div />}
              <button
                type="button"
                onClick={nextTab}
                className="bg-[#EA580C] hover:cursor-pointer text-white px-4 py-2 rounded font-bold"
              >
                Next: Features
              </button>
            </div>
          </div>
        )}

        {/* Features */}
        {activeTab === "features" && (
          <div className="space-y-6 border border-black rounded-lg p-6 bg-white">
            <h2 className="text-black text-xl font-bold mb-2">Car Features</h2>
            <p className="text-gray-600 mb-4">
              Select all the features that your car has. This helps renters find the right car for their needs.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-4">
              {CAR_FEATURES.map((feature, idx) => (
                <label
                  key={feature.id}
                  className="inline-flex items-center space-x-2 text-sm text-gray-700"
                  style={{ minHeight: "32px" }}
                >
                  <input
                    type="checkbox"
                    value={feature.id}
                    checked={features.includes(feature.id)}
                    onChange={e => {
                      const checked = e.target.checked;
                      if (checked) setValue("features", [...features, feature.id]);
                      else setValue("features", features.filter(f => f !== feature.id));
                    }}
                    className="mt-0 align-middle"
                  />
                  <span className="align-middle">{feature.label}</span>
                </label>
              ))}
            </div>
            {errors.features && <span className="text-red-600 text-xs block">{errors.features.message}</span>}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevTab}
                className="px-4 py-2 rounded border border-black text-black font-bold text-center hover:bg-black hover:text-white cursor-pointer"
              >
                Back to Details
              </button>
              <button
                type="button"
                onClick={nextTab}
                className="bg-[#EA580C] hover:cursor-pointer text-white px-4 py-2 rounded font-bold"
              >
                Next: Availability
              </button>
            </div>
          </div>
        )}

        {/* Availability */}
        {activeTab === "availability" && (
          <div className="space-y-6 border border-black rounded-lg p-6 bg-white">
            <h2 className="text-black text-xl font-bold mb-2">Availability & Rental Terms</h2>
            {/* When is your car available for rent? */}
            <div className="mb-4">
              <label className="text-black block text-sm font-medium mb-2">
                When is your car available for rent?
              </label>
              <div className="space-y-2">
                <label className="text-black flex items-center gap-2">
                  <input type="radio" value="always" {...register("availabilitySchedule")} className="accent-[#EA580C]" />
                  Always available
                </label>
                <label className="text-black flex items-center gap-2">
                  <input type="radio" value="weekdays" {...register("availabilitySchedule")} className="accent-[#EA580C]" />
                  Weekdays only
                </label>
                <label className="text-black flex items-center gap-2">
                  <input type="radio" value="weekends" {...register("availabilitySchedule")} className="accent-[#EA580C]" />
                  Weekends only
                </label>
                <label className="text-black flex items-center gap-2">
                  <input type="radio" value="custom" {...register("availabilitySchedule")} className="accent-[#EA580C]" />
                  Custom schedule (you’ll set this later)
                </label>
              </div>
              {errors.availabilitySchedule && (
                <span className="text-red-600 text-xs">{errors.availabilitySchedule.message}</span>
              )}
            </div>
            {/* Instant Booking Toggle */}
            <div className="flex items-center py-4 border-t border-b">
              <div className="flex-1">
                <div className="text-black text-base font-bold mb-1">Instant Booking</div>
                <div className="text-gray-500 text-sm font-normal">
                  Allow renters to book your car instantly without requiring your approval.
                </div>
              </div>
              {/* Fixed Switch Headless UI */}
              <Switch
                checked={watch("instantBooking")}
                onChange={val => setValue("instantBooking", val)}
                className={`${watch("instantBooking") ? "bg-[#EA580C]" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
              >
                <span 
                  className={`${watch("instantBooking") ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out`}
                  aria-hidden="true"
                />
              </Switch>
            </div>
            {/* Min/Max Rental Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-black block text-sm font-medium">Minimum rental period (days)</label>
                <input
                  type="number"
                  {...register("minRentalPeriod")}
                  min={1}
                  className="text-black mt-1 block w-full rounded border border-gray-300 p-2"
                />
                {errors.minRentalPeriod && (
                  <span className="text-red-600 text-xs">{errors.minRentalPeriod.message}</span>
                )}
              </div>
              <div>
                <label className="text-black block text-sm font-medium">Maximum rental period (days)</label>
                <input
                  type="number"
                  {...register("maxRentalPeriod")}
                  min={1}
                  className="text-black mt-1 block w-full rounded border border-gray-300 p-2"
                />
                {errors.maxRentalPeriod && (
                  <span className="text-red-600 text-xs">{errors.maxRentalPeriod.message}</span>
                )}
              </div>
            </div>
            {/* Security Deposit */}
            <div>
              <label className="text-black block text-sm font-medium">Security deposit amount ($)</label>
              <input
                type="number"
                {...register("securityDeposit")}
                min={0}
                className="text-black mt-1 block w-full rounded border border-gray-300 p-2"
              />
              {errors.securityDeposit && (
                <span className="text-red-600 text-xs">{errors.securityDeposit.message}</span>
              )}
            </div>
            {/* Delivery Options */}
            <div className="mt-4">
              <label className="text-black block text-sm font-medium mb-2">Delivery Options</label>
              <div className="space-y-2">
                <label className="text-black flex items-center gap-2">
                  <input type="radio" value="pickup" {...register("deliveryOptions")} className="accent-[#EA580C]" />
                  Pickup only (renters come to your location)
                </label>
                <label className="text-black flex items-center gap-2">
                  <input type="radio" value="delivery" {...register("deliveryOptions")} className="accent-[#EA580C]" />
                  Delivery only (you deliver to renters)
                </label>
                <label className="text-black flex items-center gap-2">
                  <input type="radio" value="both" {...register("deliveryOptions")} className="accent-[#EA580C]" />
                  Both options available
                </label>
              </div>
              {errors.deliveryOptions && (
                <span className="text-red-600 text-xs">{errors.deliveryOptions.message}</span>
              )}
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevTab}
                className="px-4 py-2 rounded border border-black text-black font-bold text-center hover:bg-black hover:text-white cursor-pointer"
              >
                Back to Features
              </button>
              <button
                type="button"
                onClick={nextTab}
                className="bg-[#EA580C] hover:cursor-pointer text-white px-4 py-2 rounded font-bold"
              >
                Next: Photos
              </button>
            </div>
          </div>
        )}

        {/* Photos */}
        {activeTab === "photos" && (
          <div className="space-y-6 border border-black rounded-lg p-6 bg-white">
            <div>
              <label className="text-black block text-sm font-medium">URLs das Imagens</label>
              {images.map((image, idx) => (
                <div key={idx} className="flex gap-2 mt-2">
                  <input
                    type="url"
                    value={image}
                    onChange={e => updateImage(idx, e.target.value)}
                    className="text-black flex-1 rounded border border-gray-300 p-2"
                  />
                  <button type="button" onClick={() => removeImage(idx)} className="px-2 py-1 text-red-600">Remover</button>
                </div>
              ))}
              <button type="button" onClick={addImage} className="mt-2 text-blue-600">+ Adicionar Imagem</button>
              {errors.images && <span className="text-red-600 text-xs block">{errors.images.message as string}</span>}
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevTab}
                className="px-4 py-2 rounded border hover:cursor-pointer border-black text-black font-bold text-center"
              >
                Back to Availability
              </button>
              <button
                type="button"
                onClick={nextTab}
                className="bg-[#EA580C] hover:cursor-pointer text-white px-4 py-2 rounded font-bold"
              >
                Next: Preview
              </button>
            </div>
          </div>
        )}

        {/* Preview */}
        {activeTab === "preview" && (
          <div className="space-y-6 border border-black rounded-lg p-6 bg-white">
            <div className="border rounded-lg p-6">
              <h2 className="text-black text-xl font-bold mb-4">Pré-visualização</h2>
              <div className="mb-4">
                <strong>Nome:</strong> {getValues("name")}<br />
                <strong>Marca:</strong> {getValues("brand")}<br />
                <strong>Modelo:</strong> {getValues("model")}<br />
                <strong>Ano:</strong> {getValues("year")}<br />
                <strong>Preço:</strong> R$ {getValues("price")}<br />
                <strong>Preço por dia:</strong> R$ {getValues("pricePerDay")}<br />
                <strong>Quilometragem:</strong> {getValues("mileage")}<br />
                <strong>Transmissão:</strong> {getValues("transmission")}<br />
                <strong>Combustível:</strong> {getValues("fuel")}<br />
                <strong>Assentos:</strong> {getValues("seats")}<br />
                <strong>Descrição:</strong> {getValues("description")}<br />
                <strong>Cidade:</strong> {getValues("locationCity")}<br />
                <strong>Disponibilidade:</strong> {getValues("availability")}<br />
                <strong>Período mínimo:</strong> {getValues("minRentalPeriod")}<br />
                <strong>Período máximo:</strong> {getValues("maxRentalPeriod")}<br />
                <strong>Depósito:</strong> R$ {getValues("securityDeposit")}<br />
                <strong>Opções de entrega:</strong> {getValues("deliveryOptions")}<br />
                <strong>Características:</strong> {features.map(f => CAR_FEATURES.find(cf => cf.id === f)?.label).join(", ")}<br />
                <strong>Imagens:</strong>
                <div className="flex flex-wrap gap-2 mt-2">
                  {images.map((img, idx) =>
                    img ? (
                      <img
                        key={idx}
                        src={img}
                        alt={`Carro ${idx + 1}`}
                        className="w-24 h-16 object-cover rounded border"
                      />
                    ) : null
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevTab}
                className="px-4 py-2 rounded border hover:cursor-pointer border-black text-black font-bold text-center"
              >
                Back to Photos
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#EA580C] cursor-pointer font-bold text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}