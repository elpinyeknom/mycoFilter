'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';

interface Reading {
  id: number;
  created_at: string;
  lat: number;
  lng: number;
  image_path: string;
  estimated_ppm: number;
  notes: string | null;
}

const DEFAULT_CENTER: [number, number] = [39.8283, -98.5795]; // continental US centroid

function severityColor(ppm: number): string {
  if (ppm < 50) return '#16a34a'; // green
  if (ppm < 200) return '#eab308'; // yellow
  return '#dc2626'; // red
}

/**
 * react-leaflet only applies MapContainer's center/zoom props on initial mount, so
 * once readings load asynchronously we have to recenter imperatively via useMap().
 */
function FitToReadings({ readings }: { readings: Reading[] }) {
  const map = useMap();
  useEffect(() => {
    if (readings.length === 0) return;
    if (readings.length === 1) {
      map.setView([readings[0].lat, readings[0].lng], 12);
    } else {
      const bounds = L.latLngBounds(readings.map((r) => [r.lat, r.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [readings, map]);
  return null;
}

export default function MapClient() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/readings')
      .then((res) => res.json())
      .then((body) => setReadings(body.readings ?? []))
      .catch(() => setError('Could not load readings.'));
  }, []);

  return (
    <main className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3">
        <h1 className="text-lg font-bold">🍄 MycoFilter — Live Map</h1>
        <Link href="/" className="text-sm underline">
          + Submit a reading
        </Link>
      </header>
      {error && <p className="p-2 text-sm text-red-600">{error}</p>}
      <div className="flex-1">
        <MapContainer center={DEFAULT_CENTER} zoom={4} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitToReadings readings={readings} />
          {readings.map((reading) => (
            <CircleMarker
              key={reading.id}
              center={[reading.lat, reading.lng]}
              radius={10}
              pathOptions={{ color: severityColor(reading.estimated_ppm), fillOpacity: 0.7 }}
            >
              <Popup>
                <div className="max-w-[200px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={reading.image_path} alt="strip" className="mb-1 w-full rounded" />
                  <p className="font-medium">{reading.estimated_ppm.toFixed(1)} ppm (lead, est.)</p>
                  <p className="text-xs text-stone-500">
                    {new Date(reading.created_at).toLocaleString()}
                  </p>
                  {reading.notes && <p className="mt-1 text-xs">{reading.notes}</p>}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </main>
  );
}
