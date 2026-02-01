import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type Hotel, type Room, type HotelWithRooms, type InsertHotel, type InsertRoom } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// === HOTELS ===

export function useHotels() {
  return useQuery({
    queryKey: [api.hotels.list.path],
    queryFn: async () => {
      const res = await fetch(api.hotels.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch hotels");
      return api.hotels.list.responses[200].parse(await res.json());
    },
  });
}

export function useHotel(id: number) {
  return useQuery({
    queryKey: [api.hotels.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.hotels.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch hotel");
      return api.hotels.get.responses[200].parse(await res.json());
    },
    enabled: !isNaN(id),
  });
}

export function useCreateHotel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertHotel) => {
      // Ensure numeric fields are numbers
      const payload = {
        ...data,
        rating: Number(data.rating),
        minPrice: Number(data.minPrice),
      };
      
      const validated = api.hotels.create.input.parse(payload);
      
      const res = await fetch(api.hotels.create.path, {
        method: api.hotels.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        if (res.status === 401) {
          throw new Error("Unauthorized");
        }
        throw new Error("Failed to create hotel");
      }
      return api.hotels.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.hotels.list.path] });
      toast({ title: "Success", description: "Hotel created successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to create hotel", 
        variant: "destructive" 
      });
    },
  });
}

// === ROOMS ===

export function useCreateRoom() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ hotelId, ...data }: InsertRoom & { hotelId: number }) => {
      // Ensure numeric fields are numbers
      const payload = {
        ...data,
        capacity: Number(data.capacity),
        price: Number(data.price),
      };

      const validated = api.rooms.create.input.parse(payload);
      const url = buildUrl(api.rooms.create.path, { id: hotelId });

      const res = await fetch(url, {
        method: api.rooms.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to create room");
      }
      return api.rooms.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific hotel to refresh room list
      queryClient.invalidateQueries({ queryKey: [api.hotels.get.path, variables.hotelId] });
      toast({ title: "Success", description: "Room added successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to add room", 
        variant: "destructive" 
      });
    },
  });
}
