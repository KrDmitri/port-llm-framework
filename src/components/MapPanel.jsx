

import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
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
  { name: '감천항 21(Gamcheon Port)', position: [35.0832, 128.9982] },
  { name: '부산북항부두 20(Busan North Port / Busan Bukhang)', position: [35.1033, 129.0426] },
  { name: '부산신항 22(Busan New Port / Busan Sinhang)', position: [35.0773, 128.8331] },
];

// Bounds: [[minLat, minLng], [maxLat, maxLng]]
const bounds = [
  [35.0055, 128.8696], // SW 코너
  [35.1562, 129.0401], // NE 코너
];

const colors = ['#4A90E2', '#50E3C2', '#F5A623'];

function MapPanel({ vesselData, containerData, selectedDate }) {
  // console.log('MapPanel - selectedDate:', selectedDate);

  const [dockData, setDockData] = useState({});
  const [csvRows, setCsvRows] = useState([]);

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
            // console.log('Dock Data:', data);
          },
          error: (err) => console.error('CSV parsing error:', err),
        });
      })
      .catch((err) => console.error('Fetch error:', err));
  }, []);

  // vesselData(File 또는 배열) 파싱 및 공백 제거
  useEffect(() => {
    const cleanRows = rows => rows.map(r => {
      const cleaned = {};
      Object.keys(r).forEach(key => {
        const trimmedKey = key.trim();
        let val = r[key];
        if (typeof val === 'string') val = val.trim();
        cleaned[trimmedKey] = val;
      });
      return cleaned;
    });

    if (vesselData instanceof File) {
      Papa.parse(vesselData, {
        header: true,
        skipEmptyLines: true,
        complete: ({ data, errors }) => {
          if (errors.length) console.error(errors);
          setCsvRows(cleanRows(data));
        }
      });
    } else if (Array.isArray(vesselData)) {
      setCsvRows(cleanRows(vesselData));
    } else {
      setCsvRows([]);
    }
  }, [vesselData]);

  // console.log('vesselData:', vesselData);

  const aggregated = useMemo(() => {
    return csvRows.reduce((acc, row) => {
      const code = row['청코드'];
      const year = row['년'];
      const month = row['월'];
      const ton = Number(row['총톤수']) || 0;
      if (!code || !year || !month) return acc;
      acc[code] = acc[code] || {};
      acc[code][year] = acc[code][year] || {};
      acc[code][year][month] = (acc[code][year][month] || 0) + ton;
      return acc;
    }, {});
  }, [csvRows]);

  // console.log('Aggregated Data:', JSON.stringify(aggregated, null, 2));

  for (const key in aggregated) {
    // console.log(`Key: ${key}`);
    // console.log('Value:', aggregated[key]);
    if (key === '020') {
      locations[1].tons = aggregated[key];
    } else if (key === '021') {
      locations[0].tons = aggregated[key];
    } else if (key === '022') {
      locations[2].tons = aggregated[key];
    }
  }

  const isEmpty = Object.keys(aggregated).length === 0;

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

        {/* {locations.map((loc, idx) => (
          <Marker key={idx} position={loc.position}>
            {Object.keys(aggregated).length !== 0 ? (
              <Popup>{loc.tons["2023"]["09"]}</Popup>
            ) : (
              <Popup>{loc.name}</Popup>
            )}
          </Marker>
        ))} */}

        {locations.map((loc, idx) => {


          if (!isEmpty && selectedDate) {

            const yearKey = String(selectedDate.year);
            const monthKey = String(selectedDate.month).padStart(2, '0');
            const ton = loc.tons?.[yearKey]?.[monthKey] ?? 0;

            // console.log('Selected Date:', selectedDate);
            // const ton = loc.tons["2023"]["09"];

            // 백만 단위로 스케일링
            const tonInMillions = ton / 5000;
            const radius = ton > 0
              // √(백만톤 단위) * 4, 최소 4px
              ? Math.max(4, Math.sqrt(tonInMillions) * 4)
              : 4;

            const fillColor = colors[idx % colors.length];

            // aggregated 데이터가 있으면 CircleMarker
            return (
              <CircleMarker
                key={idx}
                center={loc.position}
                radius={radius}
                fillColor={fillColor}
                fillOpacity={0.6}
                stroke={false}
              >
                <Popup>
                  {`${loc.name} — 2023년 09월: ${ton}톤`}
                </Popup>
              </CircleMarker>
            );
          } else {
            // 데이터가 없으면 기본 Marker
            return (
              <Marker key={idx} position={loc.position}>
                <Popup>{loc.name}</Popup>
              </Marker>
            );
          }
        })}


      </MapContainer>
    </div>
  );
}

export default MapPanel;
