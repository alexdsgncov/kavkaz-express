
export enum UserRole {
  PASSENGER = 'passenger',
  DRIVER = 'driver',
  ADMIN = 'admin'
}

export enum BookingStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export const StatusLabels: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: 'Ожидает',
  [BookingStatus.APPROVED]: 'Подтверждено',
  [BookingStatus.REJECTED]: 'Отклонено',
  [BookingStatus.CANCELLED]: 'Отменено'
};

export enum TripStatus {
  SCHEDULED = 'scheduled',
  BOARDING = 'boarding',
  EN_ROUTE = 'en_route',
  ARRIVED = 'arrived',
  CANCELLED = 'cancelled'
}

export const TripStatusLabels: Record<TripStatus, string> = {
  [TripStatus.SCHEDULED]: 'Запланирован',
  [TripStatus.BOARDING]: 'Посадка',
  [TripStatus.EN_ROUTE]: 'В пути',
  [TripStatus.ARRIVED]: 'Прибыл',
  [TripStatus.CANCELLED]: 'Отменен'
};

export interface User {
  id: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  rating?: number;
  tripsCount?: number;
}

export interface Seat {
  id: number;
  label: string;
  isAvailable: boolean;
  type: 'window' | 'aisle' | 'standard';
}

export interface Trip {
  id: string;
  driverId: string;
  date: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  occupiedSeats: number[]; // Массив ID занятых мест
  from: string;
  to: string;
  departureAddress: string;
  arrivalAddress: string;
  departureTime: string;
  arrivalTime: string;
  busPlate: string;
  busModel: string;
  type: 'Standard' | 'Comfort' | 'Luxury';
  status: TripStatus;
}

export interface Booking {
  id: string;
  tripId: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  status: BookingStatus;
  seatNumber: number;
  timestamp: string;
  qrCode?: string;
}

export enum NotificationType {
  BOOKING_APPROVED = 'booking_approved',
  BOOKING_REJECTED = 'booking_rejected',
  BOOKING_REQUEST = 'booking_request',
  TRIP_UPDATED = 'trip_updated'
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}
