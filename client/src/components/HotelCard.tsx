import { Link } from "wouter";
import { Hotel } from "@shared/schema";
import { Star, MapPin } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HotelCardProps {
  hotel: Hotel;
}

export function HotelCard({ hotel }: HotelCardProps) {
  return (
    <Card className="group overflow-hidden border-border/50 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="aspect-[4/3] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
        {/* Using the image URL from the hotel object directly, or a fallback */}
        <img 
          src={hotel.imageUrl} 
          alt={hotel.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-foreground shadow-sm">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          {hotel.rating}
        </div>
      </div>
      
      <CardHeader className="p-5 pb-2">
        <h3 className="font-display text-xl font-bold leading-tight group-hover:text-primary transition-colors">
          {hotel.name}
        </h3>
        <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{hotel.address}</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 pt-2 pb-4">
        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
          {hotel.description}
        </p>
      </CardContent>
      
      <CardFooter className="p-5 pt-0 flex items-center justify-between border-t bg-muted/20 mt-auto">
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">From</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-primary">${hotel.minPrice}</span>
            <span className="text-xs text-muted-foreground">/night</span>
          </div>
        </div>
        <Link href={`/hotels/${hotel.id}`}>
          <Button variant="default" size="sm" className="rounded-full px-5 font-semibold">
            View Rooms
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
