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

/**
 * Interface que representa um item no carrinho/reserva
 */
export interface CartItem {
  /** ID único do item no carrinho */
  id: string;
  /** ID do usuário que fez a reserva */
  userId: string;
  /** ID do carro reservado */
  carId: string;
  /** Data de início da reserva */
  startDate: Date;
  /** Data de fim da reserva */
  endDate: Date;
  /** Preço total da reserva incluindo taxa de serviço */
  totalPrice: number;
  /** Status atual da reserva */
  status: 'pending' | 'confirmed' | 'cancelled';
  /** Data de criação do registro */
  createdAt: Date;
  /** Data da última atualização */
  updatedAt: Date;
}

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

const convertToCartItem = (doc: QueryDocumentSnapshot<DocumentData>): CartItem => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    startDate: (data.startDate as Timestamp).toDate(),
    endDate: (data.endDate as Timestamp).toDate(),
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp).toDate()
  } as CartItem;
};

export const cartService = {
  async addToCart(
    userId: string,
    carId: string,
    startDate: Date,
    endDate: Date,
    totalPrice: number
  ): Promise<CartItem> {
    try {
      // Validate the car's availability and booking dates
      const car = await carService.getCarById(carId);
      if (!car) {
        throw new Error('Carro não encontrado');
      }
      if (car.availability !== 'available') {
        throw new Error('Este carro não está disponível para aluguel no momento');
      }      // Validate dates      // Normalize dates for comparison using local timezone
      const startDateTime = new Date(startDate);
      const endDateTime = new Date(endDate);
      
      // Get today's date at local midnight
      const today = new Date();
      
      // Convert all dates to local date strings and back to Date objects
      // This ensures we're comparing dates in the local timezone
      const todayStart = new Date(today.toLocaleDateString());
      const localStartDate = new Date(startDateTime.toLocaleDateString());
      const localEndDate = new Date(endDateTime.toLocaleDateString());

      // Debug logs
      console.log('Today (local):', todayStart);
      console.log('Start date (local):', localStartDate);
      console.log('End date (local):', localEndDate);

      // Compare dates using local timestamps
      const todayTime = todayStart.getTime();
      const startTime = localStartDate.getTime();      if (startTime < todayTime) {
        throw new Error('A data de início deve ser hoje ou uma data futura');
      }
      if (localEndDate.getTime() < localStartDate.getTime()) {
        throw new Error('A data de término não pode ser anterior à data de início');
      }
      if (localStartDate.getTime() === localEndDate.getTime()) {
        throw new Error('O período de aluguel deve ser de pelo menos 1 dia');
      }

      // Check for overlapping bookings
      const existingBookings = await this.getCarBookings(carId);
      const hasOverlap = existingBookings.some(booking => hasBookingOverlap(booking, startDate, endDate));

      if (hasOverlap) {
        throw new Error('Este período já está reservado para este carro');
      }

      // Create new cart item
      const cartItemData: Omit<CartItem, 'id'> = {
        userId,
        carId,
        startDate,
        endDate,
        totalPrice,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const cartRef = doc(collection(db, 'carts'));
      await setDoc(cartRef, {
        ...cartItemData,
        startDate: Timestamp.fromDate(cartItemData.startDate),
        endDate: Timestamp.fromDate(cartItemData.endDate),
        createdAt: Timestamp.fromDate(cartItemData.createdAt),
        updatedAt: Timestamp.fromDate(cartItemData.updatedAt)
      });

      return {
        id: cartRef.id,
        ...cartItemData
      };
    } catch (error) {
      console.error('Error in addToCart:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao adicionar ao carrinho');
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

  async getCarBookings(carId: string): Promise<CartItem[]> {
    try {
      const cartRef = collection(db, 'carts');
      const q = query(
        cartRef,
        where('carId', '==', carId),
        where('status', 'in', ['confirmed', 'pending'])
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertToCartItem);
    } catch (error) {
      console.error('Error in getCarBookings:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao buscar reservas do carro');
    }
  },

  async updateCartItem(cartItemId: string, data: Partial<CartItem>): Promise<void> {
    try {
      const cartItemRef = doc(db, 'carts', cartItemId);
      const updateData: { [key: string]: FieldValue | Partial<unknown> | undefined } = {
        ...data,
        updatedAt: Timestamp.fromDate(new Date())
      };

      // Convert Date objects to Timestamps for Firestore
      if (data.startDate) {
        updateData.startDate = Timestamp.fromDate(data.startDate);
      }
      if (data.endDate) {
        updateData.endDate = Timestamp.fromDate(data.endDate);
      }
      if (data.createdAt) {
        updateData.createdAt = Timestamp.fromDate(data.createdAt);
      }

      await updateDoc(cartItemRef, updateData);
    } catch (error) {
      console.error('Error in updateCartItem:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao atualizar item do carrinho');
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
      
      // Use um Map para manter apenas o aluguel mais recente de cada carro
      const latestRentals = new Map<string, CartItem>();
      
      querySnapshot.docs.forEach(doc => {
        const rental = convertToCartItem(doc);
        const existingRental = latestRentals.get(rental.carId);
        
        // Se não existe aluguel para este carro ou se este é mais recente
        if (!existingRental || rental.startDate > existingRental.startDate) {
          latestRentals.set(rental.carId, rental);
        }
      });
      
      // Converte o Map de volta para um array e retorna
      return Array.from(latestRentals.values());
    } catch (error) {
      console.error('Error in getConfirmedRentals:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao buscar aluguéis confirmados');
    }
  },

  async getCarRentalHistory(carId: string): Promise<CartItem[]> {
    try {
      const cartRef = collection(db, 'carts');
      const q = query(
        cartRef,
        where('carId', '==', carId),
        where('status', '==', 'confirmed'),
        orderBy('startDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertToCartItem);
    } catch (error) {
      console.error('Error in getCarRentalHistory:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao buscar histórico de aluguéis');
    }
  }
};