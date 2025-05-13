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
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
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

/**
 * Converte um documento do Firestore em um objeto CartItem
 */
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
  // Add item to cart
  async addToCart(
    userId: string,
    carId: string,
    startDate: Date,
    endDate: Date,
    totalPrice: number
  ): Promise<CartItem> {
    try {
      // Check for overlapping bookings
      const existingBookings = await this.getCarBookings(carId);
      const hasOverlap = existingBookings.some(booking => {
        const bookingStart = booking.startDate.getTime();
        const bookingEnd = booking.endDate.getTime();
        const newStart = startDate.getTime();
        const newEnd = endDate.getTime();
        
        return (
          (newStart >= bookingStart && newStart <= bookingEnd) ||
          (newEnd >= bookingStart && newEnd <= bookingEnd) ||
          (newStart <= bookingStart && newEnd >= bookingEnd)
        );
      });

      if (hasOverlap) {
        throw new Error('Este período já está reservado para este carro');
      }

      const cartRef = collection(db, 'carts');
      const newCartItemRef = doc(cartRef);

      const cartItem: CartItem = {
        id: newCartItemRef.id,
        userId,
        carId,
        startDate,
        endDate,
        totalPrice,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(newCartItemRef, cartItem);
      return cartItem;
    } catch (error: Error | unknown) {
      console.error('Error in addToCart:', error);
      throw error instanceof Error ? error : new Error('Erro desconhecido ao adicionar ao carrinho');
    }
  },

  // Get user's cart items
  async getCartItems(userId: string): Promise<CartItem[]> {
    try {
      const cartRef = collection(db, 'carts');
      const q = query(
        cartRef,
        where('userId', '==', userId),
        where('status', '==', 'pending')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertToCartItem) as CartItem[];
    } catch (error: Error | unknown) {
      console.error('Error in getCartItems:', error);
      throw error instanceof Error ? error : new Error('Erro desconhecido ao buscar itens do carrinho');
    }
  },

  // Get car's bookings to check availability
  async getCarBookings(carId: string): Promise<CartItem[]> {
    try {
      const cartRef = collection(db, 'carts');
      const q = query(
        cartRef,
        where('carId', '==', carId),
        where('status', 'in', ['pending', 'confirmed'])
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertToCartItem) as CartItem[];
    } catch (error: Error | unknown) {
      console.error('Error in getCarBookings:', error);
      throw error instanceof Error ? error : new Error('Erro desconhecido ao buscar reservas do carro');
    }
  },

  // Update cart item
  async updateCartItem(cartItemId: string, data: Partial<CartItem>): Promise<void> {
    try {
      const cartItemRef = doc(db, 'carts', cartItemId);
      await updateDoc(cartItemRef, {
        ...data,
        updatedAt: new Date()
      });
    } catch (error: Error | unknown) {
      console.error('Error in updateCartItem:', error);
      throw error instanceof Error ? error : new Error('Erro desconhecido ao atualizar item do carrinho');
    }
  },

  // Remove item from cart
  async removeFromCart(cartItemId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'carts', cartItemId));
    } catch (error: Error | unknown) {
      console.error('Error in removeFromCart:', error);
      throw error instanceof Error ? error : new Error('Erro desconhecido ao remover item do carrinho');
    }
  },

  // Clear user's cart
  async clearCart(userId: string): Promise<void> {
    try {
      const cartItems = await this.getCartItems(userId);
      const deletePromises = cartItems.map(item => 
        deleteDoc(doc(db, 'carts', item.id))
      );
      await Promise.all(deletePromises);
    } catch (error: Error | unknown) {
      console.error('Error in clearCart:', error);
      throw error instanceof Error ? error : new Error('Erro desconhecido ao limpar o carrinho');
    }
  },

  // Get cart item by ID
  async getCartItemById(cartItemId: string): Promise<CartItem | null> {
    try {
      const cartItemDoc = await getDoc(doc(db, 'carts', cartItemId));
      if (!cartItemDoc.exists()) {
        return null;
      }
        return convertToCartItem(cartItemDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error: Error | unknown) {
      console.error('Error in getCartItemById:', error);
      throw error instanceof Error ? error : new Error('Erro desconhecido ao buscar item do carrinho');
    }
  },
  // Confirm cart items (change status to confirmed)
  async confirmCartItems(userId: string): Promise<void> {
    try {
      const cartItems = await this.getCartItems(userId);
      const updatePromises = cartItems.map(async (item) => {
        await this.updateCartItem(item.id, { status: 'confirmed' });
        // Atualiza o status do carro para 'rented'
        await carService.updateCarAvailability(item.carId, 'rented');
      });
      await Promise.all(updatePromises);
    } catch (error: Error | unknown) {
      console.error('Error in confirmCartItems:', error);
      throw error instanceof Error ? error : new Error('Erro desconhecido ao confirmar itens do carrinho');
    }
  },

  // Get user's confirmed rentals
  async getConfirmedRentals(userId: string): Promise<CartItem[]> {
    try {
      const cartRef = collection(db, 'carts');
      const q = query(
        cartRef,
        where('userId', '==', userId),
        where('status', '==', 'confirmed')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertToCartItem);
    } catch (error: Error | unknown) {
      console.error('Error in getConfirmedRentals:', error);
      throw error instanceof Error ? error : new Error('Erro desconhecido ao buscar aluguéis confirmados');
    }
  }
};