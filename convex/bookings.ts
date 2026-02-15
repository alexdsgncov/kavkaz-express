
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getBookingsForTrip = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();
  },
});

export const createBooking = mutation({
  args: {
    tripId: v.id("trips"),
    passengerId: v.string(),
    passengerName: v.string(),
    passengerPhone: v.string(),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip || trip.availableSeats <= 0) throw new Error("Нет мест");

    const bookingId = await ctx.db.insert("bookings", {
      ...args,
      status: "pending",
      timestamp: new Date().toISOString(),
    });

    await ctx.db.patch(args.tripId, {
      availableSeats: trip.availableSeats - 1,
    });

    return bookingId;
  },
});

export const updateBookingStatus = mutation({
  args: { id: v.id("bookings"), status: v.string() },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.id);
    if (!booking) return;

    await ctx.db.patch(args.id, { status: args.status });

    if (args.status === "cancelled" || args.status === "rejected") {
      const trip = await ctx.db.get(booking.tripId);
      if (trip) {
        await ctx.db.patch(booking.tripId, {
          availableSeats: trip.availableSeats + 1,
        });
      }
    }
  },
});
