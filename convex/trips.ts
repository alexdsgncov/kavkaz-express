
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getTrips = query({
  args: { date: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let trips = await ctx.db.query("trips").collect();
    if (args.date) {
      trips = trips.filter(t => t.date.startsWith(args.date!));
    }
    return trips;
  },
});

export const createTrip = mutation({
  args: {
    driverId: v.string(),
    date: v.string(),
    price: v.number(),
    totalSeats: v.number(),
    from: v.string(),
    to: v.string(),
    departureTime: v.string(),
    arrivalTime: v.string(),
    busPlate: v.string(),
    busModel: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("trips", {
      ...args,
      availableSeats: args.totalSeats,
      status: "scheduled",
    });
  },
});

export const updateTripStatus = mutation({
  args: { id: v.id("trips"), status: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const deleteTrip = mutation({
  args: { id: v.id("trips") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
