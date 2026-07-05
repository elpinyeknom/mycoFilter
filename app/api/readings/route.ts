import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { insertReading, listReadings } from '@/lib/db';
import { uploadReadingImage } from '@/lib/storage';
import { samplePixel, whiteBalanceCorrect, classifyReaction } from '@/lib/colorimetry';

export async function GET() {
  const readings = await listReadings();
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
  const imagePath = await uploadReadingImage(imageBuffer, filename);

  const referenceRgb = await samplePixel(imageBuffer, refX, refY);
  const rawRgb = await samplePixel(imageBuffer, testX, testY);
  const correctedRgb = whiteBalanceCorrect(referenceRgb, rawRgb);
  const reactionCategory = classifyReaction(referenceRgb, correctedRgb);

  const reading = await insertReading({
    created_at: new Date().toISOString(),
    lat,
    lng,
    image_path: imagePath,
    analyte: 'lead',
    reference_rgb: JSON.stringify(referenceRgb),
    raw_rgb: JSON.stringify(rawRgb),
    corrected_rgb: JSON.stringify(correctedRgb),
    reaction_category: reactionCategory,
    notes: typeof notes === 'string' && notes.length > 0 ? notes : null,
  });

  return NextResponse.json({ reading }, { status: 201 });
}
