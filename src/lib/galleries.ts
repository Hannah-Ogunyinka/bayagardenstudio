/** Client gallery list (titles, photo files and sizes). Photos live in R2, not in the build. */
import data from '@data/galleries.json';

export interface Gallery {
  slug: string;
  title: string;
  photos: { file: string; width: number; height: number }[];
  download?: { file: string; bytes: number };
}

export const GALLERIES = data as Gallery[];
export const getGallery = (slug: string | undefined) => GALLERIES.find((g) => g.slug === slug);
