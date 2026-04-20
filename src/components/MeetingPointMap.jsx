import React from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet marker icon 404 bug
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom black circular dot marker
const meetingIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:36px;height:36px;background:#222;border-radius:50%;
    border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);
    display:flex;align-items:center;justify-content:center;">
    <div style="width:10px;height:10px;background:white;border-radius:50%;"></div>
  </div>`,
  iconSize:   [36, 36],
  iconAnchor: [18, 18],
});

/**
 * MeetingPointMap
 * @param {{ lat: number, lng: number, address: string }} props
 */
export default function MeetingPointMap({ lat, lng, address }) {
  if (!lat || !lng) return null;

  return (
    <div className="py-8 border-b border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold dark:text-white mb-2">Where we'll meet</h2>
      {address && (
        <p className="text-gray-500 dark:text-gray-400 mb-5">{address}</p>
      )}
      <div style={{ borderRadius: 12, overflow: 'hidden', height: 400, width: '100%' }}>
        <MapContainer
          center={[lat, lng]}
          zoom={14}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <Marker position={[lat, lng]} icon={meetingIcon}>
            <Tooltip permanent direction="bottom" offset={[0, 10]} opacity={1}
              className="leaflet-meeting-tooltip">
              Meeting point
            </Tooltip>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
