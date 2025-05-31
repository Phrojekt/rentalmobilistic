export interface Rental {
  id: string;
  carId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: 'active' | 'cancelled' | 'completed';
}
