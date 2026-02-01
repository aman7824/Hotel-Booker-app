import { useHotel } from "@/hooks/use-hotels";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { format, addDays, differenceInDays } from "date-fns";
import { MapPin, Star, Users, Check, Wifi, Coffee, Car, Dumbbell, Calendar as CalendarIcon, Loader2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCreateBooking } from "@/hooks/use-bookings";
import { cn } from "@/lib/utils";
import { Room } from "@shared/schema";

export default function HotelDetail() {
  const [, params] = useRoute("/hotels/:id");
  const [, setLocation] = useLocation();
  const id = parseInt(params?.id || "0");
  const { data: hotel, isLoading } = useHotel(id);
  const { user } = useAuth();
  const { mutate: bookRoom, isPending: isBooking } = useCreateBooking();

  const [date, setDate] = useState<{ from: Date; to: Date } | undefined>({
    from: new Date(),
    to: addDays(new Date(), 3),
  });

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hotel not found</h1>
        <Button onClick={() => setLocation("/")}>Go Home</Button>
      </div>
    );
  }

  const handleBooking = () => {
    if (!selectedRoom || !date?.from || !date?.to) return;
    
    bookRoom({
      roomId: selectedRoom.id,
      checkIn: date.from.toISOString(),
      checkOut: date.to.toISOString(),
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        // Maybe redirect to bookings page?
      }
    });
  };

  const nights = date?.from && date?.to ? differenceInDays(date.to, date.from) : 0;
  
  // Amenities Mock
  const amenities = [
    { icon: Wifi, label: "Free Wi-Fi" },
    { icon: Coffee, label: "Breakfast" },
    { icon: Car, label: "Parking" },
    { icon: Dumbbell, label: "Gym" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <div className="relative h-[50vh] min-h-[400px]">
        <img 
          src={hotel.imageUrl} 
          alt={hotel.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-black/40" />
        <div className="absolute top-6 left-6">
          <Button variant="secondary" size="icon" className="rounded-full bg-white/20 backdrop-blur hover:bg-white/40 border-none text-white" onClick={() => setLocation("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 container mx-auto">
          <Badge className="mb-4 bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1">Featured Hotel</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-2 shadow-sm">{hotel.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-white/90">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {hotel.address}
            </div>
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur px-2 py-0.5 rounded-full text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{hotel.rating} Stars</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Description */}
          <section>
            <h2 className="text-2xl font-display font-bold mb-4">About this hotel</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {hotel.description}
            </p>
          </section>

          {/* Amenities */}
          <section>
            <h2 className="text-2xl font-display font-bold mb-6">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {amenities.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <item.icon className="h-5 w-5 text-primary" />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Rooms List */}
          <section>
            <h2 className="text-2xl font-display font-bold mb-6">Available Rooms</h2>
            <div className="space-y-6">
              {hotel.rooms.map((room) => (
                <Card key={room.id} className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 h-48 md:h-auto relative">
                      <img 
                        src={room.imageUrl || "https://images.unsplash.com/photo-1631049307204-6c0b3b44b20a?auto=format&fit=crop&w=800&q=80"} 
                        alt={room.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-xl">{room.name}</h3>
                          <Badge variant="outline" className="font-normal">{room.type}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {room.capacity} Guests
                          </div>
                          <div className="flex items-center gap-1">
                            <Check className="h-4 w-4 text-green-500" />
                            {room.available ? "Available" : "Sold Out"}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <span className="text-2xl font-bold text-primary">${room.price}</span>
                          <span className="text-muted-foreground text-sm">/night</span>
                        </div>
                        
                        <Dialog open={isDialogOpen && selectedRoom?.id === room.id} onOpenChange={(open) => {
                          setIsDialogOpen(open);
                          if (!open) setSelectedRoom(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              onClick={() => setSelectedRoom(room)} 
                              disabled={!room.available}
                              className="px-6 rounded-full font-semibold"
                            >
                              Book Now
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Confirm Reservation</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                              <div className="bg-muted/30 p-4 rounded-lg flex gap-4">
                                <div className="h-20 w-20 rounded-md overflow-hidden bg-muted">
                                  <img src={room.imageUrl || ""} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <h4 className="font-bold">{room.name}</h4>
                                  <p className="text-sm text-muted-foreground">{hotel.name}</p>
                                  <p className="text-sm font-medium mt-1">${room.price} / night</p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium">Select Dates</label>
                                <div className="flex justify-center p-2 border rounded-lg bg-card">
                                  <Calendar
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={setDate}
                                    numberOfMonths={1}
                                    disabled={(date) => date < new Date()}
                                  />
                                </div>
                              </div>

                              <div className="flex justify-between items-center text-sm pt-4 border-t">
                                <span className="text-muted-foreground">Total ({nights} nights)</span>
                                <span className="text-xl font-bold text-primary">${nights * room.price}</span>
                              </div>
                            </div>
                            <DialogFooter>
                              {user ? (
                                <Button 
                                  onClick={handleBooking} 
                                  disabled={isBooking || nights < 1}
                                  className="w-full"
                                >
                                  {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                  Pay ${nights * room.price} & Book
                                </Button>
                              ) : (
                                <Button className="w-full" asChild>
                                  <a href="/api/login">Log in to Book</a>
                                </Button>
                              )}
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar - Sticky Booking Widget (Placeholder functionality) */}
        <div className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/5">
            <h3 className="font-display font-bold text-xl mb-4">Plan Your Stay</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Dates</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal h-12 border-input bg-background hover:bg-muted/20",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd")} - {format(date.to, "LLL dd")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="pt-4 text-xs text-muted-foreground leading-relaxed">
                Select your dates above to see precise pricing. Prices may vary based on season and availability.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
