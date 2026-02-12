
export enum UserRole {
  PASSENGER = 'passenger',
  DRIVER = 'driver',
  UNSET = 'unset'
}

export enum BookingStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum NotificationType {
  BOOKING_REQUEST = 'booking_request',
  BOOKING_APPROVED = 'booking_approved',
  BOOKING_REJECTED = 'booking_rejected',
  TRIP_UPDATED = 'trip_updated'
}

export const StatusLabels: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: 'Ожидает',
  [BookingStatus.APPROVED]: 'Одобрено',
  [BookingStatus.REJECTED]: 'Отклонено'
};

export interface User {
  id: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  fullName: string;
  password?: string; // 4-digit PIN
  firstName?: string;
  lastName?: string;
  middleName?: string;
  avatarUrl?: string;
  carInfo?: string; // For drivers
}

export interface Trip {
  id: string;
  driverId: string;
  date: string; // ISO string
  price: number;
  totalSeats: number;
  availableSeats: number;
  from: string; // City
  to: string; // City
  departureAddress: string;
  arrivalAddress: string;
  departureTime: string; // HH:MM
  arrivalTime: string; // HH:MM
  busPlate: string; // RU Format: x777xx06
  type: string; // Standard, Comfort, Sprinter
}

export interface Booking {
  id: string;
  tripId: string;
  passengerId: string;
  passengerName: string;
  status: BookingStatus;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  isRead: boolean;
  relatedId?: string; // e.g. bookingId or tripId
}

export interface AppState {
  user: User | null;
  trips: Trip[];
  bookings: Booking[];
  notifications: Notification[];
}
