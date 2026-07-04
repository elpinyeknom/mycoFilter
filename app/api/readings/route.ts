import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { insertReading, listReadings } from '@/lib/db';
import { samplePixel, whiteBalanceCorrect, estimatePpm } from '@/lib/colorimetry';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function GET() {
  const readings = listReadings();
  return NextResponse.json({ readings });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const image = formData.get('image');
  const refX = Number(formData.get('refX'));
  const refY = Number(formData.get('refY'));
  const testX = Number(formData.get('testX'));
  const testY = Number(formData.get('testY'));
  const lat = Number(formData.get('lat'));
  const lng = Number(formData.get('lng'));
  const notes = formData.get('notes');

  if (!(image instanceof File)) {
    return NextResponse.json({ error: 'Missing image file' }, { status: 400 });
  }
  if ([refX, refY, testX, testY, lat, lng].some((n) => Number.isNaN(n))) {
    return NextResponse.json(
      { error: 'Missing or invalid refX/refY/testX/testY/lat/lng' },
      { status: 400 }
    );
  }

  const imageBuffer = Buffer.from(await image.arrayBuffer());

  const extension = (image.name.split('.').pop() || 'jpg').toLowerCase();
  const filename = `${randomUUID()}.${extension}`;
  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(path.join(UPLOADS_DIR, filename), imageBuffer);

  const referenceRgb = await samplePixel(imageBuffer, refX, refY);
  const rawRgb = await samplePixel(imageBuffer, testX, testY);
  const correctedRgb = whiteBalanceCorrect(referenceRgb, rawRgb);
  const estimatedPpm = estimatePpm(correctedRgb);

  const reading = insertReading({
    created_at: new Date().toISOString(),
    lat,
    lng,
    image_path: `/uploads/${filename}`,
    analyte: 'lead',
    reference_rgb: JSON.stringify(referenceRgb),
    raw_rgb: JSON.stringify(rawRgb),
    corrected_rgb: JSON.stringify(correctedRgb),
    estimated_ppm: estimatedPpm,
    notes: typeof notes === 'string' && notes.length > 0 ? notes : null,
  });

  return NextResponse.json({ reading }, { status: 201 });
}
