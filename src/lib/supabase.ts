import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  user_type: 'consumer' | 'provider';
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
};

export type ProviderProfile = {
  id: string;
  profile_id: string;
  business_name: string;
  description: string;
  specialties: string[];
  service_areas: string[];
  rating: number;
  review_count: number;
  verified: boolean;
  created_at: string;
};

export type QuoteRequest = {
  id: string;
  consumer_id: string;
  service_type: '입주청소' | '이사청소' | '거주청소';
  address: string;
  address_detail?: string;
  housing_type: '아파트' | '빌라' | '단독주택';
  size: number;
  photos: string[];
  notes?: string;
  has_pets: boolean;
  has_mold: boolean;
  preferred_date?: string;
  preferred_time?: string;
  status: 'pending' | 'bidding' | 'matched' | 'completed' | 'cancelled';
  created_at: string;
  consumer?: Profile;
};

export type Bid = {
  id: string;
  quote_request_id: string;
  provider_id: string;
  amount: number;
  comment?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  provider?: Profile & { provider_profile?: ProviderProfile };
};

export type Booking = {
  id: string;
  quote_request_id: string;
  bid_id?: string;
  consumer_id: string;
  provider_id: string;
  amount: number;
  status: 'escrow' | 'in_progress' | 'completed' | 'cancelled';
  escrow_status: 'pending' | 'released' | 'refunded';
  created_at: string;
  completed_at?: string;
  quote_request?: QuoteRequest;
  provider?: Profile & { provider_profile?: ProviderProfile };
  consumer?: Profile;
};

export type Review = {
  id: string;
  booking_id: string;
  consumer_id: string;
  provider_id: string;
  rating: number;
  content: string;
  before_photos: string[];
  after_photos: string[];
  created_at: string;
};

export type Portfolio = {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  before_photo: string;
  after_photo: string;
  created_at: string;
};

export type Chat = {
  id: string;
  booking_id: string;
  consumer_id: string;
  provider_id: string;
  created_at: string;
  booking?: Booking;
};

export type Message = {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  photo_url?: string;
  read_at?: string;
  created_at: string;
  sender?: Profile;
};

export type CommunityPost = {
  id: string;
  author_id: string;
  title: string;
  content: string;
  likes_count: number;
  created_at: string;
  author?: Profile;
  comments?: PostComment[];
  liked_by_user?: boolean;
};

export type PostComment = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: Profile;
};

export type Settlement = {
  id: string;
  provider_id: string;
  booking_id?: string;
  amount: number;
  status: 'pending' | 'completed';
  bank_name?: string;
  bank_account?: string;
  created_at: string;
};
