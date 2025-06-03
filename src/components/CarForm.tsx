"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Car } from "@/services/carService";
import { useAuth } from "@/hooks/useAuth";
import { Switch } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";

const BRAZILIAN_STATES = [
  { name: "Acre", uf: "AC" },
  { name: "Alagoas", uf: "AL" },
  { name: "Amapá", uf: "AP" },
  { name: "Amazonas", uf: "AM" },
  { name: "Bahia", uf: "BA" },
  { name: "Ceará", uf: "CE" },
  { name: "Distrito Federal", uf: "DF" },
  { name: "Espírito Santo", uf: "ES" },
  { name: "Goiás", uf: "GO" },
  { name: "Maranhão", uf: "MA" },
  { name: "Mato Grosso", uf: "MT" },
  { name: "Mato Grosso do Sul", uf: "MS" },
  { name: "Minas Gerais", uf: "MG" },
  { name: "Pará", uf: "PA" },
  { name: "Paraíba", uf: "PB" },
  { name: "Paraná", uf: "PR" },
  { name: "Pernambuco", uf: "PE" },
  { name: "Piauí", uf: "PI" },
  { name: "Rio de Janeiro", uf: "RJ" },
  { name: "Rio Grande do Norte", uf: "RN" },
  { name: "Rio Grande do Sul", uf: "RS" },
  { name: "Rondônia", uf: "RO" },
  { name: "Roraima", uf: "RR" },
  { name: "Santa Catarina", uf: "SC" },
  { name: "São Paulo", uf: "SP" },
  { name: "Sergipe", uf: "SE" },
  { name: "Tocantins", uf: "TO" }
];

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
  locationCity: z.string().min(2, "City must be at least 2 characters"),
  locationState: z.string().min(2, "State must be at least 2 characters").max(2, "State must be a 2-letter code"),
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
  termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
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
  const [showImageModal, setShowImageModal] = useState(false);  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [validationAlert, setValidationAlert] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [showStateList, setShowStateList] = useState(false);
  
  const filteredStates = BRAZILIAN_STATES.filter(state => 
    state.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
    state.uf.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    watch,
  } = useForm<CarFormType>({
    defaultValues: {
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      pricePerDay: 0,
      locationCity: "",
      locationState: "",
      category: "",
      transmission: "automatic",
      fuel: "gasoline",
      seats: 5,
      description: "",
      images: [],
      availability: "available",
      availabilitySchedule: "always",
      instantBooking: false,
      minRentalPeriod: 1,
      maxRentalPeriod: 30,
      securityDeposit: 0,
      deliveryOptions: "pickup",
      features: [],
      termsAccepted: false,
      ...initialData,
    },
    resolver: zodResolver(carFormSchema)
  });

  const images = watch("images");
  const features = watch("features");

  const removeImage = (idx: number) => {
    setValue(
      "images",
      images.filter((img, i) => i !== idx && img)
    );
  };
  const submitHandler = async (data: CarFormType) => {
    if (loading) return;
    try {
      setError("");
      setLoading(true);
      setValidationAlert("");

      if (!user?.uid) {
        throw new Error("You must be logged in to register a car");
      }

      // Validação dos campos obrigatórios
      if (!data.brand || !data.model) {
        setValidationAlert("Brand and model are required");
        setLoading(false);
        return;
      }

      if (!data.images?.length) {
        setValidationAlert("At least one image is required");
        setLoading(false);
        return;
      }

      if (!data.locationCity || !data.locationState) {
        setValidationAlert("Location information is required");
        setLoading(false);
        return;
      }

      // Limpeza e validação de imagens
      const cleanedImages = data.images.filter(Boolean);
      if (!cleanedImages.length) {
        setValidationAlert("Invalid images. Please try uploading again");
        setLoading(false);
        return;
      }

      // Prepara os dados do carro
      const carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'> = {
        name: `${data.brand} ${data.model}`.trim(),
        brand: data.brand,
        model: data.model,
        year: data.year,
        price: 0, // Campo calculado
        pricePerDay: data.pricePerDay,
        mileage: 0, // Campo calculado
        location: {
          city: data.locationCity.trim(),
          state: data.locationState,
          country: 'BR'
        },
        category: data.category,
        transmission: data.transmission,
        fuel: data.fuel,
        seats: data.seats,
        description: data.description.trim(),
        features: data.features,
        images: cleanedImages,
        availability: data.availability,
        availabilitySchedule: data.availabilitySchedule,
        instantBooking: data.instantBooking,
        minRentalPeriod: data.minRentalPeriod,
        maxRentalPeriod: data.maxRentalPeriod,
        securityDeposit: data.securityDeposit,
        deliveryOptions: data.deliveryOptions,
        ownerId: user.uid
      };

      await onSubmit(carData);
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(err instanceof Error ? err.message : "Failed to register car. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const validateCurrentTab = async () => {
    const currentValues = getValues();
    const fieldsByTab = {
      "basic-info": ["brand", "model", "year", "pricePerDay", "locationCity", "locationState", "category", "transmission", "fuel", "seats", "description"],
      "features": ["features"],
      "availability": ["availabilitySchedule", "minRentalPeriod", "maxRentalPeriod", "securityDeposit", "deliveryOptions"],
      "photos": ["images"]
    };

    const fieldsToValidate = fieldsByTab[activeTab as keyof typeof fieldsByTab] || [];
    const emptyFields: string[] = [];

    for (const field of fieldsToValidate) {
      const value = currentValues[field as keyof CarFormType];
      if (!value) {
        emptyFields.push(field);
      } else if (field === "features" && Array.isArray(value) && value.length === 0) {
        emptyFields.push(field);
      } else if (field === "images" && Array.isArray(value) && value.filter(img => img).length === 0) {
        emptyFields.push(field);
      } else if (typeof value === 'string' && !value.trim()) {
        emptyFields.push(field);
      } else if ((field === 'pricePerDay' || field === 'securityDeposit') && value === 0) {
        emptyFields.push(field);
      }
    }

    if (emptyFields.length > 0) {
      setValidationAlert(`Please fill in the following required fields: ${emptyFields.join(", ")}`);
      return false;
    }

    setValidationAlert("");
    return true;
  };
  // Close state suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showStateList && !(event.target as HTMLElement).closest('.state-selector')) {
        setShowStateList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStateList]);

  const nextTab = async () => {
    const isValid = await validateCurrentTab();
    if (!isValid) return;
    
    const idx = TABS.findIndex(t => t.key === activeTab);
    if (idx < TABS.length - 1) {
      setActiveTab(TABS[idx + 1].key);
    }
  };

  const prevTab = () => {
    setValidationAlert("");
    const idx = TABS.findIndex(t => t.key === activeTab);
    if (idx > 0) {
      setActiveTab(TABS[idx - 1].key);
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl text-black font-bold">Register Your Car For Rental</h1>
        <p className="mt-2 text-gray-600">
          Fill out the details below to list your car on our platform and start earning
        </p>
      </div>
      
      {/* Tabs Navigation */}
      <div className="flex justify-center">
        <div className="bg-gray-100 rounded-lg px-2 md:px-6 py-4 mb-0 relative w-full max-w-6xl overflow-x-auto">
          <div className="flex-nowrap flex justify-around md:justify-between gap-2 md:gap-4 relative z-10 min-w-[400px]">
            {TABS.map(tab => (
              <button
                type="button"
                key={tab.key}
                className={`whitespace-nowrap px-6 py-2 font-bold text-black transition-colors
                  ${activeTab === tab.key
                    ? "bg-white text-[#EA580C] shadow z-20"
                    : "bg-transparent text-black border border-transparent"
                  }
                  hover:cursor-pointer`}
                style={activeTab === tab.key ? { position: "relative", top: "0px" } : {}}
                onClick={async () => {
                  if (tab.key === activeTab) return;
                  // Allow going back without validation
                  if (TABS.findIndex(t => t.key === tab.key) < TABS.findIndex(t => t.key === activeTab)) {
                    setValidationAlert("");
                    setActiveTab(tab.key);
                    return;
                  }
                  // For forward navigation, validate current tab first
                  const isValid = await validateCurrentTab();
                  if (isValid) {
                    setValidationAlert("");
                    setActiveTab(tab.key);
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-6 px-2 md:px-6 pt-6 max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {validationAlert && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded flex items-center">
            <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {validationAlert}
          </div>
        )}

        {/* Basic Info Tab */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-black block text-sm font-medium">City *</label>                <input
                  {...register("locationCity")}
                  placeholder="Enter your city (e.g., São Paulo)"
                  className="text-black mt-1 block w-full rounded border border-gray-300 p-2"
                />
                <p className="mt-1 text-xs text-gray-500">Enter the city where your car is located</p>
                {errors.locationCity && (
                  <span className="text-red-600 text-xs">
                    {errors.locationCity.message}
                  </span>
                )}
              </div>              <div>
                <label className="text-black block text-sm font-medium">State *</label>
                <div className="relative state-selector">
                  <input
                    type="text"
                    value={stateSearch}
                    onChange={(e) => {
                      setStateSearch(e.target.value);
                      setShowStateList(true);
                    }}
                    onFocus={() => setShowStateList(true)}
                    placeholder="Type state name (e.g., São Paulo)"
                    className="text-black mt-1 block w-full rounded border border-gray-300 p-2"
                  />
                  {showStateList && filteredStates.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredStates.map((state) => (
                        <div
                          key={state.uf}
                          className="text-black px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setValue("locationState", state.uf);
                            setStateSearch(state.name);
                            setShowStateList(false);
                          }}
                        >
                          <span className="font-medium">{state.name}</span>
                          <span className="text-gray-500 ml-2">({state.uf})</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    type="hidden"
                    {...register("locationState")}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Start typing the state name to see suggestions</p>
                {errors.locationState && (
                  <span className="text-red-600 text-xs">
                    {errors.locationState.message}
                  </span>
                )}
              </div>
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

        {/* Features Tab */}
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

        {/* Availability Tab */}
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
            {/* Instant Booking Toggle */}            <div className="flex items-center py-4 border-t border-b">
              <div className="flex-1">
                <div className="text-black text-base font-bold mb-1">Instant Booking</div>
                <div className="text-gray-500 text-sm font-normal">
                  <p className="mb-2">Allow renters to book your car instantly without requiring your approval.</p>
                  <p className="text-xs">
                    {watch("instantBooking") ? 
                      "✓ Renters can instantly book your car. This can increase your bookings!" :
                      "✗ You'll receive a notification and must approve each booking request."}
                  </p>
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

        {/* Photos Tab */}
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
                    if (!file) return;
                    
                    // Validate file size
                    if (file.size > 5 * 1024 * 1024) { // 5MB
                      setValidationAlert("Image size must be less than 5MB");
                      return;
                    }

                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const result = event.target?.result;
                      if (typeof result === 'string') {
                        setValue("images", [...images.filter(img => img), result]);
                      }
                    };
                    reader.readAsDataURL(file);
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
        )}        {/* Preview Tab */}
        {activeTab === "preview" && (
          <div className="space-y-6">            <div className="p-6 rounded-lg bg-white">
              <h2 className="text-black text-xl font-bold mb-1">Listing Preview</h2>
              <p className="text-gray-500 text-sm mb-6">Review your car listing before submitting</p>
                <div className="flex justify-center items-center bg-gray-50 rounded-lg h-[280px] mb-8">
                {images.length > 0 ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={images[0]}
                      alt="Car preview"
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Image
                      src="/CarIcon.png"
                      alt="Car icon"
                      width={48}
                      height={32}
                      className="opacity-50"
                    />
                  </div>
                )}
              </div>              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-500 text-sm mb-1">Price</p>
                  <span className="font-medium text-black text-base">${watch("pricePerDay")}/day</span>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-500 text-sm mb-1">Category</p>
                  <span className="font-medium text-black text-base">{watch("category") || "Not specified"}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-500 text-sm mb-1">Transmission</p>
                  <span className="font-medium text-black text-base capitalize">{watch("transmission")}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-500 text-sm mb-1">Seats</p>
                  <span className="font-medium text-black text-base">{watch("seats")}</span>
                </div>
              </div>              <div className="space-y-6">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Description</p>
                  <p className="text-gray-600 text-sm">{watch("description") || "No description provided."}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-1">Features</p>
                  {watch("features").length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {watch("features").map(feature => (
                        <span
                          key={feature}
                          className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded"
                        >
                          {CAR_FEATURES.find(f => f.id === feature)?.label || feature}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">No features selected.</p>
                  )}
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-1">Availability</p>
                  <p className="text-gray-600 text-sm">{watch("availabilitySchedule") === "always" ? "Always available" : watch("availabilitySchedule")}</p>
                  <p className="text-gray-600 text-sm">Rental period: {watch("minRentalPeriod")} to {watch("maxRentalPeriod")} days</p>
                </div>
              </div>

              {/* Terms and Conditions Acceptance */}
              <div className="py-6 border-t">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    {...register("termsAccepted")}
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    By registering your car, you agree to our terms of service and privacy policy
                  </label>
                </div>
                {errors.termsAccepted && 
                  <p className="text-red-600 text-xs mt-1">{errors.termsAccepted.message}</p>
                }
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={prevTab}
                  className="px-4 py-2 rounded border border-black text-black font-bold hover:bg-black hover:text-white cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`
                    px-8 py-2 rounded text-white font-bold flex items-center gap-2 transition-colors
                    ${loading ? "bg-[#EA580C]/70" : "bg-[#EA580C] hover:bg-[#EA580C]/90"}
                  `}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Registering...</span>
                    </>
                  ) : (
                    "Register Car"
                  )}
                </button>
              </div>
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