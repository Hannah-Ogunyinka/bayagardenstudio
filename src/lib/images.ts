/**
 * Widths for an image's `srcset`.
 *
 * The browser picks one candidate from `srcset` using `sizes` and the screen's
 * pixel density, so the list has to reach far enough for a retina screen
 * (up to three times the CSS width on phones) and stop at the original upload, which is the sharpest
 * file there is. The browser still downloads only the one width it needs.
 *
 * @param src the imported image
 * @param maxCssWidth the widest the image is ever shown, in CSS pixels; omit for full-bleed images
 */
const LADDER = [320, 480, 640, 800, 960, 1200, 1440, 1600, 1920, 2400, 2880, 3840];

export function imageWidths(src: ImageMetadata, maxCssWidth = Infinity): number[] {
  const cap = Math.min(src.width, Math.ceil(maxCssWidth * 3));
  return [...LADDER.filter((width) => width < cap), cap];
}
