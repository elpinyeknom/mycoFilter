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

export type ReactionCategory = 'none' | 'mild' | 'strong';

function rgbDistance(a: RGB, b: RGB): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

/**
 * Rhodizonate lead test strips are a threshold indicator — the reagent turns pink/red
 * when lead is present above its detection limit — not a continuous colorimeter. There
 * is no published, general-purpose color→ppm chart for this chemistry (EPA and NIST
 * test-kit evaluations describe it as presence/absence, not quantitative), so instead
 * of inventing a fake ppm number, this classifies how far the corrected test-strip
 * color has shifted from the reference card's neutral tone. The distance thresholds
 * below are an interim heuristic, not a validated strip/camera calibration — see
 * BLUEPRINT.md and README.md: triage only, never a lab substitute. A real ppm number
 * requires accredited lab testing; EPA's residential soil screening levels (200 ppm
 * general, 100 ppm with other lead sources nearby, 400+ ppm hazardous in play areas)
 * are shown as static reference context in the UI, not derived from the photo.
 */
const REACTION_DISTANCE_THRESHOLDS = { mild: 20, strong: 60 };

export function classifyReaction(referenceRgb: RGB, correctedRgb: RGB): ReactionCategory {
  const distance = rgbDistance(correctedRgb, referenceRgb);
  if (distance < REACTION_DISTANCE_THRESHOLDS.mild) return 'none';
  if (distance < REACTION_DISTANCE_THRESHOLDS.strong) return 'mild';
  return 'strong';
}
