import { useBookings, useCancelBooking } from "@/hooks/use-bookings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, Calendar, MapPin, BedDouble, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Bookings() {
  const { data: bookings, isLoading } = useBookings();
  const { user } = useAuth();
  const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
        <p className="text-muted-foreground mb-6">You need to be logged in to view your bookings.</p>
        <Button asChild>
          <a href="/api/login">Sign In</a>
        </Button>
      </div>
    );
  }

  const upcomingBookings = bookings?.filter(b => b.status !== 'cancelled' && new Date(b.checkIn) >= new Date()) || [];
  const pastBookings = bookings?.filter(b => b.status !== 'cancelled' && new Date(b.checkIn) < new Date()) || [];
  const cancelledBookings = bookings?.filter(b => b.status === 'cancelled') || [];

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-3xl font-display font-bold mb-8">My Bookings</h1>

      <div className="space-y-12">
        {/* Upcoming */}
        <section>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Stays
          </h2>
          {upcomingBookings.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingBookings.map((booking) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  onCancel={(id) => cancelBooking(id)}
                  isCancelling={isCancelling}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
              <p className="text-muted-foreground">You have no upcoming bookings.</p>
              <Link href="/">
                <Button variant="link" className="mt-2 text-primary">Find a hotel</Button>
              </Link>
            </div>
          )}
        </section>

        {/* Past */}
        {pastBookings.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-6 text-muted-foreground">Past Stays</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-80 hover:opacity-100 transition-opacity">
              {pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} isPast />
              ))}
            </div>
          </section>
        )}

        {/* Cancelled */}
        {cancelledBookings.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-6 text-destructive/80">Cancelled</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-60">
              {cancelledBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} isCancelled />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function BookingCard({ booking, onCancel, isCancelling, isPast, isCancelled }: any) {
  return (
    <Card className="flex flex-col sm:flex-row overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300">
      <div className="w-full sm:w-48 h-48 sm:h-auto relative bg-muted">
        <img 
          src={booking.room.imageUrl || booking.hotel.imageUrl} 
          alt={booking.hotel.name}
          className="w-full h-full object-cover" 
        />
        {isCancelled && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold uppercase tracking-widest border-2 border-white px-4 py-1 rounded">Cancelled</span>
          </div>
        )}
      </div>
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-lg">{booking.hotel.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {booking.hotel.address}
              </div>
            </div>
            {!isCancelled && !isPast && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmed</Badge>
            )}
            {isPast && <Badge variant="secondary">Completed</Badge>}
          </div>

          <div className="flex items-center gap-2 mt-4 text-sm font-medium">
            <BedDouble className="h-4 w-4 text-primary" />
            {booking.room.name}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Check-in</p>
              <p className="font-semibold">{format(new Date(booking.checkIn), "MMM dd, yyyy")}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Check-out</p>
              <p className="font-semibold">{format(new Date(booking.checkOut), "MMM dd, yyyy")}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div>
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Total Paid</span>
            <p className="text-lg font-bold">${booking.totalPrice}</p>
          </div>
          
          {!isPast && !isCancelled && onCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  Cancel Booking
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Reservation?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel your stay at {booking.hotel.name}?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep it</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onCancel(booking.id)}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    Yes, Cancel
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </Card>
  );
}
