/* Hallmark Theme: Aurora (usehallmark.com)
 * Disaster Spatial Radar - Geospatial Intelligence
 */
import React, { useEffect, useRef } from 'react';
import { useDisasterStore } from '../store/disasterStore';
import L from 'leaflet';

export default function MapView({ onSelectDisaster }) {
  const { disasters, fetchDisasters } = useDisasterStore();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    fetchDisasters();
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [39.8283, -98.5795],
        zoom: 4,
        zoomControl: true
      });

      // CartoDB Dark Matter (Tactical Dark Cartography)
      L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
        attribution: '&copy; CARTO &copy; OpenStreetMap contributors',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = [];

    disasters.forEach((disaster) => {
      const lat = disaster.location?.latitude;
      const lng = disaster.location?.longitude;

      if (lat !== undefined && lng !== undefined) {
        bounds.push([lat, lng]);

        const markerColor =
          disaster.status === 'active'
            ? '#ef4444'
            : disaster.status === 'monitoring'
            ? '#f59e0b'
            : '#10b981';

        // High-contrast Aurora Radar Pin
        const customIcon = L.divIcon({
          className: 'aurora-pin',
          html: `
            <div style="
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: ${markerColor};
              border: 2px solid #030d11;
              box-shadow: 0 0 10px ${markerColor}99;
              cursor: pointer;
            "></div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

        // Aurora Hairline Popup
        const popupContent = `
          <div style="
            background: #07171e;
            color: #f0fdfa;
            font-family: 'Geist', sans-serif;
            padding: 8px 6px;
            min-width: 200px;
          ">
            <div style="
              font-family: 'JetBrains Mono', monospace;
              font-size: 10px;
              font-weight: 700;
              color: ${markerColor};
              margin-bottom: 2px;
            ">
              ${disaster.status?.toUpperCase()} · [${lat.toFixed(3)}, ${lng.toFixed(3)}]
            </div>
            <div style="
              font-size: 13px;
              font-weight: 700;
              margin-bottom: 4px;
            ">
              ${disaster.title}
            </div>
            <div style="font-size: 11px; color: #99f6e4; margin-bottom: 8px;">
              📍 ${disaster.location?.name || 'Unspecified Epicenter'}
            </div>
            <button id="btn-${disaster.id}" style="
              width: 100%;
              padding: 5px 8px;
              background: #22d3ee;
              color: #030d11;
              border: none;
              border-radius: 2px;
              font-family: 'Geist', sans-serif;
              font-size: 11px;
              font-weight: 700;
              cursor: pointer;
            ">
              Inspect Dossier →
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-${disaster.id}`);
          if (btn) {
            btn.onclick = () => onSelectDisaster && onSelectDisaster(disaster);
          }
        });

        markersRef.current.push(marker);
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [disasters, onSelectDisaster]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 54px)', overflow: 'hidden' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Tactical HUD Card */}
      <div
        className="aurora-card"
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          padding: '12px 16px',
          zIndex: 1000,
          minWidth: '240px'
        }}
      >
        <div className="mono-label" style={{ color: 'var(--color-accent)', marginBottom: '3px', fontSize: '10px' }}>
          <span className="eyebrow-square" />
          SPATIAL RADAR
        </div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)' }}>
          {disasters.length} Epicenters Tracked
        </div>
        <div style={{ fontSize: '11px', color: 'var(--color-ink-2)', marginTop: '2px' }}>
          PostGIS ST_DWithin spatial proximity radius queries.
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '8px',
          paddingTop: '6px',
          borderTop: '1px solid var(--color-rule)'
        }}>
          <span className="mono-label" style={{ color: 'var(--color-critical)', fontSize: '10px' }}>● ACTIVE</span>
          <span className="mono-label" style={{ color: 'var(--color-warning)', fontSize: '10px' }}>● MONITORING</span>
          <span className="mono-label" style={{ color: 'var(--color-success)', fontSize: '10px' }}>● RESOLVED</span>
        </div>
      </div>
    </div>
  );
}
