

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
  { name: '감천항', code: '021', position: [35.0832, 128.9982] },
  { name: '부산북항', code: '020', position: [35.1033, 129.0426] },
  { name: '부산신항', code: '022', position: [35.0773, 128.8331] },
];

// Bounds: [[minLat, minLng], [maxLat, maxLng]]
const bounds = [
  [35.0055, 128.8696], // SW 코너
  [35.1562, 129.0401], // NE 코너
];

const colors = ['#4A90E2', '#50E3C2', '#F5A623'];

function MapPanel({ vesselData, containerData, selectedDate, onPortClick, selectedPortCode }) {
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
      <MapContainer bounds={bounds} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO contributors'
        />

        {locations.map((loc, idx) => {
          // 날짜 필터링 후 ton 계산(생략)…
          // radius, fillColor 계산(생략)…

          // 클릭 이벤트 핸들러
          const handlers = {
            click: () => onPortClick(loc.code),
          };

          // 데이터 있을 때 CircleMarker
          if (!isEmpty && selectedDate) {
            // ton, radius, fillColor 계산했다고 가정
            const year = String(selectedDate.year);
            const month = String(selectedDate.month).padStart(2, '0');
            const ton = loc.tons?.[year]?.[month] || 0;
            const radius = ton > 0
              ? Math.max(4, Math.sqrt(ton / 5000) * 4)
              : 4;
            const fillColor = colors[idx % colors.length];

            return (
              <CircleMarker
                key={loc.code}
                center={loc.position}
                radius={radius}
                fillColor={fillColor}
                fillOpacity={0.6}
                stroke={false}
                eventHandlers={handlers}       // ← 클릭 시 코드 전달
              >
                <Popup>
                  {`${loc.name} — ${selectedDate.year}년 ${selectedDate.month}월: ${ton}톤`}
                </Popup>
              </CircleMarker>
            );
          }

          // 데이터 없을 때 일반 Marker
          return (
            <Marker
              key={loc.code}
              position={loc.position}
              eventHandlers={handlers}         // ← 클릭 시 코드 전달
            >
              <Popup>{loc.name}</Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default MapPanel;
