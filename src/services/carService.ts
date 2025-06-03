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
  DocumentData,
  QueryDocumentSnapshot,
  FirestoreError,
  writeBatch,
  QueryConstraint
} from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { auth, db } from "../lib/firebase";
import { imageService } from "./imageService";
import { CartItem } from "./cartService";

export type Availability = "available" | "rented" | "maintenance";

// Interface for filtering cars
export interface GetCarsFilters {
  limit?: number;
  startAfter?: QueryDocumentSnapshot<DocumentData>;
  brand?: string;
  model?: string;
  category?: string;
  transmission?: "manual" | "automatic";
  fuel?: "gasoline" | "diesel" | "electric" | "hybrid";
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  seats?: number;
  city?: string;
  state?: string;
  pickupDate?: string;
  returnDate?: string;
  location?: string;
  availability?: "available" | "rented" | "maintenance";
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
}

// Base interface for common car fields
export interface CarBase {
  name: string;
  brand: string;
  model: string;
  category: string;
  year: number;
  price: number;
  pricePerDay: number;
  mileage: number;
  transmission: "manual" | "automatic";
  fuel: "gasoline" | "diesel" | "electric" | "hybrid";
  seats: number;
  description: string;
  features: string[];
  images: string[];
  location: {
    city: string;
    state: string;
    country: string;
  };
  availability: Availability;
  availabilitySchedule: "always" | "weekdays" | "weekends" | "custom";
  instantBooking: boolean;
  minRentalPeriod: number;
  maxRentalPeriod: number;
  securityDeposit: number;
  deliveryOptions: "pickup" | "delivery" | "both";
  ownerId: string;
}

// Interface for Car data when creating/updating
export interface CarData extends CarBase {
  id?: string;
  rentalId?: string;
}

// Interface for Car with all fields
export interface Car extends CarBase {
  id: string;
  rentalId?: string;
  createdAt: Date;
  updatedAt: Date;
  searchTerms?: string[];
  currentRental?: {
    startDate: Date;
    endDate: Date;
  };
  rentalInfo?: {
    startDate: Date;
    endDate: Date;
    totalPrice: number;
    status?: "active" | "cancelled" | "completed" | "pending";
    userId?: string;
  };
  ownerProfilePicture?: string;
  ownerName?: string;
}

// Interface for Car data as stored in Firestore
export interface FirestoreCar extends CarBase {
  id: string;
  rentalId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  searchTerms: string[];
  currentRental?: {
    startDate: Timestamp;
    endDate: Timestamp;
  };
  rentalInfo?: {
    startDate: Timestamp;
    endDate: Timestamp;
    totalPrice: number;
    status?: "active" | "cancelled" | "completed";
  };
}

// Helper function to generate search terms for a car
const generateSearchTerms = (car: Partial<CarBase>): string[] => {
  const terms = new Set<string>();
    // Function to add all word combinations
  const addTerms = (text: string) => {
    if (!text) return;
    
    const cleanText = text.toLowerCase().trim();
    const words = cleanText.split(/\s+/);
    
    // Add individual words and their variations
    words.forEach(word => {
      if (word.length > 2) {
        terms.add(word); // Add full word
        // Add word prefixes for partial matching (min 3 chars)
        for (let i = 3; i <= word.length; i++) {
          terms.add(word.substring(0, i));
        }
      }
    });

    // Add word pairs
    for (let i = 0; i < words.length - 1; i++) {
      const pair = `${words[i]} ${words[i + 1]}`;
      terms.add(pair);
    }

    // Add the full normalized text
    terms.add(cleanText);
    
    // For debugging
    console.log('Generated terms for:', text, Array.from(terms));
  };
  
  // Add brand and model terms
  if (car.brand) addTerms(car.brand);
  if (car.model) addTerms(car.model);
  if (car.brand && car.model) addTerms(`${car.brand} ${car.model}`);
  
  // Add location terms
  if (car.location) {
    if (car.location.city) addTerms(car.location.city);
    if (car.location.state) addTerms(car.location.state);
    if (car.location.city && car.location.state) {
      addTerms(`${car.location.city} ${car.location.state}`);
    }
  }
  
  // Add category
  if (car.category) addTerms(car.category);
  
  return Array.from(terms);
};

// Helper function to convert Firestore document to Car type
const convertFirestoreDataToCar = (
  doc: QueryDocumentSnapshot<DocumentData>
): Car => {
  const data = doc.data() as FirestoreCar;

  // Primeiro, pegamos apenas os campos base do carro (sem as datas)
  const { createdAt, updatedAt, currentRental, rentalInfo, ...baseData } = data;

  // Criamos o objeto car com os campos base
  const car: Car = {
    ...baseData,
    id: doc.id,
    createdAt: createdAt.toDate(),
    updatedAt: updatedAt.toDate(),
  };

  // Adicionamos currentRental se existir
  if (currentRental) {
    car.currentRental = {
      startDate: currentRental.startDate.toDate(),
      endDate: currentRental.endDate.toDate(),
    };
  }

  // Adicionamos rentalInfo se existir
  if (rentalInfo) {
    car.rentalInfo = {
      ...rentalInfo,
      startDate: rentalInfo.startDate.toDate(),
      endDate: rentalInfo.endDate.toDate(),
    };
  }

  return car;
};

export const carService = {
  // Add a new car
  async addCar(carData: Omit<CarData, "id">): Promise<Car> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User must be logged in to create a car");
      }

      // Create car reference
      const carsRef = collection(db, "cars");
      const newCarRef = doc(carsRef);
      const carId = newCarRef.id;

      // Process images
      const imageUrls = await imageService.uploadImages(carData.images || []);
      if (imageUrls.length === 0) {
        throw new Error("At least one image is required");
      }      const now = Timestamp.now();      // Create the car data with all required fields and defaults
      const firestoreCar: FirestoreCar = {
        name: carData.name,
        brand: carData.brand,
        model: carData.model,
        category: carData.category,
        year: carData.year,
        price: carData.price || 0,
        pricePerDay: carData.pricePerDay,
        mileage: carData.mileage || 0,
        transmission: carData.transmission,
        fuel: carData.fuel,
        seats: carData.seats,
        description: carData.description,
        location: carData.location,
        images: imageUrls,
        features: Array.isArray(carData.features) ? carData.features : [],
        id: carId,
        ownerId: user.uid,
        availability: "available",
        instantBooking: carData.instantBooking ?? false,
        availabilitySchedule: carData.availabilitySchedule || "always",
        minRentalPeriod: carData.minRentalPeriod || 1,
        maxRentalPeriod: carData.maxRentalPeriod || 30,
        securityDeposit: carData.securityDeposit || 0,
        deliveryOptions: carData.deliveryOptions || "pickup",
        createdAt: now,
        updatedAt: now,
        searchTerms: generateSearchTerms({
          brand: carData.brand,
          model: carData.model,
          category: carData.category,
          location: carData.location,
        }),
      };

      // Save to Firestore
      try {
        await setDoc(newCarRef, firestoreCar);
      } catch (error) {
        console.error("Error saving to Firestore:", error);
        throw new Error("Failed to save car to database. Please try again.");
      }

      // Convert Firestore data to Car type for return
      const { createdAt, updatedAt, currentRental, rentalInfo, ...baseData } = firestoreCar;

      // Create the car object with date fields properly converted
      const car: Car = {
        ...baseData,
        createdAt: createdAt.toDate(),
        updatedAt: updatedAt.toDate(),
      };

      // Add currentRental if it exists, with dates converted
      if (currentRental) {
        car.currentRental = {
          startDate: currentRental.startDate.toDate(),
          endDate: currentRental.endDate.toDate(),
        };
      }

      // Add rentalInfo if it exists, with dates converted
      if (rentalInfo) {
        car.rentalInfo = {
          ...rentalInfo,
          startDate: rentalInfo.startDate.toDate(),
          endDate: rentalInfo.endDate.toDate(),
        };
      }

      return car;
    } catch (error) {
      console.error("Error in addCar:", error);
      throw error;
    }
  },

  // Get cars by owner
  async getCarsByOwner(ownerId: string): Promise<Car[]> {
    try {
      const carsQuery = query(
        collection(db, "cars"),
        where("ownerId", "==", ownerId)
      );

      const snapshot = await getDocs(carsQuery);
      return snapshot.docs.map((doc) => convertFirestoreDataToCar(doc));
    } catch (error) {
      console.error("Error getting cars by owner:", error);
      throw error;
    }
  },

  // Delete car
  async deleteCar(carId: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User must be logged in to delete a car");
      }

      const carRef = doc(db, "cars", carId);
      const carDoc = await getDoc(carRef);

      if (!carDoc.exists()) {
        throw new Error("Car not found");
      }

      const carData = carDoc.data() as FirestoreCar;
      if (carData.ownerId !== user.uid) {
        throw new Error("Only the car owner can delete this car");
      }

      if (carData.availability === "rented") {
        throw new Error("Cannot delete a car that is currently rented");
      }

      await deleteDoc(carRef);
    } catch (error) {
      console.error("Error deleting car:", error);
      throw error;
    }
  },

  // Get car by ID
  async getCarById(carId: string): Promise<Car | null> {
    try {
      const carDoc = await getDoc(doc(db, "cars", carId));
      if (!carDoc.exists()) {
        return null;
      }
      const car = convertFirestoreDataToCar(carDoc);

      // Get owner's basic public information
      try {
        const ownerRef = doc(db, "users", car.ownerId);
        const ownerDoc = await getDoc(ownerRef);
        if (ownerDoc.exists()) {
          const ownerData = ownerDoc.data() as { fullName?: string; profilePicture?: string };
          car.ownerName = ownerData.fullName;
          car.ownerProfilePicture = ownerData.profilePicture;
        }
      } catch {
        // Falha ao buscar info do dono, ignora
      }

      return car;
    } catch (error: unknown) {
      if (error instanceof FirebaseError || error instanceof FirestoreError) {
        console.error("Error in getCarById:", (error as Error).message);
      } else {
        console.error("Error in getCarById:", error);
      }
      throw error;
    }
  },

  // Update car
  async updateCar(carId: string, data: Partial<Car>): Promise<void> {
    try {
      const carRef = doc(db, "cars", carId);

      // If there are images in the update, process them
      if (data.images && Array.isArray(data.images)) {
        // Filtra imagens vazias e faz upload apenas das novas (base64)
        const validImages = data.images.filter((img) => img);
        const imageUrls = await imageService.uploadImages(validImages);
        data = {
          ...data,
          images: imageUrls,
        };
      }      // Generate new search terms if relevant fields changed
      if (data.brand || data.model || data.category || data.location) {
        const carDoc = await getDoc(carRef);
        if (carDoc.exists()) {
          const currentData = carDoc.data() as FirestoreCar;
          const mergedData = {
            ...currentData,
            ...data
          };
          data.searchTerms = generateSearchTerms(mergedData);
        }
      }

      await updateDoc(carRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error: unknown) {
      if (error instanceof FirebaseError || error instanceof FirestoreError) {
        console.error("Error in updateCar:", (error as Error).message);
      } else {
        console.error("Error in updateCar:", error);
      }
      throw error;
    }
  }, // Update car availability
  async updateCarAvailability(
    carId: string,
    availability: Availability
  ): Promise<boolean> {
    try {
      const carRef = doc(db, "cars", carId);
      const carDoc = await getDoc(carRef);

      if (!carDoc.exists()) {
        throw new Error("Car not found");
      }

      const currentData = carDoc.data() as FirestoreCar & { id: string };
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User must be logged in to update car availability");
      }

      // Create a batch write for atomic operations
      const batch = writeBatch(db);
      const now = new Date();

      // Verify permissions based on the intended action
      if (availability === "maintenance") {
        // Only owner can mark as maintenance
        if (currentData.ownerId !== user.uid) {
          throw new Error("Only the car owner can perform this action");
        }

        // Update car availability
        batch.update(carRef, {
          availability: "maintenance",
          updatedAt: Timestamp.now(),
        });
      } else if (availability === "rented") {
        // Check if this is for approving a rental or updating status
        const isOwner = currentData.ownerId === user.uid;

        // For owner approval or instant booking
        const queryConstraints = [
          where("carId", "==", carId),
          where("status", "==", "pending"),
        ];

        // For non-owners (renters), also check that it's their own request
        if (!isOwner && !currentData.instantBooking) {
          queryConstraints.push(where("userId", "==", user.uid));
        }

        // Get the most recent pending request
        const cartQuery = query(
          collection(db, "carts"),
          ...queryConstraints,
          orderBy("createdAt", "desc"),
          limit(1)
        );

        const cartSnapshot = await getDocs(cartQuery);

        if (cartSnapshot.empty) {
          throw new Error("No pending rental requests found for this car");
        }

        const rentalRequest = cartSnapshot.docs[0].data() as CartItem;
        const cartItemId = cartSnapshot.docs[0].id;

        // For non-instant booking cars, verify that the owner is the one approving
        if (!currentData.instantBooking && !isOwner) {
          throw new Error("Only the car owner can approve rental requests");
        }

        // Check the rental dates
        const startDate =
          rentalRequest.startDate instanceof Timestamp
            ? rentalRequest.startDate.toDate()
            : new Date(rentalRequest.startDate);

        const endDate =
          rentalRequest.endDate instanceof Timestamp
            ? rentalRequest.endDate.toDate()
            : new Date(rentalRequest.endDate);

        // Check if there are any other confirmed rentals that overlap with these dates
        const overlappingQuery = query(
          collection(db, "carts"),
          where("carId", "==", carId),
          where("status", "==", "confirmed")
        );

        const overlappingSnapshot = await getDocs(overlappingQuery);
        const hasOverlap = overlappingSnapshot.docs.some((doc) => {
          const data = doc.data() as CartItem;
          const existingStart =
            data.startDate instanceof Timestamp
              ? data.startDate.toDate()
              : new Date(data.startDate);

          const existingEnd =
            data.endDate instanceof Timestamp
              ? data.endDate.toDate()
              : new Date(data.endDate);

          return (
            (startDate <= existingEnd && endDate >= existingStart) ||
            (existingStart <= endDate && existingEnd >= startDate)
          );
        });

        if (hasOverlap) {
          throw new Error(
            "The requested rental period overlaps with an existing rental"
          );
        }

        // Update cart item status to confirmed
        batch.update(doc(db, "carts", cartItemId), {
          status: "confirmed",
          updatedAt: Timestamp.now(),
        });

        // Update car availability and rental info
        batch.update(carRef, {
          availability: "rented",
          updatedAt: Timestamp.now(),
          currentRental: {
            startDate: Timestamp.fromDate(startDate),
            endDate: Timestamp.fromDate(endDate),
            userId: rentalRequest.userId,
          },
        });

        // Cancel other pending rentals for overlapping dates
        const otherPendingQuery = query(
          collection(db, "carts"),
          where("carId", "==", carId),
          where("status", "==", "pending")
        );

        const otherPendingSnapshot = await getDocs(otherPendingQuery);
        otherPendingSnapshot.docs.forEach((doc) => {
          if (doc.id !== cartItemId) {
            batch.update(doc.ref, {
              status: "cancelled",
              cancelledAt: Timestamp.now(),
              cancellationReason:
                "Another rental request was approved for this period",
            });
          }
        });
      } else if (availability === "available") {
        // For changing availability to available
        if (currentData.availability === "rented") {
          // Check if user is owner or current renter
          const cartQuery = query(
            collection(db, "carts"),
            where("carId", "==", carId),
            where("status", "==", "confirmed")
          );
          const cartSnapshot = await getDocs(cartQuery);

          if (cartSnapshot.docs.length > 0) {
            const currentRental = cartSnapshot.docs[0].data() as CartItem;
            const isOwner = currentData.ownerId === user.uid;
            const isRenter = currentRental.userId === user.uid;

            if (!isOwner && !isRenter) {
              throw new Error(
                "Only the car owner or current renter can complete/cancel the rental"
              );
            }

            const cartRef = doc(db, "carts", cartSnapshot.docs[0].id);

            const rentalEndDate =
              currentRental.endDate instanceof Timestamp
                ? currentRental.endDate.toDate()
                : new Date(currentRental.endDate);

            const isRentalComplete = rentalEndDate <= now;

            // Update rental status
            batch.update(cartRef, {
              status: isRentalComplete ? "completed" : "cancelled",
              updatedAt: Timestamp.now(),
              [isRentalComplete ? "completedAt" : "cancelledAt"]:
                Timestamp.now(),
              ...(isRentalComplete
                ? {}
                : {
                    cancellationReason:
                      "Rental cancelled by " + (isOwner ? "owner" : "renter"),
                  }),
            });
          }
        } else {
          // For non-rented cars, only owner can change availability
          if (currentData.ownerId !== user.uid) {
            throw new Error("Only the car owner can update car availability");
          }
        }

        // Update car to available
        batch.update(carRef, {
          availability: "available",
          updatedAt: Timestamp.now(),
          currentRental: null,
        });
      } // Commit all changes atomically
      await batch.commit();
      return true;
    } catch (error) {
      console.error("Error updating car availability:", error);
      throw error;
    }
  },

  // Get cars with filters
  async getCars(filters: GetCarsFilters = {}): Promise<{ cars: Car[]; lastDoc: QueryDocumentSnapshot | null }> {
    try {
      const carsRef = collection(db, "cars");
      const queryConstraints: QueryConstraint[] = [];

      // Add filters
      if (filters.brand) {
        queryConstraints.push(where("brand", "==", filters.brand));
      }
      if (filters.model) {
        queryConstraints.push(where("model", "==", filters.model));
      }
      if (filters.category) {
        queryConstraints.push(where("category", "==", filters.category));
      }
      if (filters.transmission) {
        queryConstraints.push(where("transmission", "==", filters.transmission));
      }
      if (filters.fuel) {
        queryConstraints.push(where("fuel", "==", filters.fuel));
      }
      if (filters.seats) {
        queryConstraints.push(where("seats", "==", filters.seats));
      }
      if (filters.availability) {
        queryConstraints.push(where("availability", "==", filters.availability));
      }      // Location search (city, state or location)
      if (filters.location) {
        const locationTerms = filters.location.toLowerCase().trim().split(/\s+/).filter(term => term.length > 2);
        console.log('Search terms:', locationTerms); // Debug log
        
        if (locationTerms.length > 0) {
          // Sempre usa o primeiro termo significativo
          queryConstraints.push(where("searchTerms", "array-contains", locationTerms[0]));
        }
      } else {
        // Individual location filters
        if (filters.city) {
          queryConstraints.push(where("location.city", "==", filters.city));
        }
        if (filters.state) {
          queryConstraints.push(where("location.state", "==", filters.state));
        }
      }

      // Price filters
      if (filters.minPrice !== undefined) {
        queryConstraints.push(where("pricePerDay", ">=", filters.minPrice));
      }
      if (filters.maxPrice !== undefined) {
        queryConstraints.push(where("pricePerDay", "<=", filters.maxPrice));
      }

      // Add orderBy - note: must be after where clauses
      queryConstraints.push(orderBy("createdAt", "desc"));

      // Add pagination
      if (filters.limit) {
        queryConstraints.push(limit(filters.limit));
      }
      if (filters.startAfter) {
        queryConstraints.push(startAfter(filters.startAfter));
      }

      // Execute query
      const q = query(carsRef, ...queryConstraints);
      const snapshot = await getDocs(q);
      
      const cars = await Promise.all(
        snapshot.docs.map(async (carDoc) => {
          const car = convertFirestoreDataToCar(carDoc);
          try {
            const ownerRef = doc(db, "users", car.ownerId);
            const ownerDoc = await getDoc(ownerRef);
            if (ownerDoc.exists()) {
              const ownerData = ownerDoc.data() as { fullName?: string; profilePicture?: string };
              car.ownerName = ownerData.fullName;
              car.ownerProfilePicture = ownerData.profilePicture;
            }
          } catch {
            // Falha ao buscar info do dono, ignora
          }
          return car;
        })
      );

      return {
        cars,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
      };
    } catch (error) {
      console.error("Error getting cars:", error);
      throw error;
    }
  },
  // Get featured cars
  async getFeaturedCars(maxResults = 4): Promise<Car[]> {
    try {
      const carsRef = collection(db, "cars");
      const queryConstraints: QueryConstraint[] = [
        where("availability", "==", "available"),
        orderBy("createdAt", "desc"),
        limit(maxResults)
      ];

      const q = query(carsRef, ...queryConstraints);
      const snapshot = await getDocs(q);
      
      const cars = await Promise.all(
        snapshot.docs.map(async (carDoc) => {
          const car = convertFirestoreDataToCar(carDoc);
          try {
            const ownerRef = doc(db, "users", car.ownerId);
            const ownerDoc = await getDoc(ownerRef);
            if (ownerDoc.exists()) {
              const ownerData = ownerDoc.data() as { fullName?: string; profilePicture?: string };
              car.ownerName = ownerData.fullName;
              car.ownerProfilePicture = ownerData.profilePicture;
            }
          } catch {
            // Falha ao buscar info do dono, ignora
          }
          return car;
        })
      );

      return cars;
    } catch (error) {
      console.error("Error getting featured cars:", error);
      throw error;
    }
  },

  // Update search terms for all cars
  async updateAllSearchTerms(): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, "cars"));
      const batch = writeBatch(db);
      let count = 0;

      for (const doc of snapshot.docs) {
        const car = doc.data() as FirestoreCar;
        const searchTerms = generateSearchTerms({
          brand: car.brand,
          model: car.model,
          category: car.category,
          location: car.location,
        });

        batch.update(doc.ref, { searchTerms });
        count++;

        // Firestore limits batches to 500 operations
        if (count % 400 === 0) {
          await batch.commit();
        }
      }

      if (count % 400 !== 0) {
        await batch.commit();
      }

      console.log(`Updated search terms for ${count} cars`);
    } catch (error) {
      console.error("Error updating search terms:", error);
      throw error;
    }
  },
};
