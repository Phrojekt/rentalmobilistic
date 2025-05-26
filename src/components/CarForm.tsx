"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Car } from "@/services/carService";
import { useAuth } from "@/hooks/useAuth";
import { Switch } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";

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
  brand: z.string().min(2, "Brand is required"),
  model: z.string().min(2, "Model is required"),
  year: z.coerce.number().min(1900, "Year must be at least 1900"),
  pricePerDay: z.coerce.number().min(1, "Price per day is required"),
  locationCity: z.string().min(2, "City is required"),
  category: z.string().min(1, "Category is required"),
  transmission: z.enum(["automatic", "manual"]),
  fuel: z.enum(["gasoline", "diesel", "electric", "hybrid"]),
  seats: z.coerce.number().min(1, "Number of seats is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  images: z.array(
    z.string().refine(
      val => val.startsWith("http") || val.startsWith("data:image"),
      "Add at least one valid image"
    )
  ).min(1, "Add at least one image"),
  availability: z.enum(["available", "rented", "maintenance"]),
  availabilitySchedule: z.enum(["always", "weekdays", "weekends", "custom"]),
  instantBooking: z.boolean(),
  minRentalPeriod: z.coerce.number().min(1, "Minimum rental period is required"),
  maxRentalPeriod: z.coerce.number().min(1, "Maximum rental period is required"),
  securityDeposit: z.coerce.number().min(0, "Security deposit is required"),
  deliveryOptions: z.enum(["pickup", "delivery", "both"]),
  features: z.array(z.string()).min(1, "Select at least one feature"),
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
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [validationAlert, setValidationAlert] = useState(""); // Add validation alert state

  // Fix 1: Add runtime validation using the schema
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
      images: [],
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
    resolver: zodResolver(carFormSchema) // Add this line to use the schema for validation
  });

  const images = watch("images");
  const features = watch("features");

  const removeImage = (idx: number) =>
    setValue(
      "images",
      images.filter((img, i) => i !== idx && img)
    );

  // Fix 2: Replace 'any' with a more specific type
  async function submitHandler(data: CarFormType) {
    setError("");
    setLoading(true);

    // Filtra imagens vazias antes de enviar
    data.images = data.images.filter(img => img);

    // Aguarda validação do react-hook-form
    const isValid = Object.keys(errors).length === 0;
    if (!isValid) {
      // Mapeia campos para abas
      const fieldToTab: Record<string, string> = {
        brand: "basic-info",
        model: "basic-info",
        year: "basic-info",
        pricePerDay: "basic-info",
        locationCity: "basic-info",
        category: "basic-info",
        transmission: "basic-info",
        fuel: "basic-info",
        seats: "basic-info",
        description: "basic-info",
        features: "features",
        availabilitySchedule: "availability",
        minRentalPeriod: "availability",
        maxRentalPeriod: "availability",
        securityDeposit: "availability",
        deliveryOptions: "availability",
        images: "photos",
      };
      // Encontra o primeiro campo com erro
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField && fieldToTab[firstErrorField]) {
        setActiveTab(fieldToTab[firstErrorField]);
        setTimeout(() => {
          const el = document.querySelector(`[name="${firstErrorField}"]`);
          if (el) {
            (el as HTMLElement).focus();
            el.classList.add("border-red-500", "focus:border-red-500");
          }
        }, 100);
      }
      return;
    }

    try {
      await onSubmit({
        ...data,
        name: `${data.brand} ${data.model}`,
        price: data.pricePerDay * 30, // Preço mensal estimado
        mileage: 0, // Mileage inicial
        location: {
          city: data.locationCity,
          state: "", // Estado será adicionado depois
          country: "Brasil",
        },
        ownerId: user?.uid || "",
      } as unknown as Omit<Car, "id" | "createdAt" | "updatedAt">);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error saving the car";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // Add validation function for each tab
  const validateCurrentTab = async () => {
    const currentValues = getValues();
    const fieldsByTab = {
      "basic-info": ["brand", "model", "year", "pricePerDay", "locationCity", "category", "transmission", "fuel", "seats", "description"],
      "features": ["features"],
      "availability": ["availabilitySchedule", "minRentalPeriod", "maxRentalPeriod", "securityDeposit", "deliveryOptions"],
      "photos": ["images"]
    };

    const fieldsToValidate = fieldsByTab[activeTab as keyof typeof fieldsByTab] || [];
    const emptyFields: string[] = [];
    const fieldLabels: Record<string, string> = {
      brand: "Brand",
      model: "Model", 
      year: "Year",
      pricePerDay: "Price per Day",
      locationCity: "Location",
      category: "Category",
      transmission: "Transmission",
      fuel: "Fuel",
      seats: "Number of Seats",
      description: "Description",
      features: "Features",
      availabilitySchedule: "Availability Schedule",
      minRentalPeriod: "Minimum Rental Period",
      maxRentalPeriod: "Maximum Rental Period", 
      securityDeposit: "Security Deposit",
      deliveryOptions: "Delivery Options",
      images: "Images"
    };

    // Check each field for this tab
    for (const field of fieldsToValidate) {
      const value = currentValues[field as keyof CarFormType];
      
      if (field === "features" && (!value || (Array.isArray(value) && value.length === 0))) {
        emptyFields.push(field);
      } else if (field === "images" && (!value || (Array.isArray(value) && value.filter(img => img).length === 0))) {
        emptyFields.push(field);
      } else if (field !== "features" && field !== "images" && (!value || value === "" || value === 0)) {
        emptyFields.push(field);
      }
    }

    if (emptyFields.length > 0) {
      // Show validation alert
      const fieldNames = emptyFields.map(field => fieldLabels[field]).join(", ");
      setValidationAlert(`Please fill in the following required fields: ${fieldNames}`);
      
      // Add red border to empty fields
      emptyFields.forEach(field => {
        setTimeout(() => {
          const element = document.querySelector(`[name="${field}"]`) || 
                        document.querySelector(`input[value="${field}"]`) ||
                        document.querySelector(`#${field}`);
          if (element) {
            element.classList.add("!border-red-500", "!focus:border-red-500");
            // Remove red border after 5 seconds
            setTimeout(() => {
              element.classList.remove("!border-red-500", "!focus:border-red-500");
            }, 5000);
          }
        }, 100);
      });

      return false;
    }

    setValidationAlert("");
    return true;
  };

  // Update nextTab function
  async function nextTab() {
    const isValid = await validateCurrentTab();
    if (!isValid) {
      return;
    }
    
    const idx = TABS.findIndex(t => t.key === activeTab);
    if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].key);
  }

  function prevTab() {
    setValidationAlert(""); // Clear validation alert when going back
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
                onClick={() => {
                  setValidationAlert(""); // Clear validation alert when switching tabs
                  setActiveTab(tab.key);
                }}
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

        {/* Add validation alert */}
        {validationAlert && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded flex items-center">
            <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {validationAlert}
          </div>
        )}

        {/* Basic Info */}
        {activeTab === "basic-info" && (
          <div className="space-y-6 border border-black rounded-lg p-6 bg-white">
            <h2 className="text-black text-xl font-bold mb-4">Car Details</h2>
            {/* Brand - Model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-black block text-sm font-medium">Brand *</label>
                <input {...register("brand")} className="text-black mt-1 block w-full rounded border border-gray-300 p-2" />
                {errors.brand && <span className="text-red-600 text-xs">{errors.brand.message}</span>}
              </div>
              <div>
                <label className="text-black block text-sm font-medium">Model *</label>
                <input {...register("model")} className="text-black mt-1 block w-full rounded border border-gray-300 p-2" />
                {errors.model && <span className="text-red-600 text-xs">{errors.model.message}</span>}
              </div>
            </div>
            {/* Year - Price per Day */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-black block text-sm font-medium">Year *</label>
                <input type="number" {...register("year")} className="text-black mt-1 block w-full rounded border border-gray-300 p-2" />
                {errors.year && <span className="text-red-600 text-xs">{errors.year.message}</span>}
              </div>
              <div>
                <label className="text-black block text-sm font-medium">Price per Day *</label>
                <input type="number" {...register("pricePerDay")} className="text-black mt-1 block w-full rounded border border-gray-300 p-2" />
                {errors.pricePerDay && <span className="text-red-600 text-xs">{errors.pricePerDay.message}</span>}
              </div>
            </div>
            {/* Location */}
            <div>
              <label className="text-black block text-sm font-medium">Location *</label>
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
                <label className="text-black block text-sm font-medium">Category *</label>
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
                <label className="text-black block text-sm font-medium">Transmission *</label>
                <select {...register("transmission")} className="text-black mt-1 block w-full rounded border border-gray-300 p-2">
                  <option value="">Select</option>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
                {errors.transmission && <span className="text-red-600 text-xs">{errors.transmission.message}</span>}
              </div>
              <div>
                <label className="text-black block text-sm font-medium">Fuel *</label>
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
              <label className="text-black block text-sm font-medium">Number of Seats *</label>
              <input type="number" {...register("seats")} className="text-black mt-1 block w-full rounded border border-gray-300 p-2" />
              {errors.seats && <span className="text-red-600 text-xs">{errors.seats.message}</span>}
            </div>
            {/* Description */}
            <div>
              <label className="text-black block text-sm font-medium">Description *</label>
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
              Select all the features that your car has. This helps renters find the right car for their needs. *
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-4" id="features">
              {CAR_FEATURES.map((feature) => (
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
                When is your car available for rent? *
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
                  Custom schedule (you&apos;ll set this later)
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
              <Switch
                checked={watch("instantBooking")}
                onChange={val => setValue("instantBooking", val)}
                className={`
                  ${watch("instantBooking") ? "bg-[#EA580C]" : "bg-gray-300"}
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer
                `}
              >
                <span 
                  className={`
                    ${watch("instantBooking") ? "translate-x-6" : "translate-x-1"}
                    inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out
                  `}
                  aria-hidden="true"
                />
              </Switch>
            </div>
            {/* Min/Max Rental Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-black block text-sm font-medium">Minimum rental period (days) *</label>
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
                <label className="text-black block text-sm font-medium">Maximum rental period (days) *</label>
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
              <label className="text-black block text-sm font-medium">Security deposit amount ($) *</label>
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
              <label className="text-black block text-sm font-medium mb-2">Delivery Options *</label>
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
            <h2 className="text-black text-xl font-bold mb-2">Car Photos</h2>
            <p className="text-gray-600 mb-6">
              Upload high-quality photos of your car. Include exterior, interior, and any special features. Good photos increase your chances of getting rentals. *
            </p>
            
            {/* Upload Box Component */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#EA580C] transition-colors bg-gray-200"
              onClick={() => document.getElementById('photo-upload')?.click()}
            >
              <div className="flex flex-col items-center justify-center">
                <svg className="w-12 h-12 text-gray-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                </svg>
                
                <p className="mb-2 text-black">
                  <span className="font-bold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-black">PNG, JPG or JPEG (max. 5MB per image)</p>
                
                <input 
                  type="file" 
                  id="photo-upload" 
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          const imgUrl = event.target.result.toString();
                          // Ao adicionar uma imagem:
                          setValue("images", [...images.filter(img => img), imgUrl]);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }} 
                />
              </div>
            </div>
            
            {/* Upload Status Message */}
            <div className="flex flex-col items-center justify-center mt-4 text-center">
              {images.length === 0 ? (
                <>
                  <Image 
                    src="/CarIcon.png" 
                    alt="Car icon" 
                    width={48} 
                    height={32}
                    quality={100}
                    className="mb-2"
                  />
                  <span className="font-bold text-black">No photos uploaded yet</span>
                  <p className="text-black font-normal text-sm mt-1">
                    We recommend uploading at least 5 photos of your car
                  </p>
                </>
              ) : (
                <>
                  <Image 
                    src="/CarIcon.png" 
                    alt="Car icon" 
                    width={48} 
                    height={32}
                    quality={100}
                    className="mb-2"
                  />
                  <span className="font-bold text-black">{images.filter(img => img).length} photo{images.filter(img => img).length !== 1 ? 's' : ''} uploaded</span>
                  <p className="text-black font-normal text-sm mt-1">
                    We recommend uploading at least 5 photos of your car
                  </p>
                </>
              )}
            </div>
            
            {/* Preview of uploaded images */}
            {images.filter(img => img).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                {images.map((img, idx) => 
                  img ? (
                    <div key={idx} className="relative group">
                      <div className="aspect-w-16 aspect-h-9 relative h-24 cursor-pointer">
                        <Image
                          src={img}
                          alt={`Car photo ${idx + 1}`}
                          fill
                          className="object-cover rounded-md cursor-pointer"
                          onClick={() => {
                            setCurrentImageIndex(idx);
                            setShowImageModal(true);
                          }}
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md group-hover:opacity-100 opacity-0 transition-opacity cursor-pointer hover:bg-gray-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : null
                )}
              </div>
            )}
            
            {errors.images && (
              <div className="relative">
                <span className="text-red-600 text-xs block mt-2">{errors.images.message as string}</span>
                <div className="absolute left-0 mt-1 bg-white border border-red-500 text-red-600 text-xs rounded px-2 py-1 shadow z-50 animate-fade-in">
                  {errors.images.message as string}
                </div>
              </div>
            )}
            
            {/* Photo Tips Section */}
            <div className="mt-8 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-[#EA580C] font-medium mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-4 4a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Photo tips
              </div>
              <ul className="space-y-2 text-gray-700">
                {/*
                  Consider making this list dynamic based on actual tips data
                  and possibly adding links to examples or further resources
                */}
                { [
                  "Take photos in good lighting, preferably during daylight",
                  "Include clear shots of the exterior from multiple angles",
                  "Show the interior, including front and back seats",
                  "Highlight special features or amenities",
                  "Make sure your car is clean before taking photos"
                ].map((tip, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-[#EA580C] mr-2 text-lg leading-none">•</span>
                    <span>{tip}</span>
                  </li>
                )) }
              </ul>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={prevTab}
                className="px-4 py-2 rounded border border-black text-black font-bold text-center hover:bg-black hover:text-white cursor-pointer"
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
            <div className="rounded-lg border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-black">Listing Preview</h2>
                <p className="text-sm text-gray-500 mt-1">Review your car listing before submitting</p>
              </div>

              <div className="p-6">
                {images.filter(img => img).length > 0 ? (
                  <div className="mb-6 overflow-hidden rounded-lg">
                    <div className="relative h-64 w-full">
                      <Image
                        src={images.filter(img => img)[0]}
                        alt="Car preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Image 
                      src="/CarIcon.png" 
                      alt="Car icon" 
                      width={64} 
                      height={64}
                      className="opacity-40"
                    />
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-black">
                      {getValues("brand")} {getValues("model")}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="border rounded-lg shadow-sm">
                      <div className="p-4">
                        <div className="text-sm text-gray-500">Price</div>
                        <div className="text-lg font-semibold text-black">${getValues("pricePerDay") || "0"}/day</div>
                      </div>
                    </div>
                    <div className="border rounded-lg shadow-sm">
                      <div className="p-4">
                        <div className="text-sm text-gray-500">Category</div>
                        <div className="text-lg font-semibold text-black">{getValues("category") || "Not specified"}</div>
                      </div>
                    </div>
                    <div className="border rounded-lg shadow-sm">
                      <div className="p-4">
                        <div className="text-sm text-gray-500">Transmission</div>
                        <div className="text-lg font-semibold text-black">{getValues("transmission") === "automatic" ? "Automatic" : getValues("transmission") === "manual" ? "Manual" : "Not specified"}</div>
                      </div>
                    </div>
                    <div className="border rounded-lg shadow-sm">
                      <div className="p-4">
                        <div className="text-sm text-gray-500">Seats</div>
                        <div className="text-lg font-semibold text-black">{getValues("seats") || "0"}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-black">Description</h4>
                    <p className="text-gray-500">
                      {getValues("description") || "No description provided."}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-black">Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {features.length > 0 ? (
                        features.map((featureId) => {
                          const feature = CAR_FEATURES.find((f) => f.id === featureId);
                          return feature ? (
                            <span key={featureId} className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                              {feature.label}
                            </span>
                          ) : null;
                        })
                      ) : (
                        <span className="text-gray-500">No features selected.</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-black">Availability</h4>
                    <p className="text-gray-500">
                      {getValues("availabilitySchedule") === "always" && "Always available"}
                      {getValues("availabilitySchedule") === "weekdays" && "Available on weekdays only"}
                      {getValues("availabilitySchedule") === "weekends" && "Available on weekends only"}
                      {getValues("availabilitySchedule") === "custom" && "Custom availability schedule"}
                    </p>
                    <p className="text-gray-500 mt-1">
                      Rental period: {getValues("minRentalPeriod") || "1"} to {getValues("maxRentalPeriod") || "30"}{" "}
                      days
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 pt-4">
              <div className="flex h-5 items-center">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-[#EA580C] focus:ring-[#EA580C]"
                  onChange={() => {
                    // In a real implementation, you would store this value
                    // Terms checkbox state - currently visual only
                  }}
                />
              </div>
              <div className="space-y-1 leading-none">
                <label htmlFor="terms" className="text-sm font-medium text-black">
                  I agree to the terms and conditions
                </label>
                <p className="text-xs text-gray-500">
                  By registering your car, you agree to our{" "}
                  <a href="/terms" className="text-[#EA580C] underline hover:text-[#C04000]">
                    terms of service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-[#EA580C] underline hover:text-[#C04000]">
                    privacy policy
                  </a>.
                </p>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={prevTab}
                className="px-4 py-2 rounded border border-black text-black font-bold text-center hover:bg-black hover:text-white cursor-pointer"
              >
                Back to Photos
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#EA580C] hover:cursor-pointer text-white px-4 py-2 rounded font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering car...
                  </span>
                ) : (
                  'Register Car'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {showImageModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <div 
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fechar botão */}
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Imagem */}
              <div className="w-full h-full relative bg-white rounded-lg overflow-hidden">
                <div className="relative w-full" style={{height: 'calc(90vh - 2rem)'}}>
                  <Image
                    src={images[currentImageIndex]}
                    alt={`Car photo ${currentImageIndex + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}