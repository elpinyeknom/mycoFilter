'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

type Point = { x: number; y: number }; // original-image pixel space
type ReactionCategory = 'none' | 'mild' | 'strong';

const REACTION_LABELS: Record<ReactionCategory, string> = {
  none: 'No visible reaction',
  mild: 'Mild reaction detected',
  strong: 'Strong reaction detected',
};

export default function SubmitPage() {
  const imgRef = useRef<HTMLImageElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [refPoint, setRefPoint] = useState<Point | null>(null);
  const [testPoint, setTestPoint] = useState<Point | null>(null);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ reaction_category: ReactionCategory } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setRefPoint(null);
    setTestPoint(null);
    setResult(null);
    setError(null);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  }

  function handleImageClick(e: React.MouseEvent<HTMLImageElement>) {
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    const point: Point = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };

    if (!refPoint) {
      setRefPoint(point);
    } else if (!testPoint) {
      setTestPoint(point);
    } else {
      // start over
      setRefPoint(point);
      setTestPoint(null);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation not supported — enter coordinates manually below.');
      return;
    }
    setGeoStatus('Locating…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setGeoStatus('Location captured.');
      },
      () => {
        setGeoStatus('Could not get location — enter coordinates manually below.');
      }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file || !refPoint || !testPoint) {
      setError('Upload a photo and tap both the reference patch and the test strip.');
      return;
    }
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      setError('Latitude/longitude are required — use "Use my location" or enter manually.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set('image', file);
      formData.set('refX', String(refPoint.x));
      formData.set('refY', String(refPoint.y));
      formData.set('testX', String(testPoint.x));
      formData.set('testY', String(testPoint.y));
      formData.set('lat', String(latNum));
      formData.set('lng', String(lngNum));
      formData.set('notes', notes);

      const res = await fetch('/api/readings', { method: 'POST', body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Submission failed');
      }
      const body = await res.json();
      setResult(body.reading);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-6 pb-16">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">🍄 MycoFilter — Submit a Reading</h1>
        <p className="mt-1 text-sm text-stone-600">
          Vertical slice demo: upload a colorimetric-strip photo, mark the reference patch and
          the test-strip color, and get a normalized reading plotted on the{' '}
          <Link href="/map" className="underline">
            live map
          </Link>
          .
        </p>
      </header>

      <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
        <strong>Triage only.</strong> This rhodizonate-style strip can indicate a color
        reaction to lead, but — like real consumer lead test kits — it cannot tell you an
        exact concentration. A reaction (mild or strong) means: send a sample to an
        accredited lab. For reference, the EPA's residential soil screening level is{' '}
        <strong>200 ppm</strong> (<strong>100 ppm</strong> if there are other lead sources
        nearby, such as old paint or lead pipes), and <strong>400+ ppm</strong> is treated as
        hazardous in bare-soil play areas — this app cannot tell you which of those ranges
        you're in.
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium">Strip + reference-card photo</label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm"
          />
        </div>

        {previewUrl && (
          <div>
            <p className="mb-1 text-sm text-stone-600">
              {!refPoint
                ? 'Tap the reference-card patch.'
                : !testPoint
                ? 'Now tap the test-strip color zone.'
                : 'Both points marked. Tap again to start over.'}
            </p>
            <div className="relative inline-block max-w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={previewUrl}
                alt="Strip preview"
                onClick={handleImageClick}
                className="max-h-96 w-full cursor-crosshair rounded-md border border-stone-300 object-contain"
              />
              {[
                { point: refPoint, color: 'bg-blue-500', label: 'ref' },
                { point: testPoint, color: 'bg-red-500', label: 'test' },
              ].map(
                ({ point, color, label }) =>
                  point &&
                  imgRef.current && (
                    <span
                      key={label}
                      className={`pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ${color}`}
                      style={{
                        left: `${(point.x / imgRef.current.naturalWidth) * 100}%`,
                        top: `${(point.y / imgRef.current.naturalHeight) * 100}%`,
                      }}
                    />
                  )
              )}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium">Location</label>
          <button
            type="button"
            onClick={useMyLocation}
            className="mt-1 rounded-md bg-emerald-700 px-3 py-2 text-sm text-white"
          >
            Use my location
          </button>
          {geoStatus && <p className="mt-1 text-xs text-stone-600">{geoStatus}</p>}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="rounded-md border border-stone-300 px-2 py-1 text-sm"
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="rounded-md border border-stone-300 px-2 py-1 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-stone-300 px-2 py-1 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-emerald-800 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit reading'}
        </button>
      </form>

      {result && (
        <div className="mt-6 rounded-md border border-emerald-300 bg-emerald-50 p-4">
          <p className="font-medium">Reading saved.</p>
          <p className="text-sm text-stone-700">
            <strong>{REACTION_LABELS[result.reaction_category]}</strong>
            {result.reaction_category !== 'none' &&
              ' — send a sample to an accredited lab for an exact ppm reading.'}
          </p>
          <Link href="/map" className="mt-2 inline-block text-sm underline">
            View it on the map →
          </Link>
        </div>
      )}
    </main>
  );
}
