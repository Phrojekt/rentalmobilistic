import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string; // Adicionando campo para senha com hash
  createdAt: Date;
  updatedAt: Date;
}

export const userService = {
  // Register a new user
  async register(email: string, password: string, fullName: string): Promise<User> {
    try {
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Gerar hash da senha
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const userData: User = {
        id: user.uid,
        fullName,
        email,
        passwordHash, // Salvando o hash da senha
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Salvar dados do usuário no Firestore
      await setDoc(doc(db, 'users', user.uid), userData);
      return userData;
    } catch (error: unknown) {
      console.error('Error in register:', error);
      throw error;
    }
  },

  // Login user
  async login(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      console.error('Error in login:', error);
      throw error;
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      console.error('Error in logout:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        return null;
      }
      return userDoc.data() as User;
    } catch (error: unknown) {
      console.error('Error in getUserById:', error);
      throw error;
    }
  },

  // Update user profile
  async updateUser(userId: string, data: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date()
      });
    } catch (error: unknown) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      return userDoc.data() as User;
    } catch (error: unknown) {
      console.error('Error in getUserByEmail:', error);
      throw error;
    }
  }
};