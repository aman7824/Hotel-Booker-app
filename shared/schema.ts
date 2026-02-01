import { pgTable, text, serial, integer, boolean, timestamp, date, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const hotels = pgTable("hotels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  imageUrl: text("image_url").notNull(),
  rating: integer("rating").default(0), // 1-5
  minPrice: integer("min_price").notNull(), // stored in cents or base currency unit
  createdAt: timestamp("created_at").defaultNow(),
});

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  hotelId: integer("hotel_id").references(() => hotels.id).notNull(),
  name: text("name").notNull(), // e.g. "Deluxe Suite"
  type: text("type").notNull(), // Single, Double, Suite
  capacity: integer("capacity").notNull(),
  price: integer("price").notNull(), // per night
  available: boolean("available").default(true),
  imageUrl: text("image_url"),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // References auth.users.id (which is uuid string)
  roomId: integer("room_id").references(() => rooms.id).notNull(),
  checkIn: timestamp("check_in").notNull(),
  checkOut: timestamp("check_out").notNull(),
  totalPrice: integer("total_price").notNull(),
  status: text("status").default("confirmed"), // confirmed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===

export const insertHotelSchema = createInsertSchema(hotels).omit({ id: true, createdAt: true });
export const insertRoomSchema = createInsertSchema(rooms).omit({ id: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true, status: true, totalPrice: true });

// === TYPES ===

export type Hotel = typeof hotels.$inferSelect;
export type InsertHotel = z.infer<typeof insertHotelSchema>;

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

// API Request Types
export type CreateBookingRequest = {
  roomId: number;
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
};

export type HotelWithRooms = Hotel & { rooms: Room[] };
export type BookingWithDetails = Booking & { room: Room; hotel: Hotel };
