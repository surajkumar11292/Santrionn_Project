/* Theme: Editorial Linen & Forest Green (suraj-portfolio-io.vercel.app)
 * Disaster Spatial Radar - Clean Cartography
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
        center: [20.5937, 78.9629], // Centered default
        zoom: 5,
        zoomControl: true
      });

      // OpenStreetMap (Free, Full Detailed Global & India Cartography, No API Key Required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
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
            ? '#b91c1c'
            : disaster.status === 'monitoring'
            ? '#b45309'
            : '#1b4332';

        // Clean Pin with White Border & Soft Drop
        const customIcon = L.divIcon({
          className: 'editorial-pin',
          html: `
            <div style="
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: ${markerColor};
              border: 3px solid #ffffff;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
              cursor: pointer;
            "></div>
          `,
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

        // Clean Popup Card
        const popupContent = `
          <div style="
            background: #ffffff;
            color: #1a1a1a;
            padding: 18px;
            min-width: 220px;
          ">
            <div style="
              display: inline-flex;
              align-items: center;
              gap: 6px;
              font-family: 'JetBrains Mono', monospace;
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 0.06em;
              color: ${markerColor};
              margin-bottom: 6px;
              text-transform: uppercase;
            ">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: ${markerColor};"></span>
              ${disaster.status} · [${lat.toFixed(3)}, ${lng.toFixed(3)}]
            </div>
            <div style="
              font-family: 'Roboto', sans-serif;
              font-size: 18px;
              font-weight: 400;
              color: #1a1a1a;
              margin-bottom: 4px;
              line-height: 1.25;
            ">
              ${disaster.title}
            </div>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 12px;">
              📍 ${disaster.location?.name || 'Unspecified Epicenter'}
            </div>
            <button id="btn-${disaster.id}" class="btn-forest" style="
              width: 100%;
              padding: 7px 14px;
              font-size: 12px;
              font-weight: 600;
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
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [disasters, onSelectDisaster]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 75px)', overflow: 'hidden' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
