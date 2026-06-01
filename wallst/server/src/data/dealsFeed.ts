export interface Deal {
  id: string;
  title: string;
  date: string;
  value: string;
  sector: string;
  status: string;
}

export const DEALS_FEED: Deal[] = [];
