export interface Species {
  id: string;
  name: {
    es: string;
    en: string;
  };
  scientificName: string;
  habitat: string;
  isEndemic: boolean;
  bestMonthsToSpot: number[]; // 1-12 representing Jan-Dec
  highResGallery: string[]; // URLs to WebP images
}
