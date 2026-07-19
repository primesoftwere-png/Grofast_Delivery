'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';

// Fix for default marker icons in Leaflet with Next.js
const customIcon = (iconUrl) => new L.Icon({
  iconUrl: iconUrl,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Function to generate dynamic icon with rotation
const getDeliveryBoyIcon = (heading) => new L.divIcon({
  className: 'bg-transparent border-none',
  html: `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); transition: transform 0.3s ease;">
      <div class="animate-ping absolute w-full h-full rounded-full bg-sky-400 opacity-75"></div>
      <div class="relative w-6 h-6 rounded-full bg-sky-500 border-2 border-white shadow-sm flex items-center justify-center">
        <div style="width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-bottom: 8px solid white; transform: translateY(-3px);"></div>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

function Routing({ source, destination }) {
  const map = useMap();

  useEffect(() => {
    // Ensure map and its control corners are initialized before adding routing
    if (!source || !destination || !map || !map._controlCorners) return;
    
    // Clear existing routing controls if they exist to prevent duplicates
    if (map.routingControl) {
      try {
        map.removeControl(map.routingControl);
      } catch (e) {
        console.warn("Could not remove existing routing control", e);
      }
    }

    let routingControl = null;

    try {
      routingControl = L.Routing.control({
        waypoints: [
          L.latLng(source[0], source[1]),
          L.latLng(destination[0], destination[1])
        ],
        routeWhileDragging: false,
        showAlternatives: false,
        addWaypoints: false,
        createMarker: function() { return null; }, // We handle our own markers
        lineOptions: {
          styles: [{ color: '#3b82f6', weight: 5, opacity: 0.8 }]
        },
        fitSelectedRoutes: false,
        show: false, // hide the text instructions box
      }).addTo(map);

      map.routingControl = routingControl;
    } catch (e) {
      console.error("Routing error:", e);
    }

    return () => {
      if (routingControl && map && map._controlCorners) {
        try {
          map.removeControl(routingControl);
          if (map.routingControl === routingControl) {
            map.routingControl = null;
          }
        } catch (e) {
          // Ignore cleanup errors during unmount
        }
      }
    };
  }, [source, destination, map]);

  return null;
}

export default function MapComponent({ shopLocation, customerLocation, orderStatus, onLocationUpdate }) {
  const [isMounted, setIsMounted] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const prevLocationRef = useRef(null);

  // Helper to calculate heading between two points
  const calculateHeading = (lat1, lon1, lat2, lon2) => {
    const toRadians = (degree) => degree * (Math.PI / 180);
    const toDegrees = (radian) => radian * (180 / Math.PI);

    const dLon = toRadians(lon2 - lon1);
    const rLat1 = toRadians(lat1);
    const rLat2 = toRadians(lat2);

    const y = Math.sin(dLon) * Math.cos(rLat2);
    const x = Math.cos(rLat1) * Math.sin(rLat2) - Math.sin(rLat1) * Math.cos(rLat2) * Math.cos(dLon);
    
    let brng = toDegrees(Math.atan2(y, x));
    return (brng + 360) % 360;
  };

  useEffect(() => {
    setIsMounted(true);
    
    // Start tracking delivery boy live location
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, heading: nativeHeading, speed, accuracy } = position.coords;
          const loc = [latitude, longitude];
          
          let currentHeading = nativeHeading || 0;

          // If native heading is not available, calculate it from previous position
          if (!nativeHeading && prevLocationRef.current) {
            const [prevLat, prevLng] = prevLocationRef.current;
            // Only calculate if moved at least a little bit (e.g. > 0.00001 deg) to avoid jitter
            if (Math.abs(latitude - prevLat) > 0.00001 || Math.abs(longitude - prevLng) > 0.00001) {
              currentHeading = calculateHeading(prevLat, prevLng, latitude, longitude);
            } else {
              currentHeading = heading; // keep old heading if didn't move much
            }
          }

          prevLocationRef.current = loc;
          setCurrentLocation(loc);
          setHeading(currentHeading);

          if (onLocationUpdate) {
            // Pass extra details to onLocationUpdate
            onLocationUpdate(loc, { heading: currentHeading, speed, accuracy });
          }
        },
        (error) => {
          console.error("Error watching position", error);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [heading, onLocationUpdate]);

  if (!isMounted) return <div className="w-full h-80 bg-muted rounded-xl animate-pulse"></div>;

  // Determine which location to show based on order status
  // If not picked up -> show shop location
  // If picked up -> show customer location
  
  const isPickedUp = orderStatus === 'OUT_FOR_DELIVERY' || orderStatus === 'out_for_delivery' || orderStatus === 'DELIVERED' || orderStatus === 'delivered';
  
  let targetLocation = null;
  let targetIcon = null;
  let targetTitle = "";

  if (isPickedUp) {
    if (customerLocation && (customerLocation.lat || customerLocation.latitude) && (customerLocation.lng || customerLocation.longitude)) {
      targetLocation = [
        customerLocation.lat || customerLocation.latitude, 
        customerLocation.lng || customerLocation.longitude
      ];
      targetIcon = customIcon('/customer.png'); // Customer/Home icon
      targetTitle = "Customer Location";
    }
  } else {
    if (shopLocation && shopLocation.latitude && shopLocation.longitude) {
      targetLocation = [shopLocation.latitude, shopLocation.longitude];
      targetIcon = customIcon('/shop.png'); // Shop icon
      targetTitle = "Shop Location";
    }
  }

  // Fallback location if none is available (e.g., center of India)
  const defaultLocation = [20.5937, 78.9629]; 
  const center = currentLocation || targetLocation || defaultLocation;

  return (
    <div className="w-full h-80 rounded-xl overflow-hidden border border-border/50 relative z-0">
      <MapContainer 
        center={center} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Delivery Boy Live Location Marker */}
        {currentLocation && (
          <Marker position={currentLocation} icon={getDeliveryBoyIcon(heading)}>
            <Tooltip direction="top" offset={[0, -12]} opacity={1} className="font-medium text-sm">
              Your Location
            </Tooltip>
            <Popup>Your Location</Popup>
          </Marker>
        )}
        
        {/* Target Destination Marker */}
        {targetLocation && (
          <Marker position={targetLocation} icon={targetIcon}>
            <Tooltip direction="top" offset={[0, -20]} opacity={1} className="font-medium text-sm">
              {targetTitle}
            </Tooltip>
            <Popup>{targetTitle}</Popup>
          </Marker>
        )}
        
        {/* Routing from Delivery Boy to Target */}
        {currentLocation && targetLocation && (
          <Routing source={currentLocation} destination={targetLocation} />
        )}
      </MapContainer>
    </div>
  );
}
