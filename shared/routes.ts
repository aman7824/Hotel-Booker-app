import { z } from 'zod';
import { insertHotelSchema, insertRoomSchema, hotels, rooms, bookings } from './schema';

export { insertHotelSchema, insertRoomSchema, hotels, rooms, bookings };

// Error Schemas
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  serverError: z.object({
    message: z.string(),
  })
};

export const api = {
  hotels: {
    list: {
      method: 'GET' as const,
      path: '/api/hotels',
      responses: {
        200: z.array(z.custom<typeof hotels.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/hotels/:id',
      responses: {
        200: z.custom<typeof hotels.$inferSelect & { rooms: typeof rooms.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: { // Admin only
      method: 'POST' as const,
      path: '/api/hotels',
      input: insertHotelSchema,
      responses: {
        201: z.custom<typeof hotels.$inferSelect>(),
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation,
      },
    },
  },
  rooms: {
    create: { // Admin only
      method: 'POST' as const,
      path: '/api/hotels/:id/rooms',
      input: insertRoomSchema.omit({ hotelId: true }),
      responses: {
        201: z.custom<typeof rooms.$inferSelect>(),
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation,
      },
    }
  },
  bookings: {
    list: { // My bookings
      method: 'GET' as const,
      path: '/api/bookings',
      responses: {
        200: z.array(z.custom<typeof bookings.$inferSelect & { room: typeof rooms.$inferSelect, hotel: typeof hotels.$inferSelect }>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/bookings',
      input: z.object({
        roomId: z.number(),
        checkIn: z.string(), // ISO Date
        checkOut: z.string() // ISO Date
      }),
      responses: {
        201: z.custom<typeof bookings.$inferSelect>(),
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation,
      },
    },
    cancel: {
      method: 'POST' as const,
      path: '/api/bookings/:id/cancel',
      responses: {
        200: z.custom<typeof bookings.$inferSelect>(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
