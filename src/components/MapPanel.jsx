// 설치:
// npm install react-leaflet leaflet

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Papa from 'papaparse/papaparse.js';
import { useEffect, useState } from 'react';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const CSV_URL = '/dock_code.csv';

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
    [35.0055, 128.8696], // SW 코너
    [35.1562, 129.0401], // NE 코너
];

function MapPanel() {
    const [dockData, setDockData] = useState({});

    useEffect(() => {
        fetch(CSV_URL)
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.text();
          })
          .then((csvText) => {
            // Papa.parse로 CSV 파싱
            Papa.parse(csvText, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => {
                const data = {};
                results.data.forEach((row) => {
                  const { PRT_AT_CODE, FAC_CODE, FAC_CODE_NM } = row;
                  if (!data[PRT_AT_CODE]) data[PRT_AT_CODE] = {};
                  // FAC_CODE_NM에 공백이 있어도 문자열로 안전하게 파싱
                  data[PRT_AT_CODE][FAC_CODE] = FAC_CODE_NM;
                });
                setDockData(data);
                console.log('Dock Data:', data);
              },
              error: (err) => console.error('CSV parsing error:', err),
            });
          })
          .catch((err) => console.error('Fetch error:', err));
      }, []);

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
