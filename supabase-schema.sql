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
