"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { carService } from "@/services/carService";
import { cartService } from "@/services/cartService";
import { useAuth } from "@/hooks/useAuth";
import type { Car } from "@/services/carService";
import BookingModal from "./BookingModal";
import { toast } from 'react-hot-toast';

export default function CarDetails() {
  const params = useParams() as { id?: string | string[] };
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedTab, setSelectedTab] = useState<"details" | "features" | "reviews">("details");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const { user } = useAuth();
  const [ownerData, setOwnerData] = useState<{ 
    name: string; 
    email: string;
    profilePicture?: string;
  } | null>(null);

  const loadCar = React.useCallback(async () => {
    try {
      // Check if params.id is defined and handle its type
      const carId = params?.id;
      if (!carId) {
        toast.error('Car ID not found');
        setLoading(false);
        return;
      }

      // Handle both string and string[] cases
      const id = Array.isArray(carId) ? carId[0] : carId;
      const carData = await carService.getCarById(id);
      
      if (!carData) {
        toast.error('Car not found');
        setLoading(false);
        return;
      }

      // Set owner data
      setOwnerData({
        name: carData.ownerName || 'Car Owner',
        email: '',
        profilePicture: carData.ownerProfilePicture
      });

      // If user is logged in, check their rentals
      if (user) {
        // First check pending rentals
        const pendingRentals = await cartService.getPendingRentals(carData.id);
        const userPendingRental = pendingRentals.find(rental => rental.userId === user.uid);
        
        if (userPendingRental) {
          setCar({
            ...carData,
            rentalInfo: {
              startDate: userPendingRental.startDate,
              endDate: userPendingRental.endDate,
              totalPrice: userPendingRental.totalPrice,
              status: 'pending',
              userId: userPendingRental.userId
            }
          });
          setLoading(false);
          return;
        }

        // Then check confirmed rentals
        const userRentals = await cartService.getConfirmedRentals(user.uid);
        const currentRental = userRentals.find(
          (rental) => rental.carId === carData.id && rental.status === 'confirmed'
        );
        
        if (currentRental) {
          setCar({
            ...carData,
            rentalInfo: {
              startDate: currentRental.startDate,
              endDate: currentRental.endDate,
              totalPrice: currentRental.totalPrice,
              status: 'active',
              userId: currentRental.userId
            }
          });
          setLoading(false);
          return;
        }
      }

      // If car status changed from rented to available, show cancellation message
      if (carData.availability === 'available' && car?.availability === 'rented') {
        toast.error('This rental has been cancelled by the owner');
      }
      
      setCar(carData);
    } catch (error) {
      console.error("Error loading car:", error);
      toast.error("Failed to load car details");
    } finally {
      setLoading(false);
    }
  }, [params?.id, user, car?.availability]);

  // Initial load and polling setup
  useEffect(() => {
    loadCar();

    // Set up polling if we have a car ID
    let checkRentalStatus: NodeJS.Timeout | null = null;
    if (params?.id) {
      checkRentalStatus = setInterval(loadCar, 30000); // Check every 30 seconds
    }

    // Cleanup function
    return () => {
      if (checkRentalStatus) {
        clearInterval(checkRentalStatus);
      }
    };
  }, [loadCar, params?.id]);

  const handleBookingComplete = async () => {
    // Recarregar os dados do carro após a reserva
    await loadCar();
  };

  const handleCancelBooking = async () => {
    if (!car || !user || !car.rentalInfo) return;

    const confirmed = window.confirm('Are you sure you want to cancel this rental? This action cannot be undone.');
    if (!confirmed) return;

    try {
      // Get the cart item ID
      const userRentals = await cartService.getConfirmedRentals(user.uid);
      const currentRental = userRentals.find(
        (rental) => rental.carId === car.id && rental.status === 'confirmed'
      );

      if (!currentRental) {
        toast.error('Rental not found');
        return;
      }

      // First update the rental status to cancelled
      await cartService.updateCartItem(currentRental.id, {
        status: 'cancelled',
        cancellationReason: 'Cancelled by ' + (user.uid === car.ownerId ? 'owner' : 'renter')
      });

      // Then update car availability
      await carService.updateCarAvailability(car.id, 'available');

      toast.success('Rental cancelled successfully');
      await loadCar(); // Reload car data
    } catch (error) {
      console.error('Error cancelling rental:', error);
      toast.error('Failed to cancel rental');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-[#676773]">Loading...</div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-[#676773]">Car not found</div>
      </div>
    );
  }

  // Add function to check if current user is owner
  const isOwner = user?.uid === car?.ownerId;

  // Interface button based on rental status
  const getBookingButton = () => {
    if (isOwner) {
      return <div className="text-center text-sm text-[#676773]">You cannot rent your own car</div>;
    }

    if (!user) {
      return <div className="text-center text-sm text-[#676773]">Please log in to rent this car</div>;
    }

    if (car?.rentalInfo?.status === 'pending' && user?.uid === car.rentalInfo.userId) {
      return (
        <div className="flex flex-col gap-2">
          <div className="text-center text-sm text-[#F59E42] font-medium">
            Your rental request is pending approval
          </div>
          <button
            onClick={handleCancelBooking}
            className="w-full font-bold py-2 rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            Cancel Request
          </button>
        </div>
      );
    }

    if (car?.availability === 'available' && !car?.rentalInfo?.status) {
      return (
        <button
          className="w-full font-bold cursor-pointer py-2 rounded bg-orange-600 hover:bg-orange-700 text-white transition-colors"
          onClick={() => setIsBookingModalOpen(true)}
        >
          {car.instantBooking ? 'Book Now' : 'Request Rental'}
        </button>
      );
    }

    if (car?.availability === 'maintenance') {
      return <div className="text-center text-sm text-[#F59E42]">Under Maintenance</div>;
    }

    if (car?.availability === 'rented') {
      if (car.rentalInfo?.userId === user?.uid) {
        if (car.rentalInfo.status === 'active') {
          return (
            <>
              <div className="text-center text-sm text-[#16A34A] mb-4">You are currently renting this car</div>
              <button
                onClick={handleCancelBooking}
                className="w-full font-bold py-2 rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Cancel Rental
              </button>
            </>
          );
        }
        return <div className="text-center text-sm text-[#F59E42]">Your rental request is being processed</div>;
      }
      return <div className="text-center text-sm text-[#676773]">Currently rented</div>;
    }

    return <div className="text-center text-sm text-[#676773]">Not Available</div>;
  };

  return (
    <div className="flex flex-col items-center w-full bg-white">
      <div className="flex w-full max-w-7xl mx-auto gap-8 py-10 px-6 flex-col lg:flex-row">
        {/* Left: Main Image and Gallery */}
        <div className="flex flex-col w-full lg:w-2/3">
          <div className="relative w-full aspect-[16/10] bg-gray-200 rounded-lg overflow-hidden">
            {car.images[selectedImage] && (
              <Image
                src={car.images[selectedImage]}
                alt={`${car.name} - Image ${selectedImage + 1}`}
                fill
                className="object-cover"
                priority
              />
            )}
          </div>
          <div className="flex gap-3 mt-4">
            {car.images.map((image, index) => (
              <button
                key={index}
                className={`relative w-20 h-20 rounded overflow-hidden border-2 ${selectedImage === index ? "border-orange-500" : "border-transparent"}`}
                onClick={() => setSelectedImage(index)}
                aria-label={`Show image ${index + 1}`}
              >
                <Image
                  src={image}
                  alt={`${car.name} - Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
          {/* Tabs */}
          <div className="mt-8">
            <div className="flex gap-2 mb-4">
              {["details", "features", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab as typeof selectedTab)}
                  className={`px-5 py-2 rounded-t font-semibold text-sm border-b-2 cursor-pointer ${
                    selectedTab === tab
                      ? "bg-white border-orange-500 text-black"
                      : "bg-gray-100 border-transparent text-gray-500"
                  }`}
                >
                  {tab === "details"
                    ? "Details"
                    : tab === "features"
                    ? "Features"
                    : "Reviews"}
                </button>
              ))}
            </div>
            <div className="rounded-b p-6 min-h-[120px]">
              {selectedTab === "details" && (
                <>
                  <div className="mb-4">
                    <h3 className="font-bold text-black text-lg mb-2">Description</h3>
                    <p className="text-gray-700">{car.description}</p>
                  </div>
                  {/* Car Specifications as cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 border rounded p-3 flex flex-col items-start">
                      <div className="flex items-center gap-2 mb-1">
                        <Image src="/CarIcon.png" alt="Category Icon" width={18} height={18} />
                        <span className="text-base font-bold text-black">Category</span>
                      </div>
                      <span className="text-sm font-medium text-black">{car.category}</span>
                    </div>
                    <div className="bg-gray-50 border rounded p-3 flex flex-col items-start">
                      <div className="flex items-center gap-2 mb-1">
                        <Image src="/OrangeSeats_icon.png" alt="Seats Icon" width={18} height={18} />
                        <span className="text-base font-bold text-black">Seats</span>
                      </div>
                      <span className="text-sm font-medium text-black">{car.seats}</span>
                    </div>
                    <div className="bg-gray-50 border rounded p-3 flex flex-col items-start">
                      <div className="flex items-center gap-2 mb-1">
                        <Image src="/TransmissionIcon.png" alt="Transmission Icon" width={18} height={18} />
                        <span className="text-base font-bold text-black">Transmission</span>
                      </div>
                      <span className="text-sm font-medium text-black">{car.transmission === "automatic" ? "Automatic" : "Manual"}</span>
                    </div>
                    <div className="bg-gray-50 border rounded p-3 flex flex-col items-start">
                      <div className="flex items-center gap-2 mb-1">
                        <Image src="/FuelIcon.png" alt="Fuel Icon" width={18} height={18} />
                        <span className="text-base font-bold text-black">Fuel</span>
                      </div>
                      <span className="text-sm font-medium text-black capitalize">{car.fuel}</span>
                    </div>
                  </div>
                </>
              )}
              {selectedTab === "features" && (
                <div>
                  <h3 className="font-bold text-black text-lg mb-4">Vehicle features</h3>
                  {car.features.length > 0 ? (                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-8">
                      {car.features.map((feature, idx) => {
                        // Função para formatar o texto do feature
                        const formatFeature = (text: string) => {
                          // Separar palavras com base em camelCase ou underscores
                          const words = text.replace(/([A-Z])/g, ' $1')
                                          .replace(/_/g, ' ')
                                          .toLowerCase()
                                          .trim();
                          // Capitalizar primeira letra
                          return words.charAt(0).toUpperCase() + words.slice(1);
                        };

                        return (
                          <div key={idx} className="flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                              <path d="M5 10.5L9 14.5L15 7.5" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="text-black">{formatFeature(feature)}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-gray-500">No features listed.</span>
                  )}
                </div>
              )}
              {selectedTab === "reviews" && (
                <div className="text-gray-500">Coming soon: user reviews</div>
              )}
            </div>
          </div>
        </div>
        {/* Right: Car Info and Booking */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white border rounded-lg p-6 flex flex-col gap-4 shadow-sm">
            <h2 className="font-bold text-2xl mb-1 text-[#1A1A1A]">
              {car.name} {car.year && `(${car.year})`}
            </h2>
            <div className="flex items-center gap-2 text-[#676773] text-base mb-2">
              <Image src="/gps_icon.png" alt="Location Icon" width={16} height={16} />
              <span>{car.location.city}, {car.location.state}</span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-[#EA580C]">${car.pricePerDay}</span>
              <span className="text-[#676773] text-base">/DAY</span>
            </div>
            <div
              className={`text-xs font-semibold mb-2 ${
                car.availability === "available"
                  ? "text-[#16A34A]"
                  : car.availability === "rented"
                  ? "text-[#EA580C]"
                  : "text-[#F59E42]"
              }`}
            >
              {car.availability === "available"
                ? "Available Now"
                : car.availability === "rented"
                ? "Currently Rented"
                : "Maintenance"}
            </div>            {/* Booking Form */}
            <div className="bg-gray-50 rounded p-4 mb-2">
              {isOwner ? (
                <div className="text-center text-sm text-[#676773]">
                  You cannot rent your own car
                </div>
              ) : car.availability === "rented" && car.rentalInfo ? (
                <>
                  <div className="mb-4">
                    <label className="block text-xs text-[#676773] mb-1">Current Rental Period</label>
                    <div className="w-full border rounded px-2 py-1 text-sm text-[#1A1A1A] bg-white">
                      {new Date(car.rentalInfo.startDate).toLocaleDateString()} - {new Date(car.rentalInfo.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-sm mb-4">
                    <div className="flex justify-between border-t pt-1">
                      <span className="text-[#676773]">Total Paid</span>
                      <span className="text-[#1A1A1A] font-semibold">${car.rentalInfo.totalPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#676773]">Status</span>
                      <span className={`font-semibold ${
                        car.rentalInfo.status === 'active' ? "text-[#16A34A]" :
                        car.rentalInfo.status === 'pending' ? "text-[#F59E42]" :
                        car.rentalInfo.status === 'cancelled' ? "text-red-500" :
                        "text-[#16A34A]"
                      }`}>
                        {car.rentalInfo.status === 'pending' ? 'Pending Approval' : 'Active'}
                      </span>
                    </div>
                  </div>
                  {user && user.uid === car.rentalInfo.userId && car.rentalInfo.status !== 'pending' ? (
                    <>
                      <div className="text-center text-sm text-[#676773] mb-4">
                        You are currently renting this car
                      </div>
                      <button
                        onClick={handleCancelBooking}
                        className="w-full font-bold py-2 rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
                      >
                        Cancel Rental
                      </button>
                    </>
                  ) : user && user.uid === car.rentalInfo.userId ? (
                    <div className="text-center text-sm text-[#676773]">
                      Your rental request is pending approval
                    </div>
                  ) : (
                    <div className="text-center text-sm text-[#676773]">
                      This car is currently {car.rentalInfo.status === 'pending' ? 'pending rental approval' : 'rented'}
                    </div>
                  )}
                </>
              ) : car.availability === "available" && car.rentalInfo?.status === 'pending' ? (
                <div className="text-center text-sm text-[#F59E42] font-medium">
                  Your rental request is pending approval
                </div>
              ) : (
                <>
                  <div className="mb-2">
                    <label className="block text-xs text-[#676773] mb-1">Select Period</label>
                    <button
                      onClick={() => setIsBookingModalOpen(true)}
                      disabled={car.availability !== "available" || isOwner || car.rentalInfo?.status === 'pending'}
                      className={`w-full border rounded px-2 py-1 text-sm text-left ${
                        isOwner || car.availability !== "available" || car.rentalInfo?.status === 'pending'
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "text-[#1A1A1A] bg-white hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      {isOwner ? "You own this car" : 
                       car.rentalInfo?.status === 'pending' ? "Rental request pending" :
                       "Click to select dates"}
                    </button>
                  </div>
                  <div className="flex flex-col gap-1 text-sm mb-2">
                    <div className="flex justify-between">
                      <span className="text-[#676773]">Price per day</span>
                      <span className="text-[#1A1A1A] font-semibold">${car.pricePerDay}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#676773]">Service fee</span>
                      <span className="text-[#1A1A1A] font-semibold">10%</span>
                    </div>
                  </div>
                  {getBookingButton()}
                </>
              )}
            </div>            {/* Owner Info */}
            <div className="flex items-center gap-3 mt-2">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#EA580C]">
                {ownerData?.profilePicture ? (
                  <Image
                    src={ownerData.profilePicture}
                    alt="Owner"
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#EA580C] flex items-center justify-center text-white text-sm">
                    {ownerData?.name?.charAt(0)?.toUpperCase() || "O"}
                  </div>
                )}
              </div>
              <div>
                <div className="font-semibold text-sm text-black">
                  {user?.uid === car.ownerId 
                    ? "Your Car" 
                    : ownerData?.name || "Car Owner"}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.uid === car.ownerId 
                    ? "You are the owner" 
                    : "Owner"}
                </div>
              </div>
              {user?.uid === car.ownerId && (
                <Link
                  href={`/admin/cars/${car.id}/edit`}
                  className="ml-auto text-sm text-[#EA580C] hover:text-[#D45207] font-medium"
                >
                  Edit Car
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>      {/* Booking Modal */}
      {isBookingModalOpen && (
        <BookingModal
          car={car}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          onBookingComplete={handleBookingComplete}
        />
      )}
    </div>
  );
}
