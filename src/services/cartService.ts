import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
  FieldValue,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { carService } from './carService';

export type RentalStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

/**
 * Interface que representa um item no carrinho/reserva
 */
export interface CartItem {
  /** Unique ID of the cart item */
  id: string;
  /** User ID who made the reservation */
  userId: string;
  /** Car ID being reserved */
  carId: string;
  /** Start date of the reservation */
  startDate: Date;
  /** End date of the reservation */
  endDate: Date;
  /** Total price including service fee */
  totalPrice: number;
  /** Current status of the reservation */
  status: RentalStatus;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
  /** Cancellation timestamp if applicable */
  cancelledAt?: Date;
  /** Reason for cancellation if applicable */
  cancellationReason?: string;
  /** When the rental was confirmed */
  confirmedAt?: Date;
  /** When the rental was completed */
  completedAt?: Date;
  /** Notes or special requests */
  notes?: string;
}

// Helper function to check for rental date overlaps
const hasBookingOverlap = (
  booking: CartItem,
  startDate: Date,
  endDate: Date
): boolean => {
  // Convert all dates to local dates for comparison
  const bookingStart = new Date(new Date(booking.startDate).toLocaleDateString());
  const bookingEnd = new Date(new Date(booking.endDate).toLocaleDateString());
  const newStart = new Date(new Date(startDate).toLocaleDateString());
  const newEnd = new Date(new Date(endDate).toLocaleDateString());

  // Compare using local timestamps
  const bookingStartTime = bookingStart.getTime();
  const bookingEndTime = bookingEnd.getTime();
  const newStartTime = newStart.getTime();
  const newEndTime = newEnd.getTime();
  
  return (
    (newStartTime >= bookingStartTime && newStartTime <= bookingEndTime) ||
    (newEndTime >= bookingStartTime && newEndTime <= bookingEndTime) ||
    (newStartTime <= bookingStartTime && newEndTime >= bookingEndTime)
  );
};

// Helper function to validate rental dates
const validateRentalDates = (startDate: Date, endDate: Date): void => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDateTime = new Date(startDate);
  const endDateTime = new Date(endDate);

  if (startDateTime < today) {
    throw new Error('A data de início deve ser a partir de hoje');
  }

  if (endDateTime <= startDateTime) {
    throw new Error('A data de devolução deve ser posterior à data de retirada');
  }

  // Ensure minimum rental period (e.g., 1 day)
  const minRentalHours = 24;
  const rentalDuration = endDateTime.getTime() - startDateTime.getTime();
  const rentalHours = rentalDuration / (1000 * 60 * 60);
  
  if (rentalHours < minRentalHours) {
    throw new Error('O período mínimo de aluguel é de 24 horas');
  }

  // Ensure maximum rental period (e.g., 30 days)
  const maxRentalDays = 30;
  const rentalDays = rentalHours / 24;
  
  if (rentalDays > maxRentalDays) {
    throw new Error(`O período máximo de aluguel é de ${maxRentalDays} dias`);
  }
}

const convertToCartItem = (doc: QueryDocumentSnapshot<DocumentData>): CartItem => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    startDate: (data.startDate as Timestamp).toDate(),
    endDate: (data.endDate as Timestamp).toDate(),
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp).toDate(),
    cancelledAt: data.cancelledAt ? (data.cancelledAt as Timestamp).toDate() : undefined,
    confirmedAt: data.confirmedAt ? (data.confirmedAt as Timestamp).toDate() : undefined,
    completedAt: data.completedAt ? (data.completedAt as Timestamp).toDate() : undefined,
  } as CartItem;
};

export const cartService = {
  async addToCart(
    userId: string,
    carId: string,
    startDate: Date,
    endDate: Date,
    totalPrice: number,
    notes?: string
  ): Promise<CartItem> {
    try {
      // Use a predictable ID that matches security rules
      const cartId = `${userId}_${carId}`;
      
      // Validate the car's availability
      const car = await carService.getCarById(carId);
      if (!car) {
        throw new Error('Carro não encontrado');
      }
      if (car.availability !== 'available') {
        throw new Error('Este carro não está disponível para aluguel no momento');
      }

      // Validate rental dates
      validateRentalDates(startDate, endDate);

      // Check for overlapping bookings
      const existingBookings = await this.getCarBookings(carId);
      const hasOverlap = existingBookings.some(booking =>
        hasBookingOverlap(booking, startDate, endDate)
      );

      if (hasOverlap) {
        throw new Error('Este carro já está reservado para o período selecionado');
      }

      const now = new Date();
      
      // Create base cart item without optional fields
      const baseCartItem = {
        userId,
        carId,
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
        totalPrice,
        status: 'pending' as const,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      };

      // Add optional fields only if they are defined
      const cartItem = {
        ...baseCartItem,
        ...(notes ? { notes } : {})
      };

      // Create the cart item
      const cartRef = doc(db, 'carts', cartId);
      await setDoc(cartRef, cartItem);

      // Convert Timestamps back to Dates for the return value
      return {
        id: cartId,
        ...baseCartItem,
        startDate,
        endDate,
        createdAt: now,
        updatedAt: now,
        ...(notes ? { notes } : {})
      };
    } catch (error) {
      console.error('Error in addToCart:', error);
      throw error;
    }
  },

  async getCartItems(userId: string): Promise<CartItem[]> {
    try {
      const cartRef = collection(db, 'carts');
      const q = query(
        cartRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertToCartItem);
    } catch (error) {
      console.error('Error in getCartItems:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao buscar itens do carrinho');
    }
  },

  async updateCartItem(cartItemId: string, data: Partial<CartItem>): Promise<void> {
    try {
      const cartItemRef = doc(db, 'carts', cartItemId);
      const cartDoc = await getDoc(cartItemRef);
      
      if (!cartDoc.exists()) {
        throw new Error('Rental not found');
      }

      const currentData = cartDoc.data() as CartItem;
      const now = new Date();      type UpdateDataValue = string | number | Date | boolean | null | Timestamp | undefined;
      const updateData: { [key: string]: UpdateDataValue | FieldValue } = {
        ...data,
        updatedAt: Timestamp.fromDate(now)
      };

      // Add timestamps based on status changes
      if (data.status) {
        switch (data.status) {
          case 'confirmed':
            updateData.confirmedAt = Timestamp.fromDate(now);
            break;
          case 'cancelled':
            updateData.cancelledAt = Timestamp.fromDate(now);
            break;
          case 'completed':
            updateData.completedAt = Timestamp.fromDate(now);
            break;
        }
      }

      // Convert Date objects to Timestamps for Firestore
      if (data.startDate) {
        updateData.startDate = Timestamp.fromDate(data.startDate);
      }
      if (data.endDate) {
        updateData.endDate = Timestamp.fromDate(data.endDate);
      }      // Validate status transitions
      if (data.status) {
        if (data.status === currentData.status) {
          // Allow setting the same status - this is not a transition
          return;
        }

        switch (currentData.status) {
          case 'pending':
            if (!['confirmed', 'cancelled'].includes(data.status)) {
              throw new Error('Invalid status transition. Pending rentals can only be confirmed or cancelled.');
            }
            break;
          case 'confirmed':
            if (!['completed', 'cancelled'].includes(data.status)) {
              throw new Error('Invalid status transition. Confirmed rentals can only be completed or cancelled.');
            }
            break;
          case 'cancelled':
          case 'completed':
            throw new Error(`Cannot update rental in ${currentData.status} status - this is a terminal state.`);
        }
      }

      await updateDoc(cartItemRef, updateData);
    } catch (error) {
      console.error('Error in updateCartItem:', error);
      throw error;
    }
  },

  async removeFromCart(cartItemId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'carts', cartItemId));
    } catch (error) {
      console.error('Error in removeFromCart:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao remover item do carrinho');
    }
  },

  async clearCart(userId: string): Promise<void> {
    try {
      const cartItems = await this.getCartItems(userId);
      await Promise.all(
        cartItems.map(item => deleteDoc(doc(db, 'carts', item.id)))
      );
    } catch (error) {
      console.error('Error in clearCart:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao limpar carrinho');
    }
  },

  async getCartItemById(cartItemId: string): Promise<CartItem | null> {
    try {
      const cartItemDoc = await getDoc(doc(db, 'carts', cartItemId));
      if (!cartItemDoc.exists()) {
        return null;
      }
      return convertToCartItem(cartItemDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error in getCartItemById:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao buscar item do carrinho');
    }
  },
  async getPendingRentals(carId?: string): Promise<CartItem[]> {
    try {
      const cartRef = collection(db, 'carts');
      const constraints = [
        where('status', '==', 'pending'),
        orderBy('createdAt', 'asc') // Get oldest first
      ];
      
      if (carId) {
        constraints.unshift(where('carId', '==', carId));
      }
      
      const q = query(cartRef, ...constraints);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertToCartItem);
    } catch (error) {
      console.error('Error in getPendingRentals:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error fetching pending rental requests');
    }
  },

  async getCarBookings(carId: string): Promise<CartItem[]> {
    try {
      const cartRef = collection(db, 'carts');
      const q = query(
        cartRef,
        where('carId', '==', carId),
        where('status', 'in', ['confirmed', 'pending']),
        orderBy('startDate', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertToCartItem);
    } catch (error) {
      console.error('Error in getCarBookings:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error fetching car bookings');
    }
  },

  async getConfirmedRentals(userId: string): Promise<CartItem[]> {
    try {
      const cartRef = collection(db, 'carts');
      const q = query(
        cartRef,
        where('userId', '==', userId),
        where('status', '==', 'confirmed'),
        orderBy('startDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertToCartItem);
    } catch (error) {
      console.error('Error in getConfirmedRentals:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error fetching confirmed rentals');
    }
  },

  async getCarRentalHistory(carId: string): Promise<CartItem[]> {
    try {
      const cartRef = collection(db, 'carts');
      const q = query(
        cartRef,
        where('carId', '==', carId),
        where('status', 'in', ['confirmed', 'completed', 'cancelled']),
        orderBy('startDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      // Get all rental data first
      const rentals = querySnapshot.docs.map(convertToCartItem);
      
      // Get user information for each rental
      const rentalsWithUserInfo = await Promise.all(rentals.map(async (rental) => {
        try {
          const userDoc = await getDoc(doc(db, 'users', rental.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            return {
              ...rental,
              userName: userData.fullName,
              userEmail: userData.email
            };
          }
          return rental;
        } catch (error) {
          console.warn('Error fetching user info for rental:', error);
          return rental;
        }
      }));

      return rentalsWithUserInfo;
    } catch (error) {
      console.error('Error in getCarRentalHistory:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error fetching rental history');
    }
  }
};