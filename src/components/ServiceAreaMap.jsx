import React from 'react';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet marker icon 404 bug
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/**
 * ServiceAreaMap – shows the service coverage zone as a dashed filled circle.
 * @param {{ lat: number, lng: number, radiusMeters: number }} props
 */
export default function ServiceAreaMap({ lat, lng, radiusMeters = 15000 }) {
  if (!lat || !lng) return null;

  return (
    <div className="py-8 border-b border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold dark:text-white mb-2">I'll come to you</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-5">
        I travel to guests in the area outlined on the map. To book in a different location, you can message me.
      </p>
      <div style={{ borderRadius: 12, overflow: 'hidden', height: 400, width: '100%' }}>
        <MapContainer
          center={[lat, lng]}
          zoom={10}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <Circle
            center={[lat, lng]}
            radius={radiusMeters}
            pathOptions={{
              color:       '#555',
              weight:       1.5,
              dashArray:   '6, 4',
              fillColor:   '#888',
              fillOpacity: 0.18,
            }}
          />
        </MapContainer>
      </div>
    </div>
  );
}
