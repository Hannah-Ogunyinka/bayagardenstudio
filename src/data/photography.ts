/**
 * Brand Photography gallery, in the order shown on the page.
 * `alt` is empty until each photo is described (TODO: review).
 */
import type { ImageMetadata } from 'astro';

export const PHOTO_CATEGORIES = ['portraits', 'products', 'events'] as const;
export type PhotoCategory = (typeof PHOTO_CATEGORIES)[number];

// Any of these photo formats can be used; Astro converts them to WebP at build time.
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/images/photography/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true });

function photo(file: string) {
  const image = files[`../assets/images/photography/${file}`]?.default;
  if (!image) throw new Error(`Missing gallery photo: ${file}`);
  return image;
}

export const GALLERY: { image: ImageMetadata; category: PhotoCategory; alt: string }[] = [
  { image: photo('ITAV5531-1.jpg'), category: 'portraits', alt: '' },
  { image: photo('ITAV5218.jpg'), category: 'portraits', alt: '' },
  { image: photo('DSCF8303.jpg'), category: 'portraits', alt: '' },
  { image: photo('ITAV5669.jpg'), category: 'products', alt: '' },
  { image: photo('ITAV5304.jpg'), category: 'portraits', alt: '' },
  { image: photo('ITAV5511.jpg'), category: 'portraits', alt: '' },
  { image: photo('DSCF1525.jpg'), category: 'products', alt: '' },
  { image: photo('DSCF4061.jpg'), category: 'portraits', alt: '' },
  { image: photo('ITAV5468.jpg'), category: 'portraits', alt: '' },
  { image: photo('DSCF8980.jpg'), category: 'products', alt: '' },
  { image: photo('ITAV5486.jpg'), category: 'portraits', alt: '' },
  { image: photo('ITAV5232.jpg'), category: 'portraits', alt: '' },
  { image: photo('DSCF2571.jpg'), category: 'portraits', alt: '' },
  { image: photo('DSCF1068.jpg'), category: 'products', alt: '' },
  { image: photo('DSCF4023.jpg'), category: 'portraits', alt: '' },
  { image: photo('DSCF1139-e1714666805882.jpg'), category: 'products', alt: '' },
  { image: photo('DSCF0901.jpg'), category: 'products', alt: '' },
  { image: photo('ITAV5178-1.jpg'), category: 'portraits', alt: '' },
  { image: photo('ITAV5625.jpg'), category: 'products', alt: '' },
  { image: photo('ITAV5493.jpg'), category: 'portraits', alt: '' },
  { image: photo('DSCF2562.jpg'), category: 'portraits', alt: '' },
  { image: photo('DSCF0840.jpg'), category: 'portraits', alt: '' },
  { image: photo('DSCF2537.jpg'), category: 'products', alt: '' },
  { image: photo('DSCF4566.jpg'), category: 'portraits', alt: '' },
  { image: photo('ITAV5243.jpg'), category: 'portraits', alt: '' },
  { image: photo('DSCF3267.jpg'), category: 'events', alt: '' },
  { image: photo('DSCF3274.jpg'), category: 'events', alt: '' },
  { image: photo('DSCF3314.jpg'), category: 'events', alt: '' },
  { image: photo('DSCF3324.jpg'), category: 'events', alt: '' },
  { image: photo('DSCF3354.jpg'), category: 'events', alt: '' },
  { image: photo('DSCF3362.jpg'), category: 'events', alt: '' },
  { image: photo('DSCF3480.jpg'), category: 'events', alt: '' },
  { image: photo('DSCF3557.jpg'), category: 'events', alt: '' },
  { image: photo('DSCF3560.jpg'), category: 'events', alt: '' },
  { image: photo('DSCF4485.jpg'), category: 'events', alt: '' },
  { image: photo('DSCF4514.jpg'), category: 'events', alt: '' },
  { image: photo('DSCF4578.jpg'), category: 'portraits', alt: '' },
  { image: photo('DSCF4635.jpg'), category: 'events', alt: '' },
  { image: photo('DSCF4643.jpg'), category: 'events', alt: '' },
  { image: photo('DSCF5545.jpg'), category: 'events', alt: '' },
  { image: photo('DSCF5596.jpg'), category: 'events', alt: '' },
  { image: photo('DSCF5600.jpg'), category: 'events', alt: '' },
];
