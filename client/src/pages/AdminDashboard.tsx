import { useAuth } from "@/hooks/use-auth";
import { useCreateHotel, useCreateRoom, useHotels } from "@/hooks/use-hotels";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertHotelSchema, insertRoomSchema, type InsertHotel, type InsertRoom } from "@shared/routes";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Building2, BedDouble } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: hotels } = useHotels();
  const { mutate: createHotel, isPending: isCreatingHotel } = useCreateHotel();
  const { mutate: createRoom, isPending: isCreatingRoom } = useCreateRoom();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Button asChild><a href="/api/login">Admin Login</a></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage hotels and rooms inventory.</p>
        </div>
      </div>

      <Tabs defaultValue="hotel" className="w-full">
        <TabsList className="mb-8 w-full md:w-auto grid grid-cols-2 h-12">
          <TabsTrigger value="hotel" className="text-base">Add Hotel</TabsTrigger>
          <TabsTrigger value="room" className="text-base">Add Room</TabsTrigger>
        </TabsList>

        <TabsContent value="hotel">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>New Hotel Listing</CardTitle>
                  <CardDescription>Add a new property to the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                  <HotelForm onSubmit={createHotel} isLoading={isCreatingHotel} />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Existing Hotels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {hotels?.map(hotel => (
                      <div key={hotel.id} className="p-3 bg-background rounded-lg border text-sm flex items-center justify-between">
                        <span className="font-medium truncate">{hotel.name}</span>
                        <span className="text-xs text-muted-foreground">{hotel.id}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="room">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Add Room</CardTitle>
                  <CardDescription>Add a room type to an existing hotel.</CardDescription>
                </CardHeader>
                <CardContent>
                  <RoomForm 
                    onSubmit={createRoom} 
                    isLoading={isCreatingRoom} 
                    hotels={hotels || []} 
                  />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BedDouble className="h-5 w-5 text-muted-foreground" />
                    Room Management
                  </CardTitle>
                  <CardDescription>
                    Rooms are linked to specific hotels. Make sure to select the correct parent hotel.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// === FORMS ===

function HotelForm({ onSubmit, isLoading }: { onSubmit: (data: InsertHotel) => void, isLoading: boolean }) {
  const form = useForm<InsertHotel>({
    resolver: zodResolver(insertHotelSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      imageUrl: "",
      rating: 0,
      minPrice: 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hotel Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Grand Plaza" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St, City" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the property..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="minPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating (1-5)</FormLabel>
                <FormControl>
                  <Input type="number" max={5} min={1} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Create Hotel
        </Button>
      </form>
    </Form>
  );
}

function RoomForm({ onSubmit, isLoading, hotels }: { onSubmit: (data: any) => void, isLoading: boolean, hotels: any[] }) {
  // Extending schema with hotelId for selection
  const formSchema = insertRoomSchema.extend({
    hotelId: z.coerce.number(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hotelId: 0,
      name: "",
      type: "Double",
      capacity: 2,
      price: 100,
      imageUrl: "",
      available: true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="hotelId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Hotel</FormLabel>
              <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a hotel" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {hotels.map((hotel) => (
                    <SelectItem key={hotel.id} value={hotel.id.toString()}>
                      {hotel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Ocean View Suite" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Type</FormLabel>
                <FormControl>
                  <Input placeholder="Single, Double, Suite..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price per Night ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity (Guests)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Add Room
        </Button>
      </form>
    </Form>
  );
}
