import { MapPin, Navigation, Clock, Route } from "lucide-react";

const ManageMap = () => {
  return (
    <div className="p-4">
      <div className="space-y-6 animate-fade-in">

        <h1 className="text-2xl font-display font-bold text-foreground">
          Manage Map
        </h1>

        {/* Map Placeholder */}
        <div className="border border-border/50 rounded-xl overflow-hidden">
          <div className="p-0">

            <div className="relative h-[400px] md:h-[500px] bg-muted flex items-center justify-center">

              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-primary/10" />

              {/* Center Content */}
              <div className="relative text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Navigation className="w-8 h-8 text-primary" />
                </div>

                <p className="text-muted-foreground font-medium">
                  Map View
                </p>

                <p className="text-xs text-muted-foreground">
                  Integrate Google Maps / OpenStreetMap here
                </p>
              </div>

              {/* Route Info Card */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="border border-border/50 rounded-xl shadow-lg bg-background">

                  <div className="p-4">

                    {/* Shop */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-sm font-medium text-foreground">
                          Fresh Mart (Shop)
                        </span>
                      </div>

                      <span className="text-sm text-primary font-semibold">
                        1.2 km
                      </span>
                    </div>

                    {/* Customer */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-accent" />
                        <span className="text-sm font-medium text-foreground">
                          Customer Location
                        </span>
                      </div>

                      <span className="text-sm text-muted-foreground">
                        After pickup
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Route className="w-4 h-4" /> 3.4 km total
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> ETA: 12 min
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-1 text-sm px-3 py-2 rounded-lg bg-primary text-primary-foreground">
                        <Navigation className="w-4 h-4" />
                        Start Navigation
                      </button>

                      <button className="flex-1 flex items-center justify-center gap-1 text-sm px-3 py-2 rounded-lg border border-border">
                        <MapPin className="w-4 h-4" />
                        Complete Delivery
                      </button>
                    </div>

                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ManageMap;