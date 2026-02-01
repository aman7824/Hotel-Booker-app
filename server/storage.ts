import { db } from "./db";
import { hotels, rooms, bookings, type Hotel, type InsertHotel, type Room, type InsertRoom, type Booking, type InsertBooking } from "@shared/schema";
import { eq, and, gt, gte, lt, lte } from "drizzle-orm";

export interface IStorage {
  // Hotels
  getHotels(): Promise<Hotel[]>;
  getHotel(id: number): Promise<Hotel | undefined>;
  createHotel(hotel: InsertHotel): Promise<Hotel>;
  
  // Rooms
  getRooms(hotelId: number): Promise<Room[]>;
  createRoom(room: InsertRoom): Promise<Room>;
  getRoom(id: number): Promise<Room | undefined>;

  // Bookings
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsByUser(userId: string): Promise<(Booking & { room: Room; hotel: Hotel })[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  cancelBooking(id: number): Promise<Booking>;
}

export class DatabaseStorage implements IStorage {
  async getHotels(): Promise<Hotel[]> {
    return await db.select().from(hotels);
  }

  async getHotel(id: number): Promise<Hotel | undefined> {
    const [hotel] = await db.select().from(hotels).where(eq(hotels.id, id));
    return hotel;
  }

  async createHotel(hotel: InsertHotel): Promise<Hotel> {
    const [newHotel] = await db.insert(hotels).values(hotel).returning();
    return newHotel;
  }

  async getRooms(hotelId: number): Promise<Room[]> {
    return await db.select().from(rooms).where(eq(rooms.hotelId, hotelId));
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const [newRoom] = await db.insert(rooms).values(room).returning();
    return newRoom;
  }

  async getRoom(id: number): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getBookingsByUser(userId: string): Promise<(Booking & { room: Room; hotel: Hotel })[]> {
    const rows = await db.select({
      booking: bookings,
      room: rooms,
      hotel: hotels
    })
    .from(bookings)
    .innerJoin(rooms, eq(bookings.roomId, rooms.id))
    .innerJoin(hotels, eq(rooms.hotelId, hotels.id))
    .where(eq(bookings.userId, userId));

    return rows.map(row => ({
      ...row.booking,
      room: row.room,
      hotel: row.hotel
    }));
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async cancelBooking(id: number): Promise<Booking> {
    const [updated] = await db.update(bookings)
      .set({ status: 'cancelled' })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
