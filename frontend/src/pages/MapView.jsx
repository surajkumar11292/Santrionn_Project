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
      // Initialize Leaflet map instance
      const map = L.map(mapContainerRef.current, {
        center: [39.8283, -98.5795], // Center of US
        zoom: 4,
        zoomControl: true
      });

      // Dark Matter CartoDB tile layer for mission-control aesthetic
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
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

        // Custom pulsing SVG circle marker
        const customIcon = L.divIcon({
          className: 'disaster-map-pin',
          html: `
            <div style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: ${markerColor};
              border: 3px solid #ffffff;
              box-shadow: 0 0 16px ${markerColor};
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 11px;
              font-weight: 800;
              cursor: pointer;
            ">
              !
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

        // Popup with Incident Summary and Action Button
        const popupContent = `
          <div style="color: #070d1a; font-family: sans-serif; padding: 4px; min-width: 200px;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: ${markerColor}; margin-bottom: 2px;">
              ${disaster.status}
            </div>
            <strong style="font-size: 14px; display: block; margin-bottom: 4px;">${disaster.title}</strong>
            <div style="font-size: 12px; color: #475569; margin-bottom: 8px;">📍 ${disaster.location?.name || ''}</div>
            <button id="btn-${disaster.id}" style="
              width: 100%;
              padding: 6px 10px;
              background: #0f172a;
              color: white;
              border: none;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
            ">
              View Intel & Resources
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-${disaster.id}`);
          if (btn) {
            btn.onclick = () => onSelectDisaster(disaster);
          }
        });

        markersRef.current.push(marker);
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [disasters, onSelectDisaster]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 65px)', overflow: 'hidden' }}>
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Info Overlay */}
      <div style={{
        position: 'absolute',
        top: 'var(--space-4)',
        left: 'var(--space-4)',
        background: 'var(--color-bg-glass)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3) var(--space-4)',
        zIndex: 1000,
        boxShadow: 'var(--shadow-md)',
        maxWidth: '320px'
      }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          🗺️ PostGIS Geospatial Overview
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
          Tracking {disasters.length} incident epicenters with ST_DWithin radius querying.
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)', fontSize: '0.75rem' }}>
          <span style={{ color: '#ef4444' }}>● Active</span>
          <span style={{ color: '#f59e0b' }}>● Monitoring</span>
          <span style={{ color: '#10b981' }}>● Resolved</span>
        </div>
      </div>
    </div>
  );
}
