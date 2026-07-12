'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';

// Fix for default marker icons in Leaflet with Next.js
const customIcon = (iconUrl) => new L.Icon({
  iconUrl: iconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const deliveryBoyIcon = customIcon('https://cdn-icons-png.flaticon.com/512/2983/2983088.png');

function Routing({ source, destination }) {
  const map = useMap();

  useEffect(() => {
    if (!source || !destination || !map) return;
    
    // Clear existing routing controls if they exist to prevent duplicates
    if (map.routingControl) {
      map.removeControl(map.routingControl);
    }

    try {
      const routingControl = L.Routing.control({
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
        fitSelectedRoutes: true,
        show: false, // hide the text instructions box
      }).addTo(map);

      map.routingControl = routingControl;
    } catch (e) {
      console.error("Routing error:", e);
    }

    return () => {
      if (map.routingControl) {
        map.removeControl(map.routingControl);
        map.routingControl = null;
      }
    };
  }, [source, destination, map]);

  return null;
}

export default function MapComponent({ shopLocation, customerLocation, orderStatus, onLocationUpdate }) {
  const [isMounted, setIsMounted] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    
    // Start tracking delivery boy live location
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const loc = [position.coords.latitude, position.coords.longitude];
          setCurrentLocation(loc);
          if (onLocationUpdate) {
            onLocationUpdate(loc);
          }
        },
        (error) => {
          console.error("Error watching position", error);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

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
      targetIcon = customIcon('https://cdn-icons-png.flaticon.com/512/3135/3135715.png'); // Customer/Home icon
      targetTitle = "Customer Location";
    }
  } else {
    if (shopLocation && shopLocation.latitude && shopLocation.longitude) {
      targetLocation = [shopLocation.latitude, shopLocation.longitude];
      targetIcon = customIcon('https://cdn-icons-png.flaticon.com/512/3081/3081840.png'); // Shop icon
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
          <Marker position={currentLocation} icon={deliveryBoyIcon}>
            <Popup>Your Location</Popup>
          </Marker>
        )}
        
        {/* Target Destination Marker */}
        {targetLocation && (
          <Marker position={targetLocation} icon={targetIcon}>
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
