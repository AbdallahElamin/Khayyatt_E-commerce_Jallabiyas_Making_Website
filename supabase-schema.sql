-- Create an ENUM type for roles
CREATE TYPE public.user_role AS ENUM ('customer', 'tailor', 'admin');

-- Create the profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY, -- Links directly to the Auth user (FK removed for prototyping tailor insertion)
  role public.user_role NOT NULL DEFAULT 'customer',
  
  -- Shared fields
  full_name TEXT,
  username TEXT UNIQUE,
  
  -- Customer & Tailor Location fields
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_address TEXT,
  
  -- Tailor specific fields
  atelier_name TEXT,
  experience_start_date DATE,

  -- Tailor rating fields (managed by admin; updated manually or via future trigger)
  -- rating: 0.00–5.00, defaults to 0 until reviews are recorded
  -- review_count: total number of customer reviews received
  rating NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access (so anyone can view profiles/tailors)
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Allow users to insert their own profile (used during registration)
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

-- ── Migration: add rating columns to an existing profiles table ───────────
-- Run this in the Supabase SQL editor if the table already exists:
--
-- ALTER TABLE public.profiles
--   ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
--   ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0 CHECK (review_count >= 0);

-- ── Order System Tables ───────────

CREATE TYPE public.order_status AS ENUM ('pending_payment', 'confirmed');
CREATE TYPE public.payment_method AS ENUM ('cod', 'card');

CREATE TABLE public.orders (
  id TEXT PRIMARY KEY, -- e.g. o-xyz123
  customer_id UUID REFERENCES public.profiles(id),
  status public.order_status NOT NULL DEFAULT 'pending_payment',
  payment_method public.payment_method,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.order_items (
  id TEXT PRIMARY KEY, -- e.g. item-xyz123
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  tailor_id UUID REFERENCES public.profiles(id),
  design JSONB NOT NULL,
  measurements JSONB NOT NULL,
  pricing JSONB NOT NULL,
  stage INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id TEXT REFERENCES public.order_items(id) ON DELETE CASCADE,
  stage INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
