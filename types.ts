
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
  password?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  avatarUrl?: string;
  carInfo?: string;
}

export interface Trip {
  id: string;
  driverId: string;
  date: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  from: string;
  to: string;
  departureAddress: string;
  arrivalAddress: string;
  departureTime: string;
  arrivalTime: string;
  busPlate: string;
  type: string;
}

export interface Booking {
  id: string;
  tripId: string;
  passengerId: string;
  passengerName: string;
  passengerPhone?: string;
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
  relatedId?: string;
}

export interface AppState {
  user: User | null;
  trips: Trip[];
  bookings: Booking[];
  notifications: Notification[];
}
