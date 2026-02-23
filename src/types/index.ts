export interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  plan: 'free' | 'per_event' | 'pro';
  subscription_status: string;
  subscription_interval: string;       // 'month' | 'year' | ''
  subscription_period_end: string | null;
  event_count: number;
  events_used: number;
  event_credits: number;
  has_per_event_events: boolean;
}

export interface Event {
  id: number;
  owner: User;
  title: string;
  slug: string;
  description: string;
  event_date: string | null;
  content: string;
  pdf_file: string | null;
  cover_image: string | null;
  qr_code: string | null;
  is_published: boolean;
  is_paid: boolean;
  paid_per_event: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicEvent {
  title: string;
  slug: string;
  description: string;
  event_date: string | null;
  content: string;
  pdf_file: string | null;
  cover_image: string | null;
  view_count: number;
  created_at: string;
}
