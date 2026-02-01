import { useHotels } from "@/hooks/use-hotels";
import { HotelCard } from "@/components/HotelCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Loader2 } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { data: hotels, isLoading } = useHotels();
  const [search, setSearch] = useState("");

  const filteredHotels = hotels?.filter(h => 
    h.name.toLowerCase().includes(search.toLowerCase()) || 
    h.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Unsplash image: Luxury hotel lobby/interior */}
          <img 
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Luxury Hotel" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold tracking-wider uppercase mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Premium Experiences
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Discover Your Next <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Perfect Getaway</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Book unique accommodations in the world's most breathtaking locations. 
            From luxury resorts to cozy cabins, find your escape.
          </p>

          {/* Search Bar */}
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl max-w-4xl mx-auto border border-white/20 shadow-2xl animate-in fade-in zoom-in duration-700 delay-300">
            <div className="bg-white rounded-xl p-2 flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Where do you want to go?" 
                  className="pl-12 h-14 border-transparent bg-transparent text-lg focus-visible:ring-0 focus-visible:bg-muted/30 transition-colors"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="w-px bg-border hidden md:block my-2" />
              <div className="flex-1 relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Check-in - Check-out" 
                  className="pl-12 h-14 border-transparent bg-transparent text-lg focus-visible:ring-0 focus-visible:bg-muted/30 transition-colors"
                  disabled // Placeholder for now, would hook up to date picker
                />
              </div>
              <Button size="lg" className="h-14 px-8 rounded-lg text-lg font-semibold shadow-lg shadow-primary/25">
                <Search className="mr-2 h-5 w-5" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="py-24 container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">Featured Destinations</h2>
            <p className="text-muted-foreground max-w-lg">
              Handpicked selection of the highest rated and most luxurious stays available for booking today.
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex">View All</Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredHotels?.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
            {filteredHotels?.length === 0 && (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                No hotels found matching your search.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
