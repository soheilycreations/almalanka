export interface ItineraryDay {
  day: string;
  title: string;
  desc: string;
}

export interface TourPlan {
  id: string;
  title: string;
  days: number;
  route: string[];
  activities: string[];
  price: string;
  image: string;
  type?: string;
  feat?: boolean;
  overview: string;
  highlights: string[];
  difficulty: string;
  guide: string;
  gallery?: string[];
  itinerary?: ItineraryDay[];
}
