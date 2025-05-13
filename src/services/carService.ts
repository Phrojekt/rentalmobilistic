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
  limit,
  startAfter,
  Timestamp,
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot,
  FirestoreError
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../lib/firebase';

export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  pricePerDay: number;
  mileage: number;
  transmission: 'manual' | 'automatic';
  fuel: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  seats: number;
  description: string;
  features: string[];
  images: string[];
  location: {
    city: string;
    state: string;
    country: string;
  };
  availability: 'available' | 'rented' | 'maintenance';
  availabilitySchedule: 'always' | 'weekdays' | 'weekends' | 'custom';
  instantBooking: boolean;
  minRentalPeriod: number;
  maxRentalPeriod: number;
  securityDeposit: number;
  deliveryOptions: 'pickup' | 'delivery' | 'both';
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  currentRental?: {
    startDate: Date;
    endDate: Date;
  };
  rentalInfo?: {
    startDate: Date;
    endDate: Date;
    totalPrice: number;
  };
}

// Helper function to convert Firestore document to Car type
const convertFirestoreDataToCar = (doc: QueryDocumentSnapshot<DocumentData>): Car => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
    updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : new Date()
  } as Car;
};

export const carService = {
  // Add a new car
  async addCar(carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>): Promise<Car> {
    try {
      const carsRef = collection(db, 'cars');
      const newCarRef = doc(carsRef);

      // Garantir que features seja sempre um array
      const features = Array.isArray(carData.features) ? carData.features : [];

      const car: Car = {
        ...carData,
        features,
        id: newCarRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(newCarRef, car);
      return car;
    } catch (error: unknown) {
      if (error instanceof FirebaseError || error instanceof FirestoreError) {
        console.error('Error in addCar:', (error as Error).message);
      } else {
        console.error('Error in addCar:', error);
      }
      throw error;
    }
  },

  // Get car by ID
  async getCarById(carId: string): Promise<Car | null> {
    try {
      const carDoc = await getDoc(doc(db, 'cars', carId));
      if (!carDoc.exists()) {
        return null;
      }
      return carDoc.data() as Car;
    } catch (error: unknown) {
      if (error instanceof FirebaseError || error instanceof FirestoreError) {
        console.error('Error in getCarById:', (error as Error).message);
      } else {
        console.error('Error in getCarById:', error);
      }
      throw error;
    }
  },

  // Update car
  async updateCar(carId: string, data: Partial<Car>): Promise<void> {
    try {
      const carRef = doc(db, 'cars', carId);
      await updateDoc(carRef, {
        ...data,
        updatedAt: new Date()
      });
    } catch (error: unknown) {
      if (error instanceof FirebaseError || error instanceof FirestoreError) {
        console.error('Error in updateCar:', (error as Error).message);
      } else {
        console.error('Error in updateCar:', error);
      }
      throw error;
    }
  },

  // Update car availability
  async updateCarAvailability(carId: string, availability: 'available' | 'rented' | 'maintenance'): Promise<void> {
    try {
      const carRef = doc(db, 'cars', carId);
      await updateDoc(carRef, {
        availability,
        updatedAt: new Date()
      });
    } catch (error: Error | unknown) {
      console.error('Error in updateCarAvailability:', error);
      throw error instanceof Error ? error : new Error('Erro desconhecido ao atualizar disponibilidade do carro');
    }
  },

  // Delete car
  async deleteCar(carId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'cars', carId));
    } catch (error: unknown) {
      if (error instanceof FirebaseError || error instanceof FirestoreError) {
        console.error('Error in deleteCar:', (error as Error).message);
      } else {
        console.error('Error in deleteCar:', error);
      }
      throw error;
    }
  },  // Get rental information for a car
  async getCarRentalInfo(car: Car): Promise<Car> {
    try {
      if (car.availability === 'rented') {
        const cartRef = collection(db, 'carts');
        const cartQuery = query(
          cartRef,
          where('carId', '==', car.id),
          where('status', '==', 'confirmed')
        );
        
        const cartSnapshot = await getDocs(cartQuery);
        const currentRental = cartSnapshot.docs[0]?.data();
        
        if (currentRental?.startDate && currentRental?.endDate) {
          return {
            ...car,
            currentRental: {
              startDate: (currentRental.startDate as Timestamp).toDate(),
              endDate: (currentRental.endDate as Timestamp).toDate()
            }
          };
        }
      }
      return car;
    } catch (error) {
      console.error('Error in getCarRentalInfo:', error);
      return car;
    }
  },  // Get all cars with filters
  async getCars(filters?: {
    brand?: string;
    transmission?: 'manual' | 'automatic';
    fuel?: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    seats?: number;
    city?: string;
    state?: string;
    location?: string;
    availability?: 'available' | 'rented' | 'maintenance';
    limit?: number;
    lastDoc?: QueryDocumentSnapshot<DocumentData>;
  }): Promise<{ cars: Car[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
    try {      const carsRef = collection(db, 'cars');
      const queryConstraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];

      // Adicionar filtros que podem ser aplicados diretamente na query
      if (filters?.availability) {
        queryConstraints.push(where('availability', '==', filters.availability));
      }

      if (filters?.transmission) {
        queryConstraints.push(where('transmission', '==', filters.transmission));
      }

      if (filters?.fuel) {
        queryConstraints.push(where('fuel', '==', filters.fuel));
      }

      if (filters?.seats) {
        queryConstraints.push(where('seats', '==', Number(filters.seats)));
      }

      if (filters?.lastDoc) {
        queryConstraints.push(startAfter(filters.lastDoc));
      }

      if (filters?.limit) {
        queryConstraints.push(limit(filters.limit));
      }      const carsQuery = query(carsRef, ...queryConstraints);
      const querySnapshot = await getDocs(carsQuery);
      
      try {
        // Converter documentos em objetos Car com informações de aluguel
        const cars = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            try {
              const car = convertFirestoreDataToCar(doc);

              // Buscar informações de aluguel apenas se necessário
              return car.availability === 'rented' ? await carService.getCarRentalInfo(car) : car;
            } catch (error) {
              console.error(`Error processing car ${doc.id}:`, error);
              return null;
            }
          })
        );

        // Remover carros que falharam no processamento
        const validCars = cars.filter((car): car is Car => car !== null);

        // Aplicar filtros que precisam ser feitos em memória
        const filteredCars = validCars.filter(car => {
          if (!filters) return true;

          // Aplicar filtros de localização/pesquisa textual
          if (filters.location) {
            const searchTerm = filters.location.toLowerCase().trim();
            const matchesSearch = 
              car.brand.toLowerCase().includes(searchTerm) ||
              car.model.toLowerCase().includes(searchTerm) ||
              car.location.city.toLowerCase().includes(searchTerm) ||
              car.location.state.toLowerCase().includes(searchTerm);
            
            if (!matchesSearch) return false;
          }

          // Filtros específicos de cidade e estado
          if (filters.city && !car.location.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
          if (filters.state && !car.location.state.toLowerCase().includes(filters.state.toLowerCase())) return false;

          // Filtros de preço
          if (filters.minPrice && car.pricePerDay < filters.minPrice) return false;
          if (filters.maxPrice && car.pricePerDay > filters.maxPrice) return false;

          // Filtros de ano
          if (filters.minYear && car.year < filters.minYear) return false;
          if (filters.maxYear && car.year > filters.maxYear) return false;

          return true;
        });

        return {
          cars: filteredCars,
          lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
        };
      } catch (error) {
        console.error('Error processing cars:', error);
        throw error;
      }
    } catch (error: unknown) {
      if (error instanceof FirebaseError || error instanceof FirestoreError) {
        console.error('Error in getCars:', (error as Error).message);
      } else {
        console.error('Error in getCars:', error);
      }
      throw error;
    }
  },

  // Get cars by owner
  async getCarsByOwner(ownerId: string): Promise<Car[]> {
    try {
      // Buscar carros apenas pelo ownerId, sem ordenação no banco
      const q = query(
        collection(db, 'cars'),
        where('ownerId', '==', ownerId)
      );

      const querySnapshot = await getDocs(q);
      const cars = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: (doc.data().createdAt as Timestamp).toDate(),
        updatedAt: (doc.data().updatedAt as Timestamp).toDate()
      })) as Car[];

      // Ordenar manualmente por createdAt
      return cars.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error: unknown) {
      if (error instanceof FirebaseError || error instanceof FirestoreError) {
        console.error('Error in getCarsByOwner:', (error as Error).message);
      } else {
        console.error('Error in getCarsByOwner:', error);
      }
      throw error;
    }
  },

  // Get featured cars
  async getFeaturedCars(limitCount: number = 4): Promise<Car[]> {
    try {
      // Buscar todos os carros primeiro
      const q = query(
        collection(db, 'cars')
      );
      
      const querySnapshot = await getDocs(q);
      const cars = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
          updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : new Date()
        };
      }) as Car[];

      if (cars.length === 0) {
        console.log('No cars found in the database');
        return [];
      }

      // Embaralha todos os carros
      const shuffled = [...cars].sort(() => 0.5 - Math.random());

      // Retorna até limitCount carros
      return shuffled.slice(0, limitCount);
    } catch (error) {
      console.error('Error in getFeaturedCars:', error);
      return []; // Retorna array vazio em caso de erro
    }
  }
};