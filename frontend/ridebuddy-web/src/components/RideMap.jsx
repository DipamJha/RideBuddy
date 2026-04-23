import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

// Fix for default marker icons in Leaflet + React
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Helper to auto-fit map to markers
const SetBounds = ({ markers }) => {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [markers, map]);
  return null;
};

const RideMap = ({ rides, center = [12.9716, 77.5946], zoom = 12 }) => {
  const markers = rides
    .filter(r => r.fromCoord)
    .map(r => ({
      id: r._id,
      lat: r.fromCoord.lat,
      lng: r.fromCoord.lng,
      ride: r
    }));

  return (
    <div className="w-full h-full rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative z-10">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%", background: "#0F172A" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {markers.map((marker) => (
          <Marker key={marker.id} position={[marker.lat, marker.lng]}>
            <Popup className="premium-popup">
              <div className="p-2 min-w-[150px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🚗</span>
                  <span className="font-bold text-sm">{marker.ride.from} → {marker.ride.to}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-primary">₹{marker.ride.price}</span>
                  <span className="text-slate-400">{marker.ride.time}</span>
                </div>
                <div className="mt-3">
                  <button 
                    onClick={() => window.location.href = `/search?id=${marker.id}`}
                    className="w-full py-2 bg-primary text-brandDark text-[10px] font-black uppercase tracking-widest rounded-lg hover:scale-105 transition-transform"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        <SetBounds markers={markers} />
      </MapContainer>

      {/* Map Overlay Controls */}
      <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-2">
        <div className="glass-card px-3 py-2 rounded-xl border border-white/10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live View
        </div>
      </div>
    </div>
  );
};

export default RideMap;
