import sharp from 'sharp';

export type RGB = [number, number, number];

const SAMPLE_RADIUS = 6; // px, in each direction around the tapped point

/**
 * Average RGB of a small square neighborhood around (x, y) in the given image buffer.
 * Coordinates are in the original image's pixel space.
 */
export async function samplePixel(imageBuffer: Buffer, x: number, y: number): Promise<RGB> {
  const image = sharp(imageBuffer);
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  const left = Math.max(0, Math.min(width - 1, Math.round(x) - SAMPLE_RADIUS));
  const top = Math.max(0, Math.min(height - 1, Math.round(y) - SAMPLE_RADIUS));
  const regionWidth = Math.min(SAMPLE_RADIUS * 2, width - left);
  const regionHeight = Math.min(SAMPLE_RADIUS * 2, height - top);

  const { data, info } = await image
    .extract({ left, top, width: Math.max(1, regionWidth), height: Math.max(1, regionHeight) })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let r = 0;
  let g = 0;
  let b = 0;
  const pixelCount = info.width * info.height;
  const channels = info.channels;
  for (let i = 0; i < pixelCount; i++) {
    r += data[i * channels];
    g += data[i * channels + 1];
    b += data[i * channels + 2];
  }
  return [r / pixelCount, g / pixelCount, b / pixelCount];
}

/**
 * Gray-world white-balance correction: derives a per-channel scale factor that would
 * make the reference-patch sample neutral gray, then applies that same scale to the
 * test-strip sample. This corrects for ambient lighting/color-cast differences between
 * submitted photos, using the reference card as the known-neutral anchor.
 */
export function whiteBalanceCorrect(referenceRgb: RGB, rawRgb: RGB): RGB {
  const targetGray = (referenceRgb[0] + referenceRgb[1] + referenceRgb[2]) / 3;
  const scales = referenceRgb.map((channel) => (channel > 0 ? targetGray / channel : 1)) as RGB;
  return [rawRgb[0] * scales[0], rawRgb[1] * scales[1], rawRgb[2] * scales[2]].map((v) =>
    Math.max(0, Math.min(255, v))
  ) as RGB;
}

/**
 * PLACEHOLDER calibration table for lead (rhodizonate-style strip: pale pink at low
 * concentration, deepening to magenta/maroon at high concentration). These control
 * points are illustrative only, not derived from lab data — replace with a real
 * calibration curve before this reading is used for anything beyond demoing the
 * pipeline. See BLUEPRINT.md safety framing: triage only, never a lab substitute.
 */
const LEAD_CALIBRATION_CURVE: { rgb: RGB; ppm: number }[] = [
  { rgb: [245, 240, 238], ppm: 0 }, // near-white, no reaction
  { rgb: [240, 205, 210], ppm: 25 }, // pale pink
  { rgb: [225, 150, 170], ppm: 75 }, // light pink
  { rgb: [200, 90, 120], ppm: 150 }, // pink
  { rgb: [160, 40, 80], ppm: 300 }, // magenta
  { rgb: [100, 20, 45], ppm: 600 }, // deep maroon
];

function rgbDistance(a: RGB, b: RGB): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

/** Inverse-distance-weighted interpolation over the placeholder calibration curve. */
export function estimatePpm(correctedRgb: RGB): number {
  const EPS = 1e-3;
  let weightedSum = 0;
  let weightTotal = 0;
  for (const point of LEAD_CALIBRATION_CURVE) {
    const distance = rgbDistance(correctedRgb, point.rgb);
    if (distance < EPS) return point.ppm;
    const weight = 1 / distance ** 2;
    weightedSum += weight * point.ppm;
    weightTotal += weight;
  }
  return weightedSum / weightTotal;
}
