// 설치:
// npm install react-leaflet leaflet

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default marker icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// 포트 위치 데이터
const locations = [
    { name: '감천항 (Gamcheon Port)', position: [35.0832, 128.9982] },
    { name: '부산북항부두 (Busan North Port / Busan Bukhang)', position: [35.1033, 129.0426] },
    { name: '부산신항 (Busan New Port / Busan Sinhang)', position: [35.0773, 128.8331] },
];

// Bounds: [[minLat, minLng], [maxLat, maxLng]]
const bounds = [
    [35.0455, 128.7696], // SW 코너
    [35.1062, 129.0401], // NE 코너
];

function MapPanel() {
    return (
        <div style={{ height: '100%', width: '100%' }}>
            <MapContainer
                bounds={bounds}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
                />
                {locations.map((loc, idx) => (
                    <Marker key={idx} position={loc.position}>
                        <Popup>{loc.name}</Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

export default MapPanel;
