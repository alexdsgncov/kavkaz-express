
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    fullName: v.string(),
    phoneNumber: v.string(),
    role: v.string(), // 'passenger' | 'driver'
    avatarUrl: v.optional(v.string()),
  }).index("by_phone", ["phoneNumber"]),

  trips: defineTable({
    driverId: v.string(),
    date: v.string(),
    price: v.number(),
    totalSeats: v.number(),
    availableSeats: v.number(),
    from: v.string(),
    to: v.string(),
    departureTime: v.string(),
    arrivalTime: v.string(),
    busPlate: v.string(),
    busModel: v.string(),
    status: v.string(), // 'scheduled' | 'boarding' | 'en_route' | 'arrived' | 'cancelled'
  }).index("by_date", ["date"]),

  bookings: defineTable({
    tripId: v.id("trips"),
    passengerId: v.string(),
    passengerName: v.string(),
    passengerPhone: v.string(),
    status: v.string(), // 'pending' | 'approved' | 'rejected' | 'cancelled'
    timestamp: v.string(),
  }).index("by_trip", ["tripId"]).index("by_passenger", ["passengerId"]),
});
