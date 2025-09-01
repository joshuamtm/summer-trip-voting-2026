export interface TripDetails {
  duration: string;
  location: string;
  activities: string[];
  accommodation: string;
  estimatedCost: string;
  highlights: string[];
  benefits?: string[];
  challenges?: string[];
}

export interface TripOption {
  id: number;
  title: string;
  description: string;
  details: TripDetails;
}

export interface Rankings {
  first_choice: number;
  second_choice: number;
  third_choice: number;
}

export interface Vote {
  id: string;
  name: string;
  first_choice: number;
  second_choice: number;
  third_choice: number;
  comments?: string;
  submitted_at: string;
}

export interface Results {
  totalVotes: number;
  tripScores: { [key: number]: number };
  firstChoiceCount: { [key: number]: number };
  allVotes: Vote[];
}