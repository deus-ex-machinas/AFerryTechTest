import { BookingType } from './BookingType.enum';

export type Booking = {
  id: string;
  partitionKey: string;
  timestamp: number;
  type: BookingType;
};

export type BookingCompleted = Booking & {
  [BookingType.booking_completed]: {
    timestamp: number;
    orderId: number;
    product_provider: string;
  };
};

export type BookingRequested = Booking & {
  [BookingType.booking_requested]: {
    timestamp: number;
    orderId: number;
    product_provider: string;
  };
};
