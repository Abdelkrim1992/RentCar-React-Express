-- Add city column to car_availabilities table
ALTER TABLE car_availabilities ADD COLUMN IF NOT EXISTS city VARCHAR(255);