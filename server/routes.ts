import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // --- Auth Setup ---
  await setupAuth(app);
  registerAuthRoutes(app);

  // --- API Routes ---

  // Hotels
  app.get(api.hotels.list.path, async (req, res) => {
    const hotels = await storage.getHotels();
    res.json(hotels);
  });

  app.get(api.hotels.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const hotel = await storage.getHotel(id);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    const rooms = await storage.getRooms(id);
    res.json({ ...hotel, rooms });
  });

  app.post(api.hotels.create.path, isAuthenticated, async (req, res) => {
    // Basic admin check (in a real app, check role/claims)
    // For now, any logged in user can add for demo purposes or we can restrict
    // Let's assume all logged in users can be "admin" for this demo or check email
    try {
      const input = api.hotels.create.input.parse(req.body);
      const hotel = await storage.createHotel(input);
      res.status(201).json(hotel);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Rooms
  app.post(api.rooms.create.path, isAuthenticated, async (req, res) => {
    try {
      const hotelId = Number(req.params.id);
      const input = api.rooms.create.input.parse(req.body);
      const room = await storage.createRoom({ ...input, hotelId });
      res.status(201).json(room);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Bookings
  app.get(api.bookings.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const bookings = await storage.getBookingsByUser(userId);
    res.json(bookings);
  });

  app.post(api.bookings.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.bookings.create.input.parse(req.body);
      const userId = (req.user as any).claims.sub;

      const room = await storage.getRoom(input.roomId);
      if (!room) {
        return res.status(400).json({ message: "Invalid room" });
      }

      // Calculate days
      const start = new Date(input.checkIn);
      const end = new Date(input.checkOut);
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      if (nights <= 0) {
        return res.status(400).json({ message: "Invalid dates" });
      }

      const totalPrice = room.price * nights;

      const booking = await storage.createBooking({
        userId,
        roomId: input.roomId,
        checkIn: start,
        checkOut: end,
        totalPrice,
      });

      res.status(201).json(booking);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post(api.bookings.cancel.path, isAuthenticated, async (req, res) => {
    const id = Number(req.params.id);
    const userId = (req.user as any).claims.sub;
    
    const booking = await storage.getBooking(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId !== userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updated = await storage.cancelBooking(id);
    res.json(updated);
  });

  // --- Seed Data ---
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getHotels();
  if (existing.length === 0) {
    const h1 = await storage.createHotel({
      name: "Grand Plaza Hotel",
      description: "Luxury stay in the heart of the city.",
      address: "123 Main St, New York, NY",
      rating: 5,
      minPrice: 200,
      imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
    });
    await storage.createRoom({
      hotelId: h1.id,
      name: "Executive Suite",
      type: "Suite",
      capacity: 2,
      price: 350,
      imageUrl: "https://images.unsplash.com/photo-1631049307204-6c0b3b44b20a?auto=format&fit=crop&w=800&q=80"
    });
    await storage.createRoom({
      hotelId: h1.id,
      name: "Standard King",
      type: "Double",
      capacity: 2,
      price: 200,
      imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"
    });

    const h2 = await storage.createHotel({
      name: "Seaside Resort",
      description: "Relax by the ocean with stunning views.",
      address: "45 Ocean Dr, Miami, FL",
      rating: 4,
      minPrice: 150,
      imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80"
    });
    await storage.createRoom({
      hotelId: h2.id,
      name: "Ocean View Room",
      type: "Double",
      capacity: 2,
      price: 250,
      imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
    });

    await storage.createHotel({
      name: "Mountain Lodge",
      description: "Cozy cabin vibes with modern amenities.",
      address: "789 Pine Way, Denver, CO",
      rating: 4,
      minPrice: 120,
      imageUrl: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80"
    });
  }
}
