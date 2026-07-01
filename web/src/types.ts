export interface Role {
  code: string;
  label: string;
  color: string;
  role_label?: string;
  role_color?: string;
}

export interface Member {
  id: number;
  name: string;
  initials?: string;
  designation?: string | null;
  profession?: string | null;
  business?: string | null;
  area?: string | null;
  phone?: string | null;
  email?: string | null;
  joined_year?: number | null;
  dob?: string | null;
  anniv?: string | null;
  spouse?: string | null;
  avatar_color?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  expertise?: string | null;
  goals?: string | null;
  accomplishments?: string | null;
  interests?: string | null;
  network?: string | null;
  social?: string | null;
  role?: string;
  role_label?: string;
  role_color?: string;
}

export interface ClubEvent {
  id: number;
  title: string;
  type: string;
  starts_at: string;
  ends_at?: string | null;
  venue?: string | null;
  description?: string | null;
  cause_id?: string | null;
  cover_url?: string | null;
  going: number;
  my_status: 'yes' | 'no' | 'maybe' | null;
  cancelled?: number;
}

export interface NewsItem {
  id: number;
  title: string;
  tag?: string | null;
  excerpt?: string | null;
  body?: string | null;
  cover_url?: string | null;
  published_at?: string | null;
  scope?: string | null;
}

export interface ImpactRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  units: number;
  amount_inr: number;
  projects: number;
}

export interface Cause {
  id: string;
  name: string;
  icon: string;
  unit_label: string | null;
  color: string;
  sort_order: number;
}
