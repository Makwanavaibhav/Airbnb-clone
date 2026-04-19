import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// A component to safely re-center map if coordinates change
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const ExperienceMeetingMap = ({ meetingPoint }) => {
  if (!meetingPoint || !meetingPoint.coordinates) return null;

  return (
    <div className="py-12 border-b border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Where we'll meet</h2>
      <div className="mb-6">
        <h3 className="font-semibold text-lg dark:text-white">{meetingPoint.name}</h3>
        <p className="text-gray-600 dark:text-gray-400">{meetingPoint.address}</p>
      </div>
      
      <div className="h-[300px] md:h-[500px] w-full rounded-xl overflow-hidden z-0">
        <MapContainer 
          center={meetingPoint.coordinates} 
          zoom={15} 
          scrollWheelZoom={false}
          className="h-full w-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={meetingPoint.coordinates} />
          <Marker position={meetingPoint.coordinates} icon={customIcon}>
            <Popup>
              <strong>Meeting point</strong><br/>
              {meetingPoint.name}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default ExperienceMeetingMap;
