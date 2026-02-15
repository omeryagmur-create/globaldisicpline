-- Fix RLS policy to allow profile creation during signup
-- Bu dosyayı Supabase SQL Editor'de çalıştırın

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
