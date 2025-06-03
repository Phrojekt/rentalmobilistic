"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cartService } from "@/services/cartService";
import { carService } from "@/services/carService";
import { notificationService } from "@/services/notificationService";
import type { Car } from "@/services/carService";
import toast from "react-hot-toast";

interface BookingModalProps {
  car: Car;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete?: () => void;
}

export default function BookingModal({ car, isOpen, onClose, onBookingComplete }: BookingModalProps) {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const calculateTotalPrice = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const rentalPrice = car.pricePerDay * days;
    const serviceFee = rentalPrice * 0.1; // 10% service fee
    return rentalPrice + serviceFee;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Please log in to continue");
      return;
    }

    if (!startDate || !endDate) {
      setError("Please select pickup and return dates");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      setError("Return date must be after pickup date");
      return;
    }

    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days < car.minRentalPeriod) {
      setError(`Minimum rental period is ${car.minRentalPeriod} days`);
      return;
    }

    if (days > car.maxRentalPeriod) {
      setError(`Maximum rental period is ${car.maxRentalPeriod} days`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Check if there's already a pending request for this car
      const existingRentals = await cartService.getPendingRentals(car.id);
      const userPendingRental = existingRentals.find(rental => rental.userId === user.uid);
      
      if (userPendingRental) {
        setError("You already have a pending rental request for this car");
        return;
      }

      // If car is instant booking, check if there are any other pending requests
      if (car.instantBooking && existingRentals.length > 0) {
        setError("This car has pending rental requests and cannot be instantly booked at the moment");
        return;
      }

      const totalPrice = calculateTotalPrice();
      
      // Add to cart with initial status
      const cartItem = await cartService.addToCart(
        user.uid, 
        car.id, 
        start, 
        end, 
        totalPrice, 
        car.instantBooking ? 'confirmed' : 'pending'
      );
      
      try {
        if (car.instantBooking) {
          // For instant booking, update car availability
          await carService.updateCarAvailability(car.id, 'rented');
          
          // Notify owner
          await notificationService.createNotification(
            car.ownerId,
            'booking_confirmed',
            'New Instant Booking',
            `Your car ${car.name} has been booked from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}.`,
            { carId: car.id, bookingId: cartItem.id, renterId: user.uid }
          );
          
          toast.success('Booking confirmed! The car is now reserved.');
        } else {
          // For regular bookings, just notify the owner
          await notificationService.createNotification(
            car.ownerId,
            'booking_request',
            'New Booking Request',
            `You have a new booking request for ${car.name} from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}.`,
            { carId: car.id, bookingId: cartItem.id, renterId: user.uid }
          );
          toast.success('Booking request sent! Waiting for owner approval.');
        }
        
        setSuccess(true);
        
        // Wait 2 seconds before closing
        setTimeout(() => {
          onClose();
          if (onBookingComplete) {
            onBookingComplete();
          }
        }, 2000);
      } catch (updateError) {
        // If something goes wrong, cancel the booking
        await cartService.updateCartItem(cartItem.id, { 
          status: 'cancelled',
          cancellationReason: 'Error processing booking'
        });
        throw updateError;
      }
    } catch (err) {
      let errorMessage = "Error processing booking. Please try again.";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'code' in err) {
        const firebaseError = err as { code: string };
        if (firebaseError.code === 'permission-denied') {
          errorMessage = "You don't have permission to perform this action. Please log in again.";
        }
      }
      
      setError(errorMessage);
      console.error("Error processing booking:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">Book {car.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
              {car.instantBooking 
                ? "Booking confirmed! Redirecting..." 
                : "Booking request sent! Waiting for owner approval. Redirecting..."}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="text-black w-full rounded border border-gray-300 p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Return Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split("T")[0]}
              className="text-black w-full rounded border border-gray-300 p-2"
              required
            />
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Daily rate:</span>
              <span className="text-black font-medium">${car.pricePerDay.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Service fee (10%):</span>
              <span className="text-black font-medium">${(calculateTotalPrice() * 0.1).toLocaleString()}</span>
            </div>
            <div className="text-black flex justify-between font-bold">
              <span>Total:</span>
              <span>${calculateTotalPrice().toLocaleString()}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-12 rounded font-bold text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#EA580C] hover:bg-[#D45207]"
            }`}
          >
            {loading ? "Processing..." : car.instantBooking ? "Book Now" : "Request Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}
